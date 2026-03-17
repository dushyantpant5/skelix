// @ts-nocheck
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface User {
  name: string
  bio: string
  isVerified: boolean
}

export function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4 p-6">
      <Avatar className="h-16 w-16" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-500">{user.bio}</p>
        {user.isVerified && <Badge>Verified</Badge>}
      </div>
    </div>
  )
}
