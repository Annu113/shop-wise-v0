import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { InvoiceUploadScan } from '@/components/InvoiceUploadScan';
import { ManualAddForm } from '@/components/ManualAddForm';

export const FloatingQuickAdd = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  }, [position]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Keep button within screen bounds
    const buttonSize = 56; // 14 * 4 (w-14 h-14)
    const maxX = window.innerWidth - buttonSize;
    const maxY = window.innerHeight - buttonSize;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragStart]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Touch events
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    } else {
      // Mouse events
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Touch events
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }

    return () => {
      // Cleanup
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleClick = () => {
    // Only open dialog if we're not dragging
    if (!isDragging) {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            ref={buttonRef}
            size="icon"
            className={`fixed h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-[100] select-none ${
              isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{showManualForm ? "Add Item Manually" : "Quick Add Items"}</DialogTitle>
            <DialogDescription>
              {showManualForm ? "Enter item details to add to your pantry" : "Upload, scan, or add manually to your pantry"}
            </DialogDescription>
          </DialogHeader>
          {showManualForm ? (
            <ManualAddForm onClose={() => { setShowManualForm(false); setIsOpen(false); }} />
          ) : (
            <div className="space-y-4">
              <InvoiceUploadScan compact />
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-muted"></div>
                <span className="text-xs text-muted-foreground px-1">or</span>
                <div className="flex-1 border-t border-muted"></div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8"
                onClick={() => setShowManualForm(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Manually
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};