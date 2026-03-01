import { insforge } from '@/lib/insforge';
import { Metadata } from 'next';
import Link from 'next/link';
import Comments from '@/components/Comments';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data: post } = await insforge.database.from('posts').select('title, cover_image_url').eq('id', id).single();
    return {
        title: post ? `${post.title} | Inkwell` : 'Post | Inkwell',
        openGraph: {
            images: post?.cover_image_url ? [post.cover_image_url] : [],
        }
    };
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: post, error } = await insforge.database
        .from('posts')
        .select('*, profiles(name, avatar_url, bio)')
        .eq('id', id)
        .single();

    if (error || !post) {
        return <div className="text-center py-20 text-2xl text-gray-500">Post not found. <Link href="/" className="underline text-[#2c2c2f]">Go home</Link></div>;
    }

    return (
        <article className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-[#2c2c2f]">{post.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-gray-300 py-6 mb-10 gap-4">
                <Link href={`/u/${post.user_id}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {post.profiles?.avatar_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.profiles.avatar_url} alt={post.profiles.name} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-lg text-gray-900">{post.profiles?.name || 'Unknown Author'}</div>
                        <div className="text-sm text-gray-500">{post.profiles?.bio || 'Curious writer'}</div>
                    </div>
                </Link>
                <div className="text-sm text-gray-500 whitespace-nowrap md:text-right">
                    <div>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div>{post.is_draft ? <span className="text-amber-500 font-medium tracking-wide">DRAFT</span> : null}</div>
                </div>
            </div>

            {post.cover_image_url && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-12 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                </div>
            )}

            <div className="prose-container" dangerouslySetInnerHTML={{ __html: post.content }} />

            <Comments postId={post.id} />
        </article>
    );
}
