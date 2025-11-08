/**
 * Dashboard Page
 *
 * This is a Next.js Server Component that fetches data from our API routes
 * and passes it to the client components.
 *
 * Server Components vs Client Components:
 * - Server Components: Run on the server, can directly access databases/APIs
 * - Client Components: Run in the browser, can use hooks (useState, useEffect, etc.)
 *
 * Python equivalent concept:
 * ```python
 * @app.route('/dashboard')
 * def dashboard():
 *     stats = fetch_stats()  # This runs on the server
 *     articles = fetch_articles()
 *     return render_template('dashboard.html', stats=stats, articles=articles)
 * ```
 */

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ArticlesTable } from "@/components/articles-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Stats, ChartDataPoint, Article } from "@/lib/types"

/**
 * Fetch dashboard statistics from our API
 *
 * In Next.js Server Components, we can use fetch() to call our own API routes.
 * The fetch() is cached by default for performance.
 */
async function getStats(): Promise<Stats> {
  try {
    // Get the base URL for the API
    // In production, this would be your domain
    // In development, it's localhost:3000
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/stats`, {
      // Revalidate every 60 seconds (refresh cache)
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch stats')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return default values on error
    return { total: 0, threats: 0, opportunities: 0, neutral: 0, unclassified: 0 }
  }
}

/**
 * Fetch chart data from our API
 * Fetches 90 days of data so the client-side component can filter for 7/30/90 day views
 */
async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/chart-data?days=90`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch chart data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return []
  }
}

/**
 * Fetch articles from our API
 */
async function getArticles(): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/articles?limit=50`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch articles')
    }

    const data = await res.json()
    return data.articles
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

/**
 * Main Dashboard Page Component
 *
 * This is an async Server Component (new in Next.js 13+)
 * It can directly fetch data before rendering!
 */
export default async function Page() {
  // Fetch all data in parallel for better performance
  // Promise.all() waits for all promises to resolve
  // This is like running multiple API calls simultaneously
  const [stats, chartData, articles] = await Promise.all([
    getStats(),
    getChartData(),
    getArticles(),
  ])

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
              {/* Pass stats to SectionCards */}
              <SectionCards stats={stats} />

              {/* Pass chart data to ChartAreaInteractive */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={chartData} />
              </div>

              {/* Pass articles to ArticlesTable */}
              <div className="px-4 lg:px-6">
                <ArticlesTable articles={articles} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
