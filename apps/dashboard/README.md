# Admin Dashboard Application (`@repo/dashboard`)

This Next.js application serves as the admin dashboard and the backend for the chat widget.

## Features

- Provides an admin interface to view chat conversations and analytics.
- Includes user authentication (Credentials-based with NextAuth.js).
- Hosts the Socket.IO server for real-time communication with chat widgets.
- Connects to a PostgreSQL database via Prisma ORM to store conversations and user data.
- Exposes an API endpoint (`/api/ai`) for the chat widget to interact with the AI model (Google Gemini).
- Uses Tailwind CSS and Shadcn UI for styling.

## Setup

These steps assume you have already cloned the monorepo and run `npm install` in the root directory.

1.  **Database Setup:**
    - Ensure you have PostgreSQL installed and running.
    - Create a dedicated database for this application.

2.  **Environment Variables:**
    - Navigate to the `apps/dashboard` directory.
    - Create a `.env` file by copying `.env.example` (if it exists) or creating it manually.
    - Populate the `.env` file with the following required variables:
        - `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`).
        - `NEXTAUTH_SECRET`: A secret key for NextAuth.js session encryption. Generate one using `openssl rand -base64 32` or a similar tool.
        - `GEMINI_API_KEY`: Your API key for Google Gemini.
        - `NEXTAUTH_URL`: The canonical URL of your deployed dashboard (e.g., `http://localhost:3000` for local development). This is crucial for NextAuth redirects.
        - `SOCKET_PATH` (Optional): The path for the Socket.IO server. Defaults to `/api/socket` if not set.

3.  **Database Migrations:**
    - From the **root** directory of the monorepo, run the Prisma migration command:
      ```bash
      npm run dashboard:migrate:dev
      ```
    - This will synchronize your database schema with the Prisma schema definition (`apps/dashboard/prisma/schema.prisma`).

4.  **Create Initial Admin User:**
    - Start the dashboard in development mode (see Running section below).
    - Open your browser and navigate to `http://localhost:3000/signup`.
    - Register your first admin user using the signup form.

## Running the Application

Use the scripts defined in the **root** `package.json` for consistency.

-   **Development:**
    ```bash
    # From the root directory
npm run dashboard:dev
    ```
    This command runs `node server.js` (as configured in `apps/dashboard/package.json`), which starts the Next.js development server along with the integrated Socket.IO server. The application will typically be available at `http://localhost:3000`.

-   **Production Build:**
    ```bash
    # From the root directory
npm run dashboard:build
    ```
    This command executes `next build` within the `apps/dashboard` context, creating an optimized production build.

-   **Production Start:**
    ```bash
    # From the root directory
npm run dashboard:start
    ```
    This command runs `NODE_ENV=production node server.js` (as configured in `apps/dashboard/package.json`), serving the production build with the integrated Socket.IO server. Ensure you have run the build step first.

## API Endpoints

-   `/api/socket`: Handles WebSocket connections via Socket.IO.
-   `/api/ai`: Accepts POST requests from the widget to get AI responses. Expects `{ prompt: string, history: GeminiHistoryMessage[], askForName: boolean }`.
-   `/api/auth/...`: Handled by NextAuth.js for authentication.
-   `/api/conversations`: Provides data for the conversations table.
-   `/api/stats`: Provides data for dashboard analytics.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Real-time:** Socket.IO
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS, Shadcn UI
- **AI:** Google Gemini Pro

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
