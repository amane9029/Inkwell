'use client';
import { InsforgeBrowserProvider } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';

export function InsforgeProvider({ children }: { children: React.ReactNode }) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <InsforgeBrowserProvider client={insforge as any} afterSignInUrl="/dashboard">
            {children}
        </InsforgeBrowserProvider>
    );
}
