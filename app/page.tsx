import { insforge } from '@/lib/insforge';
import Link from 'next/link';
import { auth } from '@insforge/nextjs/server';
import Hero from '@/components/Hero';
import Image from 'next/image';
import type { Post } from '@/types';
import { TOPICS } from '@/types';

export const revalidate = 60;

export default async function Home(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { user } = await auth().catch(() => ({ user: null }));
  const searchParams = await props.searchParams;
  const feed = searchParams?.feed || 'explore';
  const topic = typeof searchParams?.topic === 'string' ? searchParams.topic : '';
  const page = parseInt(typeof searchParams?.page === 'string' ? searchParams.page : '1', 10);
  const showFollowing = feed === 'following' && user;
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

  if (showFollowing && user) {
    const { data: follows } = await insforge.database.from('follows').select('following_id').eq('follower_id', user.id);
    const followingIds = follows?.map(f => f.following_id) || [];
    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds);
    } else {
      query = query.in('user_id', ['00000000-0000-0000-0000-000000000000']);
    }
  }

  const { data: posts, count } = await query;
  const totalPages = Math.ceil((count || 0) / perPage);

  return (
    <div className="bg-[#0d0d0d] min-h-screen font-sans selection:bg-[#c9a84c]/20 text-[#f0ece4] flex flex-col">

      {/* HERO SECTION */}
      <Hero />

      {/* Tabs / Filters */}
      <div className="max-w-6xl mx-auto w-full px-6 pt-16 pb-8">
        <div className="flex space-x-8 border-b border-[#2a2a2a]">
          <Link href="/" className={`pb-4 text-sm font-semibold tracking-wide transition-colors ${!showFollowing ? 'border-b-2 border-[#c9a84c] text-[#f0ece4]' : 'text-[#6b6b6b] hover:text-[#f0ece4]'}`}>Explore</Link>
          {user && (
            <Link href="/?feed=following" className={`pb-4 text-sm font-semibold tracking-wide transition-colors ${showFollowing ? 'border-b-2 border-[#c9a84c] text-[#f0ece4]' : 'text-[#6b6b6b] hover:text-[#f0ece4]'}`}>For You</Link>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1" id="explore">
        {!posts && (
          <div className="py-20 text-center text-[#6b6b6b] text-lg font-light animate-pulse">Loading amazing stories...</div>
        )}
        {posts?.length === 0 && (
          <div className="py-24 text-center border border-[#2a2a2a] rounded-[20px] bg-[#141414]">
            <h3 className="text-2xl font-serif mb-3 text-[#f0ece4]">No stories yet</h3>
            <p className="mb-8 text-[#6b6b6b] font-light">{showFollowing ? "People you follow haven't posted." : "Be the first to share your thoughts with the world."}</p>
            <Link href="/new" className="bg-[#c9a84c] text-[#0a0a0a] px-8 py-3 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-all inline-block">
              Start writing
            </Link>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="space-y-24">
            {/* SECTION 1: Featured Story */}
            <section>
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-8">Featured</h2>
              <Link href={`/p/${posts[0].id}`} className="group block">
                <div className="flex flex-col md:flex-row bg-[#1a1a1a] rounded-[20px] relative overflow-hidden transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#000]/50 border-l-4 border-l-[#c9a84c]">
                  <div className="w-full md:w-[55%] p-10 md:p-14 flex flex-col justify-center relative z-10">
                    <div className="flex items-center space-x-3 text-xs text-[#6b6b6b] mb-6 font-medium uppercase tracking-wider">
                      <span>{(posts[0] as Post).profiles?.name || 'Unknown Writer'}</span>
                      <span>·</span>
                      <span>{new Date(posts[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold leading-[1.15] mb-6 text-[#f0ece4] group-hover:text-[#c9a84c] transition-colors">
                      {posts[0].title}
                    </h3>
                    <span className="text-[#c9a84c] font-semibold text-sm uppercase tracking-widest flex items-center">
                      Read Story <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </span>
                  </div>
                  <div className="w-full md:w-[45%] h-64 md:h-auto bg-[#111] relative overflow-hidden rounded-r-[20px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-transparent to-transparent z-10 md:block hidden"></div>
                    {posts[0].cover_image_url ? (
                      <Image src={posts[0].cover_image_url} alt={posts[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100" unoptimized />
                    ) : (
                      <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                        <svg className="w-12 h-12 text-[#2a2a2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </section>

            {/* SECTION 2: Latest Stories Grid */}
            {posts.length > 1 && (
              <section>
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-8">Latest Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.slice(1).map((post: Post) => (
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
              </section>
            )}

            {/* SECTION 3: TOPICS / TAGS ROW */}
            <section className="py-2">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-8">Explore Topics</h2>
              <div className="flex overflow-x-auto space-x-3 pb-4 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0">
                <Link
                  href="/"
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full border text-sm font-medium transition-colors ${!topic ? 'bg-[#c9a84c] text-[#0a0a0a] border-[#c9a84c]' : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#f0ece4] hover:border-[#c9a84c] hover:text-[#c9a84c]'}`}
                >
                  All
                </Link>
                {TOPICS.map(t => (
                  <Link
                    key={t}
                    href={`/?topic=${encodeURIComponent(t)}`}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-full border text-sm font-medium transition-colors ${topic === t ? 'bg-[#c9a84c] text-[#0a0a0a] border-[#c9a84c]' : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#f0ece4] hover:border-[#c9a84c] hover:text-[#c9a84c]'}`}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </section>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <section className="flex justify-center items-center space-x-4 pb-8">
                {page > 1 && (
                  <Link
                    href={`/?page=${page - 1}${topic ? `&topic=${encodeURIComponent(topic)}` : ''}${feed === 'following' ? '&feed=following' : ''}`}
                    className="px-6 py-2.5 rounded-[16px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors text-sm font-medium"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="text-[#6b6b6b] text-sm">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link
                    href={`/?page=${page + 1}${topic ? `&topic=${encodeURIComponent(topic)}` : ''}${feed === 'following' ? '&feed=following' : ''}`}
                    className="px-6 py-2.5 rounded-[16px] border border-[#2a2a2a] text-[#6b6b6b] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors text-sm font-medium"
                  >
                    Next →
                  </Link>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* WHY INKWELL SECTION */}
      <div className="w-full px-6 mb-24 mt-12 mx-auto" style={{ maxWidth: '1400px' }}>
        <section className="bg-[#111111] rounded-[32px] py-24 px-8 lg:px-16 overflow-hidden max-w-6xl mx-auto border border-[#2a2a2a]/30">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#f0ece4] mb-4">Built for Writers.</h2>
            <p className="text-[#6b6b6b] text-lg font-light max-w-xl mx-auto">Everything you need to create, connect, and thrive in a space that respects your words.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] rounded-[20px] p-10 hover:border-t-[#c9a84c] border-t-[3px] border-t-transparent transition-all duration-300 group shadow-lg shadow-[#000]/20">
              <div className="w-10 h-10 rounded-[12px] bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center mb-6 border border-[#c9a84c]/20">
                <span className="text-xl">✎</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-[#f0ece4]">Write Freely</h3>
              <p className="text-[#6b6b6b] font-light leading-relaxed text-sm">
                A distraction-free editor designed to help you focus.
                No clunky toolbars. Just you and your words.
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-[20px] p-10 hover:border-t-[#c9a84c] border-t-[3px] border-t-transparent transition-all duration-300 group shadow-lg shadow-[#000]/20">
              <div className="w-10 h-10 rounded-[12px] bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center mb-6 border border-[#c9a84c]/20">
                <span className="text-xl">☺</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-[#f0ece4]">Build an Audience</h3>
              <p className="text-[#6b6b6b] font-light leading-relaxed text-sm">
                Connect with readers who care about your niche.
                Grow through genuine engagement, not gaming algorithms.
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-[20px] p-10 hover:border-t-[#c9a84c] border-t-[3px] border-t-transparent transition-all duration-300 group shadow-lg shadow-[#000]/20">
              <div className="w-10 h-10 rounded-[12px] bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center mb-6 border border-[#c9a84c]/20">
                <span className="text-xl">☰</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-[#f0ece4]">Deep Discussions</h3>
              <p className="text-[#6b6b6b] font-light leading-relaxed text-sm">
                Engage through integrated comment threads that
                prioritize meaning over metrics.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] border-t border-[#c9a84c]/20 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <Link href="/" className="flex items-center space-x-3 text-2xl font-serif font-bold tracking-wide mb-10 group">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#c9a84c] flex-shrink-0 group-hover:-translate-y-0.5 transition-transform duration-300">
              <defs>
                <mask id="nib-mask-footer">
                  <rect width="24" height="24" fill="white" />
                  <circle cx="12" cy="13.5" r="1.5" fill="black" />
                  <line x1="12" y1="2" x2="12" y2="13.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                </mask>
              </defs>
              <path d="M12 2 L5 11.5 L7.5 21 Q12 22.5 16.5 21 L19 11.5 Z" fill="currentColor" fillOpacity="0.15" />
              <path d="M12 2 L7 11.5 L9 19 Q12 20 15 19 L17 11.5 Z" fill="currentColor" mask="url(#nib-mask-footer)" />
            </svg>
            <span className="text-[#f0ece4]">Inkwell</span>
          </Link>

          <div className="flex space-x-8 mb-12 text-sm text-[#6b6b6b] uppercase tracking-widest font-medium">
            <Link href="/about" className="hover:text-[#c9a84c] transition-colors">About</Link>
            <Link href="/new" className="hover:text-[#c9a84c] transition-colors">Write</Link>
            <Link href="/privacy" className="hover:text-[#c9a84c] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#c9a84c] transition-colors">Terms</Link>
          </div>

          <p className="text-[#2a2a2a] text-xs font-medium tracking-wider">
            © {new Date().getFullYear()} INKWELL. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
