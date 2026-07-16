import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import styles from "./page.module.css"

const mx8Font = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mx8",
})

export const metadata: Metadata = {
  title: "Método X8 | Modelo 2",
}

export default function Modelo2Page() {
  return (
    <main className={`${styles.page} ${mx8Font.variable}`}>
      <section className={styles.hero} aria-labelledby="modelo-2-title">
        <div className={styles.auraOne} />
        <div className={styles.auraTwo} />
        <div className={styles.orbitOne} />
        <div className={styles.orbitTwo} />
        <div className={styles.mesh} />

        <div className={styles.copy}>
          <img className={styles.logo} src="/modelo-2/logo-mx8.svg" alt="Método X8" />

          <div className={styles.badge}>ACOMPANHAMENTO INDIVIDUAL</div>

          <h1 id="modelo-2-title">
            <span>Abra sua mente</span>
            <strong>para enxergar novas possibilidades.</strong>
          </h1>

          <p>
            Um acompanhamento direto para ampliar visão, organizar decisões e avançar com clareza.
          </p>

          <a className={styles.cta} href="#inscricao">
            Entre agora para o Método X8
          </a>
        </div>

        <div className={styles.personWrap} aria-hidden="true">
          <div className={styles.personHalo} />
          <img className={styles.person} src="/modelo-2/fabiano-mx8.svg" alt="" />
        </div>
      </section>
    </main>
  )
}
