# Contributing to Farmers Trade Hub (FTH)

Thank you for helping us build a transparent agricultural marketplace for Rwanda! Please follow these guidelines to ensure a smooth contribution process.

---

## 🛠️ Local Development Setup

### Prerequisites
* **Node.js** (v18+)
* **PostgreSQL** (Running locally or via Docker)
* **Redis** (Required for BullMQ background workers)

### Repository Setup
1. **Fork** and clone the repository:
   ```bash
   git clone https://github.com/Alicade123/Final-Year-Project.git
   cd farmers-trade-hub
   ```
2. **Install Frontend Dependencies** (React + Vite):
   ```bash
   cd frontend && npm install
   ```
3. **Install Backend Dependencies** (Node + Express):
   ```bash
   cd ../backend && npm install
   ```
4. **Environment Variables**: Copy `.env.example` to `.env` in both folders and fill in your local database, Redis, and API keys.

---

## 🔄 Git Workflow & Branching

We use a standard feature-branch workflow. 

1. **Pull latest changes** from the main branch before working.
2. **Create a descriptive branch** using this naming convention:
   * `feat/feature-name` (e.g., `feat/momo-payment-api`)
   * `fix/bug-name` (e.g., `fix/receipt-sms-delay`)
   * `docs/topic` (e.g., `docs/hub-inventory-flow`)

---

## 🎨 Code Style & Standards

### Frontend (React & Tailwind CSS)
* Use functional components with hooks.
* Use Tailwind utility classes for responsive UI matching mobile, tablet, and desktop designs.
* Organize routing within the `React Router` structure.

### Backend (Node.js & Express)
* Follow RESTful API design patterns.
* Protect user-specific routes (Admin, Hub Manager, Farmer, Buyer, Transporter) using JWT authentication middleware.
* Handle database queries efficiently to avoid performance bottlenecks in reporting.

---

## 🚀 Submitting a Pull Request (PR)

1. Ensure your code builds locally without errors.
2. Open a PR against the `main` branch.
3. Your PR description must include:
   * **What was added/fixed** (e.g., "Added daily delivery report chart component").
   * **The user role affected** (e.g., Hub Manager UI).
   * **Linked Issue** (e.g., `Closes #124`).
4. Wait for at least one maintainer review before merging.
