"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@insforge/nextjs';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`flex items-center justify-between px-6 lg:px-12 py-5 bg-[#0a0a0a] text-[#f0ece4] sticky top-0 z-50 transition-colors duration-300 ${scrolled ? 'border-b border-[#c9a84c]' : 'border-b border-transparent'}`}>
            <Link href="/" className="flex items-center space-x-3 text-2xl font-serif font-bold tracking-wide group">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#c9a84c] flex-shrink-0 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <defs>
                        <mask id="nib-mask-nav">
                            <rect width="24" height="24" fill="white" />
                            <circle cx="12" cy="13.5" r="1.5" fill="black" />
                            <line x1="12" y1="2" x2="12" y2="13.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                        </mask>
                    </defs>
                    <path d="M12 2 L5 11.5 L7.5 21 Q12 22.5 16.5 21 L19 11.5 Z" fill="currentColor" fillOpacity="0.15" />
                    <path d="M12 2 L7 11.5 L9 19 Q12 20 15 19 L17 11.5 Z" fill="currentColor" mask="url(#nib-mask-nav)" />
                </svg>
                <span className="text-[#f0ece4]">Inkwell</span>
            </Link>

            <div className="flex items-center space-x-8 text-sm font-medium tracking-wide">
                <Link href="/explore" className="text-[#6b6b6b] hover:text-[#c9a84c] transition-colors">
                    Explore
                </Link>
                <SignedOut>
                    <div className="flex items-center space-x-6">
                        <span className="cursor-pointer text-[#6b6b6b] hover:text-[#f0ece4] transition-colors">
                            <SignInButton />
                        </span>
                        <span className="text-[#c9a84c] border border-[#c9a84c] px-6 py-2.5 rounded hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-colors cursor-pointer">
                            <SignUpButton />
                        </span>
                    </div>
                </SignedOut>
                <SignedIn>
                    <Link href="/new" className="text-[#6b6b6b] hover:text-[#c9a84c] transition-colors">
                        Write
                    </Link>
                    <Link href="/dashboard" className="text-[#6b6b6b] hover:text-[#c9a84c] transition-colors">
                        Dashboard
                    </Link>
                    <div className="pl-2">
                        <UserButton />
                    </div>
                </SignedIn>
            </div>
        </nav>
    );
}
