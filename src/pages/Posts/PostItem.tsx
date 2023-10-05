import {
    Avatar,
    Badge,
    Box,
    Button,
    Collapse, Divider,
    Flex,
    HStack,
    Image,
    Spinner,
    Stack,
    Text, useColorModeValue,
    useDisclosure,
    useToast,
    WrapItem
} from '@chakra-ui/react'
import CommentsList from "../Comments/CommentsList.tsx";
import {IconHeart, IconHeartFilled, IconMessage} from "@tabler/icons-react";
import CreatePostComment from "../Comments/CreatePostComment.tsx";
import PlaceholderImage from '@/assets/placeholder-image.png'
import CopyButton from "@/components/CopyButton.tsx";
import {formatDate} from "@/utils/formatDate.ts";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {useEffect, useMemo, useState} from "react";
import {PostType} from "./PostsList.tsx";
import {CHAIN_PARAMS, IPFS_URI} from "@/utils/constants.ts";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {useNavigate} from "react-router-dom";
import {ERRORS} from "@/utils/errors.ts";
import {formatShortAddress} from "@/utils/string.ts";

type PostItemProps = {
    postInfo: PostType | undefined
    setSelectedPost: any
}

const PostItem = ({postInfo, setSelectedPost}: PostItemProps) => {
    const toast = useToast()
    const {posts, setPostComments, setIsLikedPost} = usePostsStore()
    const {wallet, hasProvider, isConnecting, connectMetaMask} = useMetaMask()
    const {contractW, contractR} = useProfileStore()
    const {isOpen, onToggle} = useDisclosure()
    const navigate = useNavigate()
    const [isLoadingLike, setIsLoadingLike] = useState(false)
    const [isLoadingPostComments, setIsLoadingPostComments] = useState(false)
    const [postsCommentsCount, setPostsCommentCount] = useState(0)

    const getPostComments = async () => {
        setIsLoadingPostComments(true)
        const arr = []
        try {
            let txPostCommentsCount = await contractR?.get_comments_of_post(postInfo!.id)
            setPostsCommentCount(txPostCommentsCount.length)

            for (let i = 0; i < txPostCommentsCount.length; i++) {
                let commentInfo = await contractR?.get_comment_info(txPostCommentsCount[i])
                const txCommentAuthor = await contractR?.get_user_info(commentInfo?.author)
                arr.push({
                    id: txPostCommentsCount[i], ...commentInfo,
                    author: {...txCommentAuthor, id: commentInfo?.author}
                })
            }

            setPostComments(postInfo?.id, [...arr])
            setIsLoadingPostComments(false)
        } catch (e) {
            setIsLoadingPostComments(false)
        }
    }

    const handlerLikePost = async (): Promise<void> => {
        if (wallet.accounts.length > 0) {
            if (wallet.chainId !== CHAIN_PARAMS.chainId) {
                toast({
                    title: ERRORS.SWITCH_CHAIN_ERROR,
                    description: "",
                    position: 'bottom-right',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
                return
            }

            setIsLoadingLike(true)
            try {
                const tx = await contractW?.add_or_remove_like(postInfo!.id)
                const txRes = await tx.wait();
                setIsLoadingLike(false)
                setIsLikedPost(postInfo?.id, !postInfo?.isLiked)
                setIsLoadingLike(false)
            } catch (e) {
                setIsLoadingLike(false)
                toast({
                    title: 'Error!',
                    description: "",
                    position: 'bottom-right',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
            }
        } else {
            toast({
                title: 'Connect wallet!',
                description: "",
                position: 'bottom-right',
                status: 'error',
                duration: 3000,
                isClosable: true,
                variant: 'subtle'
            })
        }
    }

    const postComments = useMemo(() => posts?.find(item => item?.id === postInfo?.id)?.comments, [posts, postInfo])


    useEffect(() => {
        if (contractR)
            getPostComments()
    }, [contractR]);

    if (!postInfo) return <></>

    return (
        <Box
            w="100%"
            borderWidth="1px"
            rounded="lg"
            shadow="1px 1px 3px rgba(0,0,0,0.3)"
            p={3}
            bg={useColorModeValue('red.50', 'gray.900')}
        >
            <Box w="100%">
                <WrapItem>
                    <Box w="100%">
                        {postInfo?.content !== null && postInfo?.content !== undefined && postInfo?.content !== '' &&
                            <Box
                                w="100%"
                                marginBottom={3} borderRadius="lg" overflow="hidden">
                                <Box
                                    w="100%"
                                    textDecoration="none" _hover={{textDecoration: 'none'}}>
                                    <Image
                                        transform="scale(1.0)"
                                        src={postInfo?.content ? `${IPFS_URI}${postInfo?.content}` : ''}
                                        alt="some text"
                                        objectFit="cover"
                                        width="100%"
                                        height={'300px'}
                                        transition="0.3s ease-in-out"
                                        _hover={{transform: 'scale(1.05)'}}
                                        fallbackSrc={PlaceholderImage}
                                    />
                                </Box>
                            </Box>
                        }
                        <Text noOfLines={3} as="p" fontSize="md" my="2">
                            {postInfo?.text}
                        </Text>
                        <Divider mb={3}/>
                        <Flex justify={'end'}>
                            <Badge
                                bg={useColorModeValue('white', 'gray.800')}
                                variant={'outline'} style={{fontSize: 14, textTransform: 'none'}}>
                                Total tips: {(postInfo?.donations / 10 **18).toFixed(5)} BTT
                            </Badge>
                        </Flex>
                        <Flex gap={2} wrap={'wrap'} align={'center'} justify={'space-between'}>
                            <HStack marginTop="2" spacing="2" display="flex" alignItems="center">
                                <Avatar
                                    cursor={'pointer'}
                                    onClick={() => navigate(`/profile/${postInfo?.author?.id}`)}
                                    borderRadius="full"
                                    boxSize="40px"
                                    src={postInfo?.author?.avatar ? `${IPFS_URI}${postInfo?.author?.avatar}` : ''}
                                />
                                {postInfo &&
                                    <Stack gap={0}>
                                        <Text fontWeight="medium">
                                            <CopyButton
                                                value={postInfo?.author?.id}
                                                str={formatShortAddress(postInfo?.author?.id)}
                                            />
                                        </Text>
                                        {postInfo?.created_timestamp !== undefined &&
                                            <Text fontSize={14}>{formatDate(new Date(parseInt(postInfo?.created_timestamp?.toString()) * 1000))}</Text>
                                        }
                                    </Stack>
                                }
                            </HStack>
                            <Flex align={'center'} gap={3}>
                                <Button
                                    size={'sm'}
                                    isLoading={postComments?.length === 0 && isLoadingPostComments}
                                    onClick={() => setSelectedPost(postInfo)}
                                >
                                    Send tip
                                </Button>
                                {(isLoadingPostComments || postsCommentsCount !== 0) &&
                                    <Button
                                        size={'sm'}
                                        isLoading={postComments?.length === 0 && isLoadingPostComments}
                                        onClick={onToggle}
                                        leftIcon={<IconMessage size={20}/>}
                                    >
                                        ({postsCommentsCount})
                                    </Button>
                                }
                                <Button
                                    size={'sm'}
                                    variant={postInfo?.isLiked ? 'solid' : "outline"}
                                    onClick={handlerLikePost}
                                    isLoading={isLoadingLike}
                                    colorScheme={'red'}
                                    leftIcon={postInfo?.isLiked ? <IconHeartFilled size={20}/> : <IconHeart size={20}/>}
                                >
                                    ({postInfo.likesCount})
                                </Button>
                            </Flex>
                        </Flex>
                    </Box>
                </WrapItem>
            </Box>

            <CreatePostComment postsCommentsCount={postsCommentsCount} setPostsCommentCount={setPostsCommentCount}
                               postInfo={postInfo}/>

            <Collapse in={isOpen} animateOpacity>
                <Box
                    color='white'
                    mt='4'
                    rounded='md'
                    shadow='md'
                >
                    <CommentsList postId={postInfo?.id} postComments={postComments}/>
                </Box>

                {isLoadingPostComments && postComments?.length === 0
                    ? <Flex style={{marginBlock: 10}} justify={'center'} align={'center'}>
                        <Spinner size='lg'/>
                    </Flex>
                    : <>
                    </>
                }
            </Collapse>
        </Box>
    )
}

export default PostItem
