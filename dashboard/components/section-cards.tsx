/**
 * SectionCards Component
 *
 * Displays summary statistics as cards:
 * - Total Articles
 * - Threats (clickable → /dashboard/threats)
 * - Opportunities (clickable → /dashboard/opportunities)
 * - Neutral (clickable → /dashboard/neutral)
 *
 * This component receives stats as props (like function parameters in Python)
 *
 * Python equivalent:
 * ```python
 * def section_cards(stats: Stats):
 *     return render_template('cards.html', stats=stats)
 * ```
 */

import Link from "next/link"
import { IconAlertTriangle, IconSparkles, IconNews, IconCircle, IconCalendarEvent, IconStarFilled, IconClockPlus } from "@tabler/icons-react"
import type { Stats } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Props interface (like function parameters with type hints)
interface SectionCardsProps {
  stats: Stats
}

export function SectionCards({ stats }: SectionCardsProps) {
  // Calculate percentage of each classification
  const threatPercentage = stats.total > 0
    ? ((stats.threats / stats.total) * 100).toFixed(1)
    : '0.0'

  const opportunityPercentage = stats.total > 0
    ? ((stats.opportunities / stats.total) * 100).toFixed(1)
    : '0.0'

  const neutralPercentage = stats.total > 0
    ? ((stats.neutral / stats.total) * 100).toFixed(1)
    : '0.0'

  return (
    <>
      {/* First Row: Main Statistics - Total, Threats, Opportunities, Neutral (2+2+2+2=8) */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-8">
        {/* Total Articles Card - Clickable (2 cols) */}
        <Link href="/dashboard/articles" className="@container/card @5xl/main:col-span-2">
        <Card className="cursor-pointer transition-all hover:bg-muted/50">
          <CardHeader>
            <CardDescription>Total Articles</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.total.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconNews className="size-4" />
                All Time
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Total articles in database
            </div>
            <div className="text-muted-foreground">
              Click to view all articles
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Threats Card - Clickable */}
      <Link href="/dashboard/threats" className="@container/card @5xl/main:col-span-2">
        <Card className="cursor-pointer transition-all hover:bg-muted/50">
          <CardHeader>
            <CardDescription>Threats</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.threats.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-red-600 dark:text-red-400">
                <IconAlertTriangle className="size-4" />
                {threatPercentage}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Articles classified as threats
            </div>
            <div className="text-muted-foreground">
              Click to view all threats
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Opportunities Card - Clickable */}
      <Link href="/dashboard/opportunities" className="@container/card @5xl/main:col-span-2">
        <Card className="cursor-pointer transition-all hover:bg-muted/50">
          <CardHeader>
            <CardDescription>Opportunities</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.opportunities.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                <IconSparkles className="size-4" />
                {opportunityPercentage}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Positive opportunities identified
            </div>
            <div className="text-muted-foreground">
              Click to view all opportunities
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Neutral Card - Clickable */}
      <Link href="/dashboard/neutral" className="@container/card @5xl/main:col-span-2">
        <Card className="cursor-pointer transition-all hover:bg-muted/50">
          <CardHeader>
            <CardDescription>Neutral</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.neutral.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                <IconCircle className="size-4" />
                {neutralPercentage}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Informational articles
            </div>
            <div className="text-muted-foreground">
              Click to view all neutral articles
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>

    {/* Second Row: Articles Added Today and Starred Articles (2 cols each) */}
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-8">
      <Link href="/dashboard/today" className="@container/card @5xl/main:col-span-2">
        <Card className="cursor-pointer transition-all hover:bg-muted/50">
          <CardHeader>
            <CardDescription>Added Today</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.articlesToday.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconCalendarEvent className="size-4" />
                Today
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Articles published today
            </div>
            <div className="text-muted-foreground">
              Click to view today's articles
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Starred Articles Card - Clickable (2 cols) */}
      <Link href="/dashboard/starred" className="@container/card @5xl/main:col-span-2">
        <Card className="cursor-pointer transition-all hover:bg-muted/50">
          <CardHeader>
            <CardDescription>Starred Articles</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.starred.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                <IconStarFilled className="size-4" />
                Favorites
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Your starred articles
            </div>
            <div className="text-muted-foreground">
              Click to view starred articles
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* New Since Last Visit Card - Not clickable (2 cols) */}
      <div className="@container/card @5xl/main:col-span-2">
        <Card>
          <CardHeader>
            <CardDescription>New Since Last Visit</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.newSinceLastVisit.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
                <IconClockPlus className="size-4" />
                Recent
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Articles added since your last visit
            </div>
            <div className="text-muted-foreground">
              New content for you to review
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
    </>
  )
}
