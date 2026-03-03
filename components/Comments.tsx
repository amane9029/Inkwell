'use client';
import { useState, useEffect, useCallback } from 'react';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { Trash2 } from 'lucide-react';
import type { Comment } from '@/types';
import Image from 'next/image';

export default function Comments({ postId }: { postId: string }) {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const fetchComments = useCallback(async () => {
        try {
            const { data, error: fetchError } = await insforge.database
                .from('comments')
                .select('*, profiles(name, avatar_url)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            if (fetchError) throw fetchError;
            if (data) setComments(data);
        } catch {
            setError('Failed to load comments.');
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();

        let connected = false;
        insforge.realtime.connect().then(() => {
            connected = true;
            insforge.realtime.subscribe(`post:${postId}`);

            insforge.realtime.on('INSERT_comment', (payload) => {
                const user_id = (payload as Record<string, unknown>).user_id as string;
                insforge.database.from('profiles').select('name, avatar_url').eq('id', user_id).single().then(({ data }) => {
                    setComments(prev => [...prev, { ...(payload as Record<string, unknown>), profiles: data } as unknown as Comment]);
                });
            });

            insforge.realtime.on('DELETE_comment', (payload) => {
                setComments(prev => prev.filter(c => c.id !== payload.id));
            });
        });

        return () => {
            insforge.realtime.unsubscribe(`post:${postId}`);
            if (connected) {
                insforge.realtime.disconnect();
            }
        };
    }, [postId, fetchComments]);

    const handlePostComment = async () => {
        if (!user || !content.trim()) return;
        setError('');
        try {
            const { error: insertError } = await insforge.database.from('comments').insert({
                post_id: postId,
                user_id: user.id,
                content
            });
            if (insertError) throw insertError;
            setContent('');
        } catch {
            setError('Failed to post comment.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            const { error: deleteError } = await insforge.database.from('comments').delete().eq('id', id).eq('user_id', user.id);
            if (deleteError) throw deleteError;
        } catch {
            setError('Failed to delete comment.');
        }
    };

    return (
        <div className="mt-16 border-t border-[#2a2a2a] pt-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-[#f0ece4]">Responses ({comments.length})</h3>

            {error && (
                <div className="mb-6 p-4 rounded-[16px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {user ? (
                <div className="mb-10 p-4 bg-[#141414] rounded-[16px] border border-[#2a2a2a] flex flex-col space-y-4 focus-within:ring-2 focus-within:ring-[#c9a84c]/50 focus-within:border-[#c9a84c]/50 transition-all">
                    <textarea
                        placeholder="What are your thoughts?"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full resize-none outline-none bg-transparent placeholder-[#6b6b6b] text-[#f0ece4]"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handlePostComment}
                            disabled={!content.trim()}
                            className="bg-[#c9a84c] text-[#0a0a0a] px-6 py-2 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-colors disabled:opacity-40"
                        >
                            Respond
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-10 p-6 bg-[#141414] rounded-[16px] text-center text-[#6b6b6b] border border-[#2a2a2a]">
                    Please sign in to join the conversation.
                </div>
            )}

            <div className="space-y-6">
                {comments.map(c => (
                    <div key={c.id} className="pb-6 border-b border-[#2a2a2a] last:border-0 group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] overflow-hidden border border-[#2a2a2a] relative">
                                    {c.profiles?.avatar_url ? (
                                        <Image src={c.profiles.avatar_url} alt="" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-[#6b6b6b] text-sm font-bold">
                                            {c.profiles?.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#f0ece4]">{c.profiles?.name || 'User'}</div>
                                    <div className="text-xs text-[#6b6b6b]">{new Date(c.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            {user && user.id === c.user_id && (
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 text-[#6b6b6b] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-500/10"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-[#f0ece4] whitespace-pre-wrap leading-relaxed px-1 font-medium">{c.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
