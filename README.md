# Zinuel-ch Hotel - Enterprise Property Management System

A professional, enterprise-grade Hotel Property Management System (PMS) built with Next.js 16, TypeScript, MongoDB, and a premium gold/black luxury design aesthetic.

## Overview

Zinuel-ch Hotel PMS is a comprehensive hotel management solution featuring an astonishing UI/UX with glassmorphism effects, professional data visualizations, and a sophisticated enterprise-level architecture. The system handles all core hotel operations seamlessly.

## Features

### 1. **Authentication & RBAC**
- Secure JWT-based authentication
- Role-based access control (Admin, Manager, Staff)
- Password hashing with bcryptjs
- Token refresh mechanism
- Protected routes with authentication middleware

### 2. **Dashboard & Analytics**
- Real-time KPIs: Occupancy Rate, ADR, RevPAR, Total Revenue
- Weekly occupancy trends visualization
- Monthly revenue charts with targets
- Recent reservations overview
- Professional data visualization with Recharts

### 3. **Room Management**
- Complete room inventory system
- Room types: Standard, Deluxe, Suite
- Real-time room status tracking (Available, Occupied, Maintenance, Reserved)
- Price per night management
- Room capacity and amenities management
- Add/Edit/Delete room operations

### 4. **Reservation Management**
- Create and track reservations
- Check-in/Check-out date management
- Guest capacity tracking
- Automatic night calculation
- Reservation status management (Confirmed, Pending, Cancelled)
- Guest history integration

### 5. **Guest CRM**
- Guest profile management
- Guest history and total stay tracking
- Contact information management
- Last visit tracking
- Email and phone verification
- Country/location information

### 6. **Front Desk Operations**
- Check-in management for current guests
- Check-out processing
- Available rooms display
- Room key management
- Guest request handling
- Pending check-outs queue

### 7. **Billing & Payments**
- Invoice generation and tracking
- Payment status management (Paid, Pending, Overdue)
- Multiple payment methods support (Credit Card, Bank Transfer)
- Invoice download functionality
- Billing statistics and analytics
- Payment collection tracking

### 8. **Professional UI/UX**
- Premium gold/black luxury theme matching Zinuel-ch branding
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive design (Mobile, Tablet, Desktop)
- Dark mode optimized interface
- Professional typography and spacing
- Enterprise-level component library

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **TailwindCSS 4** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Image Optimization** - Next.js Image component
- **Zustand + SWR** - Client state management and data fetching

### Backend
- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS-enabled** - Cross-origin support

### Design System
- **Design Tokens** - Color, spacing, typography system
- **Component Library** - Reusable UI components
- **Responsive Grid** - Mobile-first layout system

## Project Structure

```
zinuel-ch-hotel/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Login page
│   ├── globals.css             # Global styles & design tokens
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout
│       ├── page.tsx            # Dashboard home
│       ├── rooms/
│       ├── reservations/
│       ├── guests/
│       ├── front-desk/
│       └── billing/
├── components/
│   ├── auth/
│   │   ├── login-page.tsx
│   │   └── protected-route.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── dashboard/
│   │   ├── dashboard-stats.tsx
│   │   ├── occupancy-chart.tsx
│   │   ├── revenue-chart.tsx
│   │   └── recent-reservations.tsx
│   ├── rooms/
│   │   ├── rooms-list.tsx
│   │   └── create-room-modal.tsx
│   ├── reservations/
│   │   ├── reservations-list.tsx
│   │   └── create-reservation-modal.tsx
│   ├── guests/
│   │   ├── guests-list.tsx
│   │   └── add-guest-modal.tsx
│   ├── front-desk/
│   │   ├── check-in-list.tsx
│   │   └── check-out-list.tsx
│   └── billing/
│       ├── billing-stats.tsx
│       └── invoices-list.tsx
├── lib/
│   ├── mongodb.ts              # MongoDB connection
│   ├── auth.ts                 # Authentication utilities
│   └── auth-context.tsx        # Auth React context
├── app/api/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── rooms/
│   ├── reservations/
│   ├── guests/
│   └── billing/
├── public/
│   └── logo.png                # Zinuel-ch logo
└── package.json
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- MongoDB Atlas account or local MongoDB instance

### Environment Variables
Create a `.env.local` file with the following:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/zinuel_ch_hotel
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### Installation Steps

1. **Clone/Download the project**
   ```bash
   cd zinuel-ch-hotel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MongoDB credentials
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room

### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create new reservation

### Guests
- `GET /api/guests` - Get all guests
- `POST /api/guests` - Create new guest

## Database Schema

### Users
- _id: ObjectId
- email: String (unique)
- password: String (hashed)
- fullName: String
- role: String (admin, manager, staff)
- status: String (active, inactive)
- createdAt: Date
- updatedAt: Date

### Rooms
- _id: ObjectId
- roomNumber: String
- type: String
- floor: Number
- capacity: Number
- pricePerNight: Number
- amenities: Array
- status: String
- createdAt: Date
- updatedAt: Date

### Guests
- _id: ObjectId
- firstName: String
- lastName: String
- email: String (unique)
- phone: String
- address: String
- city: String
- country: String
- passportNumber: String
- createdAt: Date
- updatedAt: Date

### Reservations
- _id: ObjectId
- guestId: ObjectId (ref: Guest)
- roomId: ObjectId (ref: Room)
- checkInDate: Date
- checkOutDate: Date
- numberOfGuests: Number
- totalPrice: Number
- status: String (confirmed, pending, cancelled, checked-in)
- notes: String
- createdAt: Date
- updatedAt: Date

## Key Features Implemented

✅ **Enterprise-Grade Security**
- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected routes with middleware

✅ **Professional UI/UX**
- Premium gold/black luxury theme
- Glassmorphism effects
- Smooth animations
- Responsive design
- Dark mode optimized

✅ **Data Management**
- MongoDB integration
- RESTful API architecture
- Proper error handling
- Input validation

✅ **Business Features**
- Room inventory management
- Reservation system
- Guest CRM
- Billing & invoicing
- Front desk operations
- Real-time analytics

## Deployment

### Vercel (Recommended)
```bash
# Connect your GitHub repo to Vercel
# Push to main branch to auto-deploy
```

### Docker
```bash
# Create Dockerfile and docker-compose.yml
docker compose up
```

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Tailwind CSS purging
- MongoDB connection pooling
- Efficient data fetching with SWR
- Responsive images with srcset

## Security Best Practices

- HTTPS-only in production
- CORS configuration
- JWT token expiration
- Password hashing
- Input validation
- Rate limiting (can be added)
- CSRF protection (can be added)

## Future Enhancements

- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Housekeeping management
- [ ] Maintenance requests
- [ ] Guest loyalty program
- [ ] Revenue management tools
- [ ] Advanced analytics & reporting
- [ ] Multi-property support
- [ ] Mobile app

## Support & Documentation

For detailed information on any feature, refer to the inline code comments and component documentation.

## License

Proprietary - Zinuel-ch Hotel

## Credits

Built with v0 by Vercel and powered by modern web technologies.

---

**Version:** 1.0.0  
**Last Updated:** June 2024  
**Status:** Production Ready (MVP)
