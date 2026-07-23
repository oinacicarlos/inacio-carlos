import {
  Calculator,
  CreditCard,
  FileSignature,
  HelpCircle,
  Home,
  LogOut,
  MessageSquarePlus,
  ReceiptText,
  Settings,
  UserRound,
  Users,
} from "lucide-react"

const hubNavigation = [
  { label: "Visão geral", icon: Home },
  { label: "Ferramentas", icon: Calculator },
  { label: "Solicitações", icon: HelpCircle },
  { label: "Minha assinatura", icon: CreditCard },
  { label: "Minha conta", icon: UserRound },
]

const hubTools = [
  {
    title: "Gerador de Contratos",
    description: "Monte um documento simples para revisar, imprimir ou baixar.",
    icon: FileSignature,
    href: "/ferramentas/gerador-contrato",
  },
  {
    title: "Simulador de Rescisão",
    description: "Estime valores principais de uma rescisão trabalhista.",
    icon: ReceiptText,
    href: "/ferramentas/simulador-rescisao",
  },
  {
    title: "Simulador de Contratação",
    description: "Veja uma estimativa do custo mensal de contratar uma pessoa.",
    icon: Users,
    href: "/ferramentas/simulador-contratacao",
  },
  {
    title: "Calculadora de Precificação",
    description: "Descubra um valor sugerido para cobrar por produtos ou serviços.",
    icon: Calculator,
    href: "/ferramentas/calculadora-precificacao",
  },
  {
    title: "Nova Solicitação",
    description: "Envie uma dúvida, pedido de suporte ou solicitação contábil.",
    icon: MessageSquarePlus,
    href: "#solicitacoes",
  },
]

const requests = [
  { title: "Envio de documentos MEI", status: "Em análise", date: "22 jul. 2026" },
  { title: "Dúvida sobre nota fiscal", status: "Respondida", date: "18 jul. 2026" },
  { title: "Atualização cadastral", status: "Aberta", date: "15 jul. 2026" },
]

export const metadata = {
  title: "Hub do Cliente | ContaFacil",
  description: "Área visual inicial do cliente ContaFacil.",
}

export default function ClientHubPage() {
  return (
    <main className="client-hub-page">
      <aside className="client-hub-sidebar" aria-label="Menu do hub do cliente">
        <a className="client-hub-logo" href="/" aria-label="ContaFacil">
          <span>Conta</span>Facil
        </a>

        <nav className="client-hub-nav" aria-label="Navegação do hub">
          {hubNavigation.map(({ label, icon: Icon }, index) => (
            <a className={index === 0 ? "is-active" : ""} href={`#${label.toLowerCase().replace(/\s+/g, "-")}`} key={label}>
              <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <button className="client-hub-signout" type="button">
          <LogOut size={18} strokeWidth={2.1} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </aside>

      <section className="client-hub-main" aria-labelledby="client-hub-title">
        <header className="client-hub-header" id="visão-geral">
          <div>
            <span>Hub do cliente</span>
            <h1 id="client-hub-title">Olá, Ana. Tudo certo por aqui.</h1>
            <p>Acompanhe suas ferramentas, solicitações e dados da assinatura em um só lugar.</p>
          </div>

          <div className="client-hub-account-pill">
            <Settings size={17} strokeWidth={2.1} aria-hidden="true" />
            <span>Plano Prata</span>
          </div>
        </header>

        <section className="client-hub-overview" aria-label="Visão geral">
          <article>
            <span>Solicitações abertas</span>
            <strong>2</strong>
            <p>1 aguardando retorno do atendimento.</p>
          </article>
          <article>
            <span>Próximo vencimento</span>
            <strong>05 ago.</strong>
            <p>Assinatura mensal ativa.</p>
          </article>
          <article>
            <span>Ferramentas disponíveis</span>
            <strong>4</strong>
            <p>Acesso igual para todos os clientes.</p>
          </article>
        </section>

        <section className="client-hub-section" id="ferramentas" aria-labelledby="client-hub-tools-title">
          <div className="client-hub-section-head">
            <h2 id="client-hub-tools-title">Ferramentas</h2>
            <p>Atalhos para resolver tarefas comuns sem sair do hub.</p>
          </div>

          <div className="client-hub-tool-grid">
            {hubTools.map(({ title, description, icon: Icon, href }) => (
              <a className="client-hub-tool-card" href={href} key={title}>
                <span className="client-hub-tool-icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={2.1} />
                </span>
                <strong>{title}</strong>
                <p>{description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="client-hub-lower-grid">
          <article className="client-hub-panel" id="solicitações">
            <div className="client-hub-section-head">
              <h2>Solicitações</h2>
              <p>Dados fictícios para demonstrar o layout.</p>
            </div>
            <div className="client-hub-request-list">
              {requests.map((request) => (
                <div className="client-hub-request" key={request.title}>
                  <div>
                    <strong>{request.title}</strong>
                    <span>{request.date}</span>
                  </div>
                  <em>{request.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="client-hub-panel" id="minha-assinatura">
            <div className="client-hub-section-head">
              <h2>Minha assinatura</h2>
              <p>Resumo simples da assinatura atual.</p>
            </div>
            <div className="client-hub-subscription-card">
              <span>Plano atual</span>
              <strong>Prata</strong>
              <p>MEI com 1 funcionário, atendimento prioritário e orientação especializada.</p>
            </div>
          </article>

          <article className="client-hub-panel" id="minha-conta">
            <div className="client-hub-section-head">
              <h2>Minha conta</h2>
              <p>Informações demonstrativas do cliente.</p>
            </div>
            <dl className="client-hub-account-list">
              <div>
                <dt>Nome</dt>
                <dd>Ana Souza</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>ana@empresa.com</dd>
              </div>
              <div>
                <dt>Empresa</dt>
                <dd>Ana Souza MEI</dd>
              </div>
            </dl>
          </article>
        </section>
      </section>
    </main>
  )
}
