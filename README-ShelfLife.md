# Shelf Life Integration Guide

## Features Implemented
✅ **Default shelf life values** for different food categories and items
✅ **Auto-calculate expiry dates** using shelf-life + purchase date when no expiry date is provided
✅ **Smart expiring threshold** - items marked as "expiring" when only 40% of shelf life remains
✅ **Expired status** - items marked as "expired" once shelf life is reached
✅ **Custom shelf life override** - ability to set custom shelf life for specific items

## How It Works

### 1. Default Shelf Life Data
The system uses a JSON file (`src/data/shelfLife.json`) containing default shelf life values in days:

```json
{
  "Dairy": {
    "Whole Milk 2%": 7,
    "Greek Yogurt": 14,
    "Cheddar Cheese": 28
  },
  "Produce": {
    "Organic Bananas": 7,
    "Fresh Spinach": 5,
    "Apples": 21
  }
}
```

### 2. Priority System
When determining shelf life, the system uses this priority:
1. **Custom shelf life** (if specified for the item)
2. **Item-specific shelf life** (from JSON file)
3. **Category default** (fallback for category)
4. **Global default** (7 days if nothing else matches)

### 3. Status Calculation
- **Fresh**: More than 40% of shelf life remaining
- **Expiring**: 40% or less of shelf life remaining
- **Expired**: Past the shelf life date
- **Consumed**: Quantity is 0

## Customizing Your JSON File

### Option 1: Edit the existing file
Modify `src/data/shelfLife.json` with your own data.

### Option 2: Replace with your own JSON
You can replace the content of `src/data/shelfLife.json` with your own shelf life data. Use this structure:

```json
{
  "CategoryName": {
    "Item Name": days_as_number,
    "Another Item": days_as_number
  },
  "AnotherCategory": {
    "Item Name": days_as_number
  }
}
```

### Option 3: Paste your JSON content
If you have a JSON file, you can:
1. Copy its contents
2. Paste it to replace the content in `src/data/shelfLife.json`
3. Make sure it follows the structure above

## Examples

### Adding items without expiry date:
Items will auto-calculate expiry date using shelf life + purchase date.

### Adding items with custom shelf life:
```javascript
addItem({
  name: "Special Cheese",
  category: "Dairy", 
  quantity: 1,
  purchasedDate: "2025-01-29",
  shelfLifeDays: 45, // Custom 45-day shelf life
  icon: <Package className="w-4 h-4" />
});
```

### With explicit expiry date:
```javascript
addItem({
  name: "Pre-packaged Salad",
  category: "Produce",
  quantity: 1,
  purchasedDate: "2025-01-29", 
  expiryDate: "2025-02-01", // Explicit expiry date (overrides shelf life calculation)
  icon: <Package className="w-4 h-4" />
});
```

## Categories with Default Shelf Life
- **Dairy**: 7 days
- **Produce**: 7 days  
- **Bakery**: 5 days
- **Meat**: 3 days
- **Pantry**: 365 days
- **Frozen**: 90 days

Feel free to provide your own JSON file content to customize these values!