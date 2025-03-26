import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PropsTableProps {
  props: {
    title: string;
    description: string;
    defaultValue?: string;
  }[];
}

export function PropsTable({ props }: PropsTableProps) {
  const hasDefaultValues = props.some((prop) => prop.defaultValue);

  return (
    <Table mdx>
      <TableHeader>
        <TableRow>
          <TableHead>Prop</TableHead>
          <TableHead>Description</TableHead>
          {hasDefaultValues && <TableHead>Default</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map((prop) => (
          <TableRow key={prop.title}>
            <TableCell>
              <code className="text-[13px]">{prop.title}</code>
            </TableCell>
            <TableCell>{prop.description}</TableCell>
            {hasDefaultValues && (
              <TableCell>
                {prop.defaultValue ? (
                  <code className="text-[13px]">{prop.defaultValue}</code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
