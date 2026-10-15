# SmartPrepaid

A full-stack prototype dashboard for managing prepaid electricity meters. Users can create an account, sign in, connect a meter, validate a recharge token, update a meter balance, and review recharge history.

> **Project status:** Portfolio/demo project. It is not connected to ENEO or a live electricity-meter/token provider. Use only test data.

## Tech stack

- React, Vite, React Router
- Node.js and Express
- PostgreSQL (`pg`)
- `express-session` for session-based authentication
- `bcrypt` for password hashing

## Features

- User registration and login
- Session-protected meter and recharge endpoints
- Connect and disconnect meters for a signed-in user
- Validate token status and confirm that a token belongs to the submitted meter
- Update the meter balance and record a recharge in a PostgreSQL transaction
- View meter information and recharge history

## Requirements

- Node.js 20.6 or newer (the backend uses Node's `--env-file` option)
- PostgreSQL
- npm

## Local setup

### 1. Create the database

Create a PostgreSQL database named `smartprepaid`. The application expects tables named `users`, `meter`, `user_meters`, `tokens`, and `recharges`, with columns referenced by the SQL queries in `backend/index.js`. The database schema and sample data must be created locally before using the API. Do not put real customer information or real electricity tokens in a public demo database.

### 2. Configure the backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set your local PostgreSQL password and a long, random session secret. Keep `backend/.env` private; it is ignored by Git.

Start the API from the `backend` directory:

```bash
npm run dev
```

The API defaults to `http://localhost:5000`.

### 3. Start the frontend

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`. The frontend currently calls the local API at `http://localhost:5000`, so run both applications locally for the demo.

### 4. Build and lint the frontend

From the project root:

```bash
npm run build
npm run lint
```

## Security notes

- Never commit `.env` files, database passwords, session secrets, or real token data.
- Use HTTPS, secure cookie settings, a production session store, and production-specific CORS settings before deploying.
- This prototype is not a production prepaid-meter payment or token activation service.

## Project structure

```text
smart-prepaid/
├── backend/             # Express API and PostgreSQL connection
├── src/
│   ├── components/      # Dashboard, login, registration, meter, recharge, history
│   ├── App.jsx          # Application routes and authentication state
│   └── main.jsx         # React entry point
├── public/
├── package.json
└── README.md
```

## Author

Developed as a full-stack software engineering portfolio project.
