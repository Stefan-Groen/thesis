"use client"

import { useEffect } from "react"

/**
 * Dashboard Visit Tracker
 *
 * This component updates the user's last_dashboard_visit timestamp
 * when the dashboard page loads. This allows us to track which
 * articles are "new since last visit".
 */
export function DashboardVisitTracker() {
  useEffect(() => {
    // Update the timestamp on mount
    const updateVisit = async () => {
      try {
        await fetch('/api/update-dashboard-visit', {
          method: 'POST',
        })
      } catch (error) {
        console.error('Failed to update dashboard visit:', error)
      }
    }

    updateVisit()
  }, []) // Empty dependency array = runs once on mount

  // This component doesn't render anything
  return null
}
