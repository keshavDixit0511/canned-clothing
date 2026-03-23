// app/api/upload/route.ts

import { NextResponse } from "next/server"
import { requireSession, isAuthError } from "@/lib/auth"
import { uploadFile } from "@/services/storage/s3"

export async function POST(req: Request) {
  try {
    // ── Auth check ────────────────────────────────────────────────────────────
    // Uploads are authenticated because growth logs and product media should
    // never accept anonymous writes from the browser.
    await requireSession()

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

    const url = await uploadFile({
      buffer,
      filename: file.name,
      type:     file.type,
    })

    return NextResponse.json({ url })
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("UPLOAD_ERROR", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
