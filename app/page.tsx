// app/page.tsx

import { HeroSection }          from "@/components/home/HeroSection"
import { LifeCycleSection }     from "@/components/home/LifeCycleSection"
import { ProductsSection }      from "@/components/home/ProductsSection"
import { EcoCounterSection }    from "@/components/home/EcoCounterSection"
// import { LeaderboardSection }   from "@/components/home/LeaderBoardSection"
import { TestimonialsSection }  from "@/components/home/TestimonialsSection"
import { NewsletterSection }    from "@/components/home/NewsletterSection"
import { LeaderboardSection } from "@/components/home/LeaderBoardSection"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <main className="bg-[#080c08]">
      <HeroSection />
      <LifeCycleSection />
      <ProductsSection />
      <EcoCounterSection />
      <LeaderboardSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  )
}
