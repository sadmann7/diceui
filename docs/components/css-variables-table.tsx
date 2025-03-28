import { PropsTable } from "@/components/props-table";

interface CSSVariablesTableProps {
  variables: {
    title: string;
    description: string;
    defaultValue?: string;
  }[];
}

export function CSSVariablesTable({ variables }: CSSVariablesTableProps) {
  return <PropsTable variant="css-variable" data={variables} />;
}
