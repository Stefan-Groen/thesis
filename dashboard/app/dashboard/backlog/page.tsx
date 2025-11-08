/**
 * Backlog Page
 *
 * Displays all articles pending classification.
 */

import Link from "next/link"
import { IconArrowLeft, IconClock } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { FilteredArticlesTable } from "@/components/filtered-articles-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/types"
import { query } from "@/lib/db"

/**
 * Fetch backlog articles directly from database
 */
async function getBacklogArticles(): Promise<Article[]> {
  try {
    const sql = `
      SELECT
        id, title, link, summary, source, classification, explanation,
        date_published, classification_date, status
      FROM articles
      WHERE classification = '' OR classification IS NULL OR status = 'PENDING'
      ORDER BY date_added DESC
      LIMIT 1000;
    `

    const result = await query(sql)

    return result.rows.map((row) => ({
      ...row,
      date_published: row.date_published?.toISOString() || null,
      classification_date: row.classification_date?.toISOString() || null,
      // Set classification to empty string for consistent typing
      classification: row.classification || '',
    }))
  } catch (error) {
    console.error('Error fetching backlog articles:', error)
    return []
  }
}

export default async function BacklogPage() {
  const articles = await getBacklogArticles()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                      <Link href="/dashboard">
                        <IconArrowLeft className="size-4" />
                      </Link>
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold flex items-center gap-2">
                        <IconClock className="size-8 text-orange-600" />
                        Backlog
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles pending classification
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 dark:text-orange-400 text-lg px-4 py-2">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>
              </div>

              {/* Table */}
              <div className="px-4 lg:px-6">
                {articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
                    <p className="text-muted-foreground text-lg">No articles in backlog</p>
                    <p className="text-muted-foreground text-sm mt-2">
                      All articles have been classified!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4 font-medium">Title</th>
                          <th className="text-left p-4 font-medium w-40">Date Published</th>
                          <th className="text-left p-4 font-medium w-32">Source</th>
                          <th className="text-left p-4 font-medium w-16">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.map((article) => (
                          <tr key={article.id} className="border-t hover:bg-muted/50">
                            <td className="p-4">
                              <div className="font-medium line-clamp-2">{article.title}</div>
                              {article.summary && (
                                <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {article.summary}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-muted-foreground text-sm">
                                {article.date_published
                                  ? new Date(article.date_published).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'Unknown'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-muted-foreground text-sm">
                                {article.source || 'Unknown'}
                              </span>
                            </td>
                            <td className="p-4">
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
                                  <IconArrowLeft className="size-4 rotate-180" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
