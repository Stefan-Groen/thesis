/**
 * API Route: /api/activity-data
 *
 * Returns time-series data showing articles published vs classified per day.
 *
 * Query parameters:
 * - days: Number of days to show (default: 7)
 *
 * Returns data format:
 * [
 *   { date: '2024-01-01', published: 10, classified: 8 },
 *   { date: '2024-01-02', published: 15, classified: 12 },
 *   ...
 * ]
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // Get published articles count per day
    const publishedSql = `
      SELECT
        date_trunc('day', date_published)::date as date,
        COUNT(*) as count
      FROM articles
      WHERE
        date_published >= NOW() - INTERVAL '${days} days'
        AND date_published IS NOT NULL
      GROUP BY date_trunc('day', date_published)
      ORDER BY date ASC;
    `

    // Get classified articles count per day
    const classifiedSql = `
      SELECT
        date_trunc('day', classification_date)::date as date,
        COUNT(*) as count
      FROM articles
      WHERE
        classification_date >= NOW() - INTERVAL '${days} days'
        AND classification_date IS NOT NULL
      GROUP BY date_trunc('day', classification_date)
      ORDER BY date ASC;
    `

    const [publishedResult, classifiedResult] = await Promise.all([
      query(publishedSql),
      query(classifiedSql)
    ])

    // Create a map of all dates
    const dateMap = new Map<string, { published: number, classified: number }>()

    // Add published counts
    publishedResult.rows.forEach((row) => {
      const dateStr = row.date?.toISOString().split('T')[0] || ''
      if (dateStr) {
        dateMap.set(dateStr, { published: Number(row.count), classified: 0 })
      }
    })

    // Add classified counts
    classifiedResult.rows.forEach((row) => {
      const dateStr = row.date?.toISOString().split('T')[0] || ''
      if (dateStr) {
        const existing = dateMap.get(dateStr)
        if (existing) {
          existing.classified = Number(row.count)
        } else {
          dateMap.set(dateStr, { published: 0, classified: Number(row.count) })
        }
      }
    })

    // Convert to array and sort by date
    const activityData = Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        published: counts.published,
        classified: counts.classified,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(activityData)

  } catch (error) {
    console.error('Error fetching activity data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    )
  }
}
