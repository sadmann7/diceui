import { PropsTable } from "@/components/props-table";

interface CSSVariablesTableProps {
  data: {
    title: string;
    description: string;
    defaultValue?: string;
  }[];
}

export function CSSVariablesTable({ data }: CSSVariablesTableProps) {
  return <PropsTable variant="css-variable" data={data} />;
}
