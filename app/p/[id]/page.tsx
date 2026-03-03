import { insforge } from '@/lib/insforge';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Comments from '@/components/Comments';
import LikeButton from '@/components/LikeButton';
import ShareButtons from '@/components/ShareButtons';
import { estimateReadingTime, sanitizeHtml } from '@/types';

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
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl text-[#6b6b6b] mb-4">Post not found.</h2>
                <Link href="/" className="text-[#c9a84c] underline font-medium">Go home</Link>
            </div>
        );
    }

    // Get like count
    const { count: likeCount } = await insforge.database
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

    const readingTime = estimateReadingTime(post.content || '');
    const safeContent = sanitizeHtml(post.content || '');

    return (
        <article className="max-w-3xl mx-auto px-6 py-12">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: string) => (
                        <Link
                            key={tag}
                            href={`/explore?topic=${encodeURIComponent(tag)}`}
                            className="text-[10px] uppercase font-bold tracking-wider text-[#c9a84c] bg-[#c9a84c]/10 border border-[#c9a84c]/20 px-3 py-1 rounded-full hover:bg-[#c9a84c]/20 transition-colors"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-[#f0ece4] font-serif">{post.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between border-y border-[#2a2a2a] py-6 mb-10 gap-4">
                <Link href={`/u/${post.user_id}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a] relative border border-[#2a2a2a]">
                        {post.profiles?.avatar_url ? (
                            <Image src={post.profiles.avatar_url} alt={post.profiles.name || ''} fill className="object-cover" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#6b6b6b] font-bold">
                                {post.profiles?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-lg text-[#f0ece4]">{post.profiles?.name || 'Unknown Author'}</div>
                        <div className="text-sm text-[#6b6b6b]">{post.profiles?.bio || 'Curious writer'}</div>
                    </div>
                </Link>
                <div className="text-sm text-[#6b6b6b] whitespace-nowrap md:text-right">
                    <div>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div className="flex items-center gap-3 mt-1 md:justify-end">
                        <span>{readingTime} min read</span>
                        {post.is_draft && <span className="text-[#c9a84c] font-medium tracking-wide">DRAFT</span>}
                    </div>
                </div>
            </div>

            {post.cover_image_url && (
                <div className="w-full aspect-video rounded-[20px] overflow-hidden mb-12 shadow-md relative">
                    <Image src={post.cover_image_url} alt="Cover" fill className="object-cover" unoptimized />
                </div>
            )}

            <div className="prose-container" dangerouslySetInnerHTML={{ __html: safeContent }} />

            {/* Like + Share Row */}
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-[#2a2a2a]">
                <LikeButton postId={post.id} initialCount={likeCount || 0} />
                <ShareButtons title={post.title} />
            </div>

            <Comments postId={post.id} />
        </article>
    );
}
