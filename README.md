# Chat Widget and Admin Dashboard

This repository contains the code for an embeddable chat widget and an admin dashboard to view conversation analytics, built using React, Next.js, TypeScript, Socket.IO, Prisma, PostgreSQL, and Tailwind CSS.

## Project Structure

The project is structured as a monorepo using npm workspaces:

- `apps/dashboard`: Next.js application for the admin dashboard.
  - See [`apps/dashboard/README.md`](./apps/dashboard/README.md) for detailed setup and usage.
- `packages/widget`: React package for the embeddable chat widget.
  - See [`packages/widget/README.md`](./packages/widget/README.md) for detailed build and embedding instructions.
- `packages/ui`: (Optional) Shared UI components (if you add this later).
- `packages/config`: (Optional) Shared configurations like ESLint, TypeScript (if you add this later).

## Quick Start

1.  **Clone:** `git clone <repository-url>`
2.  **Install Dependencies:** `npm install` (in the root directory)
3.  **Setup Dashboard:** Follow the setup instructions in [`apps/dashboard/README.md`](./apps/dashboard/README.md) (Database, Environment Variables, Migrations, Initial User).

## Running the Application

Run these commands from the **root** directory:

1.  **Start the Dashboard (includes Socket.IO server):**
    ```bash
    npm run dashboard:dev
    ```
    The dashboard will be available at `http://localhost:3000` (or your configured port). Login using the credentials created during setup.

2.  **Build the Widget (Optional - for embedding):**
    ```bash
    npm run widget:build
    ```
    The embeddable script is generated at `packages/widget/dist/chat-widget.iife.js`.

3.  **Test the Widget:**
    - Open the `test.html` file (in the root directory) in your browser.
    - Ensure the dashboard server is running.
    - Interact with the chat bubble to test sending messages and AI responses.

## Embedding the Widget

See [`packages/widget/README.md`](./packages/widget/README.md) for instructions on how to embed the built widget script into your website.

## Technologies Used

- **Monorepo Management:** npm Workspaces
- **Frontend (Widget):** React, TypeScript, Styled Components, Socket.IO Client, Vite
- **Backend/Admin (Dashboard):** Next.js (App Router), TypeScript, Socket.IO, Prisma, PostgreSQL, NextAuth.js, Tailwind CSS, Shadcn UI
- **AI:** Google Gemini Pro
- **Database:** PostgreSQL

## Architecture Decisions

- Monorepo structure for code sharing and unified dependency management.
- Custom Next.js server (`server.js`) to integrate Socket.IO alongside the Next.js application on the same port.
- Prisma ORM simplifies database interactions.
- Session-based conversation tracking using `localStorage` on the client (widget) and passing `sessionId` to the backend (dashboard).
- Credential-based authentication for the dashboard via NextAuth.js.

## Important Notes

- **Custom Server:** Using a custom server (`server.js`) for Socket.IO integration means the dashboard application cannot be deployed on serverless platforms like Vercel that do not support long-running WebSocket connections. It requires a traditional Node.js hosting environment.
- **Environment Variables:** Ensure all required environment variables listed in `apps/dashboard/README.md` are correctly configured in `apps/dashboard/.env`.

