import { ToolShell } from "@/components/tool-shell"
import { COMPANY_ADDRESS_LINE, COMPANY_ADDRESS_ZIP, COMPANY_CNPJ, COMPANY_EMAIL, COMPANY_LEGAL_NAME } from "@/lib/company-info"

export const metadata = {
  title: "Política de Privacidade | Tropa",
  description: "Como a Tropa Contabilidade coleta, usa e protege os dados dos visitantes e clientes do site.",
}

export default function PoliticaDePrivacidadePage() {
  return (
    <ToolShell mainClassName="blog-site">
      <section className="legal-page-hero" aria-labelledby="legal-page-title">
        <h1 id="legal-page-title">Política de Privacidade</h1>
        <p>Última atualização: agosto de 2026</p>
      </section>

      <section className="legal-page-content">
        <div className="blog-article-body">
          <p>
            Esta política explica como a {COMPANY_LEGAL_NAME} (CNPJ {COMPANY_CNPJ}), doravante "Tropa", coleta,
            usa, armazena e protege os dados pessoais de quem visita este site ou contrata nossos serviços de
            contabilidade e assessoria empresarial, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
            13.709/2018 — LGPD).
          </p>

          <h2>1. Quais dados coletamos</h2>
          <p>Dependendo de como você interage com o site, podemos coletar:</p>
          <ul>
            <li>Dados de contato: nome, e-mail, telefone/WhatsApp.</li>
            <li>Dados cadastrais e fiscais, quando você contrata um serviço: CPF, CNPJ, dados societários e documentos necessários para abertura, alteração ou regularização de empresa.</li>
            <li>
              Credenciais de acesso a portais do governo (como a senha do gov.br), somente quando estritamente
              necessário para executar um serviço que você contratou (ex: abertura de MEI). Esses dados são
              armazenados de forma criptografada e nunca são solicitados como condição para navegar no site ou
              iniciar um primeiro contato.
            </li>
            <li>Dados de navegação: páginas visitadas, dispositivo, origem do acesso, cookies.</li>
          </ul>

          <h2>2. Como usamos seus dados</h2>
          <ul>
            <li>Para prestar o serviço contábil e de assessoria contratado.</li>
            <li>Para responder dúvidas e solicitações enviadas por WhatsApp, e-mail ou formulário.</li>
            <li>Para cumprir obrigações legais e fiscais relacionadas à prestação do serviço.</li>
            <li>Para anúncios e marketing (ex: campanhas no Google Ads e Meta/Facebook), incluindo remarketing.</li>
            <li>Para medir o desempenho do site (analytics).</li>
          </ul>

          <h2>3. Com quem compartilhamos dados</h2>
          <p>Utilizamos fornecedores (operadores de dados) para viabilizar o site e o serviço, entre eles:</p>
          <ul>
            <li><strong>Supabase</strong> — banco de dados e autenticação da nossa plataforma.</li>
            <li><strong>Stripe</strong> — processamento de pagamentos dos planos.</li>
            <li><strong>Google</strong> (Google Ads, Google Analytics, Google Tag Manager) — anúncios e métricas de uso do site.</li>
            <li><strong>Meta/Facebook</strong> — anúncios e mensuração de campanhas.</li>
            <li><strong>WhatsApp/Meta</strong> — canal de atendimento.</li>
          </ul>
          <p>
            Não vendemos dados pessoais a terceiros. O compartilhamento ocorre apenas com os fornecedores acima,
            na medida necessária para operar o site e prestar o serviço contratado.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Usamos cookies próprios e de terceiros (Google, Meta) para lembrar preferências, medir audiência e
            exibir anúncios mais relevantes. Você pode desativar cookies nas configurações do seu navegador, o que
            pode limitar algumas funcionalidades do site.
          </p>

          <h2>5. Armazenamento e segurança</h2>
          <p>
            Dados sensíveis, como credenciais de acesso a portais do governo, são armazenados de forma
            criptografada e com acesso restrito à nossa equipe técnica. Adotamos medidas razoáveis de segurança
            para proteger seus dados contra acesso não autorizado, perda ou uso indevido.
          </p>

          <h2>6. Seus direitos (LGPD)</h2>
          <p>Você pode, a qualquer momento, solicitar:</p>
          <ul>
            <li>Confirmação de que tratamos seus dados e acesso a eles.</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Exclusão ou anonimização de dados, quando aplicável.</li>
            <li>Portabilidade dos dados a outro fornecedor de serviço.</li>
            <li>Revogação de consentimento, quando o tratamento depender dele.</li>
          </ul>
          <p>
            Para exercer esses direitos, envie um e-mail para{" "}
            <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>.
          </p>

          <h2>7. Retenção dos dados</h2>
          <p>
            Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política ou
            exigências legais e fiscais (que podem exigir guarda de documentos contábeis por prazos determinados
            em lei).
          </p>

          <h2>8. Alterações desta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. A data da última atualização está sempre indicada no
            topo desta página.
          </p>

          <h2>9. Contato</h2>
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
