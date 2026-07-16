import { CallToAction } from "./components/call-to-action"
import { Expertise } from "./components/expertise"
import { FAQ } from "./components/faq"
import { Footer } from "./components/footer"
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { Philosophy } from "./components/philosophy"
import { Projects } from "./components/projects"

export default function Modelo1Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Philosophy />
      <Projects />
      <Expertise />
      <FAQ />
      <CallToAction />
      <Footer />
    </main>
  )
}
