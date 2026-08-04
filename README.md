# AAA Doors — Stock Control

Inventory in/out tracking with facilities, truck dispatch proof, and role-based access. Built with **Next.js 15** and **React 19**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo logins

| User   | Username | PIN  | Role     |
|--------|----------|------|----------|
| Owner  | `admin`  | 1234 | Admin    |
| Ravi   | `ravi`   | 1111 | Manager  |
| Sunil  | `sunil`  | 2222 | Operator |

## Features

- Stock in / out / transfer with gate-pass dockets
- Live stock by facility, low-stock alerts
- Truck / driver / photo proof on dispatches
- Item master, facilities, users & RBAC
- CSV export and demo data reset
- Persists in browser `localStorage`

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Dev server (Turbopack)   |
| `npm run build` | Production build         |
| `npm start`     | Serve production build   |

## Project layout

```
app/                  Next.js App Router
  layout.js           Fonts + metadata
  page.js             Home → stock app
  globals.css         App styles
components/
  AAADoorsStock.jsx   Main client UI
lib/
  store.js            localStorage persistence
  helpers.js          Formatting / CSV / images
  domain.js           Categories, roles, permissions
  seed.js             Demo data
  stock.js            Stock calculations
```
