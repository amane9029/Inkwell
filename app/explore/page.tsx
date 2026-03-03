import { insforge } from '@/lib/insforge';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types';
import { TOPICS } from '@/types';
import { Search } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
    title: 'Explore | Inkwell',
    description: 'Discover stories from writers around the world.',
};

export default async function ExplorePage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const topic = typeof searchParams?.topic === 'string' ? searchParams.topic : '';
    const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
    const page = parseInt(typeof searchParams?.page === 'string' ? searchParams.page : '1', 10);
    const perPage = 12;
    const offset = (page - 1) * perPage;

    let query = insforge.database
        .from('posts')
        .select('*, profiles:user_id(name, avatar_url)', { count: 'exact' })
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1);

    if (topic) {
        query = query.contains('tags', [topic]);
    }

    if (q) {
        query = query.ilike('title', `%${q}%`);
    }

    const { data: posts, count } = await query;
    const totalPages = Math.ceil((count || 0) / perPage);

    return (
        <div className="bg-[#0d0d0d] min-h-screen text-[#f0ece4]">
            <div className="max-w-6xl mx-auto px-6 pt-12 pb-24">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Explore</h1>
                    <p className="text-[#6b6b6b] text-lg font-light">Discover stories from writers around the world.</p>
                </div>

                {/* Search Bar */}
                <form action="/explore" method="GET" className="mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b6b]" />
                        <input
                            type="text"
                            name="q"
                            placeholder="Search stories by title..."
                            defaultValue={q}
                            className="w-full pl-12 pr-6 py-3.5 rounded-[16px] bg-[#141414] border border-[#2a2a2a] text-[#f0ece4] placeholder-[#6b6b6b] outline-none focus:border-[#c9a84c] transition-colors"
                        />
                        {topic && <input type="hidden" name="topic" value={topic} />}
                    </div>
                </form>

                {/* Topic Filter */}
                <div className="flex overflow-x-auto space-x-3 pb-6 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 mb-8">
                    <Link
                        href={`/explore${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                        className={`flex-shrink-0 px-5 py-2 rounded-full border text-sm font-medium transition-colors ${!topic ? 'bg-[#c9a84c] text-[#0a0a0a] border-[#c9a84c]' : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#f0ece4] hover:border-[#c9a84c] hover:text-[#c9a84c]'}`}
                    >
                        All
                    </Link>
                    {TOPICS.map(t => (
                        <Link
                            key={t}
                            href={`/explore?topic=${encodeURIComponent(t)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                            className={`flex-shrink-0 px-5 py-2 rounded-full border text-sm font-medium transition-colors ${topic === t ? 'bg-[#c9a84c] text-[#0a0a0a] border-[#c9a84c]' : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#f0ece4] hover:border-[#c9a84c] hover:text-[#c9a84c]'}`}
                        >
                            {t}
                        </Link>
                    ))}
                </div>

                {/* Results */}
                {q && (
                    <p className="text-sm text-[#6b6b6b] mb-8">
                        {count || 0} result{count !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;{topic ? ` in ${topic}` : ''}
                    </p>
                )}

                {posts && posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post: Post) => (
                            <article key={post.id} className="group flex flex-col bg-[#141414] border border-[#2a2a2a] rounded-[16px] overflow-hidden hover:border-[#c9a84c] hover:-translate-y-1 hover:shadow-xl hover:shadow-[#000]/60 transition-all duration-300 h-full">
                                <Link href={`/p/${post.id}`} className="block relative h-[200px] bg-[#0a0a0a] overflow-hidden border-b border-[#2a2a2a]">
                                    {post.cover_image_url ? (
                                        <Image src={post.cover_image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-[1s] ease-out opacity-70 group-hover:opacity-100" unoptimized />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
                                            <svg className="w-8 h-8 text-[#2a2a2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="absolute top-4 left-4 bg-[#0a0a0a]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider text-[#c9a84c] border border-[#c9a84c]/30">
                                            {post.tags[0]}
                                        </div>
                                    )}
                                </Link>
                                <div className="p-8 flex flex-col flex-1">
                                    <Link href={`/p/${post.id}`} className="block mb-6 flex-1">
                                        <h4 className="text-xl font-serif font-bold leading-tight mb-3 text-[#f0ece4] group-hover:text-[#c9a84c] transition-colors line-clamp-2">
                                            {post.title}
                                        </h4>
                                    </Link>
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#2a2a2a]">
                                        <Link href={`/u/${post.user_id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1a1a1a] relative">
                                                {post.profiles?.avatar_url ? (
                                                    <Image src={post.profiles.avatar_url} alt="" fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#6b6b6b] text-xs font-bold">
                                                        {post.profiles?.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium text-sm text-[#6b6b6b]">{post.profiles?.name || 'Unknown'}</span>
                                        </Link>
                                        <span className="text-xs text-[#6b6b6b] uppercase tracking-wider">
                                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border border-[#2a2a2a] rounded-[20px] bg-[#141414]">
                        <h3 className="text-2xl font-serif mb-3 text-[#f0ece4]">No stories found</h3>
                        <p className="mb-8 text-[#6b6b6b] font-light">{q ? `No results for "${q}".` : 'Be the first to share your thoughts.'}</p>
                        <Link href="/new" className="bg-[#c9a84c] text-[#0a0a0a] px-8 py-3 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-all inline-block">
                            Start writing
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-16">
                        {page > 1 && (
                            <Link
                                href={`/explore?page=${page - 1}${topic ? `&topic=${encodeURIComponent(topic)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                                className="px-6 py-2.5 rounded-[16px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors text-sm font-medium"
                            >
                                ← Previous
                            </Link>
                        )}
                        <span className="text-[#6b6b6b] text-sm">Page {page} of {totalPages}</span>
                        {page < totalPages && (
                            <Link
                                href={`/explore?page=${page + 1}${topic ? `&topic=${encodeURIComponent(topic)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                                className="px-6 py-2.5 rounded-[16px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors text-sm font-medium"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
