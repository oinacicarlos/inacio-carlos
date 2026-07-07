import ModeloRealEstateSite from '@/components/modelo-1/real-estate-site'
import { modeloProperties } from '@/lib/modelo-1-data'

export function generateStaticParams() {
  return modeloProperties.map(property => ({ slug: property.slug }))
}

export default async function Modelo1ImovelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ModeloRealEstateSite page="detail" slug={slug} />
}
