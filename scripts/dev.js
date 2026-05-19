// dev.js
import browserSync from 'browser-sync';
import { createProxyMiddleware } from 'http-proxy-middleware';

const bs = browserSync.create();

const apiProxy = createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathFilter: ['/api', '/oauth']
});

bs.init({
  server: {
    baseDir: "exampleSite/public",
    // This maps http://localhost:1234/design-system to your folder
    routes: {
      "/design-system": "exampleSite/public"
    },
    middleware: [apiProxy]
  },
  // Automatically opens the browser at the correct sub-path
  startPath: "/design-system/", 
  files: ["exampleSite/public/**/*"],
  port: 1234,
  open: true,
  notify: false
});