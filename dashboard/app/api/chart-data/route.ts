/**
 * API Route: /api/chart-data
 *
 * Returns time-series data for the classification trend bar chart.
 * Groups articles by publication date (when articles were published).
 * Returns only Threats and Opportunities (excludes Neutral).
 *
 * Query parameters:
 * - days: Number of days to show (default: 7)
 * - interval: Grouping interval - 'day', 'week', or 'month' (default: 'day')
 *
 * Example usage:
 * - /api/chart-data?days=7&interval=day
 * - /api/chart-data?days=30&interval=day
 * - /api/chart-data?days=90&interval=day
 *
 * Returns data format:
 * [
 *   { date: '2024-01-01', threats: 5, opportunities: 3 },
 *   { date: '2024-01-02', threats: 7, opportunities: 4 },
 *   ...
 * ]
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10) // Changed default to 7 days
    const interval = searchParams.get('interval') || 'day'

    // Validate interval parameter
    if (!['day', 'week', 'month'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be day, week, or month.' },
        { status: 400 }
      )
    }

    // Determine the date truncation function based on interval
    // date_trunc() groups dates by day, week, or month
    // Using date_published (when article was published)
    const truncFunc = `date_trunc('${interval}', date_published)`

    // SQL query to get counts grouped by publication date
    // Only includes Threats and Opportunities (excludes Neutral)
    const sql = `
      SELECT
        ${truncFunc}::date as date,
        COUNT(*) FILTER (WHERE classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE classification = 'Opportunity') as opportunities
      FROM articles
      WHERE
        date_published >= NOW() - INTERVAL '${days} days'
        AND date_published IS NOT NULL
        AND classification IN ('Threat', 'Opportunity')
      GROUP BY ${truncFunc}
      ORDER BY date ASC;
    `

    // Execute query
    const result = await query(sql)

    // Format the data for the chart
    const chartData = result.rows.map((row) => ({
      date: row.date?.toISOString().split('T')[0] || '', // Format as YYYY-MM-DD
      threats: Number(row.threats),
      opportunities: Number(row.opportunities),
    }))

    // If no data, return an empty array (chart will show "no data" message)
    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
