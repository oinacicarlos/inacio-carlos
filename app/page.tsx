import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import MarqueeSection from "./components/MarqueeSection"
import SolutionsShowcaseSection from "./components/SolutionsShowcaseSection"

export default function Home() {
  return (
    <main className="landing-page">
      <Header />
      <HeroSection />
      <MarqueeSection />
      <SolutionsShowcaseSection />
    </main>
  )
}
