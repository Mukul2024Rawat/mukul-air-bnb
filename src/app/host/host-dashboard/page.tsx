'use client'

import React from 'react'
import BookingTable from '@/components/host/BookingTable'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Host Dashboard</h1>
      <BookingTable />
    </div>
  )
}