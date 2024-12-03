import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataAttributesTableProps {
  attributes: {
    title: string;
    value: string | string[];
  }[];
}

export function DataAttributesTable({ attributes }: DataAttributesTableProps) {
  return (
    <Table className="rounded-md">
      <TableHeader>
        <TableRow className="bg-transparent hover:bg-transparent">
          <TableHead className="w-[45%] bg-accent/50">Data Attribute</TableHead>
          <TableHead className="w-[55%] bg-accent/50">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attributes.map((attribute, index) => (
          <TableRow
            key={`${attribute.title}-${index}`}
            className="bg-transparent hover:bg-transparent"
          >
            <TableCell>
              <code className="text-[13px]">{attribute.title}</code>
            </TableCell>
            <TableCell>
              {Array.isArray(attribute.value) ? (
                <code className="text-secondary">
                  {attribute.value.map((item, idx) => (
                    <span key={item}>
                      {idx + 1 !== attribute.value.length
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
  );
}