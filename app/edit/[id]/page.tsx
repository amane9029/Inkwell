'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostEditor from '@/components/PostEditor';
import { insforge } from '@/lib/insforge';
import { useUser } from '@insforge/nextjs';
import { EditorSkeleton } from '@/components/Skeletons';
import Link from 'next/link';

interface EditablePost {
    id: string;
    title: string;
    content: string;
    cover_image_url?: string;
    cover_image_key?: string;
    is_draft: boolean;
    tags: string[];
    user_id: string;
}

export default function EditPost() {
    const { id } = useParams();
    const { user, isLoaded } = useUser();
    const [post, setPost] = useState<EditablePost | null>(null);
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        if (id && isLoaded) {
            insforge.database.from('posts').select('*').eq('id', id).single().then(({ data, error }) => {
                if (error || !data) {
                    setLoading(false);
                    return;
                }
                // Ownership check
                if (user && data.user_id !== user.id) {
                    setUnauthorized(true);
                    setLoading(false);
                    return;
                }
                setPost(data);
                setLoading(false);
            });
        }
    }, [id, user, isLoaded]);

    if (loading) return <EditorSkeleton />;

    if (unauthorized) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl text-[#f0ece4] mb-4 font-serif">Unauthorized</h2>
                <p className="text-[#6b6b6b] mb-6">You can only edit your own posts.</p>
                <Link href="/dashboard" className="text-[#c9a84c] underline font-medium">Go to Dashboard</Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl text-[#6b6b6b] mb-4">Post not found.</h2>
                <Link href="/dashboard" className="text-[#c9a84c] underline font-medium">Go to Dashboard</Link>
            </div>
        );
    }

    return <PostEditor initialPost={post} />;
}
