import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth'
import { HomePage } from './pages/HomePage'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <HomePage />
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App