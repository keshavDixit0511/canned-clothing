// components/home/TinScene/tinCan.ts

import * as THREE from "three"

// â”€â”€â”€ Canvas texture for the label band â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function makeLabelTexture(): THREE.CanvasTexture {
  const W = 1024
  const H = 512
  const cv = document.createElement("canvas")
  cv.width  = W
  cv.height = H
  const ctx = cv.getContext("2d")!

  // â”€â”€ Background: deep charcoal with subtle grain â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ctx.fillStyle = "#0a0f0a"
  ctx.fillRect(0, 0, W, H)

  // Subtle diagonal texture lines
  ctx.strokeStyle = "rgba(255,255,255,0.018)"
  ctx.lineWidth = 1
  for (let i = -H; i < W + H; i += 18) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + H, H)
    ctx.stroke()
  }

  // â”€â”€ Top thin accent line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const topGrad = ctx.createLinearGradient(0, 0, W, 0)
  topGrad.addColorStop(0,    "transparent")
  topGrad.addColorStop(0.2,  "#34d399")
  topGrad.addColorStop(0.8,  "#34d399")
  topGrad.addColorStop(1,    "transparent")
  ctx.strokeStyle = topGrad
  ctx.lineWidth   = 2.5
  ctx.beginPath()
  ctx.moveTo(0, 72)
  ctx.lineTo(W, 72)
  ctx.stroke()

  // â”€â”€ Bottom thin accent line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ctx.strokeStyle = topGrad
  ctx.lineWidth   = 2.5
  ctx.beginPath()
  ctx.moveTo(0, H - 72)
  ctx.lineTo(W, H - 72)
  ctx.stroke()

  // â”€â”€ "DK" monogram â€” center â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ctx.textAlign    = "center"
  ctx.textBaseline = "middle"

  // Outer glow
  ctx.shadowColor  = "#34d399"
  ctx.shadowBlur   = 48
  ctx.fillStyle    = "#34d399"
  ctx.font         = "bold 190px 'Arial Narrow', Arial, sans-serif"
  ctx.letterSpacing = "12px"
  ctx.fillText("DK", W / 2, H / 2 - 18)

  // Solid white fill on top
  ctx.shadowBlur = 0
  ctx.fillStyle  = "#f0f4f0"
  ctx.fillText("DK", W / 2, H / 2 - 18)

  // â”€â”€ Divider line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const divGrad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0)
  divGrad.addColorStop(0,   "transparent")
  divGrad.addColorStop(0.5, "#34d399")
  divGrad.addColorStop(1,   "transparent")
  ctx.strokeStyle = divGrad
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.moveTo(W * 0.3,  H / 2 + 68)
  ctx.lineTo(W * 0.7, H / 2 + 68)
  ctx.stroke()

  // ESTHETIQUE subtitle
  ctx.fillStyle  = "rgba(52,211,153,0.75)"
  ctx.font       = "500 22px Arial, sans-serif"
  ctx.letterSpacing = "8px"
  ctx.fillText("ESTHETIQUE", W / 2, H / 2 + 102)

  // â”€â”€ Small seed icon dots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const dotPositions = [W * 0.28, W * 0.5, W * 0.72]
  dotPositions.forEach((x) => {
    ctx.beginPath()
    ctx.arc(x, H / 2 + 148, 3, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(52,211,153,0.4)"
    ctx.fill()
  })

  return new THREE.CanvasTexture(cv)
}

// â”€â”€â”€ Canvas texture for the tin lid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function makeLidTexture(): THREE.CanvasTexture {
  const S  = 512
  const cv = document.createElement("canvas")
  cv.width = cv.height = S
  const ctx = cv.getContext("2d")!

  // Brushed aluminum radial
  const grad = ctx.createRadialGradient(S * 0.35, S * 0.35, 0, S / 2, S / 2, S * 0.55)
  grad.addColorStop(0,    "#e8ece8")
  grad.addColorStop(0.4,  "#c8cec8")
  grad.addColorStop(0.75, "#a0a8a0")
  grad.addColorStop(1,    "#707870")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, S, S)

  // Concentric ring lines (brushed look)
  for (let r = 20; r < S * 0.5; r += 14) {
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255,255,255,${0.06 - r * 0.0002})`
    ctx.lineWidth   = 1
    ctx.stroke()
  }

  // Center dot
  ctx.beginPath()
  ctx.arc(S / 2, S / 2, 18, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(52,211,153,0.3)"
  ctx.fill()

  return new THREE.CanvasTexture(cv)
}

// â”€â”€â”€ Normal map for brushed metal look â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function makeBrushNormalTexture(): THREE.CanvasTexture {
  const W = 512
  const H = 256
  const cv = document.createElement("canvas")
  cv.width  = W
  cv.height = H
  const ctx = cv.getContext("2d")!

  // Horizontal brush strokes â†’ encodes as normal map blue-ish base
  ctx.fillStyle = "#8080ff" // flat normal pointing forward
  ctx.fillRect(0, 0, W, H)

  // Subtle horizontal variation
  for (let y = 0; y < H; y += 2) {
    const v = 120 + Math.sin(y * 0.8) * 8
    ctx.fillStyle = `rgb(${v},${v},255)`
    ctx.fillRect(0, y, W, 1)
  }

  return new THREE.CanvasTexture(cv)
}

// â”€â”€â”€ buildTinCan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface TinCanGroup {
  group:       THREE.Group
  labelMesh:   THREE.Mesh
  dispose:     () => void
}

export function buildTinCan(envMap: THREE.Texture): TinCanGroup {
  const group = new THREE.Group()

  const labelTex  = makeLabelTexture()
  const lidTex    = makeLidTexture()
  const brushNorm = makeBrushNormalTexture()

  // â”€â”€ Shared metal material (body without label) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const metalMat = new THREE.MeshStandardMaterial({
    color:     0xc8cec8,
    metalness: 0.96,
    roughness: 0.12,
    envMap,
    envMapIntensity: 1.4,
    normalMap:       brushNorm,
    normalScale:     new THREE.Vector2(0.4, 0.4),
  })

  // â”€â”€ Label band material â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const labelMat = new THREE.MeshStandardMaterial({
    map:       labelTex,
    metalness: 0.2,
    roughness: 0.55,
    envMap,
    envMapIntensity: 0.6,
  })

  // â”€â”€ Lid material â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const lidMat = new THREE.MeshStandardMaterial({
    map:       lidTex,
    metalness: 0.92,
    roughness: 0.15,
    envMap,
    envMapIntensity: 1.2,
  })

  // â”€â”€ Cylinder body (tall) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Using 3 separate meshes: top metal strip, label band, bottom metal strip
  const RAD    = 0.72
  const HEIGHT = 2.2

  // Bottom metal strip
  const bottomGeo = new THREE.CylinderGeometry(RAD, RAD, HEIGHT * 0.18, 64, 1, true)
  const bottomMesh = new THREE.Mesh(bottomGeo, metalMat)
  bottomMesh.position.y = -(HEIGHT * 0.5) + (HEIGHT * 0.18 * 0.5)
  bottomMesh.castShadow    = true
  bottomMesh.receiveShadow = true
  group.add(bottomMesh)

  // Top metal strip
  const topGeo  = new THREE.CylinderGeometry(RAD, RAD, HEIGHT * 0.18, 64, 1, true)
  const topMesh = new THREE.Mesh(topGeo, metalMat)
  topMesh.position.y = (HEIGHT * 0.5) - (HEIGHT * 0.18 * 0.5)
  topMesh.castShadow    = true
  topMesh.receiveShadow = true
  group.add(topMesh)

  // Label band â€” center 64% of height
  const labelH   = HEIGHT * 0.64
  const labelGeo = new THREE.CylinderGeometry(RAD + 0.002, RAD + 0.002, labelH, 64, 1, true)
  const labelMesh = new THREE.Mesh(labelGeo, labelMat)
  labelMesh.castShadow    = true
  labelMesh.receiveShadow = true
  group.add(labelMesh)

  // â”€â”€ Top lid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const lidTopGeo  = new THREE.CylinderGeometry(RAD, RAD, 0.055, 64)
  const lidTopMesh = new THREE.Mesh(lidTopGeo, lidMat)
  lidTopMesh.position.y = HEIGHT * 0.5 + 0.028
  lidTopMesh.castShadow = true
  group.add(lidTopMesh)

  // Lid lip (slightly wider ring)
  const lipGeo  = new THREE.TorusGeometry(RAD + 0.01, 0.028, 12, 64)
  const lipMesh = new THREE.Mesh(lipGeo, metalMat)
  lipMesh.position.y = HEIGHT * 0.5
  lipMesh.rotation.x = Math.PI / 2
  group.add(lipMesh)

  // â”€â”€ Bottom cap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const capGeo  = new THREE.CylinderGeometry(RAD - 0.02, RAD - 0.02, 0.04, 64)
  const capMesh = new THREE.Mesh(capGeo, lidMat)
  capMesh.position.y = -(HEIGHT * 0.5) - 0.02
  group.add(capMesh)

  // Bottom lip torus
  const botLipGeo  = new THREE.TorusGeometry(RAD + 0.005, 0.024, 10, 64)
  const botLipMesh = new THREE.Mesh(botLipGeo, metalMat)
  botLipMesh.position.y = -(HEIGHT * 0.5)
  botLipMesh.rotation.x = Math.PI / 2
  group.add(botLipMesh)

  // â”€â”€ Pull tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tabGroup = new THREE.Group()

  // Tab ring
  const ringGeo  = new THREE.TorusGeometry(0.1, 0.025, 8, 24)
  const ringMesh = new THREE.Mesh(ringGeo, metalMat)
  ringMesh.rotation.x = Math.PI / 2
  tabGroup.add(ringMesh)

  // Tab tongue
  const tonguePts: THREE.Vector2[] = []
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    tonguePts.push(new THREE.Vector2(
      Math.sin(t * Math.PI) * 0.09,
      t * 0.22
    ))
  }
  const tongueShape = new THREE.Shape()
  tongueShape.moveTo(-0.045, 0)
  tongueShape.lineTo(0.045, 0)
  tongueShape.lineTo(0.03, 0.22)
  tongueShape.lineTo(-0.03, 0.22)
  tongueShape.closePath()
  const tongueGeo  = new THREE.ShapeGeometry(tongueShape)
  const tongueMesh = new THREE.Mesh(tongueGeo, metalMat)
  tongueMesh.position.set(0, -0.1, 0.01)
  tabGroup.add(tongueMesh)

  tabGroup.position.set(0.15, HEIGHT * 0.5 + 0.06, 0.55)
  tabGroup.rotation.x = -0.3
  group.add(tabGroup)

  // â”€â”€ Rim score lines (decorative horizontal rings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const scorePositions = [
    HEIGHT * 0.5  - HEIGHT * 0.18,
    -(HEIGHT * 0.5 - HEIGHT * 0.18),
  ]
  scorePositions.forEach((y) => {
    const scoreGeo  = new THREE.TorusGeometry(RAD + 0.003, 0.008, 6, 64)
    const scoreMesh = new THREE.Mesh(scoreGeo, metalMat)
    scoreMesh.position.y = y
    scoreMesh.rotation.x = Math.PI / 2
    group.add(scoreMesh)
  })

  // â”€â”€ Emerald glow ring (bottom ambient) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const glowGeo = new THREE.TorusGeometry(RAD * 0.7, 0.025, 6, 64)
  const glowMat = new THREE.MeshBasicMaterial({
    color:       0x34d399,
    transparent: true,
    opacity:     0.35,
  })
  const glowMesh = new THREE.Mesh(glowGeo, glowMat)
  glowMesh.position.y = -(HEIGHT * 0.5) - 0.08
  glowMesh.rotation.x = Math.PI / 2
  group.add(glowMesh)

  // â”€â”€ Shadows from floor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow    = true
      obj.receiveShadow = true
    }
  })

  // â”€â”€ Dispose helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const dispose = () => {
    labelTex.dispose()
    lidTex.dispose()
    brushNorm.dispose()
    metalMat.dispose()
    labelMat.dispose()
    lidMat.dispose()
    glowMat.dispose()
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose()
    })
  }

  return { group, labelMesh, dispose }
}
