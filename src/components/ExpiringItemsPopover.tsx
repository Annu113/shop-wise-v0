import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus,
  Minus,
  Clock,
  ShoppingCart,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { usePantry } from "@/contexts/PantryContext";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'fresh': return 'text-green-600 bg-green-50 border-green-200';
    case 'expiring': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'expired': return 'text-red-600 bg-red-50 border-red-200';
    case 'consumed': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const ExpiringItemsPopover = () => {
  const { getExpiringItems, updateQuantity, updateStatus, removeItem, addToCart } = usePantry();
  const expiringItems = getExpiringItems();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="default" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Review All Expiring Items ({expiringItems.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-y-auto z-50 bg-background border shadow-lg" side="bottom" align="center">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Items Expiring in 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            {expiringItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items expiring in the next 7 days
              </p>
            ) : (
              expiringItems.map((item) => (
                <Card key={item.id} className="p-3 bg-muted/30">
                  <div className="space-y-3">
                    {/* Item Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Item Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Qty:</span>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {item.status !== 'consumed' && (
                          <p className="text-xs text-muted-foreground">
                            {item.status === 'expired' ? `Expired ${formatDate(item.expiryDate)}` : `Expires ${formatDate(item.expiryDate)}`}
                          </p>
                        )}
                        {item.status !== 'consumed' && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.daysLeft} days left
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Status Selector and Add to Cart */}
                    <div className="flex gap-2">
                      <Select value={item.status} onValueChange={(value: 'fresh' | 'expiring' | 'expired' | 'consumed') => updateStatus(item.id, value)}>
                        <SelectTrigger className={`h-8 text-xs flex-1 ${getStatusColor(item.status)} z-50`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background min-w-[120px]">
                          <SelectItem value="fresh" className="text-green-600 text-xs">Fresh</SelectItem>
                          <SelectItem value="expiring" className="text-yellow-600 text-xs">Expiring</SelectItem>
                          <SelectItem value="expired" className="text-red-600 text-xs">Expired</SelectItem>
                          <SelectItem value="consumed" className="text-blue-600 text-xs">Consumed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3"
                        onClick={() => addToCart(item)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};