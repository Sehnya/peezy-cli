'use client'

import { signIn } from 'next-auth/react'

export function LoginButton() {
    return (
        <div className="space-y-4">
            <button
                onClick={() => signIn('github')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                Sign in with GitHub
            </button>
            <button
                onClick={() => signIn('google')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                Sign in with Google
            </button>
        </div>
    )
}