export default function App() {
    return (
        <main className="grid min-h-screen place-items-center p-8">
            <section className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <h1 className="text-3xl font-bold">__APP_NAME__</h1>
                <p className="mt-2 text-white/70">Scaffolded with peezy.</p>
                <div className="mt-6 flex gap-4 justify-center">
                    <a
                        className="inline-block rounded-lg border border-white/20 px-4 py-2 transition-colors hover:bg-white/10"
                        href="https://react.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        React Docs →
                    </a>
                    <a
                        className="inline-block rounded-lg border border-white/20 px-4 py-2 transition-colors hover:bg-white/10"
                        href="https://tailwindcss.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Tailwind Docs →
                    </a>
                </div>
            </section>
        </main>
    )
}