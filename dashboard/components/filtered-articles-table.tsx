/**
 * FilteredArticlesTable Component
 *
 * Displays a table of articles filtered by classification.
 * Clicking a row opens a modal with full article details.
 *
 * Columns: Classification, Title, Date Published, Source, Link (clickable)
 * Modal shows: Classification, Explanation, Reasoning
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { IconExternalLink, IconX } from "@tabler/icons-react"
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

interface FilteredArticlesTableProps {
  articles: Article[]
  classification: 'Threat' | 'Opportunity' | 'Neutral'
}

export function FilteredArticlesTable({ articles, classification }: FilteredArticlesTableProps) {
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null)

  // If no articles, show a message
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
        <p className="text-muted-foreground text-lg">No {classification.toLowerCase()} articles found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Run your Python script to fetch and classify more articles
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-32">Classification</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-40">Date Published</TableHead>
              <TableHead className="w-32">Source</TableHead>
              <TableHead className="w-16">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
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
