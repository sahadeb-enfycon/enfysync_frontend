"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, X } from "lucide-react";

export interface RecruiterTableRow {
  id: string;
  name: string;
  email: string;
  submissions: number;
  selected: number;
  rejected: number;
  inProgress: number;
  conversion: number;
}

interface RecruiterProductivityTableProps {
  rows: RecruiterTableRow[];
}

export default function RecruiterProductivityTable({
  rows,
}: RecruiterProductivityTableProps) {
  const [query, setQuery] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("all");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q);

      let matchesPipeline = true;
      if (pipelineFilter === "selected") matchesPipeline = row.selected > 0;
      if (pipelineFilter === "rejected") matchesPipeline = row.rejected > 0;
      if (pipelineFilter === "in-progress") matchesPipeline = row.inProgress > 0;

      return matchesQuery && matchesPipeline;
    });
  }, [rows, query, pipelineFilter]);

  const clearFilters = () => {
    setQuery("");
    setPipelineFilter("all");
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-slate-800/40 p-4 rounded-xl border border-neutral-200 dark:border-slate-700 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Recruiter name or email..."
              className="pl-9 h-10 bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-600 rounded-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
            Pipeline
          </label>
          <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
            <SelectTrigger className="w-[190px] h-10 bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-600 rounded-lg">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="selected">Has Selected</SelectItem>
              <SelectItem value="rejected">Has Rejected</SelectItem>
              <SelectItem value="in-progress">Has In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(query || pipelineFilter !== "all") && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-neutral-500 hover:text-destructive hover:bg-destructive/10"
            onClick={clearFilters}
            title="Clear Filters"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
        <Table className="table-auto border-spacing-0 border-separate min-w-full">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-start">
                Recruiter
              </TableHead>
              <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                Submissions
              </TableHead>
              <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                In Progress
              </TableHead>
              <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                Selected
              </TableHead>
              <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                Rejected
              </TableHead>
              <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-b border-neutral-200 dark:border-slate-600 text-center">
                Conversion
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  No recruiter data matches current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-start">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{row.name}</span>
                      <span className="text-xs text-muted-foreground">{row.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                    <Badge variant="secondary">{row.submissions}</Badge>
                  </TableCell>
                  <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                    {row.inProgress}
                  </TableCell>
                  <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                    {row.selected}
                  </TableCell>
                  <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                    {row.rejected}
                  </TableCell>
                  <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600 text-center">
                    {row.conversion}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

