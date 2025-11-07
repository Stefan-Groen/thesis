/**
 * API Route: /api/chart-data
 *
 * Returns time-series data for the classification trend chart.
 * Groups articles by date and classification type.
 *
 * Query parameters:
 * - days: Number of days to show (default: 30)
 * - interval: Grouping interval - 'day', 'week', or 'month' (default: 'day')
 *
 * Example usage:
 * - /api/chart-data?days=7&interval=day
 * - /api/chart-data?days=90&interval=week
 *
 * Returns data format:
 * [
 *   { date: '2024-01-01', threats: 5, opportunities: 3, neutral: 2 },
 *   { date: '2024-01-02', threats: 7, opportunities: 4, neutral: 1 },
 *   ...
 * ]
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
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
    const truncFunc = `date_trunc('${interval}', date_published)`

    // SQL query to get counts grouped by date and classification
    // This creates a pivot table with dates as rows and classifications as columns
    const sql = `
      SELECT
        ${truncFunc}::date as date,
        COUNT(*) FILTER (WHERE classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE classification = 'Neutral') as neutral
      FROM articles
      WHERE
        date_published >= NOW() - INTERVAL '${days} days'
        AND date_published IS NOT NULL
        AND classification IN ('Threat', 'Opportunity', 'Neutral')
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
      neutral: Number(row.neutral),
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
