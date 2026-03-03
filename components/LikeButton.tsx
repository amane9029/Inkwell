'use client';
import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { Heart } from 'lucide-react';

export default function LikeButton({ postId, initialCount = 0 }: { postId: string; initialCount?: number }) {
    const { user } = useUser();
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (!user) return;
        let mounted = true;
        insforge.database.from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle()
            .then(({ data }) => {
                if (mounted) setLiked(!!data);
            });
        return () => { mounted = false; };
    }, [user, postId]);

    const handleToggle = async () => {
        if (!user) return;
        setAnimating(true);
        setTimeout(() => setAnimating(false), 300);

        try {
            if (liked) {
                await insforge.database.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
                setLiked(false);
                setCount(prev => Math.max(0, prev - 1));
            } else {
                await insforge.database.from('likes').insert({ post_id: postId, user_id: user.id });
                setLiked(true);
                setCount(prev => prev + 1);
            }
        } catch {
            // Revert optimistic update silently
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-[16px] border transition-all duration-200 ${liked ? 'border-[#c9a84c]/50 bg-[#c9a84c]/10 text-[#c9a84c]' : 'border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c]/30 hover:text-[#c9a84c]'}`}
            aria-label={liked ? 'Unlike' : 'Like'}
        >
            <Heart className={`w-5 h-5 transition-transform ${animating ? 'scale-125' : 'scale-100'} ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{count}</span>
        </button>
    );
}
