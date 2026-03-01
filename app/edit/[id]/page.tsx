'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostEditor from '@/components/PostEditor';
import { insforge } from '@/lib/insforge';

interface Post {
    id: string;
    title: string;
    content: string;
    cover_image_url?: string;
    cover_image_key?: string;
    is_draft: boolean;
}

export default function EditPost() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            insforge.database.from('posts').select('*').eq('id', id).single().then(({ data }) => {
                setPost(data);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading editor...</div>;
    if (!post) return <div className="p-10 text-center">Post not found</div>;

    return <PostEditor initialPost={post} />;
}
