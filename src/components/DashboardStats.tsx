import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Package,
  Filter
} from "lucide-react";
import { useState } from "react";

// Mock data - in a real app, this would come from your state management or API
const dashboardData = {
  purchased: {
    totalItems: 47,
    totalQuantity: 152,
    totalPrice: 248.75,
    thisMonth: 15
  },
  expired: {
    totalItems: 3,
    totalQuantity: 8,
    totalPrice: 12.50,
    thisMonth: 1
  },
  consumed: {
    totalItems: 124,
    totalQuantity: 387,
    totalPrice: 623.25,
    thisMonth: 42
  }
};

export const DashboardStats = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const { purchased, expired, consumed } = dashboardData;

  const handleRowClick = (type: string) => {
    // TODO: Implement detail view for each item type
    console.log(`Clicked on ${type} items`);
  };

  const tableData = [
    {
      type: "Items Purchased",
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      bgColor: "hover:bg-blue-50/50",
      count: purchased.totalItems,
      quantity: purchased.totalQuantity,
      price: purchased.totalPrice
    },
    {
      type: "Items Expired",
      icon: AlertTriangle,
      iconColor: "text-red-600",
      bgColor: "hover:bg-red-50/50",
      count: expired.totalItems,
      quantity: expired.totalQuantity,
      price: expired.totalPrice
    },
    {
      type: "Items Consumed",
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "hover:bg-green-50/50",
      count: consumed.totalItems,
      quantity: consumed.totalQuantity,
      price: consumed.totalPrice
    }
  ];

  const totalItems = purchased.totalItems + expired.totalItems + consumed.totalItems;
  const totalQuantity = purchased.totalQuantity + expired.totalQuantity + consumed.totalQuantity;
  const totalPrice = purchased.totalPrice + expired.totalPrice + consumed.totalPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Track your grocery management and spending</p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Overview</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => {
                const Icon = row.icon;
                return (
                  <TableRow 
                    key={row.type}
                    className={`cursor-pointer transition-colors ${row.bgColor}`}
                    onClick={() => handleRowClick(row.type)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${row.iconColor}`} />
                        {row.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{row.count}</TableCell>
                    <TableCell className="text-right">{row.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">${row.price.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
              {/* Total Row */}
              <TableRow className="border-t-2 bg-muted/30 font-bold">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{totalItems}</TableCell>
                <TableCell className="text-right font-bold">{totalQuantity}</TableCell>
                <TableCell className="text-right font-bold">${totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-200/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Bananas consumed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Qty: 3</p>
                <p className="text-xs text-green-600">$4.50</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Milk purchased</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Qty: 2</p>
                <p className="text-xs text-blue-600">$7.99</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-200/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Yogurt expired</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Qty: 1</p>
                <p className="text-xs text-red-600">$3.49</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};