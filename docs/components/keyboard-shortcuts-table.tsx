import { Kbd } from "@/components/ui/kbd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KeyboardShortcutsTableProps {
  data: {
    keys: string[];
    description: string;
  }[];
}

export function KeyboardShortcutsTable({ data }: KeyboardShortcutsTableProps) {
  return (
    <div className="mdx">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((shortcut, index) => (
            <TableRow key={`${shortcut.keys.join(" + ")}-${index}`}>
              <TableCell className="flex items-center gap-2">
                {shortcut.keys.map((key) => (
                  <Kbd key={key} className="not-prose">
                    {key}
                  </Kbd>
                ))}
              </TableCell>
              <TableCell>
                <span>{shortcut.description}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
