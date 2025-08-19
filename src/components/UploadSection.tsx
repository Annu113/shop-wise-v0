import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, FileImage, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UploadSection = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    toast({
      title: "Processing Receipt",
      description: `Analyzing ${file.name} with AI OCR...`,
    });

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;

          // Call the OCR edge function
          const response = await fetch('https://byjztbfaqrmznhebiusl.functions.supabase.co/extract-receipt-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Image
            }),
          });

          const result = await response.json();

          if (result.success && result.data) {
            const { items, storeName, total } = result.data;
            toast({
              title: "Receipt processed successfully!",
              description: `Found ${items?.length || 0} items from ${storeName || 'your receipt'}`,
            });
            
            console.log('Extracted receipt data:', result.data);
            // TODO: Add items to pantry context
          } else {
            throw new Error(result.error || 'Failed to extract receipt data');
          }
        } catch (error) {
          console.error('Error processing receipt:', error);
          toast({
            title: "Error processing receipt",
            description: "Please try again or contact support",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Please try again with a different image",
          variant: "destructive",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Upload Your Invoice
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Snap a photo or upload a PDF of your grocery receipt and let AI do the rest
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card 
            className={`transition-all duration-300 ${
              isDragOver ? 'border-primary shadow-glow scale-105' : ''
            }`}
          >
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Drop your invoice here
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="upload" size="lg" asChild>
                        <span>
                          <FileImage className="w-5 h-5" />
                          Choose File
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, PDF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">AI-Powered OCR</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced text recognition extracts items, quantities, and dates automatically
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-success/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Smart Categorization</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically sorts items by category and sets realistic expiry estimates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-warning/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Multiple Formats</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload photos from your phone or PDF receipts from online orders
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};