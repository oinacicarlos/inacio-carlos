import { ToolShell } from "@/components/tool-shell"
import { COMPANY_ADDRESS_LINE, COMPANY_ADDRESS_ZIP, COMPANY_CNPJ, COMPANY_LEGAL_NAME, CRC_REGISTRATION } from "@/lib/company-info"

export const metadata = {
  title: "Sobre Nós | Tropa",
  description: "Conheça a Tropa Contabilidade: quem somos e como ajudamos prestadores de serviço e pequenas empresas.",
}

export default function SobrePage() {
  return (
    <ToolShell mainClassName="blog-site">
      <section className="legal-page-hero" aria-labelledby="legal-page-title">
        <h1 id="legal-page-title">Sobre a Tropa</h1>
        <p>Contabilidade e assessoria para quem presta serviço e empreende.</p>
      </section>

      <section className="legal-page-content">
        <div className="blog-article-body">
          <p>
            A Tropa é uma empresa privada de contabilidade e assessoria empresarial, focada em prestadores de
            serviço e pequenos empreendedores que precisam manter a empresa organizada sem perder tempo com
            burocracia. Já atendemos mais de 2.000 clientes com contabilidade recorrente, abertura e alteração de
            empresas, departamento pessoal e suporte fiscal.
          </p>

          <h2>O que fazemos</h2>
          <p>
            Cuidamos da contabilidade completa do seu negócio — apuração de impostos, obrigações mensais e
            anuais, folha de pagamento e departamento pessoal — com um assessor dedicado, atendimento pelo
            WhatsApp e e-mail, e sem contrato de fidelidade. Também disponibilizamos ferramentas gratuitas
            (simulador de rescisão, simulador de contratação, calculadora de precificação e gerador de contratos)
            para ajudar quem presta serviço a tomar decisões com mais segurança, mesmo sem ser cliente.
          </p>

          <h2>Como trabalhamos</h2>
          <p>
            Acreditamos em atendimento rápido e humanizado: sem esconder informação atrás de burocracia, sem
            prometer resultados que não podemos garantir, e sempre buscando a forma mais eficiente e legal de
            organizar a situação fiscal e tributária de cada cliente.
          </p>

          <h2>Transparência</h2>
          <p>
            A Tropa não tem qualquer vínculo com órgãos públicos ou governamentais. Não emitimos, vendemos ou
            intermediamos documentos públicos — todo o suporte para abertura, alteração ou regularização de
            empresas é prestado como serviço de assessoria contábil privada, com responsável técnico registrado
            sob {CRC_REGISTRATION}.
          </p>

          <h2>Dados da empresa</h2>
          <p>
            {COMPANY_LEGAL_NAME}
            <br />
            CNPJ {COMPANY_CNPJ}
            <br />
            {COMPANY_ADDRESS_LINE} — {COMPANY_ADDRESS_ZIP}
          </p>
        </div>
      </section>
    </ToolShell>
  )
}
