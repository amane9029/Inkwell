import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About | Inkwell',
    description: 'About Inkwell — a premium editorial blogging platform for thoughtful writers.',
};

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#f0ece4] mb-8">About Inkwell</h1>

            <div className="space-y-6 text-[#6b6b6b] text-lg font-light leading-relaxed">
                <p>
                    <span className="text-[#f0ece4] font-medium">Inkwell</span> is a premium editorial blogging platform built for writers who value craft, depth, and genuine connection. In a world of infinite scroll and algorithmic feeds, Inkwell offers a space where words matter.
                </p>

                <p>
                    We believe that great writing deserves great design. Every detail — from the distraction-free editor to the carefully curated reading experience — is designed to help writers focus on what they do best: telling stories that resonate.
                </p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">Our Mission</h2>
                <p>
                    To create a space where thoughtful writing thrives. No engagement metrics. No algorithm games. Just authentic voices connecting with genuine readers.
                </p>

                <h2 className="text-2xl font-serif font-bold text-[#f0ece4] pt-4">Features</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>Distraction-free rich text editor with image support</li>
                    <li>Beautiful dark editorial design</li>
                    <li>Real-time comment threads</li>
                    <li>Follow your favorite writers</li>
                    <li>Topic-based discovery</li>
                    <li>Share your stories with the world</li>
                </ul>

                <div className="pt-8 border-t border-[#2a2a2a] mt-8">
                    <Link href="/new" className="bg-[#c9a84c] text-[#0a0a0a] px-8 py-3 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-all">
                        Start Writing
                    </Link>
                </div>
            </div>
        </div>
    );
}
