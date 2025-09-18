'use client'

import { signOut } from 'next-auth/react'
import { User } from 'next-auth'

interface UserProfileProps {
    user: User
}

export function UserProfile({ user }: UserProfileProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
                {user.image && (
                    <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="w-10 h-10 rounded-full"
                    />
                )}
                <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            </div>
            <button
                onClick={() => signOut()}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-100"
            >
                Sign out
            </button>
        </div>
    )
}