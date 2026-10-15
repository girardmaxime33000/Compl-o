import type { ReactNode } from "react";

type CalloutKind = "attention" | "astuce" | "regle";

const CALLOUT: Record<CalloutKind, { icon: string; label: string; className: string }> = {
  attention: { icon: "⚠️", label: "Attention", className: "border-amber-500/60 bg-amber-500/10" },
  astuce: { icon: "💡", label: "Astuce", className: "border-primary/50 bg-primary/10" },
  regle: { icon: "📌", label: "À retenir", className: "border-muted-foreground/40 bg-muted/40" },
};

export function Callout({ kind, children }: { kind: CalloutKind; children: ReactNode }) {
  const c = CALLOUT[kind];
  return (
    <blockquote className={`rounded-md border-l-4 p-4 text-sm ${c.className}`}>
      <p className="font-semibold">
        <span aria-hidden="true">{c.icon}</span> {c.label}
      </p>
      <div className="mt-1 space-y-1">{children}</div>
    </blockquote>
  );
}

/** Synthèse de tête de guide : réponse courte, public concerné, points clés. */
export function Tldr({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <caption className="border-b bg-muted/40 p-3 text-left font-semibold">En bref</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b last:border-0 align-top">
              <th scope="row" className="w-1/3 p-3 font-medium">{k}</th>
              <td className="p-3">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <caption className="border-b bg-muted/40 p-3 text-left font-semibold">{caption}</caption>
        <thead>
          <tr className="border-b">
            {head.map((h) => (
              <th key={h} scope="col" className="p-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-0 align-top">
              {r.map((c, j) => (
                <td key={j} className="p-3">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Steps({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
          <div>
            <p className="font-semibold">{s.title}</p>
            <div className="text-muted-foreground">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span aria-hidden="true" className="font-mono">[ ]</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export interface Source {
  label: string;
  url: string;
  /** Date "Vérifié le" affichée sur la fiche officielle. */
  verified: string;
}

export function Sources({ items }: { items: Source[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Sources officielles</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((s) => (
          <li key={s.url}>
            <a href={s.url} className="text-primary underline" rel="noopener noreferrer" target="_blank">{s.label}</a>, fiche vérifiée le {s.verified}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Disclaimer() {
  return (
    <Callout kind="attention">
      <p>
        Ce guide est une information générale tirée de fiches officielles, à la date indiquée. Il ne constitue ni un
        conseil fiscal, ni un conseil juridique. Pour votre situation précise, vérifiez sur urssaf.fr et
        service-public.fr ou demandez conseil à un professionnel.
      </p>
    </Callout>
  );
}

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold">{title}</h2>
    {children}
  </section>
);

export const num = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
export const pct = (r: number) => `${(r * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
