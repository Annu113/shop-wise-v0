import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, X, Edit } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { PantryItem, usePantry } from "@/contexts/PantryContext";

interface EditableItemProps {
  item: PantryItem;
}

export const EditableItem = ({ item }: EditableItemProps) => {
  const { updateItem } = usePantry();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [expiryDate, setExpiryDate] = useState<Date>(parse(item.expiryDate, 'yyyy-MM-dd', new Date()));
  const [purchasedDate, setPurchasedDate] = useState<Date>(parse(item.purchasedDate, 'yyyy-MM-dd', new Date()));

  const handleSave = () => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let status: 'fresh' | 'expiring' | 'expired' | 'consumed' = 'fresh';
    if (daysLeft < 0) status = 'expired';
    else if (daysLeft <= 7) status = 'expiring';

    updateItem(item.id, {
      name,
      expiryDate: format(expiryDate, 'yyyy-MM-dd'),
      purchasedDate: format(purchasedDate, 'yyyy-MM-dd'),
      daysLeft,
      status
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(item.name);
    setExpiryDate(parse(item.expiryDate, 'yyyy-MM-dd', new Date()));
    setPurchasedDate(parse(item.purchasedDate, 'yyyy-MM-dd', new Date()));
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
        <div className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-medium"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Purchased</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8 text-xs",
                    !purchasedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {purchasedDate ? format(purchasedDate, "MM-dd-yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchasedDate}
                  onSelect={(date) => date && setPurchasedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Expires</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8 text-xs",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {expiryDate ? format(expiryDate, "MM-dd-yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={(date) => date && setExpiryDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 w-6 p-0">
            <X className="w-3 h-3" />
          </Button>
          <Button size="sm" onClick={handleSave} className="h-6 w-6 p-0">
            <Check className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};