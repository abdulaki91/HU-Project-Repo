import React from "react";
import { Search, Grid3x3, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Input } from "./Input";
import { Button } from "./Button";

export default function ProjectFilters({
  searchQuery,
  setSearchQuery,
  selectedCourse,
  setSelectedCourse,
  selectedBatch,
  setSelectedBatch,
  viewMode,
  setViewMode,
  batches = [],
  courses = [],
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <Input
          placeholder="Search by title, description, or technology..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
        />
      </div>

      <Select onValueChange={(v) => setSelectedCourse(v)} defaultValue="all">
        <SelectTrigger className="w-full md:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
          <SelectValue placeholder="All Courses" />
        </SelectTrigger>

        <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
          <SelectItem value="all" className="dark:text-white">
            All Courses
          </SelectItem>

          {courses.map((course) => (
            <SelectItem key={course} value={course} className="dark:text-white">
              {course}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={(v) => setSelectedBatch(v)} defaultValue="all">
        <SelectTrigger className="w-full md:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
          <SelectValue placeholder="All Batches" />
        </SelectTrigger>
        <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
          <SelectItem value="all" className="dark:text-white">
            All Batches
          </SelectItem>
          {batches?.map((batch) => (
            <SelectItem key={batch} value={batch} className="dark:text-white">
              {batch}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewMode("grid")}
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>

        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
