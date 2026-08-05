import { ArrowRight, BadgeCheck } from "lucide-react"
import type { BlogArticle, BlogSection } from "@/lib/blog/types"
import { PILLAR_LABELS } from "@/lib/blog/types"
import { formatBlogDate } from "@/lib/blog/format"
import { getRelatedArticles } from "@/lib/blog/articles"
import { BlogCard } from "@/components/blog/blog-card"

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case "paragraph":
      return <p key={index}>{section.text}</p>
    case "heading": {
      const HeadingTag = section.level === 2 ? "h2" : "h3"
      return (
        <HeadingTag key={index} id={section.id}>
          {section.text}
        </HeadingTag>
      )
    }
    case "list": {
      const ListTag = section.ordered ? "ol" : "ul"
      return (
        <ListTag key={index}>
          {section.items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      )
    }
    case "callout":
      return (
        <div className="blog-callout" key={index}>
          {section.title ? <strong>{section.title}</strong> : null}
          <p>{section.text}</p>
        </div>
      )
    case "table":
      return (
        <div className="blog-table-wrap" key={index}>
          <table>
            <thead>
              <tr>
                {section.headers.map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

function buildJsonLd(article: BlogArticle) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: "Tropa" },
    publisher: { "@type": "Organization", name: "Tropa" },
  }

  const faqJsonLd =
    article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: "/blog" },
      { "@type": "ListItem", position: 2, name: article.title, item: `/blog/${article.slug}` },
    ],
  }

  return [articleJsonLd, faqJsonLd, breadcrumbJsonLd].filter(Boolean)
}

export function ArticleView({ article }: { article: BlogArticle }) {
  const headings = article.sections.filter((section): section is Extract<BlogSection, { type: "heading" }> => section.type === "heading")
  const relatedArticles = getRelatedArticles(article)
  const jsonLdBlocks = buildJsonLd(article)

  return (
    <>
      {jsonLdBlocks.map((block, index) => (
        // eslint-disable-next-line react/no-danger
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
      ))}

      <section className="blog-article-section" aria-labelledby="blog-article-title">
        <nav className="blog-breadcrumb" aria-label="Caminho">
          <a href="/blog">Blog</a>
          <span aria-hidden="true">/</span>
          <span>{PILLAR_LABELS[article.pillar]}</span>
        </nav>

        <header className="blog-hero-banner">
          <img className="blog-hero-banner-bg" src={article.coverImage} alt={article.coverImageAlt} loading="eager" />
          <div className="blog-hero-banner-scrim" aria-hidden="true" />
          <div className="blog-hero-banner-text">
            <span className="blog-hero-banner-pillar">{PILLAR_LABELS[article.pillar]}</span>
            <h1 id="blog-article-title">{article.title}</h1>
            <p className="blog-hero-banner-excerpt">{article.excerpt}</p>
            <p className="blog-hero-banner-meta">
              Publicado em {formatBlogDate(article.publishedAt)}
              {article.updatedAt !== article.publishedAt ? ` · Atualizado em ${formatBlogDate(article.updatedAt)}` : ""}
              {" · "}
              {article.readingTimeMinutes} min de leitura
            </p>
          </div>
        </header>

        <div className="blog-article-layout">
          {headings.length > 0 ? (
            <aside className="blog-toc" aria-label="Sumário do artigo">
              <span>Neste artigo</span>
              <nav>
                {headings.map(heading => (
                  <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? "is-sub" : ""}>
                    {heading.text}
                  </a>
                ))}
              </nav>
            </aside>
          ) : null}

          <article className="blog-article-body">
            {article.sections.map((section, index) => renderSection(section, index))}

            {article.faq.length > 0 ? (
              <section className="blog-faq" aria-labelledby="blog-faq-title">
                <h2 id="blog-faq-title">Perguntas frequentes</h2>
                {article.faq.map(item => (
                  <details className="pricing-tool-breakdown" key={item.question}>
                    <summary>{item.question}</summary>
                    <div className="pricing-tool-summary">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </section>
            ) : null}
          </article>

          <aside className="blog-side-promo" aria-label="Recursos relacionados">
            <div className="blog-promo-card">
              <strong>{article.relatedTool.title}</strong>
              <p>{article.relatedTool.description}</p>
              <a
                className="blog-promo-card-cta"
                href={article.relatedTool.href}
                {...(article.relatedTool.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {article.relatedTool.href.startsWith("http") ? "Falar no WhatsApp" : "Abrir ferramenta"}
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </a>
            </div>

            <div className="blog-promo-card blog-promo-card--accent">
              <BadgeCheck size={22} strokeWidth={2} aria-hidden="true" />
              <strong>Fale com um especialista</strong>
              <p>Tire dúvidas sobre a sua contabilidade com quem entende do assunto.</p>
              <a
                className="blog-promo-card-cta blog-promo-card-cta--light"
                href="https://wa.me/5521979080457"
                target="_blank"
                rel="noreferrer"
              >
                Falar agora
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>

        {relatedArticles.length > 0 ? (
          <section className="blog-related" aria-labelledby="blog-related-title">
            <h2 id="blog-related-title">Continue lendo</h2>
            <div className="blog-grid">
              {relatedArticles.map(related => (
                <BlogCard article={related} key={related.slug} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </>
  )
}
