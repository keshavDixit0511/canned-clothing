// components/home/TinScene/TinScene.tsx
"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { createScene } from "./Scene"
import { buildTinCan } from "./TinCan"
import { buildTShirt, buildSeedPouch, buildPlant } from "./objects"

gsap.registerPlugin(ScrollTrigger)

interface TinSceneProps {
  className?:       string
  scrollContainer?: string
}

export function TinScene({ className = "", scrollContainer }: TinSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    // ── 1. Scene ──────────────────────────────────────────────────────────────
    const { renderer, scene, camera, controls, envMap, dispose: disposeScene } =
      createScene(canvas)

    // ── 2. Objects ────────────────────────────────────────────────────────────
    const tin   = buildTinCan(envMap)
    const shirt = buildTShirt(envMap)
    const pouch = buildSeedPouch(envMap)
    const plant = buildPlant()

    // ── 3. Position ───────────────────────────────────────────────────────────
    tin.group.position.set(0, 0, 0)
    tin.group.rotation.y = 0.4
    scene.add(tin.group)

    shirt.group.position.set(-2.1, -0.55, -0.5)
    shirt.group.rotation.set(0.1, 0.25, 0.08)
    shirt.group.scale.setScalar(0)
    scene.add(shirt.group)

    pouch.group.position.set(2.0, -0.2, -0.3)
    pouch.group.rotation.set(0.08, -0.3, 0.15)
    pouch.group.scale.setScalar(0)
    scene.add(pouch.group)

    plant.group.position.set(0, 1.1, 0)
    plant.group.scale.setScalar(0)
    scene.add(plant.group)

    // ── 4. Render loop ────────────────────────────────────────────────────────
    let rafId: number
    const clock = new THREE.Clock()

    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const elapsed = clock.getElapsedTime()

      tin.group.position.y   = Math.sin(elapsed * 0.6) * 0.06
      shirt.group.position.y = -0.55 + Math.sin(elapsed * 0.5 + 1.2) * 0.08
      pouch.group.position.y = -0.2  + Math.sin(elapsed * 0.7 + 2.4) * 0.07

      const glowMat = plant.glowRing.material as THREE.MeshBasicMaterial
      if (glowMat.opacity > 0) {
        glowMat.opacity = 0.2 + Math.sin(elapsed * 2.2) * 0.15
      }

      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    // ── 5. GSAP intro ─────────────────────────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.3 })

    tl.from(tin.group.position, {
      y: 4, duration: 1.4, ease: "elastic.out(1, 0.55)",
    })
    tl.from(tin.group.rotation, {
      y: -Math.PI * 2, duration: 1.4, ease: "power3.out",
    }, "<")
    tl.from(tin.group.scale, {
      x: 0, y: 0, z: 0, duration: 0.6, ease: "back.out(2)",
    }, "<0.1")

    tl.to(shirt.group.scale, {
      x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.6)",
    }, "-=0.5")
    tl.from(shirt.group.position, {
      x: -4.5, duration: 0.9, ease: "power3.out",
    }, "<")

    tl.to(pouch.group.scale, {
      x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.6)",
    }, "-=0.7")
    tl.from(pouch.group.position, {
      x: 5, duration: 0.9, ease: "power3.out",
    }, "<")

    // ── 6. ScrollTrigger — plant growth ───────────────────────────────────────
    ScrollTrigger.create({
      trigger: scrollContainer ?? wrapper,
      start:   "top 60%",
      once:    true,
      onEnter: () => {
        const plantTl = gsap.timeline()

        plantTl.to(plant.group.scale, {
          x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2)",
        })
        plantTl.to(plant.stem.scale, {
          y: 1, duration: 1.2, ease: "power2.out",
        }, "-=0.2")
        plantTl.to(plant.glowRing.material as THREE.MeshBasicMaterial, {
          opacity: 0.35, duration: 0.8, ease: "power2.out",
        }, "-=0.8")
        plantTl.to(plant.leafL.scale, {
          x: 1, y: 1, z: 1, duration: 0.7, ease: "elastic.out(1, 0.6)",
        }, "-=0.3")
        plantTl.to(plant.leafL.rotation, {
          z: 0.45, duration: 0.7, ease: "power2.out",
        }, "<")
        plantTl.to(plant.leafR.scale, {
          x: 1, y: 1, z: 1, duration: 0.7, ease: "elastic.out(1, 0.6)",
        }, "-=0.4")
        plantTl.to(plant.leafR.rotation, {
          z: -0.5, duration: 0.7, ease: "power2.out",
        }, "<")
        plantTl.to(plant.leafTop.scale, {
          x: 0.65, y: 0.65, z: 0.65, duration: 0.6, ease: "elastic.out(1, 0.5)",
        }, "-=0.3")
        plantTl.add(() => {
          gsap.to(plant.leafL.rotation, {
            z: 0.55, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1,
          })
          gsap.to(plant.leafR.rotation, {
            z: -0.6, duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.4,
          })
        })
      },
    })

    // ── 7. Hover ──────────────────────────────────────────────────────────────
    const onEnter = () => gsap.to(controls, { autoRotateSpeed: 3.5, duration: 0.5 })
    const onLeave = () => gsap.to(controls, { autoRotateSpeed: 0.8, duration: 1.2 })
    canvas.addEventListener("pointerenter", onEnter)
    canvas.addEventListener("pointerleave", onLeave)

    // ── 8. Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener("pointerenter", onEnter)
      canvas.removeEventListener("pointerleave", onLeave)
      gsap.killTweensOf([
        tin.group.position,  tin.group.rotation,  tin.group.scale,
        shirt.group.scale,   shirt.group.position,
        pouch.group.scale,   pouch.group.position,
        plant.group.scale,   plant.stem.scale,
        plant.leafL.scale,   plant.leafL.rotation,
        plant.leafR.scale,   plant.leafR.rotation,
        plant.leafTop.scale, plant.glowRing.material, controls,
      ])
      ScrollTrigger.getAll().forEach((t) => t.kill())
      tin.dispose()
      shirt.dispose()
      pouch.dispose()
      plant.dispose()
      disposeScene()
    }
  }, [scrollContainer])

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full ${className}`}
    >
      {/* Three.js renders into this canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Drag hint — bottom center */}
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-[0.25em] uppercase text-white/20 pointer-events-none select-none">
        drag to rotate
      </p>
    </div>
  )
}