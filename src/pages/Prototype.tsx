import { Hero } from "@/components/Hero";
import { FloatingQuickAdd } from "@/components/FloatingQuickAdd";

const Prototype = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-primary text-primary-foreground p-4 text-center">
        <h1 className="text-xl font-bold">🧪 Prototype Mode</h1>
        <p className="text-sm opacity-90">Demo version - No account required</p>
      </div>
      <Hero />
      <FloatingQuickAdd />
    </div>
  );
};

export default Prototype;