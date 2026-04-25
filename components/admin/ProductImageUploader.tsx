"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { UPLOAD, API } from "@/lib/constants"

type ProductImageUploaderProps = {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
  hint?: string
}

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(API.upload, {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to upload image")
  }

  if (typeof data.url !== "string") {
    throw new Error("Upload did not return a valid URL")
  }

  return data.url as string
}

export function ProductImageUploader({
  value,
  onChange,
  label = "Product images",
  hint = "Upload JPG, PNG, or WebP images from your device. One upload at a time or multiple files together.",
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""

    if (!files.length) {
      return
    }

    setUploading(true)
    setError("")

    try {
      const uploadedUrls: string[] = []
      let failureMessage = ""

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          failureMessage = `"${file.name}" is not an image`
          break
        }

        if (file.size > UPLOAD.maxSizeBytes) {
          failureMessage = `"${file.name}" is larger than ${UPLOAD.maxSizeMB}MB`
          break
        }

        try {
          const url = await uploadImage(file)
          uploadedUrls.push(url)
        } catch (cause) {
          failureMessage = cause instanceof Error ? cause.message : "Upload failed"
          break
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls])
      }

      if (failureMessage) {
        setError(
          uploadedUrls.length > 0
            ? `${failureMessage}. ${uploadedUrls.length} file(s) uploaded successfully before that.`
            : failureMessage
        )
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function removeImage(url: string) {
    onChange(value.filter((current) => current !== url))
  }

  function openPicker() {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
            <p className="text-sm text-white/45">{hint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={UPLOAD.allowedTypes.join(",")}
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            <Button type="button" variant="secondary" onClick={openPicker} loading={uploading}>
              {uploading ? "Uploading..." : "Choose files"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <div className="relative aspect-[4/3] bg-black/30">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-3">
                <p className="truncate text-xs text-white/45">{url}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(url)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageUploader
