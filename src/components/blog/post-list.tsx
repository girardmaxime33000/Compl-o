import Link from "next/link";
import { findCategory, postPath, type BlogPost } from "@/lib/blog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

export function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid gap-4">
      {posts.map((p) => (
        <Link key={p.slug} href={postPath(p)} className="block">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {findCategory(p.category)?.name} · Mis à jour le {formatDate(p.updated)}
              </p>
              <CardTitle as="h2" className="text-lg">{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
