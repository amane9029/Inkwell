export function PostCardSkeleton() {
    return (
        <div className="flex flex-col bg-[#141414] border border-[#2a2a2a] rounded-[16px] overflow-hidden h-full animate-pulse">
            <div className="h-[200px] skeleton" />
            <div className="p-8 flex flex-col flex-1">
                <div className="h-6 skeleton mb-3 w-3/4" />
                <div className="h-4 skeleton mb-2 w-full" />
                <div className="h-4 skeleton w-2/3" />
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#2a2a2a]">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full skeleton" />
                        <div className="h-3 skeleton w-20" />
                    </div>
                    <div className="h-3 skeleton w-16" />
                </div>
            </div>
        </div>
    );
}

export function FeaturedSkeleton() {
    return (
        <div className="flex flex-col md:flex-row bg-[#1a1a1a] rounded-[20px] overflow-hidden border-l-4 border-l-[#c9a84c] animate-pulse">
            <div className="w-full md:w-[55%] p-10 md:p-14 flex flex-col justify-center space-y-6">
                <div className="h-3 skeleton w-40" />
                <div className="h-10 skeleton w-3/4" />
                <div className="h-4 skeleton w-full" />
                <div className="h-4 skeleton w-2/3" />
                <div className="h-4 skeleton w-24" />
            </div>
            <div className="w-full md:w-[45%] h-64 md:h-auto skeleton" />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="w-32 h-32 rounded-full skeleton mx-auto md:mx-0" />
            <div className="h-8 skeleton w-48" />
            <div className="h-4 skeleton w-full" />
            <div className="h-4 skeleton w-2/3" />
        </div>
    );
}

export function CommentSkeleton() {
    return (
        <div className="pb-6 border-b border-[#2a2a2a] animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div>
                    <div className="h-4 skeleton w-24 mb-1" />
                    <div className="h-3 skeleton w-16" />
                </div>
            </div>
            <div className="h-4 skeleton w-full mb-2" />
            <div className="h-4 skeleton w-3/4" />
        </div>
    );
}

export function EditorSkeleton() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
            <div className="h-64 md:h-96 skeleton rounded-[20px] mb-8" />
            <div className="h-12 skeleton w-2/3 mb-8" />
            <div className="h-12 skeleton rounded-[16px] mb-8" />
            <div className="h-96 skeleton" />
        </div>
    );
}
