'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getInitials } from '@/lib/utils'
import {
  BellIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export function Header() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const getRoleBadgeColor = (role?: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      project_manager: 'bg-blue-100 text-blue-800',
      team_member: 'bg-green-100 text-green-800',
      client: 'bg-gray-100 text-gray-800',
    }
    return colors[role || ''] || 'bg-gray-100 text-gray-800'
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-20 items-center justify-between px-8">
        {/* Search */}
        <div className="flex flex-1 items-center">
          <div className="relative w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tickets, or team members..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
            <BellIcon className="h-6 w-6" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {profile?.full_name || 'User'}
                </p>
                <p className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full inline-block',
                  getRoleBadgeColor(profile?.role)
                )}>
                  {profile?.role?.replace('_', ' ') || 'Member'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg">
                {profile?.full_name ? getInitials(profile.full_name) : 'U'}
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none">
                <div className="border-b border-gray-100 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <div className="p-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                        )}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        Your Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                        )}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        Settings
                      </button>
                    )}
                  </Menu.Item>
                </div>
                <div className="border-t border-gray-100 p-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          active ? 'bg-rose-50 text-rose-700' : 'text-rose-600'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
