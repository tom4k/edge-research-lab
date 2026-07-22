# EdgeSys Research Lab Website (Next.js + Prisma ORM)

A modern, responsive research-lab web application prototype built with **Next.js 14 App Router**, **TypeScript**, **Prisma ORM**, and a JWT-authenticated administrator dashboard ready to deploy to **Vercel**.

## Included Features

- **Next.js App Router**: Optimized, production-ready React architecture with server and client components.
- **Prisma ORM**: Full type-safe database schema mapping in `prisma/schema.prisma` configured for PostgreSQL / Vercel Postgres / Neon.
- **Vercel Storage Ready**: Built-in support for **Vercel Postgres** (PostgreSQL Database) & **Vercel Blob** (Image & File CDN Storage).
- **JWT Credential Management**:
  - Secure Web Crypto & `jose` JWT token signing via API routes (`/api/auth/login`, `/api/auth/me`, `/api/auth/users`).
  - **Role-Based Access Control (RBAC)**:
    - **Super Admin**: Full site control, page toggling, content CRUD, AND exclusive **User Management** console (adding & revoking admin accounts).
    - **Admin**: Content CRUD, site settings, and page activation.
- **Page Activation & Deactivation Console**:
  - Activate or deactivate public pages (`Research`, `People`, `Publications`, `Projects`, `News`, `Contact`).
  - Inactive pages automatically hide from header & footer navigation and present a `PageGuard` notice if accessed directly.
- **Interactive CMS & Live Data Sync**: Reactive state synced with `localStorage` fallback for real-time site updates.
- **Light & Dark Theme**: Toggleable with theme preference persistence.
- **Search & Filters**: Real-time searching and filtering for People (group/interests) and Publications (year/type).
- **Contact Form**: Local persistence for submitted inquiries with toast feedback.
- **JSON Backup & Import/Export**: Full website content backup download and restore.

## Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm run start
```

## Prisma Database Commands

```bash
# Push schema changes directly to PostgreSQL / Vercel Postgres
npx prisma db push

# Open interactive browser GUI to view and edit database tables
npx prisma studio
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

1. Push code to GitHub and import repository into Vercel.
2. In Vercel Project Dashboard → **Storage** tab, create:
   - **Postgres** (Database)
   - **Blob** (File Storage)
3. Run `npx prisma db push` or visit `/api/db/init` to set up tables.
