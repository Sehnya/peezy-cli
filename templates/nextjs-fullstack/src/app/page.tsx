import { auth } from '@/lib/auth'
import { LoginButton } from '@/components/auth/login-button'
import { UserProfile } from '@/components/auth/user-profile'
import { TaskList } from '@/components/tasks/task-list'

export default async function Home() {
    const session = await auth()

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Next.js Full-Stack App
                    </h1>
                    <p className="text-lg text-gray-600">
                        Authentication, Database, and Modern UI - Ready to Go
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-8">
                    {session ? (
                        <div className="space-y-8">
                            <UserProfile user={session.user} />
                            <TaskList />
                        </div>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Welcome! Please sign in to continue
                            </h2>
                            <LoginButton />
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}