# Farmers Trade Hub - Backend API

Backend API for the Farmers Trade Hub platform, specifically focused on Clerk Manager Dashboard functionality.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Dashboard Analytics**: Real-time statistics and activity tracking
- **Farmer Management**: Register, view, and manage farmer profiles
- **Product/Inventory Management**: Track lots, products, and stock levels
- **Order Management**: Process and fulfill buyer orders
- **Payout Processing**: Handle farmer payments and track payout status
- **Reports & Analytics**: Generate detailed reports on revenue, sales, and farmer activity
- **Notifications**: Real-time notification system for hub activities

## 📋 Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13
- npm >= 8.0.0

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd FTH-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

```bash
# Create database
createdb farmers_hub

# Run the schema
psql -d farmers_hub -f db/schema.sql
```

### 4. Configure environment variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 5. Start the server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
FTH-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── clerkController.js    # Clerk dashboard logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── validation.js         # Input validation
│   │   └── errorHandler.js       # Error handling
│   └── routes/
│       ├── authRoutes.js         # Auth endpoints
│       └── clerkRoutes.js        # Clerk endpoints
├── db/
│   └── schema.sql                # Database schema
├── server.js                     # Main server file
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                    | Description       | Auth Required |
| ------ | --------------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register`        | Register new user | No            |
| POST   | `/api/auth/login`           | Login user        | No            |
| GET    | `/api/auth/profile`         | Get current user  | Yes           |
| PUT    | `/api/auth/profile`         | Update profile    | Yes           |
| POST   | `/api/auth/change-password` | Change password   | Yes           |

### Clerk Dashboard

| Method | Endpoint                            | Description              | Auth Required |
| ------ | ----------------------------------- | ------------------------ | ------------- |
| GET    | `/api/clerk/dashboard/stats`        | Get dashboard statistics | Yes (CLERK)   |
| GET    | `/api/clerk/dashboard/activity`     | Get recent activity      | Yes (CLERK)   |
| GET    | `/api/clerk/farmers`                | List all farmers         | Yes (CLERK)   |
| GET    | `/api/clerk/farmers/:id`            | Get farmer details       | Yes (CLERK)   |
| GET    | `/api/clerk/products`               | List all products        | Yes (CLERK)   |
| POST   | `/api/clerk/products`               | Register new product     | Yes (CLERK)   |
| PUT    | `/api/clerk/products/:id`           | Update product           | Yes (CLERK)   |
| DELETE | `/api/clerk/products/:id`           | Delete product           | Yes (CLERK)   |
| GET    | `/api/clerk/orders`                 | List all orders          | Yes (CLERK)   |
| GET    | `/api/clerk/orders/:id`             | Get order details        | Yes (CLERK)   |
| PATCH  | `/api/clerk/orders/:id/status`      | Update order status      | Yes (CLERK)   |
| GET    | `/api/clerk/payouts`                | List all payouts         | Yes (CLERK)   |
| POST   | `/api/clerk/payouts/:id/process`    | Process payout           | Yes (CLERK)   |
| GET    | `/api/clerk/reports`                | Generate reports         | Yes (CLERK)   |
| GET    | `/api/clerk/notifications`          | Get notifications        | Yes (CLERK)   |
| PATCH  | `/api/clerk/notifications/:id/read` | Mark as read             | Yes (CLERK)   |
| GET    | `/api/clerk/settings`               | Get hub settings         | Yes (CLERK)   |
| PUT    | `/api/clerk/settings`               | Update hub settings      | Yes (CLERK)   |

## 📝 API Usage Examples

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+250788123456",
    "password": "yourpassword"
  }'
```

### Get Dashboard Stats (requires authentication)

```bash
curl -X GET http://localhost:5000/api/clerk/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Register Product

```bash
curl -X POST http://localhost:5000/api/clerk/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "farmer-uuid-here",
    "produceName": "Maize",
    "category": "Grains",
    "quantity": 100,
    "unit": "Kg",
    "pricePerUnit": 1.50
  }'
```

### Get Orders

```bash
curl -X GET "http://localhost:5000/api/clerk/orders?status=PENDING&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🛡️ Security Features

- Helmet.js for HTTP header security
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Password hashing with bcrypt
- JWT token expiration
- SQL injection prevention with parameterized queries
- Input validation on all endpoints

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage
```

## 📊 Database Schema

The application uses the following main tables:

- **users**: Farmers, clerks, and buyers
- **hubs**: Physical collection locations
- **lots**: Product inventory batches
- **orders**: Buyer purchase orders
- **order_items**: Individual items in orders
- **payments**: Payment transactions
- **payouts**: Farmer payments
- **notifications**: System notifications

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## 🔄 Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run database migrations
npm run db:migrate

# Seed the database with test data
npm run db:seed
```

## 📦 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

- `NODE_ENV=production`
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (use a strong secret in production)
- `CORS_ORIGIN` (set to your frontend URL)

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure database with SSL
- [ ] Set up proper CORS origins
- [ ] Enable logging and monitoring
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Use environment-specific configs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📧 Support

For support, email info@fth.rw or create an issue in the repository.

## 🙏 Acknowledgments

- FAO for agricultural insights
- AfCFTA for trade framework support
- Rwanda Ministry of Agriculture
