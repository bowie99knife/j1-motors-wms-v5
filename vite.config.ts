# Netlify tsc fix

The previous deploy failed with `tsc: not found`.

This version:
- explicitly installs build dependencies
- sets NPM_CONFIG_PRODUCTION=false
- keeps TypeScript and Vite available during Netlify builds
- pins Node 20
- includes a fresh package-lock.json
