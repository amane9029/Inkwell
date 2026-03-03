'use client';

import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { useState, useEffect, useCallback } from 'react';
import { Camera, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { EditorSkeleton } from '@/components/Skeletons';

interface DashboardPost {
    id: string;
    title: string;
    is_draft: boolean;
    created_at: string;
}

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [posts, setPosts] = useState<DashboardPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const fetchPosts = useCallback(async (userId: string) => {
        setLoadingPosts(true);
        try {
            const { data, error: fetchError } = await insforge.database
                .from('posts')
                .select('id, title, is_draft, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (fetchError) throw fetchError;
            if (data) setPosts(data);
        } catch {
            setError('Failed to load posts.');
        }
        setLoadingPosts(false);
    }, []);

    useEffect(() => {
        if (user) {
            insforge.database.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
                if (data) {
                    setName(data.name || '');
                    setBio(data.bio || '');
                    setAvatarUrl(data.avatar_url || '');
                } else {
                    const profileData = {
                        id: user.id,
                        name: user.profile?.name || user.email?.split('@')[0] || 'User',
                        email: user.email || '',
                        avatar_url: user.profile?.avatar_url || ''
                    };
                    insforge.database.from('profiles').insert(profileData).then(() => {
                        setName(profileData.name);
                        setAvatarUrl(profileData.avatar_url);
                    });
                }
            });

            fetchPosts(user.id);
        }
    }, [user, fetchPosts]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setError('');
        try {
            const { data } = await insforge.storage.from('avatars').uploadAuto(file);
            if (data?.url) {
                setAvatarUrl(data.url);
            }
        } catch {
            setError('Failed to upload avatar.');
        }
        setIsUploading(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            const { error: updateError } = await insforge.database.from('profiles').update({ name, bio, avatar_url: avatarUrl }).eq('id', user.id);
            if (updateError) throw updateError;
            await insforge.auth.setProfile({ name, avatar_url: avatarUrl, bio });
            setSuccess('Profile saved!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Failed to save profile.');
        }
        setIsSaving(false);
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const { error: deleteError } = await insforge.database.from('posts').delete().eq('id', id);
            if (deleteError) throw deleteError;
            if (user) fetchPosts(user.id);
        } catch {
            setError('Failed to delete post.');
        }
    };

    if (!isLoaded) return <EditorSkeleton />;
    if (!user) return <div className="p-10 text-center text-[#6b6b6b]">Please sign in to view your dashboard.</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <h1 className="text-2xl font-bold mb-4 text-[#f0ece4]">Profile</h1>

                {error && (
                    <div className="p-3 rounded-[16px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
                )}
                {success && (
                    <div className="p-3 rounded-[16px] bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>
                )}

                <div className="bg-[#141414] p-6 rounded-[16px] border border-[#2a2a2a] space-y-4">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full bg-[#1a1a1a] overflow-hidden border border-[#2a2a2a] flex items-center justify-center relative">
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                                ) : (
                                    <span className="text-[#6b6b6b] text-sm">No Image</span>
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 bg-[#c9a84c] text-[#0a0a0a] p-2 rounded-full cursor-pointer hover:bg-[#e8c96a] transition-colors">
                                <Camera className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                            </label>
                        </div>
                        {isUploading && <p className="text-xs text-[#c9a84c] mb-2">Uploading...</p>}
                        <div className="w-full text-left font-medium">
                            <label className="block text-xs text-[#6b6b6b] uppercase tracking-widest mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-2 border-b border-[#2a2a2a] bg-transparent focus:border-[#c9a84c] outline-none transition-colors text-[#f0ece4]"
                            />
                        </div>
                        <div className="w-full text-left font-medium mt-4">
                            <label className="block text-xs text-[#6b6b6b] uppercase tracking-widest mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={3}
                                className="w-full p-2 border-b border-[#2a2a2a] bg-transparent focus:border-[#c9a84c] outline-none transition-colors resize-none text-[#f0ece4]"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-[#c9a84c] text-[#0a0a0a] px-4 py-2.5 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSaving ? "Saving..." : <><Edit2 className="w-4 h-4 mr-2" /> Save</>}
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#f0ece4]">Your Stories</h1>
                    <Link href="/new" className="bg-[#c9a84c] text-[#0a0a0a] px-4 py-2 rounded-[16px] text-sm font-bold hover:bg-[#e8c96a] transition-colors">Write a story</Link>
                </div>

                <div className="space-y-4">
                    {loadingPosts && (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-[#141414] p-4 rounded-[16px] border border-[#2a2a2a] animate-pulse">
                                    <div className="h-5 skeleton w-2/3 mb-2" />
                                    <div className="h-3 skeleton w-1/3" />
                                </div>
                            ))}
                        </div>
                    )}
                    {!loadingPosts && posts.length === 0 && (
                        <div className="bg-[#141414] p-8 rounded-[16px] border border-[#2a2a2a] text-center">
                            <p className="text-[#6b6b6b] mb-4">You haven&apos;t written any stories yet.</p>
                            <Link href="/new" className="text-[#c9a84c] font-semibold hover:underline">Start writing</Link>
                        </div>
                    )}
                    {posts.map(post => (
                        <div key={post.id} className="bg-[#141414] p-4 rounded-[16px] border border-[#2a2a2a] flex justify-between items-center group hover:border-[#c9a84c]/30 transition-colors">
                            <div>
                                <Link href={`/p/${post.id}`} className="font-bold text-lg hover:text-[#c9a84c] transition-colors text-[#f0ece4]">
                                    {post.title || 'Untitled Story'}
                                </Link>
                                <div className="flex items-center text-sm text-[#6b6b6b] mt-1 space-x-3">
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    {post.is_draft ? (
                                        <span className="text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded text-xs font-medium border border-[#c9a84c]/20">Draft</span>
                                    ) : (
                                        <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-xs font-medium border border-green-400/20">Published</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/edit/${post.id}`} className="p-2 text-[#6b6b6b] hover:text-[#c9a84c] transition-colors rounded-full hover:bg-[#1a1a1a]">
                                    <Edit2 className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="p-2 text-[#6b6b6b] hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
