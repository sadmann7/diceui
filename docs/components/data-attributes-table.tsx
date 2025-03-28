import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataAttributesTableProps {
  attributes?: {
    title: string;
    value: string | string[];
  }[];
  slot?: string;
}

export function DataAttributesTable({
  attributes,
  slot,
}: DataAttributesTableProps) {
  const allAttributes = [
    ...(attributes ?? []),
    ...(slot ? [{ title: "[data-slot]", value: `"${slot}"` }] : []),
  ];

  return (
    <div className="mdx">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Attribute</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAttributes.map((attribute, index) => (
            <TableRow key={`${attribute.title}-${index}`}>
              <TableCell>
                <code className="text-[13px]">{attribute.title}</code>
              </TableCell>
              <TableCell>
                {Array.isArray(attribute.value) ? (
                  <code className="font-mono text-foreground/80">
                    {attribute.value.map((item, index) => (
                      <span key={item}>
                        {index + 1 !== attribute.value.length
                          ? `"${item}" | `
                          : `"${item}"`}
                      </span>
                    ))}
                  </code>
                ) : (
                  <span>{attribute.value}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
