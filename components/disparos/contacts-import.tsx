'use client'

import { type ChangeEvent, type DragEvent, useState } from 'react'
import { Download, Upload } from 'lucide-react'

type Props = {
  firstColumnLabel: string
  secondColumnLabel: string
  secondColumnAliases: string[]
  exampleRows: Array<[string, string]>
  fileBaseName: string
  value: string
  onChange: (contactsText: string) => void
}

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

function buildContactsTextFromRows(rows: unknown[][], secondColumnAliases: string[]) {
  if (rows.length === 0) return ''

  const header = rows[0].map(normalizeHeader)
  let nameIndex = header.findIndex(cell => cell === 'nome')
  let secondIndex = header.findIndex(cell => secondColumnAliases.includes(cell))

  let dataRows = rows.slice(1)
  if (nameIndex === -1 || secondIndex === -1) {
    // no recognizable header — assume column A = nome, column B = second field
    nameIndex = 0
    secondIndex = 1
    dataRows = rows
  }

  return dataRows
    .map(row => {
      const name = String(row[nameIndex] ?? '').trim()
      const second = String(row[secondIndex] ?? '').trim()
      return name && second ? `${name},${second}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

export default function ContactsImport({
  firstColumnLabel,
  secondColumnLabel,
  secondColumnAliases,
  exampleRows,
  fileBaseName,
  value,
  onChange,
}: Props) {
  const [manualOpen, setManualOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  async function handleDownloadModel() {
    const XLSX = await import('xlsx')
    const sheet = XLSX.utils.aoa_to_sheet([[firstColumnLabel, secondColumnLabel], ...exampleRows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Contatos')
    XLSX.writeFile(workbook, `${fileBaseName}.xlsx`)
  }

  async function importFile(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !['xlsx', 'xls', 'csv'].includes(extension)) {
      setImportError('Formato não suportado. Use .xlsx, .xls ou .csv.')
      return
    }

    setImporting(true)
    setImportError('')
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array', raw: false })
      const sheetName = workbook.SheetNames.includes('Contatos') ? 'Contatos' : workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false }) as unknown[][]
      const filteredRows = rows.filter(row => Array.isArray(row) && row.some(cell => String(cell ?? '').trim()))
      const contactsText = buildContactsTextFromRows(filteredRows, secondColumnAliases)

      if (!contactsText) {
        setImportError('Não encontrei linhas válidas nessa planilha.')
        setImporting(false)
        return
      }

      onChange(contactsText)
      setFileName(file.name)
    } catch {
      setImportError('Não consegui ler essa planilha.')
    } finally {
      setImporting(false)
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) importFile(file)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) importFile(file)
  }

  return (
    <div className="disparos-import">
      <div className="disparos-model-row">
        <button type="button" className="clientes-nucleo-btn ghost" onClick={() => handleDownloadModel()}>
          <Download size={14} aria-hidden />
          Baixar modelo Excel
        </button>
        <div>
          <strong>
            Baixe o modelo, preencha {firstColumnLabel} e {secondColumnLabel} e importe a planilha.
          </strong>
          <span>Formatos aceitos: .xlsx, .xls e .csv</span>
        </div>
      </div>

      <label
        className={dragActive ? 'disparos-upload-zone is-dragging' : 'disparos-upload-zone'}
        onDragOver={event => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload size={20} aria-hidden />
        <strong>{importing ? 'Importando planilha…' : 'Arraste sua planilha aqui'}</strong>
        <em>ou selecione um arquivo</em>
        <small>.xlsx, .xls ou .csv</small>
        <input
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          onChange={handleFileInput}
          hidden
        />
      </label>

      {fileName && !importError && <p className="disparos-muted">Planilha importada: {fileName}</p>}
      {importError && <p className="clientes-nucleo-modal-error">{importError}</p>}

      <button type="button" className="disparos-step-back" onClick={() => setManualOpen(current => !current)}>
        {manualOpen ? 'Ocultar lista manual' : 'Inserir contatos manualmente'}
      </button>

      {manualOpen && (
        <label className="routine-email-field">
          Lista ({firstColumnLabel},{secondColumnLabel} por linha)
          <textarea rows={6} value={value} onChange={event => onChange(event.target.value)} />
        </label>
      )}
    </div>
  )
}
