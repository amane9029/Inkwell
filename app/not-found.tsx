import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
            <div className="text-center max-w-lg">
                <h1 className="text-8xl font-serif font-black text-[#c9a84c] mb-6">404</h1>
                <h2 className="text-3xl font-serif font-bold text-[#f0ece4] mb-4">Page not found</h2>
                <p className="text-[#6b6b6b] text-lg font-light mb-10 leading-relaxed">
                    The story you&apos;re looking for seems to have wandered off. Perhaps it was just a whisper in the wind.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="bg-[#c9a84c] text-[#0a0a0a] px-8 py-3 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-all"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/explore"
                        className="text-[#c9a84c] px-8 py-3 rounded-[16px] font-semibold hover:bg-[#c9a84c]/10 transition-all border border-[#c9a84c]"
                    >
                        Explore Stories
                    </Link>
                </div>
            </div>
        </div>
    );
}
