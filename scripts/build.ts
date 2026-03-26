import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const root = process.cwd()
const tempDir = join(root, ".tmp")
const binDir = join(root, "node_modules", ".bin")
mkdirSync(tempDir, { recursive: true })

const env = {
  ...process.env,
  PATH: `${binDir};${process.env.PATH ?? ""}`,
  TEMP: tempDir,
  TMP: tempDir,
  TMPDIR: tempDir,
}

const generate = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  env,
})

if (generate.error) throw generate.error
if (generate.status !== 0) process.exit(generate.status ?? 1)

const build = spawnSync("next", ["build", "--experimental-build-mode", "compile"], {
  stdio: "inherit",
  env,
})

if (build.error) throw build.error
if (build.status !== 0) process.exit(build.status ?? 1)
