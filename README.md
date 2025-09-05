# Citizens Registry

A React + Vite dApp for managing a simple on‑chain citizens registry on Sepolia using Ethers v6. It lists citizens emitted by a smart‑contract event, lets you add new citizens, and view per‑citizen notes. Styling uses Tailwind CSS (v4). Data fetching/caching is handled with React Query; forms with React Hook Form and Zod.

## Features

- Wallet connect: Guides install/connect of MetaMask and ensures Sepolia is selected.
- Citizens directory: Lists citizens from contract logs with graceful empty/error states.
- Search & sort: Search by name, city, or age; sort by ID, name, age, city with ascending/descending toggle.
- Pagination: 10 items per page with first/prev/next/last controls and validated page input.
- Notes on demand: Per‑row “Show note” loads the note lazily and caches it.
- Add citizen: Add age, city, name, note via connected wallet with form validation.
- Local fallback: Session‑only local add when a transaction is rejected (no funds required).
- Theme: Light/dark theme with persistent toggle (localStorage).

## Tech Stack

- React 19 + Vite 7
- TypeScript 5
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Ethers v6
- React Query, React Hook Form, Zod
- Jest + React Testing Library

## Getting Started

### 1) Prerequisites

- Node.js 18+ (LTS recommended)
- MetaMask (or compatible) wallet in your browser
- A Sepolia RPC (e.g., Infura/Alchemy) configured in your wallet
- A deployed contract compatible with the provided ABI (`src/abi/testTaskABI.json`)

### 2) Install dependencies

```
npm install
```

### 3) Configure environment

Create a `.env` in the project root (same folder as `package.json`). Values below are examples; replace with your own.

```
VITE_CHAIN_ID=0xAA36A7                 # Sepolia chain id in hex
VITE_CONTRACT_ADDRESS=0x...            # Deployed contract address
VITE_DEPLOY_BLOCK=2273494              # Block to start reading logs from
```

Notes
- These are read by `src/env.ts` and are safe for the browser (public).
- `VITE_DEPLOY_BLOCK` should be a block at or before the first Citizen event to keep log queries fast.

### 4) Run the app

- Dev server:
  - `npm run dev` → http://localhost:5173
- Build:
  - `npm run build`
- Preview built app:
  - `npm run preview`

## Contract Interface (excerpt)

See `src/abi/testTaskABI.json`. The UI expects these parts:

- Event: `Citizen(uint256 indexed id, uint256 indexed age, string indexed city, string name)`
- Function: `addCitizen(uint256 age, string city, string name, string someNote)`
- Function: `getNoteByCitizenId(uint256 id) returns (string)`

Implementation details
- Because `city` is indexed as a string, the event topic contains only a hash. The app recovers the readable city by parsing the transaction input when possible. If only the hash is available, it shows the first 10 characters followed by `...`.

## Theming

- Theme is stored in `localStorage` (`theme` = `light` | `dark`).
- Default theme is `light`. System preferences are ignored by design.
- Tailwind dark mode is class‑based (`dark` on `html`).
- Header logo swaps based on theme:
  - Light: `/logo.png`
  - Dark: `/logo-light.png`

## Local Add Fallback (No Funds)

When you don’t have Sepolia funds or you reject the MetaMask prompt, the app can still accept new citizens for the current browser session:

- Trigger: if the wallet returns `code: "ACTION_REJECTED"` on `addCitizen`, the app stores the entry locally instead of failing.
- Storage: entries are saved in `sessionStorage` and cleared when the tab/window is closed.
- Identification: locally added citizens receive negative IDs to avoid collisions with on‑chain IDs.
- Merging: the citizens list merges on‑chain data with local session entries; notes for local entries are read from the same session storage.
- Scope: this is a convenience for demos/tests; on‑chain state remains the source of truth when transactions succeed.

## Testing

- Run unit tests:
  - `npm test`
- Watch mode:
  - `npm run test:watch`
- Coverage report:
  - `npm run test:coverage`

Notes
- Tests use JSDOM and React Testing Library.
- High‑value interaction tests cover search, sort, and pagination on the citizen list, and full Add Citizen flows (success, rejection fallback, error paths).
- The repository is configured with strict coverage thresholds in `jest.config.cjs`.

## Project Structure

```
src/
  app/                # Router + QueryClient
  components/         # UI components
  hooks/              # Ethers + data + theme hooks
  pages/              # Route pages
  services/           # Data mappers using Ethers provider
  abi/                # Contract ABI json
  utils/              # Chain utils
  env.ts              # Vite env shim
  styles.css          # Tailwind entry + base resets
index.html            # Theme bootstrap + root
```

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type‑check then build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm test` — run tests

