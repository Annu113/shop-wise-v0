import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Minus,
  Search,
  Milk,
  Apple,
  Cookie,
  Package,
  Upload,
  Trash2,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { usePantry, PantryItem } from "@/contexts/PantryContext";
import { EditableItem } from "@/components/EditableItem";

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

export const PantryDashboard = () => {
  const { items, updateQuantity, updateStatus, removeItem, addToCart } = usePantry();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>(["fresh", "expiring", "expired", "consumed"]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = ["All", "Dairy", "Produce", "Bakery", "Meat", "Snacks", "Beverages", "Frozen Foods", "Grains"];

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => {
      // If only this status is selected, show all
      if (prev.length === 1 && prev.includes(status)) {
        return ["fresh", "expiring", "expired", "consumed"];
      }
      // If multiple statuses are selected, show only this one
      if (prev.length > 1) {
        return [status];
      }
      // If this status is not selected, add it to the current selection
      if (!prev.includes(status)) {
        return [...prev, status];
      }
      // If this status is selected and there are others, remove it
      return prev.filter(s => s !== status);
    });
  };

  // Filter items based on search query, status, and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilters.includes(item.status);
    const matchesCategory = categoryFilter === "all" || categoryFilter === "All" || 
                           item.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusCount = (status: string) => {
    return items.filter(item => item.status === status).length;
  };

  // Add a helper to check if any items exist for debugging
  const totalItems = items.length;
  const totalFilteredItems = filteredItems.length;

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={statusFilters.includes("fresh") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatusFilter("fresh")}
              className={`rounded-full whitespace-nowrap ${statusFilters.includes("fresh") ? "bg-green-500 text-white" : "border-green-500 text-green-600"}`}
            >
              Fresh ({getStatusCount("fresh")})
            </Button>
            <Button
              variant={statusFilters.includes("expiring") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatusFilter("expiring")}
              className={`rounded-full whitespace-nowrap ${statusFilters.includes("expiring") ? "bg-yellow-500 text-white" : "border-yellow-500 text-yellow-600"}`}
            >
              Expiring ({getStatusCount("expiring")})
            </Button>
            <Button
              variant={statusFilters.includes("expired") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatusFilter("expired")}
              className={`rounded-full whitespace-nowrap ${statusFilters.includes("expired") ? "bg-red-500 text-white" : "border-red-500 text-red-600"}`}
            >
              Expired ({getStatusCount("expired")})
            </Button>
            <Button
              variant={statusFilters.includes("consumed") ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatusFilter("consumed")}
              className={`rounded-full whitespace-nowrap ${statusFilters.includes("consumed") ? "bg-blue-500 text-white" : "border-blue-500 text-blue-600"}`}
            >
              Consumed ({getStatusCount("consumed")})
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category || (categoryFilter === "all" && category === "All") ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category === "All" ? "all" : category)}
                className={`rounded-full ${(categoryFilter === category || (categoryFilter === "all" && category === "All")) ? "bg-gray-800 text-white" : ""}`}
              >
                {category}
              </Button>
            ))}
          </div>


          {/* Items List */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No items found matching your filters.</p>
              </Card>
            ) : (
              filteredItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-3">
                  {/* Item Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <EditableItem item={item} />
                        <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
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
                      <p className="text-xs text-muted-foreground">
                        Purchased: {formatDate(item.purchasedDate)}
                      </p>
                      {item.status !== 'consumed' && (
                        <p className="text-xs text-muted-foreground">
                          {item.status === 'expired' ? `Expired ${formatDate(item.expiryDate)}` : `Expires ${formatDate(item.expiryDate)}`}
                        </p>
                      )}
                      {item.status !== 'consumed' && item.status !== 'expired' && (
                        <p className="text-xs font-medium">
                          {`${item.daysLeft} days left`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Selector and Add to Cart */}
                  <div className="flex gap-2">
                    <Select value={item.status} onValueChange={(value: 'fresh' | 'expiring' | 'expired' | 'consumed') => updateStatus(item.id, value)}>
                      <SelectTrigger className={`h-8 text-xs flex-1 ${getStatusColor(item.status)}`}>
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
          </div>
        </div>
      </div>
    </section>
  );
};