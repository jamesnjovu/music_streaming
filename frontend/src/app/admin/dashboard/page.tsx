import { Metadata } from 'next'
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader'
import { DashboardCards } from '@/components/admin/dashboard/DashboardCards'
import { RecentTracksTable } from '@/components/admin/dashboard/RecentTracksTable'
import { ActivityChart } from '@/components/admin/dashboard/ActivityChart'
import { TopPerformers } from '@/components/admin/dashboard/TopPerformers'

export const metadata: Metadata = {
  title: 'Dashboard - Music Streaming Admin',
  description: 'Admin dashboard overview',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityChart />
        <TopPerformers />
      </div>
      
      <RecentTracksTable />
    </div>
  )
}