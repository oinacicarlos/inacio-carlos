import type { BlogArticle } from "@/lib/blog/types"

export const article: BlogArticle = {
  slug: "quanto-custa-funcionario-clt",
  title: "Quanto custa contratar um funcionário CLT (além do salário)",
  metaTitle: "Quanto custa um funcionário CLT de verdade",
  metaDescription:
    "O salário é só uma parte do custo de contratar CLT. Veja tudo que entra na conta: FGTS, 13º, férias, encargos e benefícios.",
  excerpt:
    "Quem nunca contratou costuma se surpreender: o custo real de um funcionário CLT costuma ficar bem acima do salário combinado. Veja o que entra nessa conta.",
  pillar: "contratacao",
  coverImage: "/blog/covers/quanto-custa-funcionario-clt.jpg",
  coverImageAlt: "Aperto de mão entre empresário e candidata em entrevista de emprego",
  publishedAt: "2026-01-20",
  updatedAt: "2026-01-20",
  readingTimeMinutes: 7,
  sections: [
    {
      type: "paragraph",
      text: "Quando o negócio começa a crescer e chega a hora de contratar a primeira pessoa, é comum planejar o orçamento olhando só para o salário combinado. O problema é que o salário é apenas uma fatia do custo real — e quem não considera o resto acaba levando um susto no fim do primeiro mês. Entender essa conta antes de contratar evita comprometer o caixa da empresa.",
    },
    {
      type: "heading",
      level: 2,
      text: "O salário é só o ponto de partida",
      id: "salario-e-ponto-de-partida",
    },
    {
      type: "paragraph",
      text: "Contratar CLT significa assumir uma série de obrigações previstas em lei, além do próprio salário. Cada uma delas aumenta um pouco o custo mensal e, no final, o custo real de manter um funcionário costuma ficar entre 1,5 e 2 vezes o salário bruto — dependendo do regime tributário da empresa e dos benefícios oferecidos.",
    },
    {
      type: "heading",
      level: 2,
      text: "O que entra na conta, item por item",
      id: "o-que-entra-na-conta",
    },
    {
      type: "list",
      items: [
        "FGTS — 8% do salário, depositado todo mês numa conta vinculada ao funcionário.",
        "13º salário — equivalente a mais um salário por ano, provisionado mês a mês (1/12 do salário por mês trabalhado).",
        "Férias + 1/3 — um salário extra a cada 12 meses trabalhados, também provisionado mensalmente.",
        "Encargos patronais — variam conforme o regime tributário da empresa (no Simples Nacional Anexo IV, por exemplo, incidem por fora do DAS).",
        "Vale-transporte — obrigatório quando solicitado pelo funcionário, com desconto de até 6% do salário dele.",
        "Vale-alimentação ou refeição — não é obrigatório por lei, mas é praticamente padrão de mercado hoje.",
        "Plano de saúde e outros benefícios — opcionais, mas comuns em vagas mais competitivas.",
      ],
    },
    {
      type: "callout",
      title: "Exemplo prático",
      text: "Um funcionário com salário de R$2.500, vale-transporte de R$220, vale-alimentação de R$550 e sem plano de saúde, numa empresa do Simples Nacional regime regular (sem encargo patronal adicional), custa aproximadamente R$3.995 por mês — cerca de 1,6 vezes o salário. Em uma empresa do Anexo IV ou do Lucro Presumido, com encargos patronais de 28,8%, esse custo sobe para mais de R$5.000.",
    },
    {
      type: "heading",
      level: 2,
      text: "Por que o regime tributário muda tanto essa conta",
      id: "regime-tributario-muda-conta",
    },
    {
      type: "paragraph",
      text: "Empresas do Simples Nacional em regime regular não pagam encargo patronal adicional sobre a folha — o INSS patronal já está incluído no DAS. Já as empresas enquadradas no Anexo IV do Simples (algumas atividades de serviço, como construção civil e alguns tipos de consultoria) e as do Lucro Presumido ou Real pagam a parte patronal do INSS por fora, o que costuma adicionar entre 26% e 30% sobre o salário e as provisões. Saber em qual enquadramento a empresa está é essencial antes de fechar a conta de quanto vai custar contratar.",
    },
    {
      type: "heading",
      level: 2,
      text: "Erros comuns na hora de calcular o custo de contratação",
      id: "erros-comuns",
    },
    {
      type: "list",
      items: [
        "Esquecer o 13º e as férias na provisão mensal — eles não aparecem na folha do mês, mas precisam estar reservados.",
        "Não verificar o próprio regime tributário antes de estimar os encargos.",
        "Contar o vale-transporte pelo valor cheio, sem considerar o desconto de até 6% do salário do funcionário.",
        "Comparar apenas o salário com o custo de um freelancer ou PJ, sem incluir os encargos na comparação.",
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Simule o custo antes de contratar",
      id: "simule-antes-de-contratar",
    },
    {
      type: "paragraph",
      text: "O Simulador de Contratação da Tropa já calcula essa conta inteira: você informa o salário, o regime da empresa e os benefícios, e ele mostra o custo médio mensal, o custo anual e o detalhamento de cada item — em segundos, sem precisar montar planilha.",
    },
  ],
  faq: [
    {
      question: "O custo de um funcionário CLT é sempre o dobro do salário?",
      answer:
        "Não necessariamente — costuma ficar entre 1,5 e 2 vezes o salário, dependendo do regime tributário da empresa e dos benefícios oferecidos. Empresas do Simples Nacional regular tendem para a faixa mais baixa; empresas do Anexo IV, Presumido ou Real tendem para a faixa mais alta.",
    },
    {
      question: "MEI pode contratar funcionário CLT?",
      answer:
        "Sim, o MEI pode ter um único funcionário registrado, recebendo até um salário mínimo ou o piso da categoria. Contratar mais de um funcionário exige migrar para outro enquadramento, como ME do Simples Nacional.",
    },
    {
      question: "Vale-transporte é obrigatório mesmo se o funcionário morar perto?",
      answer:
        "O vale-transporte é obrigatório sempre que o funcionário solicitar, independentemente da distância — a lei não prevê exceção por proximidade. A empresa pode descontar até 6% do salário bruto do funcionário como participação nesse custo.",
    },
  ],
  relatedTool: {
    title: "Simulador de Contratação",
    href: "/ferramentas/simulador-contratacao",
    description: "Informe salário, regime e benefícios — veja o custo médio mensal e anual em segundos.",
  },
  relatedSlugs: ["mei-pode-ter-funcionario", "ferias-clt-como-funciona-o-calculo", "como-calcular-decimo-terceiro-salario"],
}
