import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
  getTagsArray,
} from "@/lib/content";

type SortField = "title" | "date" | "type" | "author" | "year";
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

export default function Recommendations() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [search, setSearch] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getManifest().then((all) => {
      setEntries(sortByDate(filterBySection(all, "recommendations")));
    });
  }, []);

  const mediaOptions = [
    "all",
    "book",
    "magazine",
    "article",
    "movie",
    "video",
    "podcast",
  ] as const;

  const getMediaType = (entry: ContentEntry): string => {
    const raw = (entry.type || entry.subsection || "").toLowerCase();
    if (raw.includes("book")) return "book";
    if (raw.includes("magazine")) return "magazine";
    if (raw.includes("movie") || raw.includes("film")) return "movie";
    if (raw.includes("video") || raw.includes("youtube")) return "video";
    if (raw.includes("podcast")) return "podcast";
    if (raw.includes("blog") || raw.includes("article")) return "article";
    return "article";
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => getTagsArray(e.tags).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (mediaFilter !== "all") {
      result = result.filter((e) => getMediaType(e) === mediaFilter);
    }
    if (tagFilter !== "all") {
      result = result.filter((e) =>
        getTagsArray(e.tags).some((t) => t === tagFilter),
      );
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.author || "").toLowerCase().includes(q) ||
          (e.creator || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          (e.source || "").toLowerCase().includes(q) ||
          getTagsArray(e.tags).some((t) => t.toLowerCase().includes(q)),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") cmp = a.title.localeCompare(b.title);
      else if (sortField === "type")
        cmp = (a.type || a.subsection || "").localeCompare(
          b.type || b.subsection || "",
        );
      else if (sortField === "author")
        cmp = (a.author || a.creator || "").localeCompare(
          b.author || b.creator || "",
        );
      else if (sortField === "year") cmp = (a.year || 0) - (b.year || 0);
      else cmp = (a.date || "").localeCompare(b.date || "");
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [entries, mediaFilter, tagFilter, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "title" || field === "author" ? "asc" : "desc");
    }
    setPage(1);
  };

  return (
    <PageTransition>
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px] py-16 md:py-24">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            recommendations
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            books, films, blogs, and things i'd actually tell a friend about.
          </p>

          {/* Filters */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Input
              placeholder="search recommendations..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {mediaOptions.map((option) => (
                <Button
                  key={option}
                  variant={mediaFilter === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMediaFilter(option);
                    setPage(1);
                  }}
                  className="capitalize"
                >
                  {option}
                </Button>
              ))}
            </div>
            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="all">all tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
            <span className="ml-auto text-sm text-muted-foreground">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <Separator className="my-6" />

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("title")}
                >
                  title <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hidden md:table-cell"
                  onClick={() => toggleSort("type")}
                >
                  type <SortIcon field="type" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hidden lg:table-cell"
                  onClick={() => toggleSort("author")}
                >
                  creator <SortIcon field="author" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead className="hidden lg:table-cell">tags</TableHead>
                <TableHead
                  className="cursor-pointer select-none hidden md:table-cell text-right"
                  onClick={() => toggleSort("year")}
                >
                  year <SortIcon field="year" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("date")}
                >
                  added <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
                </TableHead>
                <TableHead className="w-20 text-right">links</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((entry) => (
                <TableRow
                  key={entry.slug}
                  onClick={() => {
                    if (entry.hasContent) {
                      navigate(`/recommendations/${entry.slug}`);
                      return;
                    }
                    if (entry.url) {
                      window.open(entry.url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className={
                    entry.hasContent || entry.url ? "cursor-pointer" : undefined
                  }
                >
                  <TableCell>
                    <span className="font-medium">{entry.title}</span>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-sm">
                        {entry.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {entry.type || entry.subsection || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {entry.author || entry.creator || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {getTagsArray(entry.tags).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums text-sm text-muted-foreground">
                    {entry.year || "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                    {formatDateShort(entry.date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {entry.hasContent && (
                        <Link
                          to={`/recommendations/${entry.slug}`}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="my notes"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                      )}
                      {entry.url && (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="original source"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    no recommendations match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                previous
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
                next
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
