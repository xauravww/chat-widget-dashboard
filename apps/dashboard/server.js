import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './lib/socket.js';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // ✅ Handle static files in .next/static
      if (pathname.startsWith('/_next/static')) {
        const filePath = join('.next', pathname.replace('/_next/', ''));
        if (existsSync(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          createReadStream(filePath).pipe(res);
          return;
        } else {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  initSocketServer(server);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
