'use client';
import { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

export default function ShareButtons({ title, url }: { title: string; url?: string }) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback — some browsers restrict clipboard
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <span className="text-xs text-[#6b6b6b] uppercase tracking-widest font-medium mr-2 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" /> Share
            </span>

            {/* Twitter / X */}
            <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[12px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
                title="Share on X"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>

            {/* LinkedIn */}
            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[12px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
                title="Share on LinkedIn"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>

            {/* Copy Link */}
            <button
                onClick={copyLink}
                className="p-2 rounded-[12px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
                title="Copy link"
            >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4" />}
            </button>
        </div>
    );
}
