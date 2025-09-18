import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'
import { TaskList } from '../components/tasks/TaskList'

export function HomePage() {
    const { user, logout } = useAuth()

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Express + React Full-Stack
                        </h1>
                        <p className="mt-2 text-gray-600">
                            A modern full-stack application with authentication and real-time features
                        </p>
                    </div>
                    <LoginForm />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Welcome, {user.name}!
                    </h1>
                    <button
                        onClick={logout}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <TaskList />
            </main>
        </div>
    )
}