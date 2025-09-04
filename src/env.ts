// Small env shim to make code and tests work both in Vite and Jest.
// - Reads from import.meta.env when present (Vite runtime)
// - Falls back to reasonable defaults in tests
// Access Vite env in Vite builds without using `import.meta` syntax directly
// (which breaks in Jest/ts-jest CJS transpilation). We evaluate it dynamically.
type EnvLike = { VITE_CHAIN_ID?: string; VITE_CONTRACT_ADDRESS?: string; VITE_DEPLOY_BLOCK?: string }
const viteEnv: EnvLike | undefined = (() => {
  try {
    // Use direct eval so it runs in the module scope (where import.meta exists under Vite)
    return (0, eval)('import.meta.env') as EnvLike | undefined
  } catch {
    return undefined
  }
})()

type NodeEnvMap = Record<string, string | undefined>
type GlobalWithNode = typeof globalThis & { process?: { env?: NodeEnvMap } }

function getNodeEnv(): NodeEnvMap | undefined {
  const g = globalThis as GlobalWithNode
  return g.process?.env
}

export const env = {
  // Avoid referencing `process` directly in the browser; use globalThis guard
  // This supports Node (Jest) and browser (Vite) environments safely.
  VITE_CHAIN_ID: (() => {
    const nodeEnv = getNodeEnv()
    return viteEnv?.VITE_CHAIN_ID ?? nodeEnv?.VITE_CHAIN_ID ?? '0xAA36A7'
  })(),
  VITE_CONTRACT_ADDRESS: (() => {
    const nodeEnv = getNodeEnv()
    return (
      viteEnv?.VITE_CONTRACT_ADDRESS ?? nodeEnv?.VITE_CONTRACT_ADDRESS ??
      '0xa011799d9467d2b33768fb1a3512f1b468b87e96'
    )
  })(),
  VITE_DEPLOY_BLOCK: (() => {
    const nodeEnv = getNodeEnv()
    return viteEnv?.VITE_DEPLOY_BLOCK ?? nodeEnv?.VITE_DEPLOY_BLOCK ?? '2273494'
  })(),
}
