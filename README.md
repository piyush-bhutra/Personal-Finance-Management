# FinanceFlow

FinanceFlow is a full-stack personal finance tracker built with React, Express, and MongoDB. It helps users manage day-to-day expenses, track one-time and recurring investments, monitor net worth, review portfolio allocation, and maintain simple monthly budgets from a single dashboard.

The project is designed around realistic personal finance workflows rather than placeholder metrics. It supports recurring records, historical entries, sold investments, transaction history, and analytics views that reflect actual stored data.

## Features

### Authentication
- JWT-based signup and login
- Protected routes for authenticated users
- Persistent client-side session handling

### Expense Management
- Add one-time expenses with exact dates
- Add recurring expenses with monthly backfilled entries
- Edit recurring expenses from a selected month onward
- Stop recurring expenses without deleting historical records
- View current expense history across the app

### Investment Management
- Add one-time investments with expected return assumptions
- Add recurring SIP-style investments with historical monthly entries
- Compute invested amount, estimated current value, and gain
- Stop or sell investments and capture realized value
- Support both active and closed investment lifecycle states

### Dashboard
- Net worth summary
- Active investment value and realized returns
- Monthly expense snapshot
- Portfolio distribution chart
- Recent transaction feed across expenses and investments

### Analytics and Reports
- Expense trend charts
- Expense category distribution
- Investment allocation and performance views
- Unified report summaries for active and closed positions

### Budget Tracking
- Create monthly category budgets
- Review budget utilization, remaining amount, and overspending
- Surface budget-related notifications on the dashboard

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Recharts
- Framer Motion
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Express Validator

## Project Structure

```text
.
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── server.js
├── frontend
│   ├── public
│   ├── src
│   └── vite.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- MongoDB database or MongoDB Atlas connection string

### 1. Install dependencies

From the project root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env` with values like:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_key
```

Optional frontend environment:

```env
VITE_API_URL=https://your-production-backend-url
```

Notes:
- In local development, the frontend uses the local `/api` proxy from Vite.
- `VITE_API_URL` is intended for deployed environments.

### 3. Run the app locally

From the project root:

```bash
npm run dev
```

This starts:
- Frontend on `http://localhost:5173`
- Backend on the port defined in `backend/.env` (commonly `5001`)

You can also run each side separately:

```bash
npm run backend
npm run frontend
```

## Available Scripts

### Root
- `npm run dev` - run frontend and backend together
- `npm run frontend` - run the Vite frontend
- `npm run backend` - run the Express backend

### Frontend
- `npm run dev` - start Vite dev server
- `npm run build` - create a production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

### Backend
- `npm run dev` - start backend with Nodemon
- `npm start` - start backend with Node

## API Overview

### Auth
- `POST /api/users` - register
- `POST /api/users/login` - login
- `GET /api/users/me` - get current user
- `PUT /api/users/profile` - update profile

### Expenses
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `PUT /api/expenses/:id/stop`

### Investments
- `GET /api/investments`
- `GET /api/investments/summary`
- `POST /api/investments`
- `PUT /api/investments/:id`
- `DELETE /api/investments/:id`
- `PUT /api/investments/:id/stop`

### Dashboard and Budgets
- `GET /api/dashboard/summary`
- `GET /api/dashboard/transactions`
- `GET /api/dashboard/budgets`
- `POST /api/dashboard/budgets`
- `DELETE /api/dashboard/budgets/:id`

## Current Behavior and Data Model Notes

- Recurring expenses and recurring investments are represented as plans plus monthly entry records.
- One-time expenses and one-time investments are stored as plans with a single entry.
- Dashboard totals are derived from stored entries and plan state rather than hardcoded snapshot values.
- Closed investments can contribute realized returns while active investments contribute estimated current value.
- Budget summaries are month-specific and use `YYYY-MM` inputs on the API.

## Build Status

The frontend production build is expected to pass with:

```bash
cd frontend
npm run build
```

## Deployment Notes

- Frontend is Vite-based and can be deployed to Vercel, Netlify, or any static host.
- Backend is an Express API and can be deployed to Render, Railway, or another Node-compatible platform.
- Ensure the deployed frontend points to the deployed backend via `VITE_API_URL`.

## License

This project is currently unlicensed in the repository metadata. Add a license file if you plan to distribute it publicly.
