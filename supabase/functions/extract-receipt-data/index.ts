import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error('No image data provided');
    }

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!hfToken) {
      throw new Error('Hugging Face API token not configured');
    }

    console.log('Processing receipt with Hugging Face Vision API...');

    const hf = new HfInference(hfToken);

    // Convert base64 to blob for Hugging Face
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([bytes]);

    try {
      // Use proper OCR model (TrOCR) and correct API payload key (inputs)
      const primaryModel = 'microsoft/trocr-large-printed';
      const fallbackModel = 'microsoft/trocr-base-printed';

      const runOCR = async (model: string) => {
        console.log(`[OCR] Invoking Hugging Face imageToText with model: ${model}`);
        const res = await hf.imageToText({
          inputs: blob,
          model,
        });
        console.log('[OCR] Raw result:', res);
        // Some models return string directly, others return { generated_text }
        return (res as any)?.generated_text ?? (typeof res === 'string' ? res : '');
      };

      let extractedText = '';
      try {
        extractedText = await runOCR(primaryModel);
      } catch (primaryErr) {
        console.warn('[OCR] Primary model failed, trying fallback model:', primaryErr);
        extractedText = await runOCR(fallbackModel);
      }

      console.log('[OCR] Extracted text length:', extractedText?.length || 0);

      // Basic but more robust parsing helpers
      const lines = (extractedText || '')
        .split(/\r?\n|\s{2,}/)
        .map(l => l.trim())
        .filter(Boolean);

      // Extract store name: first meaningful line with letters
      const storeName = (lines.find(l => /[A-Za-z]{3,}/.test(l)) || 'Unknown Store').slice(0, 60);

      // Extract date
      const textForDate = (extractedText || '');
      const dateMatch = textForDate.match(/(\b\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}\b)|(\b\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}\b)/);
      const parsedDate = (() => {
        if (!dateMatch) return new Date().toISOString().split('T')[0];
        const raw = dateMatch[0].replace(/\./g, '-').replace(/\//g, '-');
        const parts = raw.split('-').map(n => parseInt(n, 10));
        let y = 0, m = 1, d = 1;
        if (parts[0] > 31) { // YYYY-MM-DD
          [y, m, d] = parts;
        } else if (parts[2] > 31) { // DD-MM-YYYY or MM-DD-YYYY -> assume last is year
          if (parts[1] > 12) { // DD-MM-YYYY
            [d, m, y] = parts;
          } else { // MM-DD-YYYY
            [m, d, y] = parts;
          }
        } else { // Fallback to current date
          return new Date().toISOString().split('T')[0];
        }
        const iso = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).toISOString().split('T')[0];
        return iso;
      })();

      // Extract amounts and total
      const moneyRegex = /(?:(?:USD|INR|EUR|GBP|CAD|AUD)\s*)?\$?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.[0-9]{2})?/g;
      const amounts = Array.from((extractedText || '').matchAll(moneyRegex)).map(m => parseFloat(m[0].replace(/[^0-9.]/g, ''))).filter(n => !Number.isNaN(n));
      let total = 0;
      // Prefer a line containing TOTAL/AMOUNT DUE/BALANCE
      const totalLine = lines.find(l => /total|amount due|balance/i.test(l));
      if (totalLine) {
        const inLineAmounts = Array.from(totalLine.matchAll(moneyRegex)).map(m => parseFloat(m[0].replace(/[^0-9.]/g, '')));
        if (inLineAmounts.length) total = inLineAmounts[inLineAmounts.length - 1];
      }
      if (!total && amounts.length) total = Math.max(...amounts);

      // Extract items (very heuristic): lines with a name and a trailing price
      const itemLineRegex = /^(?<name>.*?)(?:\s{1,}|\t|\s\s+)(?<qty>x?\d+)?\s*\$?(?<price>[0-9]+(?:\.[0-9]{2})?)$/i;
      const items = lines
        .map(l => l.replace(/\s{2,}/g, ' ').trim())
        .map(l => l.replace(/\t/g, ' '))
        .map(l => l.replace(/\s+([$£€])/g, ' $1'))
        .map(l => l.replace(/([0-9]),([0-9]{3})/g, '$1$2')) // remove thousands separators inside prices
        .map(l => l)
        .reduce<{ name: string; quantity: string; price: string; category: string; expirationDays: number; }[]>((acc, l) => {
          const m = l.match(itemLineRegex) as any;
          if (!m || !m.groups) return acc;
          const name = (m.groups.name || '').trim();
          const price = parseFloat(m.groups.price);
          if (!name || Number.isNaN(price)) return acc;
          const qtyRaw = (m.groups.qty || '1').replace(/x/i, '');
          const quantity = Math.max(1, parseInt(qtyRaw, 10)).toString();
          acc.push({
            name: name.slice(0, 60),
            quantity,
            price: price.toFixed(2),
            category: 'other',
            expirationDays: 7,
          });
          return acc;
        }, [])
        .slice(0, 25);

      const extractedData = {
        items: items.length ? items : [
          {
            name: 'Receipt items detected',
            quantity: '1',
            price: '0.00',
            category: 'other',
            expirationDays: 7,
          },
        ],
        storeName,
        date: parsedDate,
        total: (total || 0).toFixed(2),
      };

      console.log('Successfully extracted receipt data:', extractedData);

      return new Response(
        JSON.stringify({
          success: true,
          data: extractedData,
          rawText: extractedText?.slice(0, 5000) || undefined,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );

    } catch (hfError) {
      console.error('Hugging Face error:', hfError);
      
      // Fallback response when HF fails
      const fallbackData = {
        items: [
          {
            name: "Unable to process receipt",
            quantity: "1",
            price: "0.00",
            category: "other",
            expirationDays: 7
          }
        ],
        storeName: "Unknown Store",
        date: new Date().toISOString().split('T')[0],
        total: "0.00"
      };

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: fallbackData,
          note: "Receipt processing failed, please manually add items"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

  } catch (error) {
    console.error('Error in extract-receipt-data function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});