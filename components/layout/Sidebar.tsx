'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  FolderIcon,
  TicketIcon,
  ClockIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
  TicketIcon as TicketIconSolid,
  ClockIcon as ClockIconSolid,
  UsersIcon as UsersIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid'
import { useAuth } from '@/components/auth/AuthProvider'
import { canManageUsers } from '@/lib/auth/permissions'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Projects', href: '/projects', icon: FolderIcon, iconSolid: FolderIconSolid },
  { name: 'My Tickets', href: '/tickets', icon: TicketIcon, iconSolid: TicketIconSolid },
  { name: 'Time Tracking', href: '/time-tracking', icon: ClockIcon, iconSolid: ClockIconSolid },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid,
    requirePermission: 'reports'
  },
  {
    name: 'Team',
    href: '/users',
    icon: UsersIcon,
    iconSolid: UsersIconSolid,
    requirePermission: 'users'
  },
  {
    name: 'Company',
    href: '/company',
    icon: BuildingOfficeIcon,
    iconSolid: BuildingOfficeIconSolid,
    requirePermission: 'company',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const filteredNavigation = navigation.filter((item) => {
    if (item.requirePermission === 'users') {
      return profile?.role && canManageUsers(profile.role)
    }
    if (item.requirePermission === 'company') {
      return profile?.role === 'admin'
    }
    if (item.requirePermission === 'reports') {
      return profile?.role && ['admin', 'project_manager'].includes(profile.role)
    }
    return true
  })

  return (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-indigo-700/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
            <FolderIconSolid className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ProjectHub</h1>
            <p className="text-xs text-indigo-300">Manage with ease</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm'
                  : 'text-indigo-200 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={cn(
                'h-6 w-6 transition-transform duration-200',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-indigo-700/50 p-4">
        <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-indigo-200">Need help?</p>
          <p className="mt-1 text-xs text-indigo-300">Check our documentation</p>
          <button className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20">
            View Docs
          </button>
        </div>
      </div>
    </div>
  )
}
