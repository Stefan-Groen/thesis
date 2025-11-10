/**
 * API Route: /api/update-dashboard-visit
 *
 * Updates the user's last_dashboard_visit timestamp
 * Called when the user loads the dashboard page
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'

export async function POST() {
  try {
    // Get the authenticated user session
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update the user's last_dashboard_visit timestamp
    await query(
      'UPDATE users SET last_dashboard_visit = NOW() WHERE id = $1',
      [session.user.id]
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating dashboard visit:', error)

    return NextResponse.json(
      { error: 'Failed to update dashboard visit' },
      { status: 500 }
    )
  }
}
