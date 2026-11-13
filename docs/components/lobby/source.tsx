import { codeToTokens } from "shiki";

import { CopyButton } from "@/components/copy-button";

const code = `import {
  ActionBar,
  ActionBarGroup,
  ActionBarItem,
} from "@/components/ui/action-bar";

return (
  <ActionBar open={open} onOpenChange={setOpen}>
    <ActionBarGroup>
      <ActionBarItem onSelect={onAssign}>
        <UserPlus />
        Assign
      </ActionBarItem>
    </ActionBarGroup>
  </ActionBar>
);`;

const principles = [
  {
    title: "Edge cases handled",
    description:
      "Hover, focus, disabled, empty and error states, RTL and keyboard support are covered in the styles and ARIA wiring.",
  },
  {
    title: "Composable all the way down",
    description:
      "Render props, controlled and uncontrolled modes, and asChild composition, so each part can be extended or swapped.",
  },
  {
    title: "Two bases, one API",
    description:
      "Use the primitive library your app already uses. Component names, props and styles stay the same.",
    bases: ["Base UI", "Radix UI", "shadcn/ui style"],
  },
];

export async function Source() {
  const { tokens } = await codeToTokens(code, {
    lang: "tsx",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  });

  return (
    <section className="border-t">
      <div className="mx-auto flex max-w-[1248px] flex-col gap-12 px-6 pt-[88px] pb-24">
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-xs tracking-[0.1em] text-muted-foreground">
            THE SOURCE
          </span>
          <h2 className="text-3xl leading-[1.12] font-semibold tracking-[-0.035em] md:text-[40px]">
            Copied into your project.
            <br />
            Yours to customize.
          </h2>
        </div>
        <div className="grid items-start gap-12 lg:grid-cols-[492px_1fr] lg:gap-14">
          <ul className="flex flex-col">
            {principles.map((principle) => (
              <li
                key={principle.title}
                className="flex flex-col gap-2.5 border-t py-[22px]"
              >
                <h3 className="text-lg font-medium tracking-tight">
                  {principle.title}
                </h3>
                <p className="text-sm leading-[1.65] text-muted-foreground">
                  {principle.description}
                </p>
                {principle.bases ? (
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {principle.bases.map((base) => (
                      <span
                        key={base}
                        className="rounded-md border bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {base}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <figure className="flex flex-col overflow-hidden rounded-[14px] border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_rgb(0_0_0/0.06)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_16px_40px_rgb(0_0_0/0.4)]">
            <figcaption className="flex h-[42px] items-center justify-between border-b px-3.5">
              <span className="flex items-center gap-[7px]">
                {Array.from({ length: 3 }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="size-2 rounded-full bg-border"
                  />
                ))}
                <span className="pl-2 font-mono text-[11px] text-muted-foreground">
                  components/task-actions.tsx
                </span>
              </span>
              <CopyButton value={code} className="-me-1.5 size-6" />
            </figcaption>
            <pre className="overflow-x-auto py-4 pr-4 pl-3 font-mono text-[11px] leading-5">
              <code className="flex flex-col">
                {tokens.map((line, index) => (
                  <span key={index} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="w-[18px] shrink-0 text-right text-[10px] text-muted-foreground/50 select-none"
                    >
                      {index + 1}
                    </span>
                    <span className="whitespace-pre">
                      {line.length === 0
                        ? " "
                        : line.map((token, tokenIndex) => (
                            <span
                              key={tokenIndex}
                              style={token.htmlStyle}
                              className="text-(--shiki-light) dark:text-(--shiki-dark)"
                            >
                              {token.content}
                            </span>
                          ))}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </figure>
        </div>
      </div>
    </section>
  );
}
