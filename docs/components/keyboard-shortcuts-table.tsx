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
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

export function KeyboardShortcutsTable({
  shortcuts,
}: KeyboardShortcutsTableProps) {
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
          {shortcuts.map((shortcut, index) => (
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
