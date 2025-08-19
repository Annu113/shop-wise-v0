import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, FileImage, Zap, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePantry } from "@/contexts/PantryContext";

interface InvoiceUploadScanProps {
  className?: string;
  compact?: boolean;
}

export const InvoiceUploadScan = ({ className = "", compact = false }: InvoiceUploadScanProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { items } = usePantry();

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
    if (!file.type.match(/^(image\/(jpeg|jpg|png)|application\/pdf)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, PNG, or PDF files only.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
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
            
            setIsProcessing(false);
            toast({
              title: "Receipt processed successfully!",
              description: `Found ${items?.length || 0} items from ${storeName || 'your receipt'}`,
              action: (
                <Button variant="outline" size="sm" onClick={() => {
                  window.location.href = "/pantry";
                }}>
                  View Pantry
                </Button>
              ),
            });
            
            console.log('Extracted receipt data:', result.data);
            // TODO: Add items to pantry context
          } else {
            throw new Error(result.error || 'Failed to extract receipt data');
          }
        } catch (error) {
          console.error('Error processing receipt:', error);
          setIsProcessing(false);
          toast({
            title: "Error processing receipt",
            description: "Please try again or contact support",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        setIsProcessing(false);
        toast({
          title: "Error reading file",
          description: "Please try again with a different image",
          variant: "destructive",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsProcessing(false);
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setShowCamera(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        
        // Convert to blob and process
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleFileUpload(file);
          }
        }, 'image/jpeg');
        
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (showCamera) {
    return (
      <Card className={`${className} transition-all duration-300`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Scan Invoice</h3>
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg bg-muted"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {capturedImage && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <img 
                    src={capturedImage} 
                    alt="Captured invoice" 
                    className="max-w-full max-h-full rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-center">
              {!capturedImage ? (
                <Button onClick={capturePhoto} size="lg" variant="hero">
                  <Camera className="w-5 h-5" />
                  Capture Invoice
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={retakePhoto} variant="outline">
                    Retake
                  </Button>
                  <Button onClick={stopCamera} variant="hero">
                    <CheckCircle className="w-5 h-5" />
                    Process Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-compact"
        />
        <label htmlFor="file-upload-compact">
          <Button variant="outline" size="sm" asChild disabled={isProcessing}>
            <span>
              <Upload className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Upload"}
            </span>
          </Button>
        </label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={startCamera}
          disabled={isProcessing}
        >
          <Camera className="w-4 h-4" />
          Scan
        </Button>
      </div>
    );
  }

  return (
    <Card 
      className={`transition-all duration-300 ${
        isDragOver ? 'border-primary shadow-glow scale-105' : ''
      } ${className}`}
    >
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Upload or Scan Invoice
            </h3>
            <p className="text-muted-foreground">
              Add items to your pantry instantly with AI-powered OCR
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/30 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Drop your invoice here
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  or choose from your device
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="file-upload">
                  <Button variant="upload" size="lg" asChild disabled={isProcessing}>
                    <span>
                      <FileImage className="w-5 h-5" />
                      {isProcessing ? "Processing..." : "Choose File"}
                    </span>
                  </Button>
                </label>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={startCamera}
                  disabled={isProcessing}
                >
                  <Camera className="w-5 h-5" />
                  Scan with Camera
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, PDF up to 10MB
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};