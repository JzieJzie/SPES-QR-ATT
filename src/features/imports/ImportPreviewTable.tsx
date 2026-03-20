import { Card } from '../../components/ui/Card'
import { Table, Td, Th } from '../../components/ui/Table'
import type { ImportRow } from '../../lib/validators/import'

type ImportPreviewTableProps = {
  rows: ImportRow[]
  invalidRows: Array<{ rowNumber: number; issues: string[] }>
}

export const ImportPreviewTable = ({ rows, invalidRows }: ImportPreviewTableProps) => {
  return (
    <Card title="Validation Preview" className="space-y-4">
      <div className="text-sm">
        <p>Valid rows: {rows.length}</p>
        <p>Invalid rows: {invalidRows.length}</p>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>lastName</Th>
            <Th>firstName</Th>
            <Th>middleName</Th>
            <Th>Barangay</Th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 25).map((row, index) => (
            <tr key={`${row.lastName}-${index}`}>
              <Td>{row.lastName}</Td>
              <Td>{row.firstName}</Td>
              <Td>{row.middleName || '-'}</Td>
              <Td>{row.Barangay}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {invalidRows.length > 0 ? (
        <div className="border-2 border-black p-2 text-xs">
          {invalidRows.slice(0, 10).map((invalidRow) => (
            <p key={invalidRow.rowNumber}>
              Row {invalidRow.rowNumber}: {invalidRow.issues.join(', ')}
            </p>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
