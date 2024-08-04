'use client'

import React from 'react'
import MyListings from '@/components/host/MyListings'

export default function ListingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">My Listings</h1>
      <MyListings />
    </div>
  )
}