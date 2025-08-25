import { useState, useEffect } from 'react'

interface ApiData {
    id: number;
    name: string;
    value: number;
}

interface ApiResponse {
    message: string;
    data: ApiData[];
}

function App() {
    const [count, setCount] = useState(0)
    const [apiData, setApiData] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/data')
            const data = await response.json()
            setApiData(data)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                        **APP_NAME**
                    </h1>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                Flask + React + Bun
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                A full-stack application with Flask backend and React frontend built with Bun.
                            </p>
                        </div>

                        <div className="mb-8">
                            <button
                                onClick={() => setCount((count) => count + 1)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                Count is {count}
                            </button>
                        </div>

                        <div className="border-t pt-8">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                API Data from Flask Backend
                            </h3>

                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors mb-4"
                            >
                                {loading ? 'Loading...' : 'Refresh Data'}
                            </button>

                            {apiData && (
                                <div className="text-left">
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        {apiData.message}
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        {apiData.data.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                                            >
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {item.name}
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Value: {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            Edit <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App