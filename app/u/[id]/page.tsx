import { insforge } from '@/lib/insforge';
import { Metadata } from 'next';
import Link from 'next/link';
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
        return <div className="text-center py-20 text-2xl text-gray-500">Profile not found. <Link href="/" className="underline text-[#2c2c2f]">Go home</Link></div>;
    }

    const { data: posts } = await insforge.database
        .from('posts')
        .select('id, title, created_at, cover_image_url')
        .eq('user_id', profile.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

    // Count followers using head
    const { count: followersCount } = await insforge.database
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-16 pb-12 border-b border-gray-300">
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-6 md:mb-0 border border-gray-300 flex-shrink-0">
                    {profile.avatar_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-[#2c2c2f] mb-2">{profile.name}</h1>
                    <p className="text-gray-600 mb-6 max-w-lg mx-auto md:mx-0 text-lg leading-snug">{profile.bio || 'This user has no biography.'}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-6">
                        <div className="text-gray-800">
                            <span className="font-bold">{followersCount || 0}</span> <span className="text-gray-500">Followers</span>
                        </div>
                        <FollowButton targetUserId={profile.id} />
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-8">Stories by {profile.name}</h2>

            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {posts.map(post => (
                        <Link href={`/p/${post.id}`} key={post.id} className="group block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white">
                            <div className="h-48 bg-gray-100 overflow-hidden w-full relative border-b border-gray-200">
                                {post.cover_image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors text-[#2c2c2f] line-clamp-2">{post.title}</h3>
                                <div className="text-sm text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-gray-500 py-10 text-center border rounded-xl bg-white">No stories published yet.</div>
            )}
        </div>
    );
}
