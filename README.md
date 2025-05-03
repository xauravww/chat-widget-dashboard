# Chat Widget and Admin Dashboard

This repository contains the code for an embeddable chat widget and an admin dashboard to view conversation analytics, built using React, Next.js, TypeScript, Socket.IO, Prisma, PostgreSQL, and Tailwind CSS.

## Project Structure

- `apps/dashboard`: Next.js application for the admin dashboard.
  - Handles Socket.IO server.
  - Connects to PostgreSQL via Prisma.
  - Provides API for AI interaction (Gemini).
  - Includes authentication.
- `packages/widget`: React package for the embeddable chat widget.
  - Connects to the dashboard's Socket.IO server.
  - Persists messages locally.
  - Calls dashboard API for AI responses.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install 
    ```
3.  **Set up PostgreSQL:**
    - Make sure you have PostgreSQL installed and running.
    - Create a database for this project.
4.  **Configure Environment Variables:**
    - Navigate to `apps/dashboard`.
    - Create `.env` from `.env.example` or manually.
    - Edit `.env` and provide `DATABASE_URL`, `NEXTAUTH_SECRET`, `GEMINI_API_KEY`, `NEXTAUTH_URL`.
5.  **Run Database Migrations:**
    ```bash
    # Ensure you are in the root directory
    npm run dashboard:migrate:dev 
    ``` 
6.  **Create Initial User:**
    - Start the dashboard: `npm run dashboard:dev`
    - Navigate to `http://localhost:3000/signup` in your browser.
    - Create your admin user account using the form.

## Running the Application

1.  **Start the Dashboard (includes Socket.IO server):**
    ```bash
    npm run dashboard:dev
    ```
    The dashboard will be available at `http://localhost:3000`.
    Login using the credentials you created on the `/signup` page.

2.  **Build the Widget:**
    ```bash
    npm run widget:build
    ```
    This creates the embeddable script at `packages/widget/dist/chat-widget.iife.js`.

3.  **Test the Widget:**
    - Open the `test.html` file (in the root directory) in your browser.
    - You should see the chat bubble. Interact with it to test sending messages and AI responses.

## Embedding the Widget

Include the following script tag in any HTML page where you want the widget to appear:

```html
<script src="<URL_TO_YOUR_HOSTED_WIDGET>/chat-widget.iife.js" defer></script>
```

Replace `<URL_TO_YOUR_HOSTED_WIDGET>` with the actual URL where you host the `chat-widget.iife.js` file (e.g., from a CDN or your own server).

## Technologies Used

- **Frontend (Widget):** React, TypeScript, Styled Components, Socket.IO Client, Vite
- **Backend (Dashboard):** Next.js (App Router), TypeScript, Socket.IO, Prisma, PostgreSQL, NextAuth.js, Tailwind CSS, Shadcn UI
- **AI:** Google Gemini Pro
- **Database:** PostgreSQL
- **Monorepo Management:** npm Workspaces

## Architecture Decisions

- Monorepo structure for code sharing and unified dependency management.
- Next.js API Routes handle Socket.IO connections and AI API calls, keeping sensitive keys off the client.
- Prisma ORM simplifies database interactions.
- Session-based conversation tracking using `localStorage` on the client and passing `sessionId` to the backend.
- Basic credential-based authentication for the dashboard.

## Challenges Faced (Optional)

- (Add any significant challenges encountered and how they were overcome) 