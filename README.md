# AssemblyOS - Manufacturing & Inventory Management 🏭

AssemblyOS is a full-stack manufacturing management application built from the ground up. It provides a comprehensive solution for businesses to digitally create, track, and manage their entire production process, from raw material inventory to finished goods. This project replaces fragmented spreadsheets and manual tracking with a centralized, secure, and user-friendly platform.

---

## ✨ Key Features

* **Secure Authentication**: Full user authentication system with registration, login, and a secure "Forgot Password" flow using in-house OTP simulation. Passwords are professionally hashed using **bcryptjs**.
* **Role-Based Access Control**: Differentiates between user roles (Admin, Producer, etc.) to secure different parts of the application, enforced on both the backend and frontend.
* **Dynamic Dashboard**: A real-time analytics dashboard with KPI cards for "Total Products," "Inventory Items," and "Low Stock Alerts."
* **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for products.
* **Bill of Materials (BOM)**: A sophisticated system to define product "recipes," including both material components and operational steps (Work Orders) with time requirements.
* **Manufacturing Orders**: A complete workflow for creating, viewing, and updating the status of production jobs (`Planned`, `In Progress`, `Done`).
* **Smart Inventory System**:
    * Calculates **"Quantity Available"** vs. **"Quantity on Hand"** by accounting for stock committed to open orders.
    * Live feasibility checks to prevent the creation of orders if raw materials are insufficient.
    * Inventory levels are automatically updated when an order is produced.
* **Work Center Analytics**: A dedicated page to track the cost and time spent at each production center (Assembly, Painting, Packing).
* **Polished UI**:
    * Built with the modern Mantine component library.
    * Includes a sleek Dark/Light theme switcher.
    * Interactive tables with live searching and filtering.

---

## 🛠️ Tech Stack

### Backend
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL
* **Authentication**: JSON Web Tokens (JWT)
* **Password Hashing**: bcryptjs

### Frontend
* **Framework**: React (built with Vite)
* **UI Library**: Mantine
* **Routing**: React Router
* **API Client**: Axios
* **Styling**: In-house component styling with Mantine

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* Node.js and npm installed
* PostgreSQL installed and running

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/ShariqSheikhh/AssemblyOS.git](https://github.com/ShariqSheikhh/AssemblyOS.git)
    cd AssemblyOS
    ```

2.  **Backend Setup:**
    * Navigate to the backend folder: `cd mfg_backend`
    * Install NPM packages: `npm install`
    * Connect to PostgreSQL (`psql`) and create your database: `CREATE DATABASE manufacturing_db;`
    * Create a `.env` file in the `mfg_backend` root and add the following variables:
        ```env
        PORT=3000
        DB_USER=postgres
        DB_HOST=localhost
        DB_DATABASE=manufacturing_db
        DB_PASSWORD=YOUR_POSTGRES_PASSWORD
        DB_PORT=5432
        JWT_SECRET=YOUR_SUPER_SECRET_KEY
        ```
    * Run the server: `npm start`

3.  **Frontend Setup:**
    * Open a new terminal and navigate to the frontend folder: `cd frontend`
    * Install NPM packages: `npm install`
    * Run the development server: `npm run dev`

The application should now be running, with the frontend on `http://localhost:5173` and the backend on `http://localhost:3000`.

---
