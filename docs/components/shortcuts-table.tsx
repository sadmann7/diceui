import { Kbd } from "@/components/kbd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShortcutsTableProps {
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

export function ShortcutsTable({ shortcuts }: ShortcutsTableProps) {
  return (
    <Table mdx>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shortcuts.map((shortcut, index) => (
          <TableRow key={`${shortcut.keys.join(" + ")}-${index}`}>
            <TableCell>
              <Kbd variant="outline">{shortcut.keys.join(" + ")}</Kbd>
            </TableCell>
            <TableCell>
              <span>{shortcut.description}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
