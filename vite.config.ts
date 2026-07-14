import { defineConfig } from 'vite';

export default defineConfig({
  // Relative assets allow the same build to run at /crossclues/ and /crossclues/pr123/.
  base: './',
  publicDir: 'static'
});
