import {create} from 'zustand'
import {PostType} from "@/pages/Posts/PostsList.tsx";
import {UserType} from "@/pages/Users/Users.tsx";

export type PostCommentType = {
    author: UserType,
    created_timestamp: BigInt,
    text: string,
    donations?: number,
    id: string
}

interface PostStore {
    posts: Array<PostType | undefined>
    postsCount: number,
    setPostComments: (id: any, com: PostCommentType[]) => void
    addPostComment: (id: any, com: PostCommentType) => void
    setIsLikedPost: (postId: any, status: boolean) => void
    addPostDonations: (postId: any, amount: number) => void
    setPostCount: (p: any) => void
    setPosts: (p: Array<PostType | null>) => void
    addPosts: (p: PostType[]) => void
    addPost: (p: PostType) => void
}

export const usePostsStore = create<PostStore>()((set) => ({
    posts: [],
    postsCount: 0,
    setPostCount: (p) => set(() => ({
        postsCount: p
    })),
    setPostComments: (id, com) => set((state) => ({
        posts: state!.posts!.map(item => item?.id === id ? {
            ...item!,
            comments: com,
        } : item)
    })),
    addPostComment: (id, com) => set((state) => ({
        posts: state!.posts!.map(item => item?.id === id ? {
            ...item!,
            comments: [com, ...item!.comments!],
        } : item)
    })),
    addPostDonations: (id, amount) => set((state) => ({
        posts: state!.posts!.map(item => item?.id === id ? {
            ...item!,
            donations: (item?.donations ?? 0) + amount,
        } : item)
    })),
    setIsLikedPost: (postId, status) => set((state) => ({
        posts: state!.posts!.map(item => item?.id === postId ? {
            ...item!,
            isLiked: status,
            likesCount: !status ? item!.likesCount - 1 : item!.likesCount + 1
        } : item)
    })),
    setPosts: (p) => set(() => ({
        posts: p?.map(item => item !== null ? ({...item!, comments: []}) : undefined),
        postsCount: p?.length
    })),
    addPosts: (p) => set((state) => ({
        postsCount: state?.postsCount + 1,
        posts: [...state.posts, ...p.map(item => ({...item, comments: [], donations: 0}))]
    })),
    addPost: (p) => set((state) => ({
        posts: [{...p, comments: [], donations: 0}, ...state.posts]
    })),
}))