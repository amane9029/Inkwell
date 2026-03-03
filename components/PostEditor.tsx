'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { insforge } from '@/lib/insforge';
import { Camera, ImageIcon, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@insforge/nextjs';
import { TOPICS } from '@/types';
import Image from 'next/image';

export default function PostEditor({ initialPost }: { initialPost?: { id?: string; title?: string; content?: string; cover_image_url?: string; cover_image_key?: string; is_draft?: boolean; tags?: string[] } }) {
    const { user } = useUser();
    const router = useRouter();
    const [title, setTitle] = useState(initialPost?.title || '');
    const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.cover_image_url || '');
    const [coverImageKey, setCoverImageKey] = useState(initialPost?.cover_image_key || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialPost?.tags || []);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TiptapImage.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: initialPost?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] text-[#f0ece4]',
            },
        },
    });

    const insertImage = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                try {
                    const { data } = await insforge.storage.from('images').uploadAuto(file);
                    if (data?.url) {
                        editor?.chain().focus().setImage({ src: data.url }).run();
                    }
                } catch {
                    setError('Failed to upload image. Please try again.');
                }
            }
        };
        input.click();
    }, [editor]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingCover(true);
        setError('');
        try {
            const { data } = await insforge.storage.from('images').uploadAuto(file);
            if (data?.url) {
                setCoverImageUrl(data.url);
                setCoverImageKey(data.key);
            }
        } catch {
            setError('Failed to upload cover image.');
        }
        setIsUploadingCover(false);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const savePost = async (isDraft: boolean) => {
        if (!user) return;
        setIsSaving(true);
        setError('');

        try {
            // Ensure profile exists
            const { data: profileExists } = await insforge.database.from('profiles').select('id').eq('id', user.id).single();
            if (!profileExists) {
                await insforge.database.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    name: user.profile?.name || user.email?.split('@')[0],
                    avatar_url: user.profile?.avatar_url
                });
            }

            const postData = {
                title: title || 'Untitled',
                content: editor?.getHTML(),
                cover_image_url: coverImageUrl,
                cover_image_key: coverImageKey,
                is_draft: isDraft,
                user_id: user.id,
                tags: selectedTags,
            };

            let postId = initialPost?.id;
            if (postId) {
                const { error: updateError } = await insforge.database.from('posts').update(postData).eq('id', postId);
                if (updateError) throw updateError;
            } else {
                const { data, error: insertError } = await insforge.database.from('posts').insert(postData).select().single();
                if (insertError) throw insertError;
                if (data) postId = data.id;
            }

            if (!isDraft && postId) {
                router.push(`/p/${postId}`);
            } else {
                router.push('/dashboard');
            }
        } catch {
            setError('Failed to save post. Please try again.');
        }
        setIsSaving(false);
    };

    if (!editor) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            {error && (
                <div className="mb-6 p-4 rounded-[16px] bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Cover Image Upload */}
            <div className="relative w-full h-64 md:h-96 bg-[#141414] mb-8 rounded-[20px] overflow-hidden border border-[#2a2a2a] group flex items-center justify-center">
                {coverImageUrl ? (
                    <Image src={coverImageUrl} alt="Cover" fill className="object-cover relative z-0" unoptimized />
                ) : (
                    <div className="flex flex-col items-center text-[#6b6b6b] relative z-0">
                        <Camera className="w-12 h-12 mb-2" />
                        <span>Add a cover image</span>
                    </div>
                )}
                <label className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 flex items-center justify-center cursor-pointer transition-all">
                    <span className="opacity-0 group-hover:opacity-100 bg-[#1a1a1a] text-[#f0ece4] px-6 py-3 rounded-[16px] font-medium shadow-lg flex items-center border border-[#2a2a2a] transform scale-95 group-hover:scale-100 transition-all duration-300">
                        {isUploadingCover ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />}
                        {coverImageUrl ? 'Change Cover' : 'Upload Cover'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} />
                </label>
            </div>

            {/* Title */}
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-5xl md:text-6xl font-bold w-full outline-none placeholder-[#2a2a2a] text-[#f0ece4] mb-8 bg-transparent tracking-tight"
            />

            {/* Tags */}
            <div className="mb-8">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6b6b6b] mb-3">Topics</p>
                <div className="flex flex-wrap gap-2">
                    {TOPICS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedTags.includes(tag) ? 'bg-[#c9a84c] text-[#0a0a0a] border-[#c9a84c]' : 'bg-[#1a1a1a] text-[#f0ece4] border-[#2a2a2a] hover:border-[#c9a84c] hover:text-[#c9a84c]'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Toolbar */}
            <div className="sticky top-20 z-40 bg-[#141414]/90 backdrop-blur-md py-3 px-4 rounded-[16px] border border-[#2a2a2a] mb-8 flex space-x-2 shadow-lg">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors ${editor.isActive('bold') ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#f0ece4]'}`}>B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1.5 rounded-[8px] italic transition-colors ${editor.isActive('italic') ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#f0ece4]'}`}>I</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1.5 rounded-[8px] font-serif font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#f0ece4]'}`}>H2</button>
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-3 py-1.5 rounded-[8px] font-medium transition-colors ${editor.isActive('blockquote') ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#f0ece4]'}`}>Quote</button>
                <div className="w-px h-6 bg-[#2a2a2a] mx-2 self-center"></div>
                <button onClick={insertImage} className="px-3 py-1.5 rounded-[8px] text-[#6b6b6b] hover:bg-[#1a1a1a] hover:text-[#f0ece4] font-medium flex items-center transition-colors"><ImageIcon className="w-4 h-4 mr-2" /> Image</button>
            </div>

            {/* Editor Content */}
            <div className="prose-container min-h-[400px]">
                <EditorContent editor={editor} />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-16 py-6 border-t border-[#2a2a2a]">
                <button
                    onClick={() => savePost(true)}
                    disabled={isSaving}
                    className="text-[#6b6b6b] px-6 py-2.5 rounded-[16px] font-medium hover:bg-[#1a1a1a] hover:text-[#f0ece4] transition-colors disabled:opacity-50 border border-[#2a2a2a]"
                >
                    Save Draft
                </button>
                <button
                    onClick={() => savePost(false)}
                    disabled={isSaving}
                    className="bg-[#c9a84c] text-[#0a0a0a] px-8 py-2.5 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-colors disabled:opacity-50 flex items-center shadow-lg"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Publish
                </button>
            </div>
        </div>
    );
}
