import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolShell } from "@/components/tool-shell"
import { ArticleView } from "@/components/blog/article-view"
import { getAllArticles, getArticleBySlug } from "@/lib/blog/articles"

type ArticlePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllArticles().map(article => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return {}
  }

  return {
    title: `${article.metaTitle ?? article.title} | Blog ContaFacil`,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle ?? article.title,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  }
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <ToolShell mainClassName="blog-site">
      <ArticleView article={article} />
    </ToolShell>
  )
}
