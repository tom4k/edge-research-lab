# EdgeSys Research Lab Website (Next.js)

A modern, responsive research-lab web application prototype built with **Next.js 14 App Router**, **TypeScript**, and a JWT-authenticated administrator dashboard ready to deploy to **Vercel**.

## Included Features

- **Next.js App Router**: Optimized, production-ready React architecture with server and client components.
- **Vercel Ready**: Preconfigured for instant one-click or CLI deployment on Vercel.
- **JWT Credential Management**:
  - Secure Web Crypto & `jose` JWT token signing via API routes (`/api/auth/login`, `/api/auth/me`, `/api/auth/users`).
  - **Role-Based Access Control (RBAC)**:
    - **Super Admin**: Full site control, page toggling, content CRUD, AND exclusive **User Management** console (adding & revoking admin accounts).
    - **Admin**: Content CRUD, site settings, and page activation.
- **Page Activation & Deactivation Console**:
  - Activate or deactivate public pages (`Research`, `People`, `Publications`, `Projects`, `News`, `Contact`).
  - Inactive pages automatically hide from header & footer navigation and present a `PageGuard` notice if accessed directly.
- **Interactive CMS & Live Data Sync**: Reactive state synced with `localStorage` for real-time site updates.
- **Light & Dark Theme**: Toggleable with theme preference persistence.
- **Search & Filters**: Real-time searching and filtering for People (group/interests) and Publications (year/type).
- **Contact Form**: Local persistence for submitted inquiries with toast feedback.
- **JSON Backup & Import/Export**: Full website content backup download and restore.

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

```bash
npm run build
npm run start
```

## Administrator Credentials

Open `/admin` or click **Admin** in the header.

### 1. Super Admin Account (Full Privileges + User Management)
- **Username:** `superadmin`
- **Password:** `super123!`

### 2. Regular Admin Account (Content & Settings Only)
- **Username:** `admin`
- **Password:** `admin123`

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npx vercel
```

### Option 2: GitHub Repository

1. Push this repository to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Vercel will automatically detect Next.js and deploy.

## Project Structure

- `src/app/`: Next.js App Router pages and API routes (`/api/auth/*`).
- `src/components/`: Header, Footer, and `PageGuard` components.
- `src/context/`: AuthContext (JWT & Users), DataContext (Lab data & page activation), and ToastContext.
- `src/lib/`: Types, seed data, and JWT auth utilities.
