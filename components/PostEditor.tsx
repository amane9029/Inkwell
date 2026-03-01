'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { insforge } from '@/lib/insforge';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@insforge/nextjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PostEditor({ initialPost }: { initialPost?: any }) {
    const { user } = useUser();
    const router = useRouter();
    const [title, setTitle] = useState(initialPost?.title || '');
    const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.cover_image_url || '');
    const [coverImageKey, setCoverImageKey] = useState(initialPost?.cover_image_key || '');
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: initialPost?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-800',
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
                const { data } = await insforge.storage.from('images').uploadAuto(file);
                if (data?.url) {
                    editor?.chain().focus().setImage({ src: data.url }).run();
                }
            }
        };
        input.click();
    }, [editor]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingCover(true);
        const { data } = await insforge.storage.from('images').uploadAuto(file);
        if (data?.url) {
            setCoverImageUrl(data.url);
            setCoverImageKey(data.key);
        }
        setIsUploadingCover(false);
    };

    const savePost = async (isDraft: boolean) => {
        if (!user) return;
        setIsSaving(true);

        // Ensure profile exists. Use select to avoid unique error if we inserted it
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
        };

        let postId = initialPost?.id;
        if (postId) {
            await insforge.database.from('posts').update(postData).eq('id', postId);
        } else {
            const { data } = await insforge.database.from('posts').insert(postData).select().single();
            if (data) postId = data.id;
        }
        setIsSaving(false);

        if (!isDraft && postId) {
            router.push(`/p/${postId}`);
        } else {
            router.push('/dashboard');
        }
    };

    if (!editor) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="relative w-full h-64 md:h-96 bg-gray-200 mb-8 rounded-lg overflow-hidden border border-gray-300 group flex items-center justify-center">
                {coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover relative z-0" />
                ) : (
                    <div className="flex flex-col items-center text-gray-500 relative z-0">
                        <Camera className="w-12 h-12 mb-2" />
                        <span>Add a cover image</span>
                    </div>
                )}
                <label className="absolute inset-0 z-10 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all">
                    <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-6 py-3 rounded-full font-medium shadow-lg flex items-center transform scale-95 group-hover:scale-100 transition-all duration-300">
                        {isUploadingCover ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />}
                        {coverImageUrl ? 'Change Cover' : 'Upload Cover'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} />
                </label>
            </div>

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-5xl md:text-6xl font-bold w-full outline-none placeholder-gray-300 text-[#2c2c2f] mb-8 bg-transparent tracking-tight"
            />

            <div className="sticky top-20 z-40 bg-[#f3f4f6]/90 backdrop-blur-md py-3 px-4 rounded-xl border border-gray-200 mb-8 flex space-x-2 shadow-sm">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1.5 rounded font-bold transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-[#2c2c2f]' : 'text-gray-600 hover:bg-gray-100'}`}>B</button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1.5 rounded italic transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-[#2c2c2f]' : 'text-gray-600 hover:bg-gray-100'}`}>I</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1.5 rounded font-serif font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-[#2c2c2f]' : 'text-gray-600 hover:bg-gray-100'}`}>H2</button>
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-3 py-1.5 rounded font-medium transition-colors ${editor.isActive('blockquote') ? 'bg-gray-200 text-[#2c2c2f]' : 'text-gray-600 hover:bg-gray-100'}`}>Quote</button>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>
                <button onClick={insertImage} className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100 font-medium flex items-center transition-colors"><ImageIcon className="w-4 h-4 mr-2" /> Image</button>
            </div>

            <div className="prose-container min-h-[400px]">
                <EditorContent editor={editor} />
            </div>

            <div className="flex justify-end space-x-4 mt-16 py-6 border-t border-gray-300">
                <button
                    onClick={() => savePost(true)}
                    disabled={isSaving}
                    className="text-gray-600 px-6 py-2.5 rounded-full font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Save Draft
                </button>
                <button
                    onClick={() => savePost(false)}
                    disabled={isSaving}
                    className="bg-[#2c2c2f] text-white px-8 py-2.5 rounded-full font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Publish
                </button>
            </div>
        </div>
    );
}
