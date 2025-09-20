interface DemoProps {
  first: React.ReactNode;
  second?: React.ReactNode;
  third?: React.ReactNode;
}

export function Demo({ first, second, third }: DemoProps) {
  return (
    <div className="flex flex-col gap-4">
      <DemoCard>{first}</DemoCard>
      {second && <DemoCard>{second}</DemoCard>}
      {third && <DemoCard>{third}</DemoCard>}
    </div>
  );
}

function DemoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100svh-10rem)] items-center justify-center">
      {children}
    </div>
  );
}
