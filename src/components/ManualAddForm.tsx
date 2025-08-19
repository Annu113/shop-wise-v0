import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePantry } from "@/contexts/PantryContext";

const categories = ["Dairy", "Produce", "Bakery", "Meat", "Snacks", "Beverages", "Frozen Foods", "Grains"];

interface ManualAddFormProps {
  onClose: () => void;
}

export const ManualAddForm = ({ onClose }: ManualAddFormProps) => {
  const { addItem } = usePantry();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [purchasedDate, setPurchasedDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !expiryDate) return;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let status: 'fresh' | 'expiring' | 'expired' | 'consumed' = 'fresh';
    if (daysLeft < 0) status = 'expired';
    else if (daysLeft <= 7) status = 'expiring';

    addItem({
      name,
      category,
      quantity,
      expiryDate: format(expiryDate, 'yyyy-MM-dd'),
      purchasedDate: format(purchasedDate, 'yyyy-MM-dd'),
      status,
      daysLeft,
      icon: <Package className="w-4 h-4" />
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Purchased Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !purchasedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {purchasedDate ? format(purchasedDate, "MM-dd-yyyy") : "Pick a date"}
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

      <div className="space-y-2">
        <Label>Expiry Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !expiryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiryDate ? format(expiryDate, "MM-dd-yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={expiryDate}
              onSelect={setExpiryDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Add Item
        </Button>
      </div>
    </form>
  );
};