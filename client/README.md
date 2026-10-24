# Prove-It Path — Frontend Client

Frontend application for Prove-It Path built with React, Vite, and TypeScript.

## Design Principles
- Editorial learning product aesthetic (warm parchment background `#fcfbf9`, deep charcoal ink `#1b1c1d`, restrained status accents).
- High-density tabular layout and monospace SQL view.
- Desktop-first responsive layout (baseline 1280×720).

## Development Setup

```bash
cd client
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`.

## Production Build

```bash
cd client
npm run build
```

## Shared Contract
Shared TypeScript interfaces live in `src/types/contract.ts`. These represent the agreed contract between frontend, learning engine, and backend services.
