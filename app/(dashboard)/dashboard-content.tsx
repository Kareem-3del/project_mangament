'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  FolderIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  activeProjects: number
  myTickets: number
  hoursThisWeek: number
  completedTickets: number
}

interface TimeEntryDuration {
  duration_minutes: number | null
}

export function DashboardContent() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    myTickets: 0,
    hoursThisWeek: 0,
    completedTickets: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      fetchDashboardStats()
    }
  }, [profile])

  async function fetchDashboardStats() {
    if (!profile?.id) return

    try {
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: ticketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', profile.id)
        .in('status', ['todo', 'in_progress', 'in_review'])

      const { count: completedCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', profile.id)
        .eq('status', 'done')

      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('user_id', profile.id)
        .gte('check_in', startOfWeek.toISOString())
        .not('check_out', 'is', null)

      const totalMinutes =
        (timeEntries as TimeEntryDuration[] | null)?.reduce(
          (sum, entry) => sum + (entry.duration_minutes || 0),
          0
        ) || 0
      const hours = Math.round((totalMinutes / 60) * 10) / 10

      setStats({
        activeProjects: projectsCount || 0,
        myTickets: ticketsCount || 0,
        hoursThisWeek: hours,
        completedTickets: completedCount || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      name: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderIcon,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'My Tasks',
      value: stats.myTickets,
      icon: TicketIcon,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      change: '+3 new',
      changeType: 'neutral',
    },
    {
      name: 'Hours This Week',
      value: `${stats.hoursThisWeek}h`,
      icon: ClockIcon,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Completed',
      value: stats.completedTickets,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      change: '+15%',
      changeType: 'positive',
    },
  ]

  const quickActions = [
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: FolderIcon,
      href: '/projects/new',
      color: 'blue',
    },
    {
      title: 'New Ticket',
      description: 'Create a task',
      icon: TicketIcon,
      href: '/tickets/new',
      color: 'purple',
    },
    {
      title: 'Track Time',
      description: 'Log work hours',
      icon: ClockIcon,
      href: '/time-tracking',
      color: 'amber',
    },
    {
      title: 'View Analytics',
      description: 'Team insights',
      icon: ChartBarIcon,
      href: '/analytics',
      color: 'emerald',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="0,0 100,0 100,100" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="mt-2 text-indigo-100">
            Here's what's happening with your projects today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-xl hover:ring-gray-900/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-emerald-600' : 'text-gray-600'
                  }`}>
                    {stat.changeType === 'positive' && (
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-gray-600">{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-xl hover:ring-gray-900/10"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg bg-${action.color}-100 p-3 transition-transform duration-300 group-hover:scale-110`}>
                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Activity</h2>
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FolderIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Project created</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <TicketIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New ticket assigned</p>
                <p className="text-xs text-gray-600">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Task completed</p>
                <p className="text-xs text-gray-600">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
          <CalendarIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            No upcoming deadlines. You're all caught up!
          </p>
        </div>
      </div>
    </div>
  )
}
