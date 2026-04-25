// app/api/upload/route.ts

import { NextResponse } from "next/server"
import { requireSession, isAuthError } from "@/lib/auth"
import { uploadFile } from "@/services/storage/s3"
import { saveLocalUpload } from "@/services/storage/local"

function isPermanentRedirect(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "PermanentRedirect" ||
      (error as { Code?: string }).Code === "PermanentRedirect")
  )
}

export async function POST(req: Request) {
  try {
    // ── Auth check ────────────────────────────────────────────────────────────
    // Uploads are authenticated because growth logs and product media should
    // never accept anonymous writes from the browser.
    await requireSession(req)

    // ── File validation ───────────────────────────────────────────────────────
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      )
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      )
    }

    // ── Upload ────────────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadInput = {
      buffer,
      filename: file.name,
      type: file.type,
    }

    const shouldUseLocalUpload =
      process.env.UPLOAD_STORAGE === "local" ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.S3_BUCKET_NAME ||
      process.env.AWS_ACCESS_KEY_ID === "your_key" ||
      process.env.AWS_SECRET_ACCESS_KEY === "your_secret" ||
      process.env.S3_BUCKET_NAME === "your_bucket"

    let url: string
    if (shouldUseLocalUpload && process.env.NODE_ENV !== "production") {
      url = await saveLocalUpload(uploadInput)
    } else {
      try {
        url = await uploadFile(uploadInput)
      } catch (error) {
        if (
          process.env.NODE_ENV !== "production" &&
          isPermanentRedirect(error)
        ) {
          url = await saveLocalUpload(uploadInput)
        } else {
          throw error
        }
      }
    }

    return NextResponse.json({ url })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("UPLOAD_ERROR", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
