// components/visual/ThreeDTin.tsx
"use client"

import { useEffect, useRef } from "react"
import { cn }                from "@/lib/utils"

interface ThreeDTinProps {
  className?: string
  size?:      "sm" | "md" | "lg"
  autoRotate?: boolean
  color?:     string  // accent color hex
}

const SIZE_MAP = {
  sm: { width: 120, height: 120 },
  md: { width: 200, height: 200 },
  lg: { width: 320, height: 320 },
}

export function ThreeDTin({
  className,
  size       = "md",
  autoRotate = true,
  color      = "#34d399",
}: ThreeDTinProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const { width, height } = SIZE_MAP[size]

  useEffect(() => {
    const mountNode = mountRef.current
    if (!mountNode) return

    let animFrameId: number
    let renderer: import("three").WebGLRenderer | null = null
    let scene: import("three").Scene | null = null
    let camera: import("three").PerspectiveCamera | null = null
    let tin: import("three").Group | null = null

    ;(async () => {
      const THREE = await import("three")

      // ── Renderer ──────────────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      mountNode.appendChild(renderer.domElement)

      // ── Scene ──────────────────────────────────────────────────────────────
      scene = new THREE.Scene()

      // ── Camera ─────────────────────────────────────────────────────────────
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
      camera.position.set(0, 0, 4)

      // ── Lighting ───────────────────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambient)

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
      keyLight.position.set(3, 4, 3)
      scene.add(keyLight)

      const fillLight = new THREE.DirectionalLight(color, 0.8)
      fillLight.position.set(-3, -1, 2)
      scene.add(fillLight)

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
      rimLight.position.set(0, -3, -3)
      scene.add(rimLight)

      // ── Tin can geometry ───────────────────────────────────────────────────
      const tinGroup = new THREE.Group()

      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 64, 1, true)
      const bodyMat = new THREE.MeshStandardMaterial({
        color:     0xd4d4d4,
        metalness: 0.96,
        roughness: 0.12,
        side:      THREE.DoubleSide,
      })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      tinGroup.add(body)

      // Label canvas texture
      const canvas  = document.createElement("canvas")
      canvas.width  = 512
      canvas.height = 256
      const ctx = canvas.getContext("2d")!

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, 256)
      grad.addColorStop(0, "#0d1f0d")
      grad.addColorStop(1, "#071209")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 512, 256)

      // DK monogram
      ctx.font      = "bold 96px serif"
      ctx.fillStyle = color
      ctx.textAlign = "center"
      ctx.globalAlpha = 0.9
      ctx.fillText("DK", 256, 155)

      // Brand name
      ctx.font        = "bold 20px sans-serif"
      ctx.fillStyle   = "rgba(255,255,255,0.6)"
      ctx.globalAlpha = 0.7
      ctx.letterSpacing = "8px"
      ctx.fillText("ESTHETIQUE", 256, 200)

      // Accent line
      ctx.globalAlpha = 0.5
      ctx.strokeStyle = color
      ctx.lineWidth   = 2
      ctx.beginPath()
      ctx.moveTo(80, 215); ctx.lineTo(432, 215)
      ctx.stroke()

      const labelTex = new THREE.CanvasTexture(canvas)
      const labelGeo = new THREE.CylinderGeometry(0.605, 0.605, 1.1, 64, 1, true)
      const labelMat = new THREE.MeshStandardMaterial({
        map:         labelTex,
        transparent: true,
        opacity:     0.95,
        metalness:   0.1,
        roughness:   0.7,
      })
      const label = new THREE.Mesh(labelGeo, labelMat)
      label.position.y = -0.1
      tinGroup.add(label)

      // Lid
      const lidGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 64)
      const lidMat = new THREE.MeshStandardMaterial({
        color:     0xc0c0c0,
        metalness: 0.98,
        roughness: 0.08,
      })
      const lid = new THREE.Mesh(lidGeo, lidMat)
      lid.position.y = 0.74
      tinGroup.add(lid)

      // Bottom cap
      const capGeo = new THREE.CylinderGeometry(0.61, 0.58, 0.06, 64)
      const cap    = new THREE.Mesh(capGeo, lidMat)
      cap.position.y = -0.73
      tinGroup.add(cap)

      // Top rim ring
      const rimGeo = new THREE.TorusGeometry(0.61, 0.022, 16, 64)
      const rimMat = new THREE.MeshStandardMaterial({
        color:     0xa0a0a0,
        metalness: 0.99,
        roughness: 0.05,
      })
      const rim = new THREE.Mesh(rimGeo, rimMat)
      rim.rotation.x = Math.PI / 2
      rim.position.y = 0.70
      tinGroup.add(rim)

      // Accent ring (emerald)
      const accentGeo = new THREE.TorusGeometry(0.615, 0.015, 16, 64)
      const accentMat = new THREE.MeshStandardMaterial({
        color:     color,
        metalness: 0.7,
        roughness: 0.2,
        emissive:  new THREE.Color(color),
        emissiveIntensity: 0.3,
      })
      const accent = new THREE.Mesh(accentGeo, accentMat)
      accent.rotation.x = Math.PI / 2
      accent.position.y = 0.45
      tinGroup.add(accent)

      scene.add(tinGroup)
      tin = tinGroup

      // Intro animation — elastic drop
      tin.position.y = 3
      tin.scale.set(0.5, 0.5, 0.5)

      const startTime = performance.now()
      const INTRO_MS  = 1200

      // ── Render loop ────────────────────────────────────────────────────────
      function animate(now: number) {
        animFrameId = requestAnimationFrame(animate)
        if (!renderer || !scene || !camera || !tin) return

        const elapsed = now - startTime

        // Intro animation
        if (elapsed < INTRO_MS) {
          const t = elapsed / INTRO_MS
          const eased = 1 - Math.pow(1 - t, 3)
          tin.position.y = 3 * (1 - eased)
          const s = 0.5 + 0.5 * eased
          tin.scale.set(s, s, s)
        } else {
          tin.position.y = 0
          tin.scale.set(1, 1, 1)
        }

        // Auto rotation
        if (autoRotate && elapsed > INTRO_MS) {
          tin.rotation.y += 0.008
        }

        renderer.render(scene, camera)
      }

      requestAnimationFrame(animate)
    })()

    return () => {
      cancelAnimationFrame(animFrameId)
      renderer?.dispose()
      if (mountNode && renderer?.domElement) {
        mountNode.removeChild(renderer.domElement)
      }
    }
  }, [width, height, autoRotate, color])

  return (
    <div
      ref={mountRef}
      className={cn("relative", className)}
      style={{ width, height }}
    />
  )
}

export default ThreeDTin
