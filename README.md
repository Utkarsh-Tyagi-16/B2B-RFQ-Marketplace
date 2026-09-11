# B2B RFQ Marketplace

A full-stack MERN application for B2B Request for Quotation (RFQ) workflows.
Buyers post procurement requests; suppliers browse and submit competitive quotations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, React Router v7, Axios, Context API |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt, stored in localStorage |
| Validation | express-validator (backend) + inline (frontend) |
| Styling | Vanilla CSS with CSS custom properties |

---

## Project Structure

```
B2B RFQ Marketplace/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # signup, login, getMe
│   │   ├── rfqController.js    # CRUD + search/filter
│   │   └── quotationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── roleMiddleware.js   # role-based access
│   │   ├── errorHandler.js     # global error handler
│   │   └── validate.js         # express-validator runner
│   ├── models/
│   │   ├── User.js
│   │   ├── RFQ.js
│   │   └── Quotation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── rfqRoutes.js
│   │   └── quotationRoutes.js
│   ├── test/
│   │   ├── auth.test.js        # Auth unit tests (7 tests)
│   │   ├── rfq.test.js         # RFQ unit tests (12 tests)
│   │   ├── quotation.test.js   # Quotation unit tests (8 tests)
│   │   ├── middleware.test.js  # Middleware & utils unit tests (18 tests)
│   │   └── helpers.js          # Mock req/res test harness
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env                    # (create from .env.example)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── Spinner.jsx
    │   │   ├── EmptyState.jsx
    │   │   └── ErrorMessage.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── CreateRFQPage.jsx
    │   │   ├── EditRFQPage.jsx
    │   │   ├── MyRFQsPage.jsx
    │   │   ├── RFQQuotationsPage.jsx
    │   │   ├── BrowseRFQsPage.jsx
    │   │   ├── RFQDetailPage.jsx
    │   │   └── MyQuotationsPage.jsx
    │   ├── services/
    │   │   └── api.js          # Axios instance + interceptors
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    └── package.json
```

---

## Local Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Clone / open the project

```bash
cd "B2B RFQ Marketplace"
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env       # On Windows: copy .env.example .env
# Edit .env — set MONGODB_URI and a strong JWT_SECRET
npm install
npm run dev
```

Backend starts on **http://localhost:5000**

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
# (optional) create .env.local if your backend runs on a different port:
#   VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**

### 4. Use the App

1. Open `http://localhost:5173`
2. Click **Sign Up** → choose **Buyer** or **Supplier**
3. **As a Buyer**: Post an RFQ → view quotations per RFQ
4. **As a Supplier**: Browse open RFQs → submit a quotation

### 5. Running Backend Unit Tests

Run the complete backend test suite (45 unit tests covering controllers, middlewares, models, and utilities):

```bash
cd backend
npm test
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public | Create account + JWT |
| POST | `/api/auth/login` | Public | Login + JWT |
| GET | `/api/auth/me` | Any | Current user |

### RFQs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rfqs` | Buyer | Create RFQ |
| GET | `/api/rfqs/my` | Buyer | My RFQs |
| PUT | `/api/rfqs/:id` | Buyer (owner) | Edit RFQ |
| DELETE | `/api/rfqs/:id` | Buyer (owner) | Close RFQ |
| GET | `/api/rfqs` | Supplier | Browse open RFQs (search/filter) |
| GET | `/api/rfqs/:id` | Any auth | RFQ detail |
| GET | `/api/rfqs/:id/quotations` | Buyer (owner) | View quotations |

#### Browse Query Params
- `?search=steel` — filter by product name (partial, case-insensitive)
- `?location=Mumbai` — filter by delivery location
- `?deadlineFrom=2024-01-01&deadlineTo=2024-12-31` — deadline range

### Quotations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/quotations` | Supplier | Submit quotation |
| GET | `/api/quotations/my` | Supplier | My submitted quotations |

---

## API Response Shape

All responses follow this consistent shape:

```json
{ "success": true, "data": { ... }, "message": "..." }
{ "success": false, "message": "...", "errors": ["..."] }
```

---

## Deployment Guide

### Backend → Render (or Railway)

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add environment variables:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random secret (use `openssl rand -hex 64`)
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `NODE_ENV` — `production`
   - `CLIENT_URL` — your Vercel frontend URL

### Frontend → Vercel (or Netlify)

1. Push the `frontend/` folder (or the whole repo) to GitHub
2. Create a new project on [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-api.onrender.com/api`)
5. Deploy — Vercel auto-detects Vite

### Database → MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist `0.0.0.0/0` (all IPs) for Render/Railway
4. Copy the connection string and set it as `MONGODB_URI` in your backend env

---

## Security Notes

- **JWT in localStorage**: Simple to implement for SPAs. Vulnerable to XSS — mitigate by sanitizing all user inputs and keeping the token expiry short.
- **Upgrade path**: Switch to httpOnly cookies + CSRF token protection for production hardening. Only `authMiddleware.js` (backend) and `services/api.js` (frontend) need changes.
- **Passwords**: bcrypt with salt rounds = 12 (computationally expensive enough to resist brute-force).
- **User enumeration**: Login returns the same error message for both "email not found" and "wrong password".
