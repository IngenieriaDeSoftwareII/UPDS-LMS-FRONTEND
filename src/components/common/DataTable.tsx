import {
  Table,
  TableBody,
  TableHeader,
} from '@/components/ui/table'

interface Props {
  header: React.ReactNode
  children: React.ReactNode
}

export function DataTable({ header, children }: Props) {
  return (
    <Table>
      <TableHeader>{header}</TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  )
}