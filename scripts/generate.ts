import { mkdirSync } from "node:fs"
import { delimiter, join } from "node:path"
import { spawnSync } from "node:child_process"

const root = process.cwd()
const tempDir = join(root, ".tmp")
const binDir = join(root, "node_modules", ".bin")
mkdirSync(tempDir, { recursive: true })

const env = {
  ...process.env,
  PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
  TEMP: tempDir,
  TMP: tempDir,
  TMPDIR: tempDir,
}

const result = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  env,
})

if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
