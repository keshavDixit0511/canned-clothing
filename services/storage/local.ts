import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

function getExtension(filename: string, mimeType: string) {
  const ext = path.extname(filename).toLowerCase()
  if (ext) return ext

  if (mimeType === "image/jpeg") return ".jpg"
  if (mimeType === "image/png") return ".png"
  if (mimeType === "image/webp") return ".webp"
  if (mimeType === "image/gif") return ".gif"

  return ""
}

export async function saveLocalUpload(input: {
  buffer: Buffer
  filename: string
  type: string
}): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadsDir, { recursive: true })

  const ext = getExtension(input.filename, input.type)
  const name = `${Date.now()}-${randomUUID().replace(/-/g, "")}${ext}`
  const filePath = path.join(uploadsDir, name)

  await writeFile(filePath, input.buffer)

  return `/uploads/${name}`
}
