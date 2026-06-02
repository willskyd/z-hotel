# Zinuel-ch Hotel PMS - Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the project root with your MongoDB credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zinuel_ch_hotel
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-recommended
NODE_ENV=development
```

**To generate a secure JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 2. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Create a free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with username and password
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/zinuel_ch_hotel`

#### Option B: Local MongoDB
```bash
# Install MongoDB locally
# macOS (with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/zinuel_ch_hotel
```

### 3. Database Initialization

The application uses MongoDB with the following collections. They are automatically created on first use:

- `users` - User accounts and authentication
- `rooms` - Hotel room inventory
- `guests` - Guest profiles
- `reservations` - Booking records
- `invoices` - Billing documents

### 4. Create Initial Users (Optional)

To create demo users, you can use MongoDB Compass or the MongoDB shell:

```bash
# Using MongoDB shell
mongosh mongodb+srv://username:password@cluster.mongodb.net/zinuel_ch_hotel
```

```javascript
// Create admin user
db.users.insertOne({
  email: "admin@zinuel-ch.com",
  password: "$2a$10$...", // bcrypt hash of "password123"
  fullName: "Admin User",
  role: "admin",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create manager user
db.users.insertOne({
  email: "manager@hotel.com",
  password: "$2a$10$...", // bcrypt hash of "password123"
  fullName: "John Manager",
  role: "manager",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create staff user
db.users.insertOne({
  email: "staff@hotel.com",
  password: "$2a$10$...", // bcrypt hash of "password123"
  fullName: "Jane Staff",
  role: "staff",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Or use the registration API:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@hotel.com",
    "password": "password123",
    "fullName": "John Manager",
    "role": "manager"
  }'
```

### 5. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Login Credentials

After setup, use these credentials to test:

### Admin Account
- Email: `admin@zinuel-ch.com`
- Password: `password123`

### Manager Account
- Email: `manager@hotel.com`
- Password: `password123`

### Staff Account
- Email: `staff@hotel.com`
- Password: `password123`

## Features by Role

### Admin
- Full system access
- User management
- System configuration
- All reports and analytics

### Manager
- Room management
- Reservation overview
- Guest management
- Billing reports
- Front desk operations

### Staff
- View reservations
- Check-in/check-out
- Guest assistance
- Room status updates

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
   - Click "Deploy"

### Environment Variables on Vercel

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   MONGODB_URI = your_mongodb_uri
   JWT_SECRET = your_jwt_secret
   NODE_ENV = production
   ```

## Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` format
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify username and password are correct
- Test connection string: `mongosh "mongodb+srv://..."`

### JWT Token Issues
- Ensure `JWT_SECRET` is set and consistent
- JWT tokens expire after 24 hours
- Refresh tokens last 7 days

### Port Already in Use
```bash
# Change port in package.json or use:
pnpm dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. Enable image optimization
2. Use production builds for testing performance
3. Configure CDN for static assets
4. Enable database indexing on frequently queried fields

## Security Checklist

- [ ] Change default credentials
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Use environment variables for secrets
- [ ] Regular security audits

## Development

### File Structure
```
app/              - Next.js pages and routes
components/       - React components
lib/             - Utilities and helpers
public/          - Static files
styles/          - Global styles
```

### Key Dependencies
- next@16
- react@19
- typescript
- tailwindcss@4
- mongodb
- jsonwebtoken
- bcryptjs

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Tailwind for styling
- Component-driven architecture

## Support

For issues or questions:
1. Check the README.md
2. Review API documentation
3. Check browser console for errors
4. Verify MongoDB connection

---

**Happy Hosting! Build amazing things with Zinuel-ch Hotel PMS.**
