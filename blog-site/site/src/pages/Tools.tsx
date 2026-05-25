import { useEffect, useState, useMemo } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  type ContentEntry,
  getManifest,
  filterBySection,
  sortByDate,
  getTagsArray,
} from "@/lib/content";

function getDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function LogoImage({ url, title }: { url: string | null; title: string }) {
  const domain = getDomain(url);
  const initial = title.charAt(0).toUpperCase();

  if (!domain) {
    return (
      <span className="text-xl font-bold text-muted-foreground/40 select-none">
        {initial}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt=""
      className="h-8 w-8 rounded-md object-contain"
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = "none";
        const fallback = el.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = "flex";
      }}
    />
  );
}

function getStatusIcon(status: string | null): { icon: string; label: string } {
  switch (status) {
    case "exploring":
      return { icon: "✨", label: "Exploring" };
    case "saved":
      return { icon: "📌", label: "Saved" };
    case "recommended":
      return { icon: "❤️", label: "Recommended" };
    default:
      return { icon: "", label: "" };
  }
}

export default function Tools() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getManifest().then((all) => {
      setEntries(sortByDate(filterBySection(all, "tools")));
    });
  }, []);

  const allStatuses = ["exploring", "saved", "recommended"];

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => {
      getTagsArray(e.tags).forEach((t) => tagSet.add(t.toLowerCase()));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const tags = getTagsArray(e.tags).map((t) => t.toLowerCase());
      if (activeStatus && e.status !== activeStatus) return false;
      if (activeTag && !tags.includes(activeTag)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        tags.some((t) => t.includes(q))
      );
    });
  }, [entries, activeStatus, activeTag, search]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<number, ContentEntry[]>();
    for (const e of filtered) {
      const year = e.date ? new Date(e.date).getFullYear() : 0;
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(e);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b - a);
  }, [filtered]);

  return (
    <PageTransition>
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] py-16 md:py-24">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">tools</h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            things i've found that work. ai, engineering, and everything in
            between.
          </p>

          <div className="mt-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {/* Status filters */}
              {allStatuses.map((status) => {
                const { icon, label } = getStatusIcon(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setActiveStatus(activeStatus === status ? null : status)
                    }
                  >
                    <Badge variant={activeStatus === status ? "default" : "outline"}>
                      {icon} {label}
                    </Badge>
                  </button>
                );
              })}
              {(activeStatus || activeTag) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus(null);
                    setActiveTag(null);
                  }}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  clear all
                </button>
              )}
            </div>

            {/* Tag filters */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTag(activeTag === tag ? null : tag)
                  }
                >
                  <Badge variant={activeTag === tag ? "default" : "outline"}>
                    {tag}
                  </Badge>
                </button>
              ))}
              {activeTag && (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  clear tags
                </button>
              )}
            </div>
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs mb-8"
            />
          </div>

          <div className="relative">
            {groupedByYear.map(([year, tools]) => (
              <div key={year} className="relative flex gap-8 mb-12">
                {/* Year timeline marker */}
                <div className="hidden md:flex flex-col items-center w-20 shrink-0 pt-1">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {year || "undated"}
                  </span>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>

                {/* Tool cards grid */}
                <div className="flex-1">
                  <div className="md:hidden mb-3">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {year || "undated"}
                    </span>
                  </div>
                  <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
                    {tools.map((entry, i) => (
                      <ScrollReveal key={entry.slug} delay={i * 0.04}>
                        <div className="group rounded-md border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md aspect-square flex flex-col overflow-hidden">
                          {/* Image area */}
                          <div className="flex-1 flex items-center justify-center bg-muted/30 relative min-h-0">
                            <LogoImage url={entry.url} title={entry.title} />
                            <span
                              className="text-xl font-bold text-muted-foreground/40 select-none absolute hidden items-center justify-center"
                            >
                              {entry.title.charAt(0).toUpperCase()}
                            </span>
                            {/* Status icon - top left */}
                            {entry.status && (
                              <div className="absolute top-1 left-1 text-lg">
                                {getStatusIcon(entry.status).icon}
                              </div>
                            )}
                            {/* Action icons - top right */}
                            <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {entry.hasContent && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/tools/${entry.slug}`)
                                  }
                                  className="rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label="Read notes"
                                >
                                  <FileText className="h-3 w-3" />
                                </button>
                              )}
                              {entry.url && (
                                <a
                                  href={entry.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label={`Open ${entry.title}`}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                          {/* Info strip */}
                          <div className="px-2 py-1.5 border-t flex flex-col gap-1 h-[35%] shrink-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-semibold text-[10px] leading-tight truncate">
                                {entry.title}
                              </h3>
                              {entry.hasContent && (
                                <FileText className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-0.5 overflow-hidden max-h-[1rem]">
                              {getTagsArray(entry.tags).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-[8px] leading-none px-1 py-0 shrink-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No tools found.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
