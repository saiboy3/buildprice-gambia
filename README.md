# BuildPriceGambia

Real-time construction material price platform for The Gambia.

## Tech Stack

- **Framework**: Next.js 14 (App Router, full-stack)
- **Database**: SQLite via Prisma (swap `DATABASE_URL` for PostgreSQL in production)
- **Auth**: JWT (phone + password; OTP-ready)
- **Styling**: Tailwind CSS
- **WhatsApp**: Meta WhatsApp Cloud API webhook

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET at minimum

# 3. Create database + seed demo data
npm run db:push
npm run db:seed

# 4. Start dev server
npm run dev
```

Open http://localhost:3000

## Demo Credentials

| Role     | Phone        | Password      |
|----------|-------------|---------------|
| Admin    | 0000000000  | admin123      |
| Supplier | 2201001001  | supplier123   |
| Supplier | 2201002002  | supplier123   |
| Supplier | 2201003003  | supplier123   |

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public-facing pages (Navbar included)
│   │   ├── page.tsx        # Home / hero
│   │   ├── search/         # Search + compare prices
│   │   ├── suppliers/      # Supplier directory + profiles
│   │   ├── login/          # Auth
│   │   ├── register/
│   │   └── alerts/         # Price alert manager
│   ├── supplier/
│   │   └── dashboard/      # Supplier price management
│   ├── admin/              # Admin panel (sidebar layout)
│   │   ├── page.tsx        # Overview stats
│   │   ├── materials/      # CRUD materials
│   │   ├── suppliers/      # Approve / manage suppliers
│   │   ├── users/          # User + role management
│   │   └── logs/           # Activity log viewer
│   └── api/
│       ├── auth/           # login, register
│       ├── materials/      # GET (search), POST (admin)
│       ├── prices/         # GET with filters
│       ├── suppliers/      # GET list, GET [id], POST
│       ├── alerts/         # CRUD price alerts
│       ├── supplier/prices/ # Supplier self-service prices
│       ├── admin/          # Admin-only endpoints
│       └── whatsapp/webhook/ # Meta WhatsApp Cloud API
├── components/             # Shared UI components
└── lib/                    # db, auth, whatsapp, alerts, fetch helpers
```

## API Reference

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials?search=&category=` | List/search materials with prices |
| GET | `/api/prices?material_id=&supplier_id=&location=&min_price=&max_price=` | Filtered price list |
| GET | `/api/suppliers?location=&verified=` | Supplier directory |
| GET | `/api/suppliers/:id` | Supplier profile + prices |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login → JWT token |

### Authenticated (any user)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | My alerts |
| POST | `/api/alerts` | `{materialId, targetPrice}` |
| DELETE | `/api/alerts?id=` | Delete alert |

### Supplier (`SUPPLIER` or `ADMIN` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/supplier/prices` | My prices |
| POST | `/api/supplier/prices` | `{materialId, price, unit, stockStatus}` |
| DELETE | `/api/supplier/prices?id=` | Remove price |

### Admin (`ADMIN` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/DELETE/PATCH | `/api/admin/materials` | Manage materials |
| GET/PATCH/DELETE | `/api/admin/suppliers` | Approve/manage suppliers |
| GET/PATCH/DELETE | `/api/admin/users` | Manage users + roles |
| GET | `/api/admin/logs` | Activity log |

### WhatsApp Webhook

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/whatsapp/webhook` | Meta verification handshake |
| POST | `/api/whatsapp/webhook` | Incoming messages |

WhatsApp bot commands:
- `cement` / `rebar` / any material name → price list
- `menu` / `hi` → interactive menu
- `2` → supplier list
- `alert cement 700` → set price alert

## WhatsApp Setup

1. Create a Meta for Developers app at https://developers.facebook.com
2. Enable WhatsApp Business API
3. Set the webhook URL to: `https://yourdomain.com/api/whatsapp/webhook`
4. Set `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` in `.env`

Without these env vars the bot logs to the console (dev mode).

## Production Deployment

### PostgreSQL

Change `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/buildpricegambia"
```

Also update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run `npm run db:push && npm run db:seed`.

### Deploy to Vercel / Railway / DigitalOcean

```bash
npm run build
npm start
```

Set all environment variables in your hosting dashboard.

## Security

- Role-based access: `USER` | `SUPPLIER` | `ADMIN`
- All protected routes require `Authorization: Bearer <token>`
- Passwords hashed with bcrypt (cost 10)
- Input validated before all writes
- Activity logged for all mutations

## Admin Credentials (production)

Set in `.env` before seeding:
```
ADMIN_PHONE="your-phone-number"
ADMIN_PASSWORD="strong-password"
```
