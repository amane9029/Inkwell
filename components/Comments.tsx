'use client';
import { useState, useEffect, useCallback } from 'react';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { Trash2 } from 'lucide-react';

interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
        name: string;
        avatar_url: string;
    };
}

export default function Comments({ postId }: { postId: string }) {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');

    const fetchComments = useCallback(async () => {
        const { data } = await insforge.database
            .from('comments')
            .select('*, profiles(name, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        if (data) setComments(data);
    }, [postId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchComments();

        insforge.realtime.connect().then(() => {
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
        };
    }, [postId, fetchComments]);

    const handlePostComment = async () => {
        if (!user || !content.trim()) return;
        await insforge.database.from('comments').insert({
            post_id: postId,
            user_id: user.id,
            content
        });
        setContent('');
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        await insforge.database.from('comments').delete().eq('id', id).eq('user_id', user.id);
    };

    return (
        <div className="mt-16 border-t border-gray-300 pt-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-8">Responses ({comments.length})</h3>

            {user ? (
                <div className="mb-10 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col space-y-4 focus-within:ring-2 focus-within:ring-[#2c2c2f] focus-within:border-transparent transition-all">
                    <textarea
                        placeholder="What are your thoughts?"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full resize-none outline-none bg-transparent placeholder-gray-400 text-gray-800"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handlePostComment}
                            disabled={!content.trim()}
                            className="bg-[#2c2c2f] text-white px-6 py-2 rounded-full font-medium hover:bg-black transition-colors disabled:opacity-40"
                        >
                            Respond
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-10 p-6 bg-gray-100 rounded-xl text-center text-gray-600 border border-gray-200">
                    Please sign in to join the conversation.
                </div>
            )}

            <div className="space-y-6">
                {comments.map(c => (
                    <div key={c.id} className="pb-6 border-b border-gray-200 last:border-0 group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                                    {c.profiles?.avatar_url && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">{c.profiles?.name || 'User'}</div>
                                    <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            {user && user.id === c.user_id && (
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed px-1 font-medium">{c.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
