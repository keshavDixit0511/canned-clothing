export interface ProfileIdentityInput {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  fallback?: string
}

export function splitFullName(fullName: string | null | undefined) {
  const trimmed = fullName?.trim() ?? ""
  if (!trimmed) {
    return { firstName: "", lastName: "" }
  }

  const [firstName, ...rest] = trimmed.split(/\s+/)
  return {
    firstName: firstName ?? "",
    lastName: rest.join(" ").trim(),
  }
}

export function getDisplayName({
  name,
  firstName,
  lastName,
  email,
  fallback = "ESTHETIQUE User",
}: ProfileIdentityInput): string {
  const trimmedName = name?.trim()
  if (trimmedName) return trimmedName

  const combined = `${firstName ?? ""} ${lastName ?? ""}`.trim()
  if (combined) return combined

  const emailPrefix = email?.split("@")[0]?.trim()
  if (emailPrefix) return emailPrefix

  return fallback
}

export function getInitials(fullName: string | null | undefined, fallback = "EU") {
  const trimmed = fullName?.trim()
  if (!trimmed) return fallback

  const initials = trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || fallback
}
