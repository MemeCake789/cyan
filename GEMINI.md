# Project Overview

This project is a web application that provides access to a collection of unblocked games. It's designed to be a gateway to games that might otherwise be blocked on certain networks.

The frontend is built with React and Vite, and the backend is an Express server. The application uses a bare server for proxying requests, allowing users to access games that might be blocked. It also includes features for users to recommend new games and report bugs.

The application supports different types of games, including HTML5, Flash (using the Ruffle.js emulator), and emulated games for various consoles.

## Key Technologies

*   **Frontend:** React, Vite
*   **Backend:** Node.js, Express
*   **Proxy:** @tomphttp/bare-server-node
*   **Styling:** CSS
*   **Deployment:** Vercel

# Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start the Vite development server, and you can access the application at `http://localhost:5173` (or another port if 5173 is in use).

3.  **Build for production:**

    ```bash
    npm run build
    ```

    This will create a `dist` directory with the optimized production build of the application.

# Development Conventions

*   **Linting:** The project uses ESLint for code quality and consistency. You can run the linter with:

    ```bash
    npm run lint
    ```

*   **API:** The application has a custom API handler in `vite.config.js` that loads API routes from the `/api` directory.
*   **Proxy:** The Vite development server is configured to proxy requests to `/g4f` and `/discord`.
*   **Obfuscation:** The production build uses `vite-plugin-javascript-obfuscator` to obfuscate the JavaScript code.

# Environment Variables

The application uses the following environment variables:

*   `BLOB_READ_WRITE_TOKEN`: A token for authenticating with Vercel Blob storage, used for the game recommendation and bug reporting features.
*   `PORT`: The port on which the Express server will run (defaults to 8080).
