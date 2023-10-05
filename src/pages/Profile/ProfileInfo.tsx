import {
    Alert,
    AlertIcon,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Center,
    Flex,
    Heading,
    Image,
    Spinner,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    useToast
} from '@chakra-ui/react'
import PostsList from "../Posts/PostsList.tsx";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from 'react'
import {EditIcon} from "@chakra-ui/icons";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import FollowersList from '../Followers/FollowersList.tsx';
import {CHAIN_PARAMS, IPFS_URI} from "@/utils/constants.ts";
import CopyButton from "@/components/CopyButton.tsx";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {UserType} from "@/pages/Users/Users.tsx";
import {ERRORS} from "@/utils/errors.ts";
import {ethers} from 'ethers';
import {formatShortAddress} from "@/utils/string.ts";

type ProfileInfoProps = UserType & {
    followersCount: number
}

const PAGE_SIZE = 4

const ProfileInfo = () => {
    const toast = useToast()
    const {pathname} = useLocation()
    const navigate = useNavigate()
    const {id} = useParams<{
        id: any
    }>()

    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [profile, setProfile] = useState<ProfileInfoProps | null>(null)
    const {posts, postsCount, setPosts, setPostCount} = usePostsStore()
    const [isLoadingPosts, setIsLoadingPosts] = useState(false)
    const [profileFollowers, setProfileFollowers] = useState<Array<UserType & {
        address: string
    }> | null>(null)
    const [isLoadingFetchFollowers, setIsLoadingFetchFollowers] = useState(false)
    const [lastPostIndex, setLastPostIndex] = useState(0)
    const [isFollowed, setIsFollowed] = useState(false)
    const [isLoadingFollowStatus, setIsLoadingFollowStatus] = useState(false)
    const [isLoadingFollow, setIsLoadingFollow] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [totalPosts, setTotalPosts] = useState(0)
    const {contractR, contractW} = useProfileStore()
    const {wallet, hasProvider, isConnecting, connectMetaMask} = useMetaMask()
    const [totalDonations, setTotalDonations] = useState(0)
    const [profileErrorText, setProfileErrorText] = useState('')

    const getTotalUserDoantions = async () => {
        try {
            let txUserFollowStatus = await contractR?.get_user_total_donations(id)
            setTotalDonations(parseInt(txUserFollowStatus))
        } catch (e) {
            console.log(e)
        }
    }

    const getFollowStatus = async () => {
        setIsLoadingFollowStatus(true)
        try {
            let txUserFollowStatus = await contractR?.is_user_followed_by(id, wallet?.accounts[0])
            setIsFollowed(txUserFollowStatus)
            setIsLoadingFollowStatus(false)
        } catch (e) {
            console.log(e)
            setIsLoadingFollowStatus(false)
        }
    }

    const getFollowers = async () => {
        setIsLoadingFetchFollowers(true)
        try {
            let txFollowersIds = await contractR?.get_user_followers(id)
            setProfile(({...profile!, followersCount: txFollowersIds!.length}))
            const arr = []
            for (let i = 1; i <= txFollowersIds; i++) {
                try {
                    let txFollowerInfo = await contractR?.get_user_info(id)
                    arr.push({...txFollowerInfo, address: txFollowersIds[i]})
                } catch (e) {
                    console.log(e)
                }
            }
            setIsLoadingFetchFollowers(false)
            setProfileFollowers(arr)
        } catch (e) {
            console.log(e)
            setIsLoadingFetchFollowers(false)
        }
    }

    const getUserInfo = async () => {
        setIsLoadingProfile(true)
        try {
            let userInfo = await contractR?.get_user_info(id)
            let txUserFollowersCount = await contractR?.get_user_followers(id)
            const followersArray = []
            for (let i = 0; i < txUserFollowersCount.length; i++) {
                let followerInfo = await contractR?.get_user_info(txUserFollowersCount[i])
                followersArray.push({address: txUserFollowersCount[i], ...followerInfo})
            }
            setProfileFollowers(followersArray)
            setProfile({...userInfo, followersCount: txUserFollowersCount?.length})
            setIsLoadingProfile(false)
        } catch (e) {
            console.log(e)

            if (e?.toString()?.includes('Unsupported address type')) {
                setErrorMessage('Unsupported address type')
            }

            setIsLoadingProfile(false)
        }
    }

    const getPostsInfo = async ({from, to, initialState}: {
        from: number,
        to: number,
        initialState: any
    }) => {
        setIsLoadingPosts(true)
        try {
            const arr = []

            const postIds: Number[] = []
            for (let i = from; i >= to; i--) {
                const x = await contractR!.get_post_of_user_by_index(id, i);
                postIds.push(parseInt(x))
            }

            for (let i = 0; i < postIds.length; i++) {
                let txPostInfo = await contractR?.get_post_info(postIds[i])
                let txPostLikesCount = await contractR?.likes_count_of_post(postIds[i])
                let txPostIsLiked = false
                if (wallet.accounts.length > 0) {
                    txPostIsLiked = await contractR?.is_post_liked_by(postIds[i], wallet.accounts[0])
                }
                const txPostTotalDonations = await contractR?.get_post_donations(postIds[i])
                const txPostAuthor = await contractR?.get_user_info(id)
                arr.push({
                    ...txPostInfo,
                    id: postIds[i],
                    author: {...txPostAuthor, id: id},
                    likesCount: parseInt(txPostLikesCount),
                    donations: parseFloat(txPostTotalDonations),
                    isLiked: txPostIsLiked
                })
            }
            setLastPostIndex(to);
            setPosts([...initialState, ...arr])
            setIsLoadingPosts(false)
        } catch (e) {
            console.log(e)
            setIsLoadingPosts(false)
        }
    }

    const getPostsCount = async (): Promise<void> => {
        setIsLoadingPosts(true)
        try {
            let tx = await contractR?.posts_count_of_user(id)
            setTotalPosts(parseInt(tx))
            setPostCount(parseInt(tx))
            if (!(parseInt(tx) > 0)) {
                setIsLoadingPosts(false)
            }
        } catch (e) {
            setIsLoadingPosts(false)
            console.log(e)
        }
    }

    const handlerShowMore = async () => {
        const lastIndex = Number(lastPostIndex) >= PAGE_SIZE ? (Number(lastPostIndex) - PAGE_SIZE) : 0
        await getPostsInfo({from: lastPostIndex - 1, to: lastIndex, initialState: posts})
    }

    const handlerFollow = async (): Promise<void> => {
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

            setIsLoadingFollow(true)
            try {
                const tx = await contractW?.follow_or_unfollow(id)
                await tx.wait()
                if (isFollowed)
                    setProfile({...profile!, followersCount: profile?.followersCount! - 1})
                else
                    setProfile({...profile!, followersCount: profile?.followersCount! + 1})
                setIsFollowed(!isFollowed)
                setIsLoadingFollow(false)
            } catch (e) {
                setIsLoadingFollow(false)
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

    useEffect(() => {
        setProfileErrorText('')
    }, [id]);

    useEffect(() => {
        if (id !== null && contractR) {
            try {
                if (!(/^0x([A-Fa-f0-9]{40})$/.test(id))) {
                    setProfileErrorText('Invalid address!')
                    return
                }
                ethers.utils.getAddress(id);
                getFollowers()
                setIsLoadingFetchFollowers(false)
                getTotalUserDoantions()

                if (wallet.accounts?.length > 0) {
                    getFollowStatus()
                }
            } catch (error) {
                setProfileErrorText('Invalid address!')
                console.error(`Invalid address!`);
            }
        }
    }, [wallet, id, contractR]);

    useEffect(() => {
        if (id !== undefined && contractR) {
            try {
                if (!(/^0x([A-Fa-f0-9]{40})$/.test(id))) {
                    setProfileErrorText('Invalid address!')
                    return
                }
                ethers.utils.getAddress(id);
                setTimeout(() => {
                    getPostsCount()
                }, 1000)
            } catch (error) {
                setProfileErrorText('Invalid address!')
                console.error(`Invalid address!`);
            }
        }
    }, [id, contractR])

    useEffect(() => {
        setErrorMessage('')
        setPosts([])
        setPostCount(0)
        setTotalPosts(0)
    }, []);

    useEffect(() => {
        setErrorMessage('')
        setPosts([])
        setPostCount(0)
        setTotalPosts(0)
    }, [pathname, id]);

    useEffect(() => {
        if (totalPosts !== 0 && contractR) {
            setTimeout(() => {
                const lastIndex = Number(totalPosts) >= PAGE_SIZE ? (Number(totalPosts) - PAGE_SIZE) : 0
                getPostsInfo({from: totalPosts - 1, to: lastIndex, initialState: []})
            }, 10)
        }
    }, [totalPosts, contractR]);

    useEffect(() => {
        if (id !== undefined && contractR) {
            try {
                if (!(/^0x([A-Fa-f0-9]{40})$/.test(id))) {
                    setProfileErrorText('Invalid address!')
                    return
                }
                ethers.utils.getAddress(id);
                getUserInfo()
            } catch (error) {
                setProfileErrorText('Invalid address!')
                console.error(`Invalid address!`);
            }
        }
    }, [id, contractR]);

    useEffect(() => {
        if (id !== undefined)
            try {
                if (!(/^0x([A-Fa-f0-9]{40})$/.test(id))) {
                    setProfileErrorText('Invalid address!')
                    return
                }
                ethers.utils.getAddress(id);
            } catch (error) {
                setProfileErrorText('Invalid address!')
                console.error(`Invalid address!`);
            }
    }, [id])

    if (profileErrorText !== '')
        return <Alert mt={30} status='error'>
            <AlertIcon/>
            <AlertTitle>{profileErrorText}</AlertTitle>
        </Alert>

    if (errorMessage !== '')
        return <Alert mt={30} status='error'>
            <AlertIcon/>
            <AlertTitle>{errorMessage}</AlertTitle>
        </Alert>

    return (
        <>
            {isLoadingProfile &&
                <Flex style={{marginBlock: 10}} justify={'center'} align={'center'}>
                    <Spinner size='lg'/>
                </Flex>
            }
            {!isLoadingProfile && profile &&
                <Stack>
                    <Center py={6}>
                        <Box
                            w={'full'}
                            boxShadow={'2xl'}
                            bg={useColorModeValue('red.50', 'gray.900')}
                            rounded={'md'}
                            overflow={'hidden'}
                        >
                            <Image
                                h={'120px'}
                                w={'full'}
                                src={
                                    'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
                                }
                                objectFit="cover"
                                alt="#"
                            />
                            <Flex justify={'center'} mt={-70}>
                                <Avatar
                                    size='2xl'
                                    src={profile?.avatar ? `${IPFS_URI}${profile?.avatar}` : ''}
                                    css={{border: '2px solid white'}}
                                />
                            </Flex>

                            <Box p={6}>
                                <Stack spacing={0} align={'center'}>
                                    <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
                                        {profile?.name}
                                    </Heading>
                                    <Text my={2} color={'gray.500'}>{profile?.bio}</Text>
                                </Stack>

                                <Flex justify={'center'} align={'center'} style={{marginBottom: 5}}>
                                    <CopyButton size={'sm'} str={formatShortAddress(id)} value={id}/>
                                </Flex>


                                <Stack direction={'row'} justify={'center'} spacing={6}>
                                    <Stack spacing={0} align={'center'}>
                                        <Text fontWeight={600}>{profile?.followersCount}</Text>
                                        <Text fontSize={'sm'} color={'gray.500'}>
                                            Followers
                                        </Text>
                                    </Stack>

                                    <Stack spacing={0} align={'center'}>
                                        <Text fontWeight={600}>{totalPosts}</Text>
                                        <Text fontSize={'sm'} color={'gray.500'}>
                                            Posts
                                        </Text>
                                    </Stack>

                                    <Stack spacing={0} align={'center'}>
                                        <Text fontWeight={600}>{(totalDonations / 10 ** 18).toFixed(4)} BTT</Text>
                                        <Text fontSize={'sm'} color={'gray.500'}>
                                            Donations received
                                        </Text>
                                    </Stack>
                                </Stack>

                                {wallet.accounts?.length > 0 && wallet.accounts[0]?.toLowerCase() === id?.toLowerCase() && hasProvider &&
                                    <Button
                                        rightIcon={<EditIcon/>}
                                        w={'full'}
                                        mt={8}
                                        bg={useColorModeValue('#151f21', 'gray.900')}
                                        color={'white'}
                                        rounded={'md'}
                                        onClick={() => navigate('/profile/edit')}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}
                                    >
                                        Edit
                                    </Button>
                                }

                                {wallet.accounts?.length > 0 && wallet.accounts[0]?.toLowerCase() !== id?.toLowerCase() && hasProvider &&
                                    <Button
                                        w={'full'}
                                        mt={8}
                                        border={'1px solid '}
                                        isLoading={isLoadingFollow || isLoadingFollowStatus}
                                        bg={
                                            isFollowed ? useColorModeValue('#151f21', 'gray.900') : useColorModeValue('#2c3c41', 'gray.900')
                                        }
                                        color={'white'}
                                        rounded={'md'}
                                        onClick={handlerFollow}
                                        _hover={{
                                            transform: 'translateY(-2px)',
                                            boxShadow: 'lg',
                                        }}
                                    >
                                        {isFollowed ? 'Unfollow' : 'Follow'}
                                    </Button>
                                }
                            </Box>
                        </Box>
                    </Center>

                    <Tabs defaultIndex={1} variant='soft-rounded' colorScheme={'red'}>
                        <TabList>
                            <Tab>Followers</Tab>
                            <Tab>Posts</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                {isLoadingFetchFollowers &&
                                    <Flex justify={'center'} align={'center'}>
                                        <Spinner size='lg'/>
                                    </Flex>
                                }

                                {profileFollowers?.length === 0 && !isLoadingFetchFollowers &&
                                    <Alert status='info'>
                                        <Stack>
                                            <Flex>
                                                <AlertIcon/>
                                                <AlertTitle>No followers</AlertTitle>
                                            </Flex>
                                        </Stack>
                                    </Alert>
                                }

                                {profileFollowers?.length !== 0 &&
                                    <Box
                                        w={'full'}
                                        bg={useColorModeValue('white', 'gray.800')}
                                        boxShadow={'2xl'}
                                        rounded={'md'}
                                        p={3}
                                        overflow={'hidden'}
                                    >
                                        <FollowersList followers={profileFollowers}/>
                                    </Box>
                                }
                            </TabPanel>
                            <TabPanel>
                                <PostsList
                                    lastPostIndex={lastPostIndex}
                                    isLoadingPosts={isLoadingPosts}
                                    handlerShowMore={handlerShowMore}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Stack>
            }
        </>
    )
}

export default ProfileInfo