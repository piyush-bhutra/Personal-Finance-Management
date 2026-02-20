# Personal Finance Management App

A full-stack personal finance management web application built using the MERN stack.  
This application allows users to track expenses, manage investments, and view their net worth based on real financial activity.

This project is intended for learning, review, and demonstration purposes and focuses on clarity and real-world financial logic.

---

## Features

### Authentication
- User signup and login using JWT authentication
- Protected routes for authenticated users

### Expense Tracking
- Add and manage daily expenses
- Categorize expenses (Food, Transport, etc.)
- View expense history

### Investment Management
- Support for one-time and recurring investments
- Track investment lifecycle (active and closed)
- Maintain historical investment records
- Calculate realized investment value on closure

### Dashboard
- Net worth calculation based on:
  - Active investments
  - Realized investment returns
  - Total expenses
- Financial overview cards
- Recent transaction activity

### Transactions & Reports
- Unified transaction history for expenses and investments
- Basic financial summaries and reports

---

## Tech Stack

Frontend:
- React (Vite)
- Tailwind CSS
- Framer Motion
- Axios

Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

---

## Project Structure

/
├── backend
│   ├── routes
│   ├── controllers
│   ├── models
│   └── server.js
│
├── frontend
│   ├── src
│   └── index.html
│
└── README.md

---

## Environment Variables

Backend:
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_jwt_secret

Frontend:
VITE_API_URL=backend_api_url

---

## Running the Project Locally

Backend:
cd backend  
npm install  
npm run dev  

Frontend:
cd frontend  
npm install  
npm run dev  

---

## Deployment

Backend:
- Deployed on Render

Frontend:
- Deployed on Vercel

---

## Notes

- This project focuses on realistic financial workflows and clean architecture
- No fake metrics, marketing claims, or automated financial advice
- Designed as a review-ready personal finance management system