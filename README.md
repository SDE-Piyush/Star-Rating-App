# Store Rating Web Application

A full-stack web platform built with **React.js**, **Express.js**, and **MySQL** that enables users to discover local stores, view community ratings, and submit or modify store ratings (1 to 5 stars). The application features dedicated role-based workflows and portals for **System Administrators**, **Store Owners**, and **Normal Users**.

---

## 🛠️ Technology Stack

- **Frontend**:
  - **React.js** (v19) - Component-based user interface
  - **Vite** - High-performance frontend build tool and development server
  - **React Router** (v7) - Client-side routing and protected routes
  - **Context API** - Global state management for authentication and session persistence
  - **Vanilla CSS** - Clean, responsive design system with custom CSS variables

- **Backend**:
  - **Node.js & Express.js** - RESTful API architecture
  - **JSON Web Tokens (JWT)** - Stateless authentication and role-based authorization middleware
  - **bcryptjs** - Salted password hashing
  - **CORS & dotenv** - Cross-origin resource sharing and environment variable management

- **Database**:
  - **MySQL 8.0** - Relational database management system
  - **mysql2/promise** - Asynchronous connection pooling and prepared statements
  - Foreign key constraints with cascading rules and composite unique constraints

---

## 📖 Project Details

### Overview & Architecture
The Store Rating Web Application connects customers with local retail businesses while providing store owners and system administrators with management and analytics tools:
- **Relational Integrity**: A composite unique constraint on `(user_id, store_id)` ensures each user can submit exactly one rating per store, which can be modified at any time without creating duplicate entries.
- **Dynamic Rating Calculation**: Store overall ratings and review counts are dynamically computed on the database layer (`ROUND(AVG(rating), 1)`), eliminating data synchronization discrepancies.
- **Role-Based Access Control (RBAC)**: All API endpoints and client-side routes enforce strict permissions based on user roles (`ADMIN`, `STORE_OWNER`, `USER`).

---

### User Roles & Key Features

#### 1. System Administrator
- **Admin Dashboard**: Live analytics showing total registered users, total registered stores, and total submitted customer ratings.
- **Store Management**:
  - Register new stores with name, email, address, and assigned store owner.
  - View all stores with multi-field search/filtering (Store Name, Email, Address) and column sorting.
  - Inspect store performance including live average ratings and assigned owner details.
- **User Management**:
  - Create new user accounts for any role (Admin, Normal User, Store Owner).
  - Search and filter users by Name, Email, Address, and Role.
  - Dynamic store owner insights displaying their associated store and current average rating.

#### 2. Normal User
- **Account Registration & Authentication**: Self-service registration with validation rules and single-portal login.
- **Store Directory**:
  - Browse stores with real-time search across store names and addresses.
  - Sort stores by Store Name, Address, Overall Rating, or user's own submitted rating.
- **Interactive Ratings & Reviews**:
  - View overall store rating (1.0 to 5.0) and total customer review count.
  - View personal submitted rating (or "Not rated yet").
  - Submit a new 1–5 star rating or update existing ratings at any time via modal dialog.
- **Profile Security**: Update account password securely from the application header.

#### 3. Store Owner
- **Store Analytics**: Dedicated dashboard featuring live store performance metrics, including overall average rating and total customer reviews.
- **Customer Feedback Breakdown**: Detailed table displaying each customer who reviewed their store (Customer Name, Email, Address, Submitted Rating, and Review Date).
- **Table Sorting**: Sort customer feedback by Customer Name, Email, Rating, or Date.
- **Profile Security**: Update account password securely while logged in.

---

## 🔑 Demo Accounts

The database comes pre-seeded with the following demo credentials for testing and evaluation across all roles:

| Role | Email | Password | Full Name | Location / Store |
|---|---|---|---|---|
| **System Administrator** | `piyushkumarsmith@gmail.com` | `Piyush@121` | Piyush Kumar | Delhi |
| **Store Owner 1** | `owner1@gmail.com` | `Piyush@121` | Piyush | Pune (`Pahadi Momos`) |
| **Store Owner 2** | `owner2@gmail.com` | `Piyush@121` | Piyush | Pune (`Chotu Tapri Wala`) |
| **Normal User 1** | `user1@gmail.com` | `Piyush@121` | Raghav | Delhi |
| **Normal User 2** | `user2@gmail.com` | `Piyush@121` | Ravi | Delhi |
| **Normal User 3** | `user3@gmail.com` | `Piyush@121` | Adya | Delhi |
