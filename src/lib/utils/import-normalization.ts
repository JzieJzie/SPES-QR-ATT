import Papa from 'papaparse'
import * as XLSX from 'xlsx'

import { importRowSchema, type ImportRow } from '../validators/import'

type ParseResult = {
  validRows: ImportRow[]
  invalidRows: Array<{ rowNumber: number; issues: string[] }>
}

const normalizeHeader = (value: string): string => value.trim().toLowerCase()

const mapKeys = (row: Record<string, unknown>): Record<string, string> => {
  const mapped: Record<string, string> = {
    lastName: '',
    firstName: '',
    middleName: '',
    Barangay: '',
  }

  Object.entries(row).forEach(([key, rawValue]) => {
    const value = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '')
    const normalized = normalizeHeader(key)

    if (normalized === 'lastname') mapped.lastName = value
    if (normalized === 'firstname') mapped.firstName = value
    if (normalized === 'middlename') mapped.middleName = value
    if (normalized === 'barangay') mapped.Barangay = value
  })

  return mapped
}

const toRecords = async (file: File): Promise<Record<string, unknown>[]> => {
  const isCsv = file.name.toLowerCase().endsWith('.csv')
  if (isCsv) {
    const text = await file.text()
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
    })
    return parsed.data
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer)
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: '',
  })
}

export const parseAndValidateImportFile = async (file: File): Promise<ParseResult> => {
  const rawRows = await toRecords(file)

  const validRows: ImportRow[] = []
  const invalidRows: Array<{ rowNumber: number; issues: string[] }> = []

  rawRows.forEach((row, index) => {
    const parsed = importRowSchema.safeParse(mapKeys(row))
    if (parsed.success) {
      validRows.push(parsed.data)
      return
    }

    invalidRows.push({
      rowNumber: index + 2,
      issues: parsed.error.issues.map((issue) => issue.message),
    })
  })

  return { validRows, invalidRows }
}
