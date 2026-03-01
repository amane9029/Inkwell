'use client';
import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { Loader2 } from 'lucide-react';

export default function FollowButton({ targetUserId }: { targetUserId: string }) {
    const { user } = useUser();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const checkFollow = async () => {
            if (user && user.id !== targetUserId) {
                const { data } = await insforge.database.from('follows')
                    .select('*')
                    .eq('follower_id', user.id)
                    .eq('following_id', targetUserId)
                    .maybeSingle();

                if (mounted) {
                    setIsFollowing(!!data);
                    setLoading(false);
                }
            } else {
                if (mounted) setLoading(false);
            }
        };

        checkFollow();
        return () => { mounted = false; };
    }, [user, targetUserId]);

    const handleToggle = async () => {
        if (!user) return;
        setLoading(true);
        if (isFollowing) {
            await insforge.database.from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId);
            setIsFollowing(false);
        } else {
            await insforge.database.from('follows')
                .insert({ follower_id: user.id, following_id: targetUserId });
            setIsFollowing(true);
        }
        setLoading(false);
    };

    if (!user || user.id === targetUserId) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center justify-center ${isFollowing ? 'border border-[#2c2c2f] text-[#2c2c2f] hover:bg-black/5' : 'bg-[#2c2c2f] text-white hover:bg-black'}`}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}
