// components/home/TinScene/scene.ts

import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SceneContext {
  renderer:  THREE.WebGLRenderer
  scene:     THREE.Scene
  camera:    THREE.PerspectiveCamera
  controls:  OrbitControls
  pmrem:     THREE.PMREMGenerator
  envMap:    THREE.Texture
  dispose:   () => void
}

// ─── createScene ──────────────────────────────────────────────────────────────

export function createScene(canvas: HTMLCanvasElement): SceneContext {

  // ── Renderer ────────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:  true,
    alpha:      true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.toneMapping          = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure  = 1.2
  renderer.shadowMap.enabled    = true
  renderer.shadowMap.type       = THREE.PCFSoftShadowMap

  // ── Scene ───────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene()
  // No background — canvas has alpha so page bg shows through

  // ── PMREMGenerator + RoomEnvironment (IBL reflections) ─────────────────────
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  const roomEnv = new RoomEnvironment()
  const envMap  = pmrem.fromScene(roomEnv, 0.04).texture
  scene.environment     = envMap
  scene.environmentIntensity = 0.6

  // ── Camera ──────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    38,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 0.4, 5.5)

  // ── Controls ─────────────────────────────────────────────────────────────────
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping    = true
  controls.dampingFactor    = 0.06
  controls.enablePan        = false
  controls.enableZoom       = false
  // Lock vertical rotation — only Y spin allowed
  controls.minPolarAngle    = Math.PI * 0.35
  controls.maxPolarAngle    = Math.PI * 0.65
  controls.rotateSpeed      = 0.55
  controls.autoRotate       = true
  controls.autoRotateSpeed  = 0.8

  // ── Lights ───────────────────────────────────────────────────────────────────

  // 1. Warm key light — top right, main illumination
  const keyLight = new THREE.DirectionalLight(0xfff4e0, 3.5)
  keyLight.position.set(3, 5, 3)
  keyLight.castShadow               = true
  keyLight.shadow.mapSize.width     = 2048
  keyLight.shadow.mapSize.height    = 2048
  keyLight.shadow.camera.near       = 0.5
  keyLight.shadow.camera.far        = 20
  keyLight.shadow.bias              = -0.001
  scene.add(keyLight)

  // 2. Cool fill light — left side, soft shadow fill
  const fillLight = new THREE.DirectionalLight(0xd0e8ff, 1.2)
  fillLight.position.set(-4, 2, 1)
  scene.add(fillLight)

  // 3. Rim / back light — creates the metallic edge highlight on the tin
  const rimLight = new THREE.DirectionalLight(0xffffff, 2.0)
  rimLight.position.set(0, 3, -5)
  scene.add(rimLight)

  // 4. Emerald point light — below center, brand color glow
  const ecoLight = new THREE.PointLight(0x34d399, 2.5, 6)
  ecoLight.position.set(0, -1.5, 1.5)
  scene.add(ecoLight)

  // 5. Ambient — very subtle, ensures no absolute black
  const ambient = new THREE.AmbientLight(0xffffff, 0.15)
  scene.add(ambient)

  // ── Resize handler ────────────────────────────────────────────────────────────
  const onResize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(onResize)
  ro.observe(canvas)

  // ── Dispose ───────────────────────────────────────────────────────────────────
  const dispose = () => {
    ro.disconnect()
    controls.dispose()
    envMap.dispose()
    pmrem.dispose()
    renderer.dispose()
  }

  return { renderer, scene, camera, controls, pmrem, envMap, dispose }
}