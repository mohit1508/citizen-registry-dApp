# Citizens Registry

A React + Vite dApp for managing a simple on‑chain “citizens” registry on Sepolia using Ethers v6. It lists citizens emitted by a smart‑contract event, lets you add new citizens, and view per‑citizen notes. Styling uses Tailwind CSS (v4). State/IO is handled with React Query and React Hook Form.

## Features

- Add a citizen (age, city, name, note) via connected wallet
- List citizens from contract logs with graceful fallbacks
- Per‑row “Show note” loads the note lazily
- Light/dark theme with persistent toggle (localStorage)
- Responsive: cards on mobile, table on desktop

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

## Testing

- Run unit tests:
  - `npm test`
- Watch mode:
  - `npm run test:watch`
- Coverage report:
  - `npm run test:coverage`

Notes
- Tests use JSDOM and React Testing Library.
- Some environment‑specific branches are covered via test helpers; others are intentionally ignored with `/* istanbul ignore */` comments where deterministic coverage isn’t feasible.

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

## Troubleshooting

- I see only “Unknown” in the City column
  - Ensure the contract and ABI match. If the event uses an indexed string for `city`, the UI will show a short hash when the transaction input cannot be parsed.
- No citizens display
  - Check `VITE_CONTRACT_ADDRESS` and `VITE_DEPLOY_BLOCK` and that your RPC sees the correct network.
- Theme doesn’t change
  - Clear `localStorage.theme`, hard refresh. The `html` element must toggle the `dark` class; Tailwind `dark:` variants depend on it.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type‑check then build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm test` — run tests

