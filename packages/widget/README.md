# Chat Widget Package (`@repo/widget`)

This package contains the embeddable React chat widget.

## Features

- Connects to the dashboard's Socket.IO server.
- Sends user messages and receives AI responses.
- Persists conversation history in `localStorage` for the current session.
- Displays a chat bubble that expands into a chat window.
- Shows connection status and AI thinking indicators.

## Building the Widget

From the **root** of the monorepo, run:

```bash
npm run widget:build
```

This command uses Vite to build the widget into a single IIFE (Immediately Invoked Function Expression) file.

The output script will be located at:
`packages/widget/dist/chat-widget.iife.js`

## Embedding the Widget

To add the chat widget to any website, include the following script tag in your HTML file, preferably just before the closing `</body>` tag:

```html
<script src="<URL_TO_YOUR_HOSTED_WIDGET>/chat-widget.iife.js" defer></script>
```

**Explanation:**

- Replace `<URL_TO_YOUR_HOSTED_WIDGET>` with the actual URL where you host the generated `chat-widget.iife.js` file. This could be:
    - A path on the same server hosting your website (e.g., `/dist/chat-widget.iife.js`).
    - A URL from a Content Delivery Network (CDN).
    - A URL from an object storage service (like AWS S3, Google Cloud Storage).
- The `defer` attribute ensures the script is executed after the HTML document has been parsed, preventing potential blocking issues.

Once embedded, the chat bubble should appear in the bottom-right corner of the page.

## Development

While the primary way to use the widget is the built version, you can run it in development mode (though this isn't typical for embedding):

```bash
# From the root directory
npm run widget:dev
```

This usually starts a Vite dev server, often for testing the component in isolation. Refer to the root `package.json` for the exact command details. 