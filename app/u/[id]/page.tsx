import { insforge } from '@/lib/insforge';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import FollowButton from '@/components/FollowButton';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data: profile } = await insforge.database.from('profiles').select('name').eq('id', id).single();
    return {
        title: profile ? `${profile.name} | Inkwell` : 'Profile | Inkwell',
    };
}

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: profile, error } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !profile) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl text-[#6b6b6b] mb-4">Profile not found.</h2>
                <Link href="/" className="text-[#c9a84c] underline font-medium">Go home</Link>
            </div>
        );
    }

    const { data: posts } = await insforge.database
        .from('posts')
        .select('id, title, created_at, cover_image_url, tags')
        .eq('user_id', profile.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

    const { count: followersCount } = await insforge.database
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-16 pb-12 border-b border-[#2a2a2a]">
                <div className="w-32 h-32 rounded-full bg-[#1a1a1a] overflow-hidden mb-6 md:mb-0 border border-[#2a2a2a] flex-shrink-0 relative">
                    {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" unoptimized />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6b6b6b] text-2xl font-bold">
                            {profile.name?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-[#f0ece4] mb-2 font-serif">{profile.name}</h1>
                    <p className="text-[#6b6b6b] mb-6 max-w-lg mx-auto md:mx-0 text-lg leading-snug">{profile.bio || 'This user has no biography.'}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-6">
                        <div className="text-[#f0ece4]">
                            <span className="font-bold">{followersCount || 0}</span> <span className="text-[#6b6b6b]">Followers</span>
                        </div>
                        <FollowButton targetUserId={profile.id} />
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-8 text-[#f0ece4]">Stories by {profile.name}</h2>

            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {posts.map(post => (
                        <Link href={`/p/${post.id}`} key={post.id} className="group block border border-[#2a2a2a] rounded-[16px] overflow-hidden hover:border-[#c9a84c] hover:shadow-lg hover:shadow-[#000]/40 transition-all bg-[#141414]">
                            <div className="h-48 bg-[#0a0a0a] overflow-hidden w-full relative border-b border-[#2a2a2a]">
                                {post.cover_image_url ? (
                                    <Image src={post.cover_image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-100" unoptimized />
                                ) : (
                                    <div className="w-full h-full bg-[#0d0d0d] flex items-center justify-center text-[#2a2a2a]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                )}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="absolute top-4 left-4 bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-[#c9a84c] border border-[#c9a84c]/30">
                                        {post.tags[0]}
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-[#c9a84c] transition-colors text-[#f0ece4] line-clamp-2 font-serif">{post.title}</h3>
                                <div className="text-sm text-[#6b6b6b]">
                                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-[#6b6b6b] py-10 text-center border border-[#2a2a2a] rounded-[16px] bg-[#141414]">No stories published yet.</div>
            )}
        </div>
    );
}
