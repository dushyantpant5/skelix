interface User {
  name: string
  email: string
  avatar: string
}

export function UserCard({ user }: { user: User }) {
  return (
    <div className="flex gap-3 p-4">
      <img className="h-12 w-12 rounded-full" src={user.avatar} alt="" />
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">{user.name}</h3>
        <p className="text-gray-500 text-xs">{user.email}</p>
      </div>
    </div>
  )
}
