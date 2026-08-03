import type { BlogArticle } from "@/lib/blog/types"
import { article as comoCalcularPrecoDeServico } from "./como-calcular-preco-de-servico"
import { article as oQueEDasMeiComoPagar } from "./o-que-e-das-mei-como-pagar"
import { article as diferencaDemissaoSemJustaCausaPedidoAcordo } from "./diferenca-demissao-sem-justa-causa-pedido-acordo"
import { article as quantoCustaFuncionarioClt } from "./quanto-custa-funcionario-clt"
import { article as oQueNaoPodeFaltarContratoPrestacaoServico } from "./o-que-nao-pode-faltar-contrato-prestacao-servico"
import { article as oQueFazerQuandoClienteNaoPaga } from "./o-que-fazer-quando-cliente-nao-paga"
import { article as comoAbrirMeiPassoAPasso } from "./como-abrir-mei-passo-a-passo"
import { article as comoEmitirNotaFiscalMei } from "./como-emitir-nota-fiscal-mei"
import { article as cobrarPorHoraOuPorProjeto } from "./cobrar-por-hora-ou-por-projeto"
import { article as oQueEAvisoPrevioComoFunciona } from "./o-que-e-aviso-previo-como-funciona"
import { article as meiPodeTerFuncionario } from "./mei-pode-ter-funcionario"
import { article as quantoCustaUmContadorParaMei } from "./quanto-custa-um-contador-para-mei"
import { article as comoTrocarDeContador } from "./como-trocar-de-contador"
import { article as meiOuMeQuandoMigrar } from "./mei-ou-me-quando-migrar"
import { article as comoCalcularDecimoTerceiroSalario } from "./como-calcular-decimo-terceiro-salario"
import { article as feriasCltComoFuncionaOCalculo } from "./ferias-clt-como-funciona-o-calculo"
import { article as contratoVerbalTemValidade } from "./contrato-verbal-tem-validade"
import { article as rpaOuNotaFiscalPrestadorServico } from "./rpa-ou-nota-fiscal-prestador-servico"
import { article as simplesNacionalPrestadorServico } from "./simples-nacional-prestador-servico"
import { article as certificadoDigitalA1ParaEmpresa } from "./certificado-digital-a1-para-empresa"
import { article as inscricaoMunicipalParaPrestadorServico } from "./inscricao-municipal-para-prestador-servico"
import { article as reformaTributariaPrestadorServico2026 } from "./reforma-tributaria-prestador-servico-2026"
import { prioridadeSimples2026Articles } from "./prioridade-simples-2026"
import { regularizacaoConversaoArticles } from "./regularizacao-conversao"
import { prestadoresServicoSeoArticles } from "./prestadores-servico-seo"

const ALL_ARTICLES: BlogArticle[] = [
  ...prioridadeSimples2026Articles,
  ...regularizacaoConversaoArticles,
  ...prestadoresServicoSeoArticles,
  rpaOuNotaFiscalPrestadorServico,
  simplesNacionalPrestadorServico,
  certificadoDigitalA1ParaEmpresa,
  inscricaoMunicipalParaPrestadorServico,
  reformaTributariaPrestadorServico2026,
  comoCalcularPrecoDeServico,
  oQueEDasMeiComoPagar,
  diferencaDemissaoSemJustaCausaPedidoAcordo,
  quantoCustaFuncionarioClt,
  oQueNaoPodeFaltarContratoPrestacaoServico,
  oQueFazerQuandoClienteNaoPaga,
  comoAbrirMeiPassoAPasso,
  comoEmitirNotaFiscalMei,
  cobrarPorHoraOuPorProjeto,
  oQueEAvisoPrevioComoFunciona,
  meiPodeTerFuncionario,
  quantoCustaUmContadorParaMei,
  comoTrocarDeContador,
  meiOuMeQuandoMigrar,
  comoCalcularDecimoTerceiroSalario,
  feriasCltComoFuncionaOCalculo,
  contratoVerbalTemValidade,
]

export function getAllArticles(): BlogArticle[] {
  return [...ALL_ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export function getRecentArticles(count: number): BlogArticle[] {
  return getAllArticles().slice(0, count)
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return ALL_ARTICLES.find(article => article.slug === slug)
}

export function getRelatedArticles(article: BlogArticle): BlogArticle[] {
  return article.relatedSlugs
    .map(slug => getArticleBySlug(slug))
    .filter((item): item is BlogArticle => Boolean(item))
}
