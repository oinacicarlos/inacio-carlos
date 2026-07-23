import { jsPDF } from "jspdf"
import type { ContractClause, ContractGeneratorState } from "../types"
import { TOOL_NOTICE, getContractTitle } from "./contractBuilder"

function addFooter(doc: jsPDF, page: number, pageCount: number) {
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(102, 117, 139)
  doc.text(TOOL_NOTICE, 20, height - 18, { maxWidth: width - 40 })
  doc.text(`${page}/${pageCount}`, width - 20, height - 8, { align: "right" })
}

export function generateContractPdf(state: ContractGeneratorState, clauses: ContractClause[], fileName: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const width = doc.internal.pageSize.getWidth()
  const height = doc.internal.pageSize.getHeight()
  const marginX = 22
  const maxWidth = width - marginX * 2
  let y = 24

  const ensureSpace = (space = 18) => {
    if (y + space > height - 34) {
      doc.addPage()
      y = 24
    }
  }

  const writeParagraph = (text: string, fontSize = 10.5, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal")
    doc.setFontSize(fontSize)
    doc.setTextColor(13, 27, 46)
    const lines = doc.splitTextToSize(text, maxWidth)
    ensureSpace(lines.length * 5 + 4)
    doc.text(lines, marginX, y)
    y += lines.length * 5 + 4
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(13, 27, 46)
  doc.text(getContractTitle(state.contractType).toUpperCase(), width / 2, y, { align: "center" })
  y += 14

  clauses.forEach((item) => {
    ensureSpace(18)
    writeParagraph(item.title, 11.5, true)
    item.paragraphs.forEach((paragraph) => writeParagraph(paragraph))
    y += 2
  })

  ensureSpace(46)
  writeParagraph("Assinaturas", 11.5, true)
  state.parties.forEach((party) => {
    ensureSpace(26)
    y += 10
    doc.line(marginX, y, marginX + 72, y)
    y += 5
    writeParagraph(party.name || "Parte")
  })

  const witnessTotal = state.signature.witnessCount === "two" ? 2 : state.signature.witnessCount === "one" ? 1 : 0
  if (witnessTotal) {
    ensureSpace(40)
    writeParagraph("Testemunhas", 11.5, true)
    state.signature.witnesses.slice(0, witnessTotal).forEach((witness, index) => {
      ensureSpace(24)
      y += 9
      doc.line(marginX, y, marginX + 72, y)
      y += 5
      writeParagraph(`${index + 1}. ${witness.name || "Nome"} - CPF: ${witness.document || "________________"}`)
    })
  }

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    addFooter(doc, page, pageCount)
  }

  doc.save(fileName)
}
