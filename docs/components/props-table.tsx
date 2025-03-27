import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PropsTableProps {
  variant: "default" | "title" | "css-variable";
  data: {
    title: string;
    description: string;
    defaultValue?: string;
  }[];
}

export function PropsTable({ variant = "default", data }: PropsTableProps) {
  const hasDefaultValues = data.some((item) => item.defaultValue);
  const firstColumn =
    variant === "default"
      ? "Prop"
      : variant === "title"
        ? "Title"
        : "CSS Variable";

  return (
    <Table className="mdx">
      <TableHeader>
        <TableRow>
          <TableHead>{firstColumn}</TableHead>
          <TableHead>Description</TableHead>
          {hasDefaultValues && <TableHead>Default</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.title}>
            <TableCell>
              <code className="text-[13px]">{item.title}</code>
            </TableCell>
            <TableCell>{item.description}</TableCell>
            {hasDefaultValues && (
              <TableCell>
                {item.defaultValue ? (
                  <code className="text-[13px]">{item.defaultValue}</code>
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
