import React, { useEffect, useState } from 'react'
import { FaBars, FaBell, FaPlus } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { fetchUserProfilePhoto } from '@/api/index' // Adjust the import path as needed
import { useRouter } from 'next/navigation'

interface HeaderProps {
  toggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const imageBlob = await fetchUserProfilePhoto()
        const blob = new Blob([imageBlob.data], { type: "image/jpeg" })
        const imageUrl = URL.createObjectURL(blob)
        setProfileImageUrl(imageUrl)
      } catch (error) {
        console.error('Error fetching profile image:', error)
      }
    }

    loadProfileImage()
  }, [])

  const handleRouteClick = () => {
    router.push('/user/dashboard/profile')
  }

  return (
    <header className="bg-white shadow-sm z-20 h-16">
      <div className="flex justify-between items-center px-4 md:px-6 h-full">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-gray-600 mr-4 md:hidden">
            <FaBars size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 hidden md:block">Host Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/become-a-host" passHref>
            <button className="flex items-center text-sm font-semibold text-pink-600 hover:text-pink-800 transition-colors duration-200">
              <FaPlus size={14} className="mr-1" />
              <span className="hidden md:inline">Add Property</span>
            </button>
          </Link>
          <button className="text-gray-600 hover:text-gray-800 transition-colors duration-200 relative">
            <FaBell size={18} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="relative w-8 h-8 rounded-full overflow-hidden cursor-pointer" onClick={handleRouteClick}>
            <Image
              src={profileImageUrl || "/profile.png"}
              alt="User Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header