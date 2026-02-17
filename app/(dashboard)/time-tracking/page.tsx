'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  getActiveTimeEntry,
  checkIn,
  checkOut,
  getTimeEntries,
} from '@/lib/api/time-entries'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  PlayIcon,
  StopIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { formatDuration, formatDateTime } from '@/lib/utils'

export default function TimeTrackingPage() {
  const { profile } = useAuth()
  const [activeEntry, setActiveEntry] = useState<any>(null)
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (profile) {
      fetchData()
    }
  }, [profile])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (activeEntry) {
      interval = setInterval(() => {
        const now = new Date()
        const checkIn = new Date(activeEntry.check_in)
        const diff = Math.floor((now.getTime() - checkIn.getTime()) / 1000 / 60)
        setElapsedTime(diff)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeEntry])

  async function fetchData() {
    try {
      const [active, entries] = await Promise.all([
        getActiveTimeEntry(profile!.id),
        getTimeEntries(profile!.id),
      ])

      setActiveEntry(active)
      setTimeEntries(entries)

      if (active) {
        const now = new Date()
        const checkIn = new Date(active.check_in)
        const diff = Math.floor((now.getTime() - checkIn.getTime()) / 1000 / 60)
        setElapsedTime(diff)
      }
    } catch (error) {
      console.error('Error fetching time tracking data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckIn() {
    try {
      await checkIn(profile!.id)
      await fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleCheckOut() {
    if (!activeEntry) return

    try {
      await checkOut(activeEntry.id)
      setActiveEntry(null)
      setElapsedTime(0)
      await fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const completedEntries = timeEntries.filter((e) => e.check_out !== null)
  const totalMinutes = completedEntries.reduce(
    (sum, entry) => sum + (entry.duration_minutes || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your work hours
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Timer Card */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white shadow-xl">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="0,0 100,0 100,100" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ClockIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Active Timer</h2>
                  <p className="text-indigo-200 text-sm">Track your work session</p>
                </div>
              </div>

              {activeEntry ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold tracking-tight">
                      {formatDuration(elapsedTime)}
                    </div>
                    <p className="mt-4 text-indigo-200">
                      Started {formatDateTime(activeEntry.check_in)}
                    </p>
                    {activeEntry.project && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                        <span className="text-sm">Project: {activeEntry.project.name}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCheckOut}
                    className="w-full rounded-xl bg-white px-6 py-4 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <StopIcon className="h-5 w-5" />
                    Stop Timer
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-white/60">--:--</div>
                    <p className="mt-4 text-indigo-200">No active timer</p>
                  </div>
                  <button
                    onClick={handleCheckIn}
                    className="w-full rounded-xl bg-white px-6 py-4 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="h-5 w-5" />
                    Start Timer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Summary</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatDuration(totalMinutes)}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedEntries.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
        </div>

        {completedEntries.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              No time entries yet. Start tracking your work!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedEntries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {entry.project?.name || 'No project'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(entry.check_in)}
                  </p>
                  {entry.ticket && (
                    <p className="text-xs text-gray-500 mt-1">
                      {entry.ticket.title}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatDuration(entry.duration_minutes)}
                  </p>
                  {entry.is_billable && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Billable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
