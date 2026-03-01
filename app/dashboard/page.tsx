'use client';

import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { useState, useEffect, useCallback } from 'react';
import { Camera, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Post {
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

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const fetchPosts = useCallback(async (userId: string) => {
        setLoadingPosts(true);
        const { data } = await insforge.database
            .from('posts')
            .select('id, title, is_draft, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (data) setPosts(data);
        setLoadingPosts(false);
    }, []);

    useEffect(() => {
        if (user) {
            // Sync or fetch profile
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

            // Fetch user's posts
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchPosts(user.id);
        }
    }, [user, fetchPosts]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const { data } = await insforge.storage.from('avatars').uploadAuto(file);
        if (data?.url) {
            setAvatarUrl(data.url);
        }
        setIsUploading(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        await insforge.database.from('profiles').update({ name, bio, avatar_url: avatarUrl }).eq('id', user.id);
        await insforge.auth.setProfile({ name, avatar_url: avatarUrl, bio });
        setIsSaving(false);
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        await insforge.database.from('posts').delete().eq('id', id);
        if (user) fetchPosts(user.id);
    };

    if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
    if (!user) return <div className="p-10 text-center">Please sign in to view your dashboard.</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
                                {avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-sm">No Image</span>
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 bg-[#2c2c2f] text-white p-2 rounded-full cursor-pointer hover:bg-black transition-colors">
                                <Camera className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                            </label>
                        </div>
                        {isUploading && <p className="text-xs text-blue-500 mb-2">Uploading...</p>}
                        <div className="w-full text-left font-medium">
                            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-2 border-b border-gray-300 bg-transparent focus:border-[#2c2c2f] outline-none transition-colors"
                            />
                        </div>
                        <div className="w-full text-left font-medium mt-4">
                            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={3}
                                className="w-full p-2 border-b border-gray-300 bg-transparent focus:border-[#2c2c2f] outline-none transition-colors resize-none"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-[#2c2c2f] text-white px-4 py-2 rounded-full font-medium hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSaving ? "Saving..." : <><Edit2 className="w-4 h-4 mr-2" /> Save</>}
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Stories</h1>
                    <Link href="/new" className="bg-[#2c2c2f] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition-colors">Write a story</Link>
                </div>

                <div className="space-y-4">
                    {loadingPosts && <p className="text-gray-500">Loading stories...</p>}
                    {!loadingPosts && posts.length === 0 && (
                        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                            <p className="text-gray-500 mb-4">You haven&apos;t written any stories yet.</p>
                            <Link href="/new" className="text-[#2c2c2f] font-semibold hover:underline">Start writing</Link>
                        </div>
                    )}
                    {posts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group">
                            <div>
                                <Link href={`/p/${post.id}`} className="font-bold text-lg hover:underline decoration-2 text-[#2c2c2f]">
                                    {post.title || 'Untitled Story'}
                                </Link>
                                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    {post.is_draft ? (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">Draft</span>
                                    ) : (
                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Published</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/edit/${post.id}`} className="p-2 text-gray-500 hover:text-[#2c2c2f] transition-colors rounded-full hover:bg-gray-100">
                                    <Edit2 className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
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
