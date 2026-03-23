// services/storage/s3.ts

/**
 * S3-compatible storage service (AWS S3 or Cloudflare R2).
 * Install: bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 * Env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME
 *      S3_ENDPOINT (optional — for R2 or custom endpoints)
 */

import { randomUUID } from "crypto"
import path           from "path"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadFileInput {
  buffer:   Buffer
  filename: string
  type:     string  // MIME type
  folder?:  string  // e.g. "products", "growth-logs"
}

export interface UploadResult {
  url:  string
  key:  string
  size: number
}

// ─── Client factory ───────────────────────────────────────────────────────────

function getS3Config() {
  const accessKeyId     = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region          = process.env.AWS_REGION          ?? "ap-south-1"
  const bucket          = process.env.S3_BUCKET_NAME
  const endpoint        = process.env.S3_ENDPOINT  // For R2/custom

  if (!accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME must be set")
  }

  return { accessKeyId, secretAccessKey, region, bucket, endpoint }
}

async function getS3Client() {
  const { S3Client } = await import("@aws-sdk/client-s3")
  const config        = getS3Config()

  return {
    client: new S3Client({
      region:      config.region,
      endpoint:    config.endpoint,
      credentials: {
        accessKeyId:     config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // Force path-style for R2/MinIO
      forcePathStyle: !!config.endpoint,
    }),
    bucket: config.bucket,
    config,
  }
}

// ─── Key generator ────────────────────────────────────────────────────────────

function generateKey(filename: string, folder?: string): string {
  const ext       = path.extname(filename).toLowerCase()
  const uuid      = randomUUID().replace(/-/g, "")
  const timestamp = Date.now()
  const base      = folder ? `${folder}/` : ""
  return `${base}${timestamp}-${uuid}${ext}`
}

function getPublicUrl(key: string, bucket: string, region: string, endpoint?: string): string {
  if (endpoint) {
    // Cloudflare R2 or custom
    return `${endpoint}/${bucket}/${key}`
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

// ─── Core upload ──────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to S3/R2.
 * Returns the public URL.
 */
export async function uploadFile(input: UploadFileInput): Promise<string> {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3")
  const { client, bucket, config } = await getS3Client()

  const key = generateKey(input.filename, input.folder)

  await client.send(
    new PutObjectCommand({
      Bucket:      bucket,
      Key:         key,
      Body:        input.buffer,
      ContentType: input.type,
      // Make file publicly readable
      ACL:         "public-read",
    })
  )

  return getPublicUrl(key, bucket, config.region, config.endpoint)
}

/**
 * Upload with full result (URL + key + size).
 */
export async function uploadFileDetailed(input: UploadFileInput): Promise<UploadResult> {
  const url = await uploadFile(input)
  const key = url.split("/").slice(-1)[0]

  return {
    url,
    key,
    size: input.buffer.length,
  }
}

/**
 * Delete a file from S3 by its full URL or key.
 */
export async function deleteFile(urlOrKey: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3")
  const { client, bucket, config } = await getS3Client()

  // Extract key from URL if a full URL was passed
  let key = urlOrKey
  const publicUrl = getPublicUrl("", bucket, config.region, config.endpoint)
  if (urlOrKey.startsWith(publicUrl)) {
    key = urlOrKey.replace(publicUrl, "").replace(/^\//, "")
  }

  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  )
}

/**
 * Generate a pre-signed URL for direct client uploads.
 * Expires in the given number of seconds (default: 5 minutes).
 */
export async function getPresignedUploadUrl(
  filename:   string,
  mimeType:   string,
  folder?:    string,
  expiresIn = 300
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const { PutObjectCommand }  = await import("@aws-sdk/client-s3")
  const { getSignedUrl }      = await import("@aws-sdk/s3-request-presigner")
  const { client, bucket, config } = await getS3Client()

  const key     = generateKey(filename, folder)
  const command = new PutObjectCommand({
    Bucket:      bucket,
    Key:         key,
    ContentType: mimeType,
    ACL:         "public-read",
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn })
  const publicUrl = getPublicUrl(key, bucket, config.region, config.endpoint)

  return { uploadUrl, key, publicUrl }
}

/**
 * Validate a file before upload.
 */
export function validateUpload(
  file:       { size: number; type: string },
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
): void {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed: ${allowedTypes.join(", ")}`)
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be under ${maxSizeMB}MB`)
  }
}