/**
 * API Route: /api/stats
 *
 * Returns dashboard statistics:
 * - Total number of articles
 * - Number of articles classified as "Threat"
 * - Number of articles classified as "Opportunity"
 * - Number of articles classified as "Neutral"
 * - New articles since last dashboard visit
 *
 * Python Flask equivalent:
 * ```python
 * @app.route('/api/stats')
 * def get_stats():
 *     cursor.execute("SELECT COUNT(*) FROM articles")
 *     total = cursor.fetchone()[0]
 *     return jsonify({'total': total, ...})
 * ```
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'

/**
 * GET /api/stats
 *
 * Next.js convention: Export an async function named after the HTTP method
 * - export async function GET() {...}  // Handles GET requests
 * - export async function POST() {...}  // Handles POST requests
 * - export async function PUT() {...}   // Handles PUT requests, etc.
 */
export async function GET() {
  try {
    // Get the authenticated user session
    const session = await auth()

    // Get user's last dashboard visit time (default to epoch if not set)
    let lastVisit = new Date(0) // Default to epoch (1970-01-01)

    if (session?.user?.id) {
      const userResult = await query(
        'SELECT last_dashboard_visit FROM users WHERE id = $1',
        [session.user.id]
      )

      if (userResult.rows[0]?.last_dashboard_visit) {
        lastVisit = new Date(userResult.rows[0].last_dashboard_visit)
      }
    }

    // SQL query to get counts by classification
    // Excludes OUTDATED articles (previously SENT articles that are no longer relevant)
    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE classification = 'Neutral') as neutral,
        COUNT(*) FILTER (WHERE classification IN ('Error: Unknown', '')) as unclassified,
        COUNT(*) FILTER (WHERE DATE(date_published) = CURRENT_DATE) as articles_today,
        COUNT(*) FILTER (WHERE starred = true) as starred,
        COUNT(*) FILTER (WHERE date_published > $1) as new_since_last_visit
      FROM articles
      WHERE classification != 'OUTDATED' AND status != 'OUTDATED';
    `

    // Execute the query (like cursor.execute() in Python)
    const result = await query(sql, [lastVisit.toISOString()])

    // Get the first row (there's only one row with the counts)
    const stats = result.rows[0]

    // Convert BigInt to Number (PostgreSQL COUNT returns BigInt)
    // JavaScript doesn't have a built-in BigInt JSON serialization
    const formattedStats = {
      total: Number(stats.total),
      threats: Number(stats.threats),
      opportunities: Number(stats.opportunities),
      neutral: Number(stats.neutral),
      unclassified: Number(stats.unclassified),
      articlesToday: Number(stats.articles_today),
      starred: Number(stats.starred),
      newSinceLastVisit: Number(stats.new_since_last_visit),
    }

    // Return JSON response (like jsonify() in Flask)
    // NextResponse.json() automatically sets Content-Type: application/json
    return NextResponse.json(formattedStats)

  } catch (error) {
    // Error handling (like try/except in Python)
    console.error('Error fetching stats:', error)

    // Return a 500 error response
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
