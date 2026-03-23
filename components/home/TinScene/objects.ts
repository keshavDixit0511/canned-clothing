// components/home/TinScene/Objects.ts

import * as THREE from "three"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFabricTexture(color: string, weaveColor: string): THREE.CanvasTexture {
  const S  = 256
  const cv = document.createElement("canvas")
  cv.width = cv.height = S
  const ctx = cv.getContext("2d")!

  ctx.fillStyle = color
  ctx.fillRect(0, 0, S, S)

  // Weave pattern — horizontal + vertical threads
  ctx.strokeStyle = weaveColor
  ctx.lineWidth   = 1.2
  for (let i = 0; i < S; i += 6) {
    ctx.globalAlpha = 0.18
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke()
  }
  ctx.globalAlpha = 1

  return new THREE.CanvasTexture(cv)
}

function makeKraftTexture(): THREE.CanvasTexture {
  const S  = 512
  const cv = document.createElement("canvas")
  cv.width = cv.height = S
  const ctx = cv.getContext("2d")!

  // Kraft paper base
  const grad = ctx.createRadialGradient(S * 0.4, S * 0.35, 0, S / 2, S / 2, S * 0.7)
  grad.addColorStop(0,   "#c8a96e")
  grad.addColorStop(0.5, "#b8965a")
  grad.addColorStop(1,   "#9a7840")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, S, S)

  // Paper fiber noise
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    const l = 4 + Math.random() * 18
    const a = Math.random() * Math.PI
    ctx.strokeStyle = `rgba(${80 + Math.random() * 60},${55 + Math.random() * 40},20,${0.06 + Math.random() * 0.1})`
    ctx.lineWidth   = 0.5 + Math.random() * 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }

  // ── Seed pouch label area ─────────────────────────────────────────────────
  // White label background
  ctx.fillStyle = "rgba(248,245,235,0.9)"
  ctx.beginPath()
  const lx = S * 0.18
  const ly = S * 0.28
  const lw = S * 0.64
  const lh = S * 0.44
  const lr = 12
  ctx.moveTo(lx + lr, ly)
  ctx.lineTo(lx + lw - lr, ly)
  ctx.quadraticCurveTo(lx + lw, ly,      lx + lw, ly + lr)
  ctx.lineTo(lx + lw, ly + lh - lr)
  ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - lr, ly + lh)
  ctx.lineTo(lx + lr, ly + lh)
  ctx.quadraticCurveTo(lx, ly + lh,  lx, ly + lh - lr)
  ctx.lineTo(lx, ly + lr)
  ctx.quadraticCurveTo(lx, ly, lx + lr, ly)
  ctx.closePath()
  ctx.fill()

  // Label border
  ctx.strokeStyle = "rgba(52,211,153,0.6)"
  ctx.lineWidth   = 2
  ctx.stroke()

  // "SEEDS" text
  ctx.textAlign    = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle    = "#1a2e1a"
  ctx.font         = "bold 36px Arial, sans-serif"
  ctx.letterSpacing = "6px"
  ctx.fillText("SEEDS", S / 2, ly + lh * 0.3)

  // Seed emoji substituted with dot pattern
  const seedDots = [
    { x: S * 0.32, y: ly + lh * 0.62 },
    { x: S * 0.44, y: ly + lh * 0.72 },
    { x: S * 0.5,  y: ly + lh * 0.58 },
    { x: S * 0.58, y: ly + lh * 0.68 },
    { x: S * 0.66, y: ly + lh * 0.56 },
  ]
  seedDots.forEach(({ x, y }) => {
    ctx.beginPath()
    ctx.ellipse(x, y, 7, 10, -0.4, 0, Math.PI * 2)
    ctx.fillStyle = "#34d399"
    ctx.fill()
  })

  // Small DK mark bottom right
  ctx.fillStyle  = "rgba(52,211,153,0.5)"
  ctx.font       = "bold 20px Arial, sans-serif"
  ctx.letterSpacing = "3px"
  ctx.fillText("DK", lx + lw - 28, ly + lh - 14)

  return new THREE.CanvasTexture(cv)
}

// ─── buildTShirt ─────────────────────────────────────────────────────────────
// A neatly folded t-shirt: layered flat box geometry with rounded edges

export interface TShirtGroup {
  group:   THREE.Group
  dispose: () => void
}

export function buildTShirt(envMap: THREE.Texture): TShirtGroup {
  const group = new THREE.Group()

  const fabricTex = makeFabricTexture("#1c2a1c", "#2a3e2a")

  const mat = new THREE.MeshStandardMaterial({
    map:       fabricTex,
    metalness: 0.0,
    roughness: 0.88,
    envMap,
    envMapIntensity: 0.3,
    color: 0x1e2e1e,
  })

  // ── Main body (wide rectangle — the folded shirt face) ────────────────────
  const bodyGeo  = new THREE.BoxGeometry(1.5, 0.08, 1.1)
  const bodyMesh = new THREE.Mesh(bodyGeo, mat)
  bodyMesh.castShadow = true
  group.add(bodyMesh)

  // ── Layered depth stacks (multiple thin layers = folded look) ─────────────
  for (let i = 1; i <= 5; i++) {
    const layerW  = 1.5 - i * 0.04
    const layerGeo  = new THREE.BoxGeometry(layerW, 0.055, 1.08 - i * 0.01)
    const layerMesh = new THREE.Mesh(layerGeo, mat)
    layerMesh.position.y = -(i * 0.065)
    layerMesh.castShadow = true
    group.add(layerMesh)
  }

  // ── Collar notch (small indented box cut from top) ─────────────────────────
  const collarMat = new THREE.MeshStandardMaterial({
    color:     0x141e14,
    metalness: 0,
    roughness: 0.95,
  })
  const collarGeo  = new THREE.BoxGeometry(0.38, 0.09, 0.15)
  const collarMesh = new THREE.Mesh(collarGeo, collarMat)
  collarMesh.position.set(0, 0.045, -0.55 + 0.075)
  group.add(collarMesh)

  // ── Sleeve flaps (folded inward, visible on sides) ─────────────────────────
  const sleeveMat = new THREE.MeshStandardMaterial({
    map:       fabricTex,
    metalness: 0,
    roughness: 0.88,
    color:     0x1a2a1a,
  })
  // Left sleeve
  const sleeveGeoL  = new THREE.BoxGeometry(0.28, 0.065, 0.45)
  const sleeveMeshL = new THREE.Mesh(sleeveGeoL, sleeveMat)
  sleeveMeshL.position.set(-0.89, 0.005, 0.12)
  sleeveMeshL.rotation.y = 0.18
  group.add(sleeveMeshL)

  // Right sleeve
  const sleeveMeshR = new THREE.Mesh(sleeveGeoL, sleeveMat)
  sleeveMeshR.position.set(0.89, 0.005, 0.12)
  sleeveMeshR.rotation.y = -0.18
  group.add(sleeveMeshR)

  // ── Subtle crease lines (thin flat boxes) ─────────────────────────────────
  const creaseMat = new THREE.MeshStandardMaterial({
    color:     0x0e1a0e,
    metalness: 0,
    roughness: 1,
  })
  const creasePositions = [-0.3, 0, 0.3]
  creasePositions.forEach((x) => {
    const creaseGeo  = new THREE.BoxGeometry(0.008, 0.082, 1.08)
    const creaseMesh = new THREE.Mesh(creaseGeo, creaseMat)
    creaseMesh.position.set(x, 0, 0)
    group.add(creaseMesh)
  })

  const dispose = () => {
    fabricTex.dispose()
    mat.dispose()
    sleeveMat.dispose()
    collarMat.dispose()
    creaseMat.dispose()
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose()
    })
  }

  return { group, dispose }
}

// ─── buildSeedPouch ──────────────────────────────────────────────────────────
// Flat kraft-paper pouch with rounded corners and seed label

export interface SeedPouchGroup {
  group:   THREE.Group
  dispose: () => void
}

export function buildSeedPouch(envMap: THREE.Texture): SeedPouchGroup {
  const group = new THREE.Group()

  const kraftTex = makeKraftTexture()

  const pouchMat = new THREE.MeshStandardMaterial({
    map:       kraftTex,
    metalness: 0.0,
    roughness: 0.82,
    envMap,
    envMapIntensity: 0.2,
  })

  // ── Main pouch body ───────────────────────────────────────────────────────
  const bodyGeo  = new THREE.BoxGeometry(0.78, 1.05, 0.12)
  const bodyMesh = new THREE.Mesh(bodyGeo, pouchMat)
  bodyMesh.castShadow = true
  group.add(bodyMesh)

  // ── Gusset sides (slight bulge on left/right) ─────────────────────────────
  const gussetMat = new THREE.MeshStandardMaterial({
    color:     0x9a7840,
    metalness: 0,
    roughness: 0.9,
  })
  ;[-1, 1].forEach((side) => {
    const gussetGeo  = new THREE.BoxGeometry(0.06, 0.95, 0.14)
    const gussetMesh = new THREE.Mesh(gussetGeo, gussetMat)
    gussetMesh.position.set(side * 0.42, -0.02, 0)
    group.add(gussetMesh)
  })

  // ── Top crimp seal ────────────────────────────────────────────────────────
  const crimpGeo  = new THREE.BoxGeometry(0.78, 0.14, 0.08)
  const crimpMesh = new THREE.Mesh(crimpGeo, pouchMat)
  crimpMesh.position.y = 0.595
  group.add(crimpMesh)

  // Crimp lines
  const crimpLineMat = new THREE.MeshStandardMaterial({
    color:     0x7a5c28,
    metalness: 0,
    roughness: 1,
  })
  for (let i = -3; i <= 3; i++) {
    const lineGeo  = new THREE.BoxGeometry(0.72, 0.012, 0.085)
    const lineMesh = new THREE.Mesh(lineGeo, crimpLineMat)
    lineMesh.position.set(0, 0.595 + i * 0.02, 0)
    group.add(lineMesh)
  }

  // ── Tear notch ────────────────────────────────────────────────────────────
  const notchMat = new THREE.MeshStandardMaterial({
    color: 0x34d399, metalness: 0.1, roughness: 0.5,
  })
  const notchGeo  = new THREE.CylinderGeometry(0.028, 0.028, 0.13, 16)
  const notchMesh = new THREE.Mesh(notchGeo, notchMat)
  notchMesh.rotation.z = Math.PI / 2
  notchMesh.position.set(0.32, 0.595, 0)
  group.add(notchMesh)

  // ── Bottom gusset fold ────────────────────────────────────────────────────
  const bottomGeo  = new THREE.BoxGeometry(0.72, 0.1, 0.16)
  const bottomMesh = new THREE.Mesh(bottomGeo, pouchMat)
  bottomMesh.position.y = -0.575
  group.add(bottomMesh)

  const dispose = () => {
    kraftTex.dispose()
    pouchMat.dispose()
    gussetMat.dispose()
    crimpLineMat.dispose()
    notchMat.dispose()
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose()
    })
  }

  return { group, dispose }
}

// ─── buildPlant ──────────────────────────────────────────────────────────────
// Stem + leaves growing from top of tin — animated via GSAP externally

export interface PlantGroup {
  group:    THREE.Group
  stem:     THREE.Mesh
  leafL:    THREE.Mesh
  leafR:    THREE.Mesh
  leafTop:  THREE.Mesh
  glowRing: THREE.Mesh
  dispose:  () => void
}

export function buildPlant(): PlantGroup {
  const group = new THREE.Group()

  // ── Stem ──────────────────────────────────────────────────────────────────
  const stemMat = new THREE.MeshStandardMaterial({
    color:     0x16a34a,
    metalness: 0,
    roughness: 0.75,
    emissive:  new THREE.Color(0x052e0f),
    emissiveIntensity: 0.3,
  })
  const stemGeo  = new THREE.CylinderGeometry(0.04, 0.06, 1.1, 10)
  const stem     = new THREE.Mesh(stemGeo, stemMat)
  stem.position.y = 0.55
  stem.scale.y    = 0 // starts invisible — GSAP grows it
  stem.castShadow = true
  group.add(stem)

  // ── Leaf material ─────────────────────────────────────────────────────────
  const leafMat = new THREE.MeshStandardMaterial({
    color:            0x22c55e,
    metalness:        0,
    roughness:        0.65,
    emissive:         new THREE.Color(0x052e0f),
    emissiveIntensity: 0.25,
    side:             THREE.DoubleSide,
  })

  // ── Left leaf ─────────────────────────────────────────────────────────────
  const leafShape = new THREE.Shape()
  leafShape.moveTo(0, 0)
  leafShape.bezierCurveTo(-0.38, 0.15, -0.42, 0.55, 0, 0.72)
  leafShape.bezierCurveTo(0.18,  0.55,  0.14, 0.2,  0, 0)
  const leafGeo = new THREE.ShapeGeometry(leafShape, 12)
  const leafL   = new THREE.Mesh(leafGeo, leafMat)
  leafL.position.set(-0.08, 0.85, 0)
  leafL.rotation.set(0.3, 0.2, 0.6)
  leafL.scale.set(0, 0, 0) // starts invisible
  leafL.castShadow = true
  group.add(leafL)

  // ── Right leaf ────────────────────────────────────────────────────────────
  const leafR = new THREE.Mesh(leafGeo, leafMat)
  leafR.position.set(0.08, 1.02, 0)
  leafR.rotation.set(0.25, -0.3, -0.65)
  leafR.scale.set(0, 0, 0)
  leafR.castShadow = true
  group.add(leafR)

  // ── Top small leaf ────────────────────────────────────────────────────────
  const leafTopGeo = new THREE.ShapeGeometry(leafShape, 8)
  const leafTop    = new THREE.Mesh(leafTopGeo, leafMat)
  leafTop.position.set(0, 1.18, 0)
  leafTop.rotation.set(-0.2, 0, -0.15)
  leafTop.scale.setScalar(0.65)
  leafTop.scale.set(0, 0, 0)
  group.add(leafTop)

  // ── Glow ring at base of plant ────────────────────────────────────────────
  const glowGeo  = new THREE.TorusGeometry(0.22, 0.018, 8, 48)
  const glowMat  = new THREE.MeshBasicMaterial({
    color:       0x34d399,
    transparent: true,
    opacity:     0,
  })
  const glowRing = new THREE.Mesh(glowGeo, glowMat)
  glowRing.rotation.x = Math.PI / 2
  glowRing.position.y = 0.02
  group.add(glowRing)

  const dispose = () => {
    stemMat.dispose()
    leafMat.dispose()
    glowMat.dispose()
    stemGeo.dispose()
    leafGeo.dispose()
    leafTopGeo.dispose()
    glowGeo.dispose()
  }

  return { group, stem, leafL, leafR, leafTop, glowRing, dispose }
}