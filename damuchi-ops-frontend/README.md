# Damuchi Ops Frontend

Damuchi Ops Frontend is the operational workspace for the Damuchi Tours platform. It enables authorised staff to manage tours, availability, bookings, customers, and day-to-day business operations through a secure and responsive dashboard.

Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- Operational dashboard
- Tour management
- Tour availability management
- Booking workflows
- Customer-related operations
- Staff-facing business tools
- Secure authenticated access
- Responsive user interface
- Notifications and feedback
- Scalable module-based architecture

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

## Backend Integration

The Damuchi Ops frontend communicates with the Spring Boot AuthSys backend.

### Local Backend

```text
http://localhost:8001
```

### Production Backend

```text
[https://api.kivanasafaris.com](https://api.kivanasafaris.com)
```

The backend provides authentication, authorisation, tour data, availability data, booking workflows, and related business APIs.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- Access to the AuthSys backend
- Valid backend environment configuration

### Installation

From the `damuchi-ops-frontend/` directory:

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

Use the variable name already implemented in the project’s API service layer.

### Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

### Build for Production

```bash
npm run build
```

### Start Production Build

```bash
npm run start
```

## Core Modules

### Dashboard

The dashboard provides an overview of key operational information, including tours, availability, bookings, and business activity.

### Tours

The Tours module allows authorised users to manage tour records, including:

- Creating tours
- Updating tour details
- Viewing tour information
- Managing tour status
- Managing tour availability
- Deleting or archiving tours where permitted

### Availability

The Availability module manages tour dates, capacity, schedules, and related availability information.

### Bookings

The Bookings module supports customer booking workflows, including:

- Viewing bookings
- Creating bookings where permitted
- Updating booking status
- Managing booking-related customer information
- Tracking booking progress

### Future Modules

The platform is designed to support additional business modules, including:

- Customers and CRM
- Payments
- Fleet management
- Guides and staff scheduling
- Reporting and analytics
- Notifications
- Organisations and multi-tenant support

## Authentication and Access

The Ops frontend relies on the AuthSys backend for authentication and authorisation.

Users must authenticate through the AuthSys frontend or an approved authentication flow before accessing protected operational pages.

Access is controlled by:

- JWT-based authentication
- Backend role-based access control
- Permission-based authorisation
- Frontend route protection for user experience

Supported roles include:

- `SUPERADMIN`
- `ADMIN`
- `MANAGER`
- `OPERATOR`
- `USER`
- `GUEST`

The backend remains the authoritative source for permissions and access decisions.

## Deployment

This application is deployed to Vercel.

### Vercel Project Settings

| Setting | Value |
|---|---|
| Repository | `94tec/Damuchi_tours` |
| Root Directory | `damuchi-ops-frontend` |
| Framework | Next.js |
| Build command | `npm run build` |
| Output directory | Vercel default for Next.js |
| Production domain | `https://ops.kivanasafaris.com` |

### Production Environment Variable

```env
NEXT_PUBLIC_API_URL=[https://api.kivanasafaris.com](https://api.kivanasafaris.com)
```

Or, if the project uses Vite-style variables:

```env
VITE_API_BASE_URL=[https://api.kivanasafaris.com](https://api.kivanasafaris.com)
```

Redeploy the Vercel project after changing environment variables.

## Development Guidelines

- Keep business logic out of UI components where possible.
- Use dedicated API service modules.
- Use TypeScript interfaces for all API payloads.
- Validate user input with Zod.
- Use reusable components and consistent design patterns.
- Protect sensitive operations through backend permissions.
- Do not expose administrative functionality without proper role checks.
- Keep the frontend state minimal and avoid duplicating backend data unnecessarily.

## Troubleshooting

### API Requests Fail

Check that:

- The backend is running.
- The API base URL is correct.
- CORS allows the frontend origin.
- The user is authenticated.
- The user has the required role or permission.

### Data Does Not Load

Check that:

- The backend endpoint is available.
- The API route is correct.
- Authentication tokens are valid.
- Required query parameters are provided.
- The browser console does not show CORS or network errors.

### Environment Variables Do Not Apply

Restart the development server after editing `.env.local`. For production, redeploy the Vercel project after updating environment variables.

## Support

For technical support or deployment assistance, contact:

**Fixtone Kaloki**  
Software Developer & ICT Specialist  
Email: [fixtone@94tec@gmail.com]  
Phone: [+254711274834]