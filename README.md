
# 🌾 Farmers Trade Hub (FTH)

A modern digital agricultural marketplace connecting farmers, collection hubs, transporters, and buyers across Rwanda.

---

# 📖 Project Overview

Farmers Trade Hub (FTH) is a web-based platform designed to reduce post-harvest losses, improve market accessibility, and create transparent agricultural trade between farmers and buyers.

The platform allows hub managers to record farmer harvest deliveries, manage inventory, connect produce to buyers, track sales, manage payments, and generate reports — all through a modern responsive digital system.

---

# 🎯 Project Objectives

## General Objective
To develop a digital agricultural trading platform that connects farmers with buyers, reduces post-harvest losses, and improves efficient market access in Rwanda.

## Specific Objectives

- Allow hubs to register and manage farmer produce
- Allow buyers to browse and purchase harvests
- Ensure transparent transactions and fair pricing
- Reduce middlemen exploitation
- Digitize agricultural trade workflows
- Generate reports for decision-making and analysis
- Improve logistics and supply chain tracking

---

# 👥 System Users

## 1. Admin
- Manage users
- Manage hubs
- View reports
- Monitor platform activity

## 2. Hub Manager / Clerk
- Register farmers
- Record deliveries
- Manage inventory
- Create sales
- Process payouts

## 3. Farmer
- Deliver produce
- Receive digital receipts
- Receive payment notifications
- Track sales and balances

## 4. Buyer
- Browse available products
- Place orders
- Make payments
- Track purchases

## 5. Transporter
- Manage deliveries
- Update transport status

---

# ⚙️ Core Features

## 🌾 Farmer Management
- Farmer registration
- Farmer profile management
- Farmer delivery history

## 📦 Harvest Collection
- Record harvest deliveries
- Generate digital receipts
- Track inventory quantities

## 🏪 Inventory Management
- Store available harvests
- Track stock quantities
- Monitor sold and available produce

## 🛒 Buyer Marketplace
- Browse available products
- Place orders
- Track order status

## 💳 Payments
- Mobile Money integration
- Bank payment support
- Farmer payouts
- Buyer payment tracking

## 🔔 Notifications
- SMS notifications
- Payment confirmations
- Order updates
- Delivery alerts

## 📊 Reports & Analytics
- Daily deliveries
- Sales reports
- Farmer payout reports
- Inventory reports
- Revenue tracking

## 📱 Responsive Design
- Mobile friendly
- Tablet compatible
- Desktop optimized

---

# 🧱 System Architecture

## Frontend
Modern responsive web application built using:

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart Libraries

## Backend
REST API server built using:

- Node.js
- Express.js
- JWT Authentication
- RESTful APIs

## Database
- PostgreSQL

## Additional Services
- Redis
- BullMQ
- SMS Gateway
- Mobile Money APIs

---

# 🗂️ Project Structure

## Frontend Structure

```bash
FTH-frontend/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── routes/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
└── vite.config.js
````

## Backend Structure

```bash
FTH-backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── jobs/
│   ├── utils/
│   ├── database/
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env
```

---

# 🛠️ Technologies Used

| Technology     | Purpose             |
| -------------- | ------------------- |
| React.js       | Frontend UI         |
| Vite           | Frontend build tool |
| Tailwind CSS   | Styling             |
| Node.js        | Backend runtime     |
| Express.js     | API framework       |
| PostgreSQL     | Database            |
| JWT            | Authentication      |
| Redis          | Queue & caching     |
| BullMQ         | Background jobs     |
| Axios          | API requests        |
| GitHub Actions | CI/CD               |

---

# 🚀 Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone https://github.com/Alicade123/Final-Year-Project.git
```

---

# 2️⃣ Frontend Setup

```bash
cd FTH-frontend

npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 3️⃣ Backend Setup

```bash
cd FTH-backend

npm install
```

Create `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=fth_db

JWT_SECRET=your_secret_key
```

Start backend server:

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 🗄️ Database Design (Core Tables)

## Users

* id
* name
* email
* password
* role

## Farmers

* id
* name
* phone
* village

## Deliveries

* id
* farmer_id
* product_name
* quantity
* receipt_number

## Inventory

* id
* product_name
* quantity
* status

## Orders

* id
* buyer_id
* product_id
* quantity
* status

## Payments

* id
* farmer_id
* amount
* payment_method
* status

---

# 🔐 Security Features

* JWT Authentication
* Password hashing using bcrypt
* Role-Based Access Control (RBAC)
* Secure API validation
* Protected routes
* Environment variable protection

---

# 📈 Future Enhancements

* AI price prediction
* Real-time logistics tracking
* Offline-first support
* QR code receipts
* Multi-language support
* Mobile application
* Smart analytics dashboard

---

# 🧪 Testing

Planned testing includes:

* Unit testing
* API testing
* User acceptance testing
* Responsive testing
* Security testing

---

# 📌 Development Phases

## Phase 1

* Project setup
* Authentication
* Dashboard UI

## Phase 2

* Farmer registration
* Delivery recording
* Inventory management

## Phase 3

* Buyer marketplace
* Order management
* Payments integration

## Phase 4

* Notifications
* Reports
* Analytics

## Phase 5

* Deployment
* Optimization
* Final testing

---

# 📷 Key Screens

Planned interfaces include:

* Login Page
* Dashboard
* Farmer Management
* Delivery Recording
* Inventory Tracking
* Buyer Marketplace
* Reports & Analytics
* Payments Management

---

# 🌍 Project Scope

The system is designed to support:

* Farmers
* Buyers
* Collection Hubs
* Transporters
* Government Agencies
* NGOs

Initially focused on Rwanda with scalability for regional expansion.

---

# 👨‍💻 Developers

### Alicade ft Mugisha

Final Year IT Students
RP Kigali College — Rwanda

---

# 📚 References

* Rwanda Agricultural Development Policies
* Agricultural E-Commerce Studies
* Supply Chain Optimization Research
* Digital Transformation Strategy Reports

---

# 📄 License

This project is developed for educational and academic purposes.

---

# ⭐ Vision

To build a smart, transparent, and scalable agricultural digital marketplace that empowers farmers and modernizes agricultural trade in Rwanda.
