import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const tempDir = join(process.cwd(), ".tmp")
mkdirSync(tempDir, { recursive: true })

const result = spawnSync("bunx", ["prisma", "generate"], {
  stdio: "inherit",
  env: {
    ...process.env,
    TEMP: tempDir,
    TMP: tempDir,
    TMPDIR: tempDir,
  },
})

if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
