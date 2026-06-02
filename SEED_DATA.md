# Database Seeding Guide - Zinuel-ch Hotel PMS

## Overview

The seed script populates your MongoDB database with realistic hotel data including users, rooms, guests, reservations, and billing information. This allows you to immediately test the application with meaningful data.

## Data Generated

### 1. **Users (7 records)**
- 1 Admin user
- 2 Manager users
- 4 Staff members (receptionists, housekeeping, maintenance)

**Credentials for Testing:**
- Admin: `admin@zinuel-ch.com` / `Admin@123`
- Manager: `manager@zinuel-ch.com` / `Manager@123`
- Manager 2: `manager2@zinuel-ch.com` / `Manager@123`
- Receptionist: `receptionist@zinuel-ch.com` / `Staff@123`
- Receptionist 2: `receptionist2@zinuel-ch.com` / `Staff@123`
- Housekeeping: `housekeeping@zinuel-ch.com` / `Staff@123`
- Maintenance: `maintenance@zinuel-ch.com` / `Staff@123`

### 2. **Rooms (40 records)**
Generated across 5 floors with:
- **Room Types**: Standard, Deluxe, Suite, Luxury Suite
- **Capacity**: 1-4 guests
- **Price Range**: €100-€600 per night
- **Status**: Available, Occupied, Maintenance, Cleaning (randomly assigned)
- **Amenities**: WiFi, TV, Air Conditioning, Mini Bar, Work Desk, Jacuzzi, etc.

Room numbering format: `F##` (Floor + Room number)
- Floor 1: Rooms 101-108
- Floor 2: Rooms 201-208
- Floor 3: Rooms 301-308
- Floor 4: Rooms 401-408
- Floor 5: Rooms 501-508

### 3. **Guests (50 records)**
Real guest profiles with:
- First and last names
- Email addresses
- Phone numbers
- Countries (15+ different countries)
- Document types (Passport or ID Card)
- Document numbers
- Preferred language
- Creation dates

### 4. **Reservations (60 records)**
Complete booking information:
- Guest associations
- Room assignments
- Check-in/Check-out dates
- Number of guests
- Total price calculations (based on room rate × nights)
- Status: Confirmed, Checked-In, Checked-Out, Cancelled, Pending
- Special requests (early check-in, high floor preference, etc.)

### 5. **Billing Records**
Financial tracking for reservations:
- Amount and currency (EUR)
- Payment methods (Credit Card, Debit Card, Bank Transfer, Cash)
- Payment status (Paid, Pending, Partial, Refunded)
- Transaction IDs
- Paid dates
- Notes

### 6. **Invoices (40 records)**
Professional invoice records:
- Unique invoice numbers (INV-2024-XXXX format)
- Guest and billing associations
- Amount and tax calculations (20% VAT)
- Issue and due dates
- Status: Issued, Paid, Overdue, Partial
- Professional descriptions and notes

## Prerequisites

### 1. MongoDB Setup

You need a MongoDB instance running. Choose one:

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb

# Windows
# Download installer from mongodb.com
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Set the MONGODB_URI environment variable

### 2. Environment Variables

Create or update your `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/zinuel-ch-hotel
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
NODE_ENV=development
```

For MongoDB Atlas, use the connection string provided:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zinuel-ch-hotel
```

## Running the Seed Script

### Step 1: Install Dependencies
If you haven't already, install all dependencies:
```bash
pnpm install
```

### Step 2: Start MongoDB (if local)
```bash
# macOS/Linux
mongod

# Or if you used brew services
brew services start mongodb-community
```

### Step 3: Run the Seed Script
```bash
pnpm seed
```

The script will:
1. Connect to MongoDB
2. Clear existing collections (users, rooms, guests, reservations, billing, invoices)
3. Create and insert seed data
4. Display progress with checkmarks (✅)
5. Show completion message with count of records created

Expected output:
```
🌱 Starting database seeding...

🗑️  Cleared collection: users
🗑️  Cleared collection: rooms
🗑️  Cleared collection: guests
🗑️  Cleared collection: reservations
🗑️  Cleared collection: billing
🗑️  Cleared collection: invoices

✅ Seeded 7 users

✅ Seeded 40 rooms

✅ Seeded 50 guests

✅ Seeded 60 reservations

✅ Seeded 40 billing records

✅ Seeded 40 invoices

🎉 Database seeding completed successfully!
```

## Testing the Application

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Navigate to http://localhost:3000

### 3. Login with Test Credentials

**Admin Account** (Full access):
- Email: `admin@zinuel-ch.com`
- Password: `Admin@123`

**Manager Account** (Management operations):
- Email: `manager@zinuel-ch.com`
- Password: `Manager@123`

**Staff Account** (Front desk operations):
- Email: `receptionist@zinuel-ch.com`
- Password: `Staff@123`

### 4. Explore Features

After logging in, you can:
- View the dashboard with occupancy, revenue, and booking analytics
- Browse all 40 rooms with their details and status
- View all 50 guests and their information
- Check 60 reservations with different statuses
- Review billing and invoice records
- Create new reservations, guests, and rooms
- Update room status (maintenance, cleaning, etc.)

## Data Characteristics

### Room Status Distribution
- Randomly assigned: Available, Occupied, Maintenance, Cleaning
- Realistic occupancy rates

### Reservation Status Distribution
- Confirmed (most common for current/future bookings)
- Checked-in (active guests)
- Checked-out (past guests)
- Pending (awaiting confirmation)
- Cancelled (cancelled bookings)

### Payment Status Distribution
- Paid (completed payments)
- Pending (awaiting payment)
- Partial (partial payments)
- Refunded (refunded reservations)

### Booking Patterns
- Dates spread across 2024 months
- Variable length of stays (1-7 nights)
- Realistic price calculations based on room type and nights
- Guest counts from 1-4 per reservation

## Resetting Data

To clear all data and start fresh:

```bash
# Run the seed script again - it clears existing data automatically
pnpm seed
```

Or manually in MongoDB CLI:
```javascript
use zinuel-ch-hotel
db.users.deleteMany({})
db.rooms.deleteMany({})
db.guests.deleteMany({})
db.reservations.deleteMany({})
db.billing.deleteMany({})
db.invoices.deleteMany({})
```

## MongoDB Connection Troubleshooting

### Issue: Connection refused (127.0.0.1:27017)
**Solution**: Start MongoDB service
```bash
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### Issue: Authentication failed with MongoDB Atlas
**Solution**: 
1. Check username and password are URL-encoded
2. Whitelist your IP address in MongoDB Atlas console
3. Use the exact connection string from Atlas

### Issue: Database not found
**Solution**: MongoDB automatically creates the database on first write. Just run the seed script.

### Issue: Permission denied writing to /data/db
**Solution** (macOS):
```bash
brew services restart mongodb-community
```

## Advanced: Customizing Seed Data

To modify the seed data, edit `/scripts/seed.ts`:

- Change guest names in `firstNames` and `lastNames` arrays
- Adjust room pricing in `roomTypes`
- Modify number of records in loop iterations
- Update special requests or descriptions

Then run `pnpm seed` again.

## Notes

- Passwords are hashed with bcryptjs (salt rounds: 10)
- All timestamps are in UTC
- Room prices are in EUR (€)
- Invoice amounts include 20% VAT
- Document numbers are randomly generated
- Phone numbers are randomly generated in international format
- Email addresses follow the format: firstname.lastname#@example.com

## Support

For issues with the seed script or database connectivity, check:
1. MongoDB is running (`mongo` or `mongosh` command works)
2. MONGODB_URI environment variable is set correctly
3. Network connectivity to MongoDB (especially for Atlas)
4. File permissions if using local MongoDB
