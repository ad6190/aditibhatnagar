import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, List, ChevronUp, ChevronDown } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ContentEntry,
  getManifest,
  filterBySection,
  sortByDate,
  formatDateShort,
} from "@/lib/content";

type SortField = "title" | "date" | "type";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 50;

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (sortField !== field) return null;
  return sortDir === "asc" ? (
    <ChevronUp className="h-3 w-3 inline ml-1" />
  ) : (
    <ChevronDown className="h-3 w-3 inline ml-1" />
  );
}

export default function Projects() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getManifest().then((all) => {
      setEntries(sortByDate(filterBySection(all, "projects")));
    });
  }, []);

  const types = useMemo(() => {
    const set = new Set(entries.map((e) => e.type).filter(Boolean));
    return Array.from(set) as string[];
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") cmp = a.title.localeCompare(b.title);
      else if (sortField === "type")
        cmp = (a.type || "").localeCompare(b.type || "");
      else cmp = (a.date || "").localeCompare(b.date || "");
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [entries, typeFilter, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <PageTransition>
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] py-16 md:py-24">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            projects
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            products i've built and things i'm working on.
          </p>

          {/* Controls */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="ml-auto flex gap-1">
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid View */}
          {view === "grid" && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((entry, i) => (
                <ScrollReveal key={entry.slug} delay={i * 0.05}>
                  <Link
                    to={`/projects/${entry.slug}`}
                    className="group block rounded-lg border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md h-full"
                  >
                    {entry.image && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={entry.image}
                          alt={entry.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {entry.type && (
                        <Badge variant="secondary" className="mb-3">
                          {entry.type}
                        </Badge>
                      )}
                      <h3 className="font-semibold text-lg group-hover:underline underline-offset-4">
                        {entry.title}
                      </h3>
                      {entry.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                          {entry.description}
                        </p>
                      )}
                      <p className="mt-4 text-xs tabular-nums text-muted-foreground">
                        {formatDateShort(entry.date)}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Table View */}
          {view === "table" && (
            <div className="mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("title")}
                    >
                      Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort("type")}
                    >
                      Type <SortIcon field="type" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => toggleSort("date")}
                    >
                      Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((entry) => (
                    <TableRow
                      key={entry.slug}
                      onClick={() => navigate(`/projects/${entry.slug}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="font-medium">{entry.title}</span>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-md">
                            {entry.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.type && (
                          <Badge variant="outline">{entry.type}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatDateShort(entry.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
