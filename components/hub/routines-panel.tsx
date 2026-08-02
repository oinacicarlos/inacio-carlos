"use client"

import { useState } from "react"
import { ChevronRight, Download, FileText, Folder } from "lucide-react"

type RoutineDocument = {
  name: string
  category: string
  date: string
  status: "Disponível" | "Pendente"
}

type RoutineMonth = {
  slug: string
  label: string
  documents: RoutineDocument[]
}

type RoutineYear = {
  slug: string
  label: string
  months: RoutineMonth[]
}

// Dados de exemplo só pra visualizar o layout — sem integração ainda.
// O acompanhamento de rotinas começa em agosto de 2026, não existe histórico anterior.
const MOCK_YEARS: RoutineYear[] = [
  {
    slug: "2026",
    label: "2026",
    months: [
      {
        slug: "2026-08",
        label: "Agosto",
        documents: [
          { name: "DAS - MEI", category: "Guia de recolhimento", date: "—", status: "Pendente" },
          { name: "Pacote e-CAC", category: "Rotina fiscal", date: "01/08/2026", status: "Disponível" },
        ],
      },
    ],
  },
]

type Level = "years" | "months" | "documents"

export default function RoutinesPanel() {
  const [level, setLevel] = useState<Level>("years")
  const [selectedYearSlug, setSelectedYearSlug] = useState<string | null>(null)
  const [selectedMonthSlug, setSelectedMonthSlug] = useState<string | null>(null)

  const selectedYear = MOCK_YEARS.find((year) => year.slug === selectedYearSlug) ?? null
  const selectedMonth = selectedYear?.months.find((month) => month.slug === selectedMonthSlug) ?? null

  function openYear(yearSlug: string) {
    setSelectedYearSlug(yearSlug)
    setSelectedMonthSlug(null)
    setLevel("months")
  }

  function openMonth(monthSlug: string) {
    setSelectedMonthSlug(monthSlug)
    setLevel("documents")
  }

  function goToYears() {
    setSelectedYearSlug(null)
    setSelectedMonthSlug(null)
    setLevel("years")
  }

  function goToMonths() {
    setSelectedMonthSlug(null)
    setLevel("months")
  }

  return (
    <article className="client-hub-panel">
      <div className="client-hub-section-head">
        <div>
          <h2>Rotinas</h2>
          <p>DAS, pacote e-CAC e outros documentos de rotina, organizados por ano e mês.</p>
        </div>
      </div>

      <nav className="routines-breadcrumb" aria-label="Navegação de pastas">
        <button type="button" onClick={goToYears} disabled={level === "years"}>
          Rotinas
        </button>
        {selectedYear && (
          <>
            <ChevronRight size={14} strokeWidth={2.2} aria-hidden="true" />
            <button type="button" onClick={goToMonths} disabled={level === "months"}>
              {selectedYear.label}
            </button>
          </>
        )}
        {selectedMonth && (
          <>
            <ChevronRight size={14} strokeWidth={2.2} aria-hidden="true" />
            <span>{selectedMonth.label}</span>
          </>
        )}
      </nav>

      {level === "years" && (
        <div className="routines-folder-grid">
          {MOCK_YEARS.map((year) => (
            <button type="button" className="routines-folder-card" key={year.slug} onClick={() => openYear(year.slug)}>
              <span className="routines-folder-icon" aria-hidden="true">
                <Folder size={22} strokeWidth={1.8} />
              </span>
              <strong>{year.label}</strong>
              <span className="routines-folder-meta">{year.months.length} meses</span>
            </button>
          ))}
        </div>
      )}

      {level === "months" && selectedYear && (
        <div className="routines-folder-grid">
          {selectedYear.months.map((month) => (
            <button type="button" className="routines-folder-card" key={month.slug} onClick={() => openMonth(month.slug)}>
              <span className="routines-folder-icon" aria-hidden="true">
                <Folder size={22} strokeWidth={1.8} />
              </span>
              <strong>{month.label}</strong>
              <span className="routines-folder-meta">{month.documents.length} documentos</span>
            </button>
          ))}
        </div>
      )}

      {level === "documents" && selectedMonth && (
        <div className="routines-doc-list">
          {selectedMonth.documents.map((document) => (
            <div className="routines-doc-row" key={document.name}>
              <span className="routines-doc-icon" aria-hidden="true">
                <FileText size={18} strokeWidth={1.9} />
              </span>
              <div className="routines-doc-info">
                <strong>{document.name}</strong>
                <span>{document.category}</span>
              </div>
              <span className={`routines-doc-status${document.status === "Pendente" ? " is-pending" : ""}`}>
                {document.status}
              </span>
              <span className="routines-doc-date">{document.date}</span>
              <button type="button" className="routines-doc-download" disabled={document.status !== "Disponível"}>
                <Download size={15} strokeWidth={2.2} aria-hidden="true" />
                Baixar
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
