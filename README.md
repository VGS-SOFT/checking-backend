# checking-backend

NestJS REST API backend for the v-s ecommerce platform. Extracted from the [v-s monorepo](https://github.com/VGS-SOFT/v-s).

## Tech Stack

- **NestJS 10** — framework
- **TypeORM + SQLite (better-sqlite3)** — database
- **JWT + Passport** — authentication
- **Tree-based RBAC** — role & permission system
- **SDUI** — server-driven UI schema builder

## Quick Start (Local)

```bash
npm install
cp .env.example .env
npm run seed     # creates SuperAdmin user
npm run dev      # starts on port 4000
```

Login at `POST http://localhost:4000/api/auth/login`:
```json
{ "email": "superadmin@system.local", "password": "superadmin123" }
```

## Deploy to Hostinger

1. Connect this repo in Hostinger hPanel → Node.js → Import Git Repository
2. Set **Entry point:** `dist/main.js`
3. Set **Build command:** `npm install && npm run build && npm run seed`
4. Add environment variables in hPanel:
   - `JWT_SECRET` = long random string
   - `DB_PATH` = `/home/yourusername/database.sqlite`
   - `NODE_ENV` = `production`
5. Click **Deploy**

## Project Structure

```
src/
├── main.ts                  ← Entry point, reads PORT from env
├── app.module.ts             ← Root module
├── seed.ts                   ← DB seeder (creates SuperAdmin)
├── auth/                     ← JWT login/register/me
├── users/                    ← User CRUD
├── roles/                    ← Tree RBAC + permissions
│   └── dto/                  ← CreateRoleDto, UpdateRoleDto
├── sdui/                     ← Server-driven UI schema builder
└── common/                   ← PermissionGuard, RequirePermission decorator
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login → JWT |
| POST | `/api/auth/register` | ❌ | Register user |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/sdui/schema` | ✅ | UI schema for current user |
| GET | `/api/roles` | ✅ | List roles |
| GET | `/api/roles/tree` | ✅ | Role hierarchy tree |
| POST | `/api/roles` | ✅ | Create role |
| PATCH | `/api/roles/:id` | ✅ | Update role |
| DELETE | `/api/roles/:id` | ✅ | Delete role |
| GET | `/api/users` | ✅ | List users |
| POST | `/api/users` | ✅ | Create user |
| PATCH | `/api/users/:id` | ✅ | Update user |
| DELETE | `/api/users/:id` | ✅ | Delete user |
