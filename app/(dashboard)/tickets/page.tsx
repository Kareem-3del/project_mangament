'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getMyTickets } from '@/lib/api/tickets'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  FolderIcon,
  CalendarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export default function MyTicketsPage() {
  const { profile } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchTickets()
    }
  }, [profile])

  async function fetchTickets() {
    try {
      const data = await getMyTickets(profile!.id)
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, { bg: string; text: string; ring: string }> = {
      low: { bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-200' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200' },
      urgent: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' },
    }
    return styles[priority] || styles.medium
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      todo: { bg: 'bg-gray-100', text: 'text-gray-700' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
      in_review: { bg: 'bg-amber-100', text: 'text-amber-700' },
      done: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    }
    return styles[status] || styles.todo
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tasks and issues assigned to you
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50">
          <FunnelIcon className="h-5 w-5" />
          Filter
        </button>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <UserCircleIcon className="h-12 w-12 text-purple-600" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-gray-900">No tickets assigned</h3>
          <p className="mt-2 text-sm text-gray-600">
            You're all caught up! No tasks assigned to you at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const priorityStyle = getPriorityStyle(ticket.priority)
            const statusStyle = getStatusStyle(ticket.status)

            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-xl hover:ring-gray-900/10 cursor-pointer">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.ring}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {ticket.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {ticket.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <FolderIcon className="h-4 w-4" />
                      <span>{ticket.project?.name}</span>
                    </div>
                    {ticket.due_date && (
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due {formatDate(ticket.due_date)}</span>
                      </div>
                    )}
                    {ticket.estimated_hours && (
                      <div className="flex items-center gap-1.5">
                        <span>Est: {ticket.estimated_hours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
