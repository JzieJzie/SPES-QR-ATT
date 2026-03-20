import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

import { formatTimestampWithSeconds } from './time'

export type MasterlistExportRow = {
  beneficiaryID: string
  lastName: string
  firstName: string
  middleName: string
  barangay: string
  qrImageUrl: string
}

export const exportMasterlistXlsx = async (rows: MasterlistExportRow[]): Promise<void> => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Masterlist')

  sheet.columns = [
    { header: 'beneficiaryID', key: 'beneficiaryID', width: 16 },
    { header: 'lastName', key: 'lastName', width: 18 },
    { header: 'firstName', key: 'firstName', width: 18 },
    { header: 'middleName', key: 'middleName', width: 18 },
    { header: 'Barangay', key: 'barangay', width: 22 },
    { header: 'QR', key: 'qr', width: 15 },
  ]

  for (const [index, row] of rows.entries()) {
    const rowIndex = index + 2
    sheet.addRow({
      beneficiaryID: row.beneficiaryID,
      lastName: row.lastName,
      firstName: row.firstName,
      middleName: row.middleName,
      barangay: row.barangay,
      qr: '',
    })

    const response = await fetch(row.qrImageUrl)
    const imageBuffer = await response.arrayBuffer()
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'png',
    })

    sheet.addImage(imageId, {
      tl: { col: 5.1, row: rowIndex - 0.85 },
      ext: { width: 68, height: 68 },
    })
    sheet.getRow(rowIndex).height = 56
  }

  const data = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([data]), `spes-masterlist-${formatTimestampWithSeconds(new Date())}.xlsx`)
}

export type DailyReportRow = {
  beneficiaryID: string
  fullName: string
  barangay: string
  amIn: string | null
  amOut: string | null
  pmIn: string | null
  pmOut: string | null
  remarks: string
}

export const exportDailyReportXlsx = async (
  date: string,
  rows: DailyReportRow[],
): Promise<void> => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Daily Attendance')

  sheet.addRow(['Date', date])
  sheet.addRow([
    'beneficiaryID',
    'fullName',
    'Barangay',
    'AM Time-In',
    'AM Time-Out',
    'PM Time-In',
    'PM Time-Out',
    'Remarks',
  ])

  rows.forEach((row) => {
    sheet.addRow([
      row.beneficiaryID,
      row.fullName,
      row.barangay,
      row.amIn,
      row.amOut,
      row.pmIn,
      row.pmOut,
      row.remarks,
    ])
  })

  sheet.columns.forEach((column) => {
    column.width = 20
  })

  const data = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([data]), `spes-daily-report-${date}.xlsx`)
}
