import { ToolShell } from "@/components/tool-shell"
import { COMPANY_ADDRESS_LINE, COMPANY_ADDRESS_ZIP, COMPANY_CNPJ, COMPANY_EMAIL, COMPANY_LEGAL_NAME, CRC_REGISTRATION } from "@/lib/company-info"

export const metadata = {
  title: "Termos de Uso | Tropa",
  description: "Condições de uso do site e dos serviços de contabilidade e assessoria empresarial da Tropa.",
}

export default function TermosDeUsoPage() {
  return (
    <ToolShell mainClassName="legal-page" variant="dark">
      <section className="legal-page-hero" aria-labelledby="legal-page-title">
        <h1 id="legal-page-title">Termos de Uso</h1>
        <p>Última atualização: agosto de 2026</p>
      </section>

      <section className="legal-page-content">
        <div className="blog-article-body">
          <p>
            Estes Termos de Uso regulam o acesso e uso deste site, de propriedade da {COMPANY_LEGAL_NAME}, CNPJ{" "}
            {COMPANY_CNPJ} ("Tropa"), e a contratação dos nossos serviços de contabilidade e assessoria
            empresarial. Ao usar o site ou contratar um serviço, você concorda com estes termos.
          </p>

          <h2>1. Quem somos</h2>
          <p>
            A Tropa é uma empresa privada de contabilidade e assessoria empresarial, com responsável técnico
            registrado sob {CRC_REGISTRATION}. Não temos qualquer vínculo com órgãos públicos ou governamentais —
            não emitimos, vendemos ou intermediamos documentos públicos. Todo o suporte para abertura, alteração
            ou regularização de empresas é prestado como serviço de assessoria contábil privada.
          </p>

          <h2>2. Serviços oferecidos</h2>
          <p>
            Oferecemos planos de contabilidade recorrente, assessoria para abertura e alteração de empresas,
            departamento pessoal, suporte fiscal e ferramentas gratuitas de simulação (rescisão, contratação,
            precificação, geração de contratos). O escopo exato de cada plano está descrito na seção de planos do
            site e pode ser detalhado durante o atendimento.
          </p>

          <h2>3. Sem garantia de resultado financeiro específico</h2>
          <p>
            Buscamos sempre a forma mais eficiente e legal de organizar a situação fiscal e tributária do seu
            negócio. No entanto, não garantimos valores, percentuais ou prazos específicos de economia tributária,
            restituição ou redução de impostos — cada caso depende do regime tributário, do faturamento e das
            particularidades da empresa, e é analisado individualmente pela nossa equipe.
          </p>

          <h2>4. Sem fidelidade</h2>
          <p>
            Nossos planos não possuem contrato de fidelidade. O cancelamento pode ser solicitado a qualquer
            momento pelos canais de atendimento, respeitando eventuais obrigações fiscais e legais já em
            andamento no período contratado.
          </p>

          <h2>5. Responsabilidades do cliente</h2>
          <ul>
            <li>Fornecer informações e documentos verdadeiros, completos e atualizados.</li>
            <li>Enviar documentos e respostas dentro dos prazos combinados, para não comprometer obrigações fiscais.</li>
            <li>Manter a confidencialidade de credenciais e acessos compartilhados com a nossa equipe.</li>
          </ul>

          <h2>6. Pagamentos</h2>
          <p>
            Os planos recorrentes são cobrados mensalmente através da nossa plataforma de pagamento (Stripe).
            Valores e formas de pagamento são informados antes da contratação.
          </p>

          <h2>7. Propriedade intelectual</h2>
          <p>
            O conteúdo do site (textos, marca, layout, ferramentas) pertence à Tropa e não pode ser copiado ou
            redistribuído sem autorização, exceto para uso pessoal e não comercial das ferramentas
            disponibilizadas gratuitamente.
          </p>

          <h2>8. Limitação de responsabilidade</h2>
          <p>
            Não nos responsabilizamos por decisões tomadas com base em informações incompletas ou incorretas
            fornecidas pelo cliente, nem por atrasos causados por terceiros (órgãos públicos, instituições
            financeiras, prestadores externos) fora do nosso controle.
          </p>

          <h2>9. Alterações destes termos</h2>
          <p>
            Podemos atualizar estes termos periodicamente. A data da última atualização está sempre indicada no
            topo desta página.
          </p>

          <h2>10. Legislação e foro</h2>
          <p>
            Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de Belford Roxo/RJ
            para dirimir eventuais controvérsias, salvo disposição legal em contrário.
          </p>

          <h2>11. Contato</h2>
          <p>
            {COMPANY_LEGAL_NAME} — CNPJ {COMPANY_CNPJ}
            <br />
            {COMPANY_ADDRESS_LINE} — {COMPANY_ADDRESS_ZIP}
            <br />
            E-mail: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
          </p>
        </div>
      </section>
    </ToolShell>
  )
}
