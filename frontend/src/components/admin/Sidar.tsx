'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  Disc, 
  Mic2, 
  CreditCard, 
  BarChart, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItemProps = {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  isSubItem?: boolean
}

type NavGroupProps = {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

// Navigation item component
const NavItem = ({ href, icon, title, isActive, isSubItem = false }: NavItemProps) => (
  <Link 
    href={href} 
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      isSubItem ? "pl-10 text-sm" : "font-medium",
      isActive 
        ? "bg-brand/10 text-brand hover:bg-brand/20" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    )}
  >
    <span className="w-5 h-5">{icon}</span>
    <span>{title}</span>
  </Link>
)

// Navigation group with collapsible sub-items
const NavGroup = ({ icon, title, children, defaultOpen = false }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const pathname = usePathname()
  
  // Auto-expand if a child route is active
  useEffect(() => {
    // Check if pathname matches any children's href
    // This would require passing child hrefs as props or using context
    const shouldBeOpen = pathname.includes(title.toLowerCase())
    if (shouldBeOpen) {
      setIsOpen(true)
    }
  }, [pathname, title])

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
      >
        <div className="flex items-center gap-3">
          <span className="w-5 h-5">{icon}</span>
          <span>{title}</span>
        </div>
        <span className="w-5 h-5">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

type SidebarProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isMobile: boolean
}

export function Sidebar({ isOpen, setIsOpen, isMobile }: SidebarProps) {
  const pathname = usePathname()
  
  // Check if the current path matches the nav item path
  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
    }
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-[64px] bottom-0 left-0 z-50 w-64 border-r bg-background transition-transform lg:translate-x-0 lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-2 top-2 p-1 rounded-full hover:bg-muted lg:hidden"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="h-full overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            <NavItem 
              href="/admin/dashboard" 
              icon={<LayoutDashboard size={20} />} 
              title="Dashboard" 
              isActive={isActivePath('/admin/dashboard')}
            />
            
            <NavItem 
              href="/admin/users" 
              icon={<Users size={20} />} 
              title="Users" 
              isActive={isActivePath('/admin/users')}
            />
            
            <NavItem 
              href="/admin/tracks" 
              icon={<Music size={20} />} 
              title="Tracks" 
              isActive={isActivePath('/admin/tracks')}
            />
            
            <NavItem 
              href="/admin/albums" 
              icon={<Disc size={20} />} 
              title="Albums" 
              isActive={isActivePath('/admin/albums')}
            />
            
            <NavItem 
              href="/admin/artists" 
              icon={<Mic2 size={20} />} 
              title="Artists" 
              isActive={isActivePath('/admin/artists')}
            />
            
            <NavGroup 
              icon={<CreditCard size={20} />} 
              title="Subscriptions"
              defaultOpen={pathname.includes('/admin/subscriptions')}
            >
              <NavItem 
                href="/admin/subscriptions" 
                icon={<CreditCard size={18} />} 
                title="Plans" 
                isActive={pathname === '/admin/subscriptions'}
                isSubItem
              />
              <NavItem 
                href="/admin/subscriptions/users" 
                icon={<Users size={18} />} 
                title="User Subscriptions" 
                isActive={pathname === '/admin/subscriptions/users'}
                isSubItem
              />
            </NavGroup>
            
            <NavGroup 
              icon={<BarChart size={20} />} 
              title="Analytics"
              defaultOpen={pathname.includes('/admin/analytics')}
            >
              <NavItem 
                href="/admin/analytics/overview" 
                icon={<LayoutDashboard size={18} />} 
                title="Overview" 
                isActive={pathname === '/admin/analytics/overview'}
                isSubItem
              />
              <NavItem 
                href="/admin/analytics/users" 
                icon={<Users size={18} />} 
                title="User Analytics" 
                isActive={pathname === '/admin/analytics/users'}
                isSubItem
              />
              <NavItem 
                href="/admin/analytics/content" 
                icon={<Music size={18} />} 
                title="Content Analytics" 
                isActive={pathname === '/admin/analytics/content'}
                isSubItem
              />
              <NavItem 
                href="/admin/analytics/revenue" 
                icon={<CreditCard size={18} />} 
                title="Revenue Analytics" 
                isActive={pathname === '/admin/analytics/revenue'}
                isSubItem
              />
            </NavGroup>
            
            <NavItem 
              href="/admin/settings" 
              icon={<Settings size={20} />} 
              title="Settings" 
              isActive={isActivePath('/admin/settings')}
            />
          </div>
        </div>
      </aside>
    </>
  )
}