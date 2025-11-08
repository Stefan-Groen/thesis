/**
 * FilteredArticlesTable Component
 *
 * Displays a table of articles filtered by classification.
 * Clicking a row opens a modal with full article details.
 * Supports pagination and sorting.
 *
 * Columns: Classification, Title, Date Published, Source, Link (clickable)
 * Modal shows: Classification, Explanation, Reasoning
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { IconExternalLink, IconX, IconChevronUp, IconChevronDown, IconChevronsUpDown } from "@tabler/icons-react"
import type { Article } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilteredArticlesTableProps {
  articles: Article[]
  classification?: 'Threat' | 'Opportunity' | 'Neutral' | 'All' | 'Backlog' | 'User Uploaded'
}

type SortField = 'classification' | 'title' | 'date_published' | 'source'
type SortDirection = 'asc' | 'desc' | null

export function FilteredArticlesTable({ articles, classification = 'All' }: FilteredArticlesTableProps) {
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(30)
  const [sortField, setSortField] = React.useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  // Sort articles
  const sortedArticles = React.useMemo(() => {
    if (!sortField || !sortDirection) return articles

    return [...articles].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      // Compare
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [articles, sortField, sortDirection])

  // Pagination logic
  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedArticles.length / pageSize)
  const startIndex = pageSize === -1 ? 0 : (currentPage - 1) * pageSize
  const endIndex = pageSize === -1 ? sortedArticles.length : startIndex + pageSize
  const paginatedArticles = sortedArticles.slice(startIndex, endIndex)

  // Reset to first page when page size changes
  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? -1 : parseInt(value))
    setCurrentPage(1)
  }

  // If no articles, show a message
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
        <p className="text-muted-foreground text-lg">No {classification?.toLowerCase()} articles found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Run your Python script to fetch and classify more articles
        </p>
      </div>
    )
  }

  // Helper to render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <IconChevronsUpDown className="size-4 ml-1 text-muted-foreground" />
    }
    if (sortDirection === 'asc') {
      return <IconChevronUp className="size-4 ml-1" />
    }
    return <IconChevronDown className="size-4 ml-1" />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Pagination controls - Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedArticles.length)} of {sortedArticles.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={pageSize === -1 ? 'all' : pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-32">
                  <button
                    onClick={() => handleSort('classification')}
                    className="flex items-center hover:text-foreground"
                  >
                    Classification
                    <SortIcon field="classification" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center hover:text-foreground"
                  >
                    Title
                    <SortIcon field="title" />
                  </button>
                </TableHead>
                <TableHead className="w-40">
                  <button
                    onClick={() => handleSort('date_published')}
                    className="flex items-center hover:text-foreground"
                  >
                    Date Published
                    <SortIcon field="date_published" />
                  </button>
                </TableHead>
                <TableHead className="w-32">
                  <button
                    onClick={() => handleSort('source')}
                    className="flex items-center hover:text-foreground"
                  >
                    Source
                    <SortIcon field="source" />
                  </button>
                </TableHead>
                <TableHead className="w-16">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.map((article) => (
              <TableRow
                key={article.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Classification Badge */}
                <TableCell>
                  <ClassificationBadge classification={article.classification} />
                </TableCell>

                {/* Article Title */}
                <TableCell>
                  <div className="font-medium line-clamp-2">{article.title}</div>
                </TableCell>

                {/* Published Date */}
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {article.date_published
                      ? new Date(article.date_published).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Unknown'}
                  </span>
                </TableCell>

                {/* Source */}
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {article.source || 'Unknown'}
                  </span>
                </TableCell>

                {/* External Link */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <Link
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open article"
                    >
                      <IconExternalLink className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls - Bottom */}
      {pageSize !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      )}
    </div>

      {/* Article Detail Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl pr-8">
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription>
              Published: {selectedArticle?.date_published
                ? new Date(selectedArticle.date_published).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Unknown'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Classification */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Classification</h3>
              <ClassificationBadge classification={selectedArticle?.classification || ''} />
            </div>

            {/* Summary */}
            {selectedArticle?.summary && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>
            )}

            {/* Explanation */}
            {selectedArticle?.explanation && (
              <div>
                <h3 className="text-sm font-semibold mb-2">LLM Explanation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedArticle.explanation}
                </p>
              </div>
            )}

            {/* Reasoning */}
            {selectedArticle?.reasoning && (
              <div>
                <h3 className="text-sm font-semibold mb-2">LLM Reasoning</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.reasoning}
                </p>
              </div>
            )}

            {/* Source and Link */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">
                  Source: <span className="font-medium">{selectedArticle?.source || 'Unknown'}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={selectedArticle?.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconExternalLink className="size-4 mr-2" />
                  Read Full Article
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Helper component to display classification badge with appropriate styling
 */
function ClassificationBadge({
  classification,
}: {
  classification: Article['classification']
}) {
  // Map classifications to colors and labels
  const config = {
    Threat: {
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Threat',
    },
    Opportunity: {
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      label: 'Opportunity',
    },
    Neutral: {
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Neutral',
    },
    'Error: Unknown': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Error',
    },
    '': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Pending',
    },
  }

  const { className, label } = config[classification] || config['']

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
