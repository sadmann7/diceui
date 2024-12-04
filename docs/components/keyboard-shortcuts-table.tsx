import { Kbd } from "@/components/kbd";
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
    combined?: boolean;
  }[];
}

export function KeyboardShortcutsTable({
  shortcuts,
}: KeyboardShortcutsTableProps) {
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
              {shortcut.combined ? (
                <Kbd variant="outline">{shortcut.keys.join(" + ")}</Kbd>
              ) : (
                shortcut.keys.map((key) => (
                  <Kbd key={key} variant="outline" className="mr-2">
                    {key}
                  </Kbd>
                ))
              )}
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
