import { motion } from 'framer-motion'

export function AboutPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">About This App</h1>

            <div className="bg-white rounded-lg shadow-sm border p-8 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Technology Stack
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Frontend</h3>
                            <ul className="text-gray-600 space-y-1">
                                <li>• React 18 with TypeScript</li>
                                <li>• Vite for fast development</li>
                                <li>• Tailwind CSS for styling</li>
                                <li>• Framer Motion for animations</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">State & Data</h3>
                            <ul className="text-gray-600 space-y-1">
                                <li>• Zustand for state management</li>
                                <li>• TanStack Query for server state</li>
                                <li>• React Router for navigation</li>
                                <li>• React Hook Form for forms</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Features
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <ul className="text-gray-600 space-y-2">
                            <li>✅ Modern React patterns and hooks</li>
                            <li>✅ TypeScript for type safety</li>
                            <li>✅ Responsive design with Tailwind</li>
                            <li>✅ Smooth animations with Framer Motion</li>
                        </ul>
                        <ul className="text-gray-600 space-y-2">
                            <li>✅ Client-side routing</li>
                            <li>✅ State management with Zustand</li>
                            <li>✅ Testing setup with Vitest</li>
                            <li>✅ Hot reload development</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Getting Started
                    </h2>
                    <div className="bg-gray-50 rounded-md p-4">
                        <pre className="text-sm text-gray-800">
                            {`npm run dev     # Start development server
npm run build   # Build for production
npm run test    # Run tests
npm run preview # Preview production build`}
                        </pre>
                    </div>
                </section>
            </div>
        </motion.div>
    )
}