# Enterprise Inventory Management System - Development Plan

## Overview
This document outlines the development plan for a production-ready Enterprise Inventory Management System built using the MERN stack (MongoDB Atlas, Express.js, React with Vite, Node.js). The system emphasizes security, scalability, and enterprise-grade features including Multi-Factor Authentication (MFA), Role-Based Access Control (RBAC), and comprehensive audit logging.

## Architecture
- **Monorepo Structure**:
  - `/api`: Express.js backend deployed as Vercel apiless functions.
  - `/src`: React frontend built with Vite.
  - Root: `vercel.json` for routing configuration and `package.json` for workspace management.
- **Deployment**: Vercel with monorepo configuration.
- **Routing**: `/api/(.*)` routes to `/api/index.js`, all others to `/index.html`.

## Security Features
- **Authentication**: JWT tokens stored in httpOnly cookies.
- **Multi-Factor Authentication (MFA)**: TOTP using Speakeasy library with QR code generation.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full system access.
  - `MANAGER`: Edit stock and products.
  - `VIEWER`: Read-only access.
- **Audit System**: Middleware logging all database mutations with schema: { userId, action, resource, oldData, newData, timestamp, ipAddress }.
- **Data Fetching**: TanStack Query for efficient state management.

## Data Models (Mongoose Schemas)
- **User**:
  - name: String
  - email: String (unique)
  - passwordHash: String
  - role: Enum ['ADMIN', 'MANAGER', 'VIEWER']
  - mfaEnabled: Boolean
  - mfaSecret: String
- **Product**:
  - name: String
  - SKU: String (unique)
  - category: ObjectId (ref: 'Category')
  - description: String
  - price: Number
  - quantity: Number
  - minStockLevel: Number
- **Category**:
  - name: String
  - description: String
- **Supplier**:
  - name: String
  - contactEmail: String
  - contactPhone: String
  - address: String
- **AuditLog**:
  - userId: ObjectId (ref: 'User')
  - action: String (e.g., 'CREATE', 'UPDATE', 'DELETE')
  - resource: String (e.g., 'Product', 'User')
  - oldData: Mixed
  - newData: Mixed
  - timestamp: Date
  - ipAddress: String

## API Endpoints Documentation
### Authentication
- `POST /api/auth/login`: Login with email/password, returns JWT and MFA challenge if enabled.
- `POST /api/auth/verify-mfa`: Verify TOTP code.
- `POST /api/auth/logout`: Clear JWT cookie.
- `POST /api/auth/register`: Register new user (ADMIN only).
- `GET /api/auth/me`: Get current user info.

### Users
- `GET /api/users`: List users (ADMIN).
- `POST /api/users`: Create user (ADMIN).
- `PUT /api/users/:id`: Update user (ADMIN).
- `DELETE /api/users/:id`: Delete user (ADMIN).
- `POST /api/users/:id/setup-mfa`: Setup MFA for user.
- `POST /api/users/:id/verify-mfa`: Verify MFA setup.

### Products
- `GET /api/products`: List products (all roles).
- `POST /api/products`: Create product (MANAGER+).
- `PUT /api/products/:id`: Update product (MANAGER+).
- `DELETE /api/products/:id`: Delete product (MANAGER+).

### Categories
- `GET /api/categories`: List categories.
- `POST /api/categories`: Create category (MANAGER+).
- `PUT /api/categories/:id`: Update category (MANAGER+).
- `DELETE /api/categories/:id`: Delete category (MANAGER+).

### Suppliers
- `GET /api/suppliers`: List suppliers.
- `POST /api/suppliers`: Create supplier (MANAGER+).
- `PUT /api/suppliers/:id`: Update supplier (MANAGER+).
- `DELETE /api/suppliers/:id`: Delete supplier (MANAGER+).

### Audit Logs
- `GET /api/audit-logs`: View audit logs (ADMIN).

## Development Phases
### Phase 1: Foundation (Completed)
- [x] Create DEVELOPMENT_PLAN.md
- [x] Initialize folder structure (/api, /src)
- [x] Setup root package.json with workspaces
- [x] Create vercel.json
- [x] Install dependencies

### Phase 2: Security & MFA Engine (Completed)
- [x] MongoDB connection setup
- [x] User model and MFA logic
- [x] Authentication middlewares (protect, restrictTo)

### Phase 3: Backend Business Logic (Completed)
- [x] Audit logging middleware
- [x] Inventory CRUD with Zod validation

### Phase 4: Frontend & Dashboard (Completed)
- [x] Vite + Tailwind + ShadcnUI setup
- [x] Login and MFA verification pages
- [x] Inventory management dashboard with TanStack Table


## Dependencies
- Backend (/api): mongoose, jsonwebtoken, speakeasy, qrcode, zod, cors, dotenv
- Frontend (/src): @tanstack/react-query, lucide-react, axios
- Shared: (managed via workspaces)

## Schema Maps
[Visual representations of data relationships would be added here in a real implementation]
- User -> AuditLog (1:many)
- Category -> Product (1:many)
- Supplier -> Product (1:many)
