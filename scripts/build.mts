import fs from 'node:fs/promises'

import esbuild from 'esbuild'

await fs.rm('dist', { recursive: true, force: true })

await esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  minify: true,
})
