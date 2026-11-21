# AuthSys Frontend — Basecamp Staff Portal

AuthSys Frontend is the authentication and staff-administration portal for the Damuchi Tours platform. It provides secure access, onboarding, account management, role administration, and audit visibility for authorised users.

Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- User registration with approval workflow
- Secure login
- Multi-factor OTP verification
- First-time password setup
- Password reset
- Profile management
- Password management
- Pending-user approval and rejection
- User account locking and unlocking
- Role and permission administration
- Audit-log visibility
- System settings
- Responsive dashboard interface

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui and Radix UI primitives |
| Forms | React Hook Form |
| Validation | Zod |
| State management | Zustand |
| HTTP client | Axios |
| Notifications | Sonner |
| Icons | Lucide React |
| Fonts | Fraunces, Inter, JetBrains Mono |

## Backend Integration

The AuthSys frontend communicates with the Spring Boot AuthSys backend.

### Local Backend

```text
http://localhost:8001
```

### Production Backend

```text
[https://api.kivanasafaris.com](https://api.kivanasafaris.com)
```

The backend uses Firebase Authentication, Firestore, PostgreSQL, Redis, Brevo email, and Africa’s Talking SMS services.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- Access to the AuthSys backend
- Valid backend environment configuration

### Installation

From the `authsys-frontend/` directory:

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

For Vite-based configuration:

```env
VITE_API_BASE_URL=http://localhost:8001
```

For Next.js public environment configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

Use only the variable name already used by the project’s API client. Do not create duplicate environment variables.

### Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

### Start Production Build

```bash
npm run start
```

## Pages and Routes

### Public Authentication Routes

| Route | Purpose |
|---|---|
| `/login` | User login |
| `/register` | New user registration |
| `/registration-submitted` | Registration confirmation |
| `/pending-approval` | Account pending administrator approval |
| `/forgot-password` | Password-reset request |
| `/reset-password` | Password reset using a secure token |
| `/login/verify` | Login OTP verification |
| `/setup/password` | First-time password setup |
| `/setup/verify` | First-time OTP verification |
| `/setup/complete` | First-time setup completion |

### Authenticated Dashboard Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Operational overview and live statistics |
| `/tours` | Tour management |
| `/profile` | User profile management |
| `/settings` | System settings |
| `/admin/pending` | Approve or reject pending users |
| `/admin/users` | Manage user accounts |
| `/admin/roles` | Manage roles and permissions |
| `/admin/audit` | View audit logs |

## Authentication Flow

The first-time login flow follows these steps:

```text
1. User submits login credentials
2. Backend returns FIRST_TIME_LOGIN status and a temporary token
3. User sets a new password
4. Backend sends an OTP through SMS
5. User verifies the OTP
6. Backend returns a verification token
7. User completes first-time setup
8. Backend issues the final authentication token pair
```

## Security Model

- Access tokens are stored in `sessionStorage` and cleared when the browser tab is closed.
- A non-sensitive `authsys-has-session=1` cookie supports client-side route gating.
- Next.js middleware is used for user experience and route protection only.
- The backend remains the source of truth for authentication and authorisation.
- Password-reset endpoints return a generic success response to reduce email-enumeration risk.
- OTP input automatically submits after the sixth digit is entered.

## Deployment

This application is deployed to Vercel.

### Vercel Project Settings

| Setting | Value |
|---|---|
| Repository | `94tec/Damuchi_tours` |
| Root Directory | `authsys-frontend` |
| Framework | Next.js |
| Build command | `npm run build` |
| Output directory | Vercel default for Next.js |
| Production domain | `https://auth.kivanasafaris.com` |

### Production Environment Variable

```env
NEXT_PUBLIC_API_URL=[https://api.kivanasafaris.com](https://api.kivanasafaris.com)
```

Or, if the project uses Vite-style variables:

```env
VITE_API_BASE_URL=[https://api.kivanasafaris.com](https://api.kivanasafaris.com)
```

After updating environment variables, redeploy the project so the new value is included in the production build.

## Development Guidelines

- Keep API calls in dedicated service modules.
- Use TypeScript types for API requests and responses.
- Validate all user input with Zod.
- Keep authentication logic centralised.
- Do not store sensitive information in localStorage.
- Do not bypass backend authorisation checks in the frontend.
- Use reusable UI components from `shadcn/ui` where possible.
- Follow the existing folder and naming conventions.

## Troubleshooting

### API Requests Fail

Check that:

- The backend is running.
- The API base URL is correct.
- CORS allows the frontend origin.
- Required authentication headers are being sent.
- The backend is reachable from the browser.

### Login Does Not Proceed

Check that:

- The user account is approved.
- The user is not locked.
- OTP delivery is configured.
- Firebase Authentication is available.
- The backend JWT configuration is valid.

### Environment Variables Do Not Apply

Restart the development server after changing `.env.local`. For production, redeploy the Vercel project after changing environment variables.

## Support

For technical support or deployment assistance, contact:

**Fixtone Kaloki**  
Software Developer & ICT Specialist  
Email: [your email address]  
Phone: [your phone number]