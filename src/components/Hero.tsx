import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Milk, Apple, AlertTriangle } from "lucide-react";
import { ExpiringItemsPopover } from "@/components/ExpiringItemsPopover";
import { usePantry } from "@/contexts/PantryContext";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

export const Hero = () => {
  const moneySaved = 45.30; // Mock data for money saved
  const { getExpiringItems } = usePantry();
  const expiringItems = getExpiringItems().slice(0, 2); // Show only first 2 on home page

  return (
    <section className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-3 pt-6 md:pt-8">
          <p className="text-lg md:text-xl text-muted-foreground">
            Welcome to ShopWise, your Smart Pantry
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Hello Elsa 👋
          </h1>
        </div>

        {/* Money Saved Card */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              <h2 className="text-xl md:text-2xl font-bold text-green-700">${moneySaved.toFixed(2)} Saved</h2>
            </div>
            <p className="text-sm md:text-base text-green-600">By reviewing expiring items in the last 30 days</p>
          </CardContent>
        </Card>

        {/* Expiring Items Section */}
        <div className="space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
              These items are expiring in a week, let's review these
            </h2>
          </div>

          {/* Expiring Items List */}
          <div className="space-y-4">
            {expiringItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-orange-400">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground text-sm md:text-base truncate">{item.name}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{item.category} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.daysLeft} days
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        Expires {formatDate(item.expiryDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <ExpiringItemsPopover />
          </div>
        </div>

      </div>
    </section>
  );
};