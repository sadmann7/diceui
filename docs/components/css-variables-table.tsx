import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CSSVariablesTableProps {
  variables: {
    title: string;
    description: string;
  }[];
}

export function CSSVariablesTable({ variables }: CSSVariablesTableProps) {
  return (
    <Table mdx>
      <TableHeader>
        <TableRow>
          <TableHead>CSS Variable</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variables.map((variable) => (
          <TableRow key={variable.title}>
            <TableCell>
              <code className="text-[13px]">{variable.title}</code>
            </TableCell>
            <TableCell>{variable.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
