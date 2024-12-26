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
    defaultValue?: string;
  }[];
}

export function CSSVariablesTable({ variables }: CSSVariablesTableProps) {
  return (
    <Table mdx>
      <TableHeader>
        <TableRow>
          <TableHead>CSS Variable</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Default</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variables.map((variable) => (
          <TableRow key={variable.title}>
            <TableCell>
              <code className="text-[13px]">{variable.title}</code>
            </TableCell>
            <TableCell>{variable.description}</TableCell>
            <TableCell>
              {variable.defaultValue ? (
                <code className="text-[13px]">{variable.defaultValue}</code>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
