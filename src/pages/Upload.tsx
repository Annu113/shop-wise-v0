import { UploadSection } from "@/components/UploadSection";

const Upload = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Upload Invoice</h1>
            <p className="text-muted-foreground">Upload your grocery receipts and let AI organize your pantry</p>
          </div>
          <UploadSection />
        </div>
      </div>
    </div>
  );
};

export default Upload;