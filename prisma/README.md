# Database Seeding

This directory contains the database seed script for populating the database with test data for analytics testing.

## Seed Script

The `seed.ts` file creates comprehensive test data including:

- **1 Test User** (email: `test@example.com`, password: `test123`)
- **3 Product Categories** (Electronics, Clothing, Home & Garden)
- **5 Products** (Laptop, Smartphone, T-Shirt, Jeans, Garden Tools)
- **5 Customers** (John, Jane, Bob, Alice, Charlie)
- **22 Sales** (20 random + 2 specific patterns) over the last 30 days

## Running the Seed Script

```bash
# Make sure you're in the biz-suite directory
cd biz-suite

# Run the seed script
npm run seed
# or
pnpm seed
# or
yarn seed
```

## What the Seed Script Creates

### Sales Data Patterns
- **Random Distribution**: 20 sales randomly distributed over the last 30 days
- **Realistic Patterns**: 
  - Different channels (in-store, online, phone)
  - Various payment methods (cash, credit card, mobile money)
  - Different statuses (completed, pending, refunded)
  - Realistic pricing with taxes and discounts
  - Multiple items per sale (1-3 items)

### Analytics-Ready Data
The seed data is specifically designed to test the `/sales-over-time` endpoint:

- **Time-based grouping**: Sales spread across different days/weeks/months
- **Amount variations**: Different total amounts for trend analysis
- **Channel diversity**: Multiple sales channels for comparison
- **Payment method variety**: Different payment methods for analysis

## Test User Credentials

After running the seed script, you can use these credentials to test the analytics endpoints:

- **Email**: `test@example.com`
- **Password**: `test123`
- **Role**: `admin`

## Analytics Endpoints to Test

With the seeded data, you can test these analytics endpoints:

- `GET /analytics/sales-over-time` - Sales trends over time
- `GET /analytics/top-products` - Best selling products
- `GET /analytics/sales-by-channel` - Sales by channel
- `GET /analytics/sales-by-payment-method` - Sales by payment method
- `GET /analytics/top-customers` - Top customers
- `GET /analytics/average-order-value` - Average order value

## Example API Calls

```bash
# Get sales over time (last month)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics/sales-over-time?period=month"

# Get sales over time (custom date range)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics/sales-over-time?period=custom&startDate=2024-01-01&endDate=2024-01-31"

# Get top products
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analytics/top-products?limit=5&period=month"
```

## Expected Response Format

The `/sales-over-time` endpoint returns data in this format:

```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-15",
      "totalAmount": 1299.99
    },
    {
      "period": "2024-01-16", 
      "totalAmount": 799.99
    }
  ]
}
```

## Resetting the Database

To start fresh, you can:

1. **Reset the database** (if using Prisma):
   ```bash
   npx prisma migrate reset
   ```

2. **Run the seed script again**:
   ```bash
   npm run seed
   ```

## Notes

- The seed script uses `upsert` operations, so it's safe to run multiple times
- Sales are created with realistic timestamps over the last 30 days
- Product costs and prices are set for profit margin analysis
- Tax calculations use a 7.5% rate (configurable in user settings)
- All data is associated with the test user for proper analytics filtering
