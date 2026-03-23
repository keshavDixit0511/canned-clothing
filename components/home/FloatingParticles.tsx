// components/home/FloatingParticles.tsx
"use client"

const PARTICLES = Array.from({ length: 24 }, (_, index) => {
  const size = 1.5 + (index % 6) * 0.5
  const left = (index * 17) % 100
  const delay = (index % 8) * 0.8
  const duration = 10 + (index % 7) * 2
  const isGreen = index % 3 !== 0
  const alpha = isGreen ? 0.35 + (index % 4) * 0.08 : 0.2 + (index % 3) * 0.07

  return {
    key: index,
    size,
    left,
    delay,
    duration,
    isGreen,
    alpha,
  }
})

export function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((particle) => (
        <div
          key={particle.key}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            bottom: `-${particle.size}px`,
            background: particle.isGreen
              ? `rgba(52,211,153,${particle.alpha})`
              : `rgba(180,180,180,${particle.alpha})`,
            boxShadow: particle.isGreen
              ? `0 0 ${particle.size * 3}px rgba(52,211,153,0.6)`
              : `0 0 ${particle.size * 2}px rgba(200,200,200,0.3)`,
            animation: `floatUp ${particle.duration}s ease-in ${particle.delay}s infinite`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(0.4); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
