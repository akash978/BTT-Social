import CreatePosts from "./CreatePosts.tsx";
import PostsList from "./PostsList.tsx";
import {useEffect, useState} from "react";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {useProfileStore} from "@/store/useWalletStore.tsx";

const PAGE_SIZE = 4

const PostPage = () => {
    const {posts, postsCount, setPosts, setPostCount} = usePostsStore()
    const [isLoadingPosts, setIsLoadingPosts] = useState(true)
    const [lastPostIndex, setLastPostIndex] = useState(0)
    const {wallet, hasProvider, isConnecting, connectMetaMask} = useMetaMask()
    const {contractR, contractW} = useProfileStore()

    const getPostsInfo = async ({from, to, initialState}: { from: number, to: number, initialState: any }) => {
        setIsLoadingPosts(true);
        try {
            const arr = await Promise.all([...Array(from - to + 1)].map(async (_, index) => {
                const i = from - index;
                if (i > 0) {
                    try {
                        const [txPostInfo, txPostLikesCount, txPostTotalDonations, txPostIsLiked] = await Promise.all([
                            contractR?.get_post_info(i),
                            contractR?.likes_count_of_post(i),
                            contractR?.get_post_donations(i),
                            wallet?.accounts.length > 0 ? contractR?.is_post_liked_by(i, wallet.accounts[0]) : false
                        ]);
                        const txPostAuthor = await contractR?.get_user_info(txPostInfo?.author)
                        return {
                            ...txPostInfo,
                            author: {...txPostAuthor, id: txPostInfo?.author},
                            likesCount: parseInt(txPostLikesCount),
                            isLiked: txPostIsLiked,
                            donations: parseFloat(txPostTotalDonations),
                            id: i
                        };
                    } catch (e) {
                        console.log(e);
                        return null;
                    }
                } else return null
            }));
            const filteredArr = arr.filter(item => item !== null);
            setLastPostIndex(to);
            setPosts([...initialState, ...filteredArr]);
            setIsLoadingPosts(false);
        } catch (e) {
            console.log(e);
        }
    };

    const handlerShowMore = async () => {
        const lastIndex = Number(lastPostIndex) >= PAGE_SIZE ? (Number(lastPostIndex) - PAGE_SIZE) : 1
        if ((lastPostIndex - 1) > 0)
            await getPostsInfo({from: Math.max(1, lastPostIndex - 1), to: lastIndex, initialState: posts})
    }

    const getPostsCount = async (): Promise<void> => {
        setIsLoadingPosts(true)
        try {
            setIsLoadingPosts(true)
            const count = await contractR!.posts_count();
            setPostCount(parseInt(count))
            setIsLoadingPosts(false)
        } catch (error) {
            console.error('Error:', error);
            setIsLoadingPosts(false)
        }
    }

    useEffect(() => {
        if (contractR)
            setTimeout(() => {
                getPostsCount()
            }, 1000)
    }, [wallet, contractR])

    useEffect(() => {
        if (postsCount !== 0 && posts?.length === 0) {
            setPosts([])
            const lastIndex = Number(postsCount) >= PAGE_SIZE ? (Number(postsCount) - PAGE_SIZE) : 0
            getPostsInfo({from: postsCount, to: Math.min(lastIndex + 1, postsCount), initialState: []})
        }
    }, [postsCount]);

    useEffect(() => {
        setPosts([])
    }, []);

    return (
        <>
            <CreatePosts/>
            <PostsList lastPostIndex={lastPostIndex} handlerShowMore={handlerShowMore} isLoadingPosts={isLoadingPosts}/>
        </>
    );
}

export default PostPage;
