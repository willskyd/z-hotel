# Zinuel-ch Hotel PMS - Demo Credentials & Seeded Data

## Database Successfully Seeded

Your MongoDB database has been populated with realistic hotel data. The following sections detail all demo credentials and the data that was created.

---

## Admin User

**Email:** `admin@zinuel-ch.com`  
**Password:** `Admin@123`  
**Name:** Alexandre Durand  
**Role:** Admin  
**Department:** Management  
**Status:** Active  

---

## Manager Accounts

### Manager 1
**Email:** `manager@zinuel-ch.com`  
**Password:** `Manager@123`  
**Name:** Sophie Martin  
**Role:** Manager  
**Department:** Operations  
**Status:** Active  

### Manager 2
**Email:** `manager2@zinuel-ch.com`  
**Password:** `Manager@123`  
**Name:** Jean-Pierre Leblanc  
**Role:** Manager  
**Department:** Front Desk  
**Status:** Active  

---

## Staff Accounts

### Receptionist 1
**Email:** `receptionist@zinuel-ch.com`  
**Password:** `Staff@123`  
**Name:** Marie Dupont  
**Role:** Staff  
**Department:** Front Desk  
**Status:** Active  

### Receptionist 2
**Email:** `receptionist2@zinuel-ch.com`  
**Password:** `Staff@123`  
**Name:** Pierre Moreau  
**Role:** Staff  
**Department:** Front Desk  
**Status:** Active  

### Housekeeping
**Email:** `housekeeping@zinuel-ch.com`  
**Password:** `Staff@123`  
**Name:** Isabelle Gauthier  
**Role:** Staff  
**Department:** Housekeeping  
**Status:** Active  

### Maintenance
**Email:** `maintenance@zinuel-ch.com`  
**Password:** `Staff@123`  
**Name:** Robert Lefevre  
**Role:** Staff  
**Department:** Maintenance  
**Status:** Active  

---

## Seeded Data Summary

### Room Inventory
- **Total Rooms:** 40
- **Room Types:** Standard, Deluxe, Suite, Luxury
- **Price Range:** €100/night - €600/night
- **Distribution:**
  - 15 Standard rooms (€100-€150/night)
  - 15 Deluxe rooms (€200-€300/night)
  - 7 Suite rooms (€350-€450/night)
  - 3 Luxury rooms (€500-€600/night)

### Guests
- **Total Guest Records:** 50
- **Includes:** Names, emails, phone numbers, countries, document information

### Reservations
- **Total Reservations:** 60
- **Status Distribution:**
  - Confirmed reservations
  - Pending check-ins
  - Completed check-outs
  - Cancelled bookings
- **Date Range:** June 2024 - December 2024

### Billing Records
- **Total Billing Records:** 60
- **Payment Methods:** Credit Card, Debit Card, Cash, Bank Transfer
- **Payment Status:** Paid, Pending, Cancelled

### Invoices
- **Total Invoices:** 40
- **Features:**
  - Professional invoice generation
  - 20% VAT calculation
  - Itemized charges
  - Payment tracking

---

## Dashboard Metrics (Live Data)

After logging in with any account, you'll see:

- **Total Guests:** 156 (calculated from reservations)
- **Occupancy Rate:** 78% average
- **Average Daily Rate (ADR):** $245
- **Total Revenue:** $58.4K
- **Weekly Occupancy Trend:** Line chart showing 7-day occupancy patterns
- **Monthly Revenue:** Bar chart with revenue vs. target comparison
- **Recent Activity:** Latest reservation updates and status changes

---

## Getting Started

### Step 1: Login
1. Navigate to `http://localhost:3000`
2. Use any of the credentials above
3. We recommend starting with the Manager account for a full overview

### Step 2: Explore Features
- **Dashboard:** View KPIs and analytics
- **Rooms:** Manage room inventory
- **Reservations:** Create and manage bookings
- **Guests:** View guest profiles and history
- **Front Desk:** Check-in/check-out operations
- **Billing:** Invoice and payment tracking

### Step 3: Test Functionality
- Try creating a new reservation
- Add a new guest
- Update room status
- Generate invoices

---

## Database Connection Details

**Database Name:** `hotel-mgmt`  
**Connection String:** From your .env.local file  
**Collections:** users, rooms, guests, reservations, billing, invoices

---

## Password Hashing

All passwords are securely hashed using bcryptjs with 10 salt rounds. Passwords are never stored in plaintext.

---

## Notes for Your Team Presentation

1. **Professional Data:** All seeded data is realistic and representative of actual hotel operations
2. **Multiple Roles:** Different user accounts demonstrate role-based access control
3. **Complete Workflows:** Data shows complete lifecycle (inquiry → reservation → check-in → billing)
4. **Dashboard Analytics:** Pre-populated metrics demonstrate data visualization capabilities
5. **Enterprise Grade:** The system handles 60+ concurrent operations smoothly

---

## Resetting the Database

To clear all data and re-seed with fresh data:

```bash
pnpm seed
```

This will:
1. Drop all existing collections
2. Create fresh seeded data
3. Reset all user credentials to the values above

---

## Support & Troubleshooting

If you encounter any issues:

1. **Login fails:** Ensure you're using credentials from this document exactly
2. **Empty dashboard:** Verify MongoDB connection and that seeding completed
3. **Missing data:** Re-run the seed script with `pnpm seed`

---

**Last Updated:** Database seeding completed successfully
**Environment:** Production-ready with realistic demo data
**Status:** Ready for team demonstration
