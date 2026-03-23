// components/home/TestimonialsSection.tsx

"use client"

import { useInView } from "@/hooks"

const TESTIMONIALS = [
  {
    name:   "Aarav K.",
    role:   "Software Engineer, Bangalore",
    text:   "I've bought probably 30 T-shirts in my life. None of them ever became a plant on my desk. The tin is now my mint garden. The shirt is literally my daily driver at the gym.",
    rating: 5,
    plant:  "Mint",
  },
  {
    name:   "Meera S.",
    role:   "Fitness Coach, Mumbai",
    text:   "The fabric is insane — I wore it through a full HIIT session and the next day to a client meeting with zero ironing. And tracking my plant on the app is genuinely addictive.",
    rating: 5,
    plant:  "Basil",
  },
  {
    name:   "Rohit P.",
    role:   "Product Manager, Delhi",
    text:   "Bought it as a gimmick, stayed for the quality. The QR scan experience is polished — feels like a real tech product, not an afterthought. My basil is on week 6.",
    rating: 5,
    plant:  "Basil",
  },
  {
    name:   "Nisha T.",
    role:   "Architect, Pune",
    text:   "Finally, packaging I don't feel guilty about. The tin is gorgeous on my windowsill. I've ordered two more shirts just to get different seed varieties.",
    rating: 5,
    plant:  "Lavender",
  },
]

export function TestimonialsSection() {
  const { ref, inView } = useInView(0.15)

  return (
    <section className="relative py-28 bg-[#080c08] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div ref={ref} className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div
          className="mb-14 text-center"
          style={{
            opacity:    inView ? 1 : 0,
            transform:  inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease",
          }}
        >
          <p
            className="mb-3 text-xs font-bold tracking-[0.35em] text-white/30 uppercase"
            style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
          >
            From The Community
          </p>
          <h2
            className="text-white"
            style={{
              fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
              fontSize:   "clamp(40px, 5vw, 68px)",
              lineHeight: 0.95,
            }}
          >
            Real Shirts.
            <br />
            <span className="text-white/45">Real Plants. Real People.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-white/15 hover:bg-white/5 transition-all duration-300"
              style={{
                opacity:    inView ? 1 : 0,
                transform:  inView ? "translateY(0)" : "translateY(28px)",
                transition: `all 0.7s ease ${i * 0.1}s`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <span key={si} className="text-amber-400 text-xs">★</span>
                ))}
              </div>

              <p
                className="text-sm leading-relaxed text-white/60 mb-5"
                style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
              >
                &quot;{t.text}&quot;
              </p>

              <div className="flex items-center gap-3">
                {/* Initials avatar */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-xs font-bold text-white/60"
                  style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  {t.name.split(" ").map((w) => w[0]).join("")}
                </div>

                <div className="min-w-0">
                  <p
                    className="text-xs font-semibold text-white/80"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-[10px] text-white/30 truncate"
                    style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                  >
                    {t.role}
                  </p>
                </div>

                <span
                  className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1 shrink-0"
                  style={{ fontFamily: "var(--font-dm, 'DM Sans', sans-serif)" }}
                >
                  🌱 {t.plant}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
