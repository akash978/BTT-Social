import {Fragment, useEffect, useState} from "react";
import {
    Alert,
    AlertIcon,
    AlertTitle, Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Spinner,
    Stack,
    useToast
} from "@chakra-ui/react";
import {PostCommentType, usePostsStore} from "@/store/usePostsStore.tsx";
import PostItem from "./PostItem.tsx";
import {BigNumber, ethers} from "ethers";
import {UserType} from "@/pages/Users/Users.tsx";
import {useForm} from "react-hook-form";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {CHAIN_PARAMS} from "@/utils/constants.ts";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {ERRORS} from "@/utils/errors.ts";

export type PostType = {
    likesCount: number,
    comments: PostCommentType[],
    isLiked: boolean,
    author: UserType,
    content: string
    donations: number,
    created_timestamp: BigNumber
    id: number
    text: string
}

type PostsListProps = {
    isLoadingPosts: boolean,
    lastPostIndex: number,
    handlerShowMore: () => void
}

const PostsList = ({isLoadingPosts, handlerShowMore, lastPostIndex}: PostsListProps) => {
    const {posts, addPostDonations} = usePostsStore()
    // const [isOpenDonationModal, setIsOpenDonationModal] = useState(false)
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null)
    const {contractR, contractW} = useProfileStore()
    const {wallet} = useMetaMask()
    const toast = useToast()
    const [isLoadingSubmitDonation, setIsLoadingSubmitDonation] = useState(false)

    const {
        setValue,
        handleSubmit,
        reset,
        register,
        formState: {errors},
    } = useForm({
        defaultValues: {
            amount: 0.0001,
        },
    })

    const getWalletBalance = async () => {
        const customHttpProvider = new ethers.providers.JsonRpcProvider(CHAIN_PARAMS.rpcUrls[0]);
        const balanceBN = await customHttpProvider?.getBalance(wallet.accounts[0])
        const balanceRes = (parseFloat(balanceBN?.toString()) / 10 ** 18)
        return balanceRes
    }

    const onSubmitDonation = async (formData: any) => {
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

            const customHttpProvider = new ethers.providers.JsonRpcProvider(CHAIN_PARAMS.rpcUrls[0]);
            const balanceBN = await customHttpProvider?.getBalance(wallet.accounts[0])
            const balanceRes = (parseFloat(balanceBN?.toString()) / 10 ** 18)

            if (Number(balanceRes) < Number(formData.amount)) {
                toast({
                    title: 'Insufficient balance!',
                    description: "",
                    position: 'bottom-right',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
                return
            }

            setIsLoadingSubmitDonation(true)
            try {
                const amountInEther = parseFloat(formData?.amount);
                const amountInWei = ethers.utils.parseUnits(amountInEther.toString(), 'ether');
                const tx = await contractW?.send_tip(selectedPost?.id, {
                    value: amountInWei
                })
                await tx.wait();
                setIsLoadingSubmitDonation(false)
                setSelectedPost(null)
                addPostDonations(selectedPost?.id, Number(amountInWei))
                toast({
                    title: 'Send Tip Successfully!',
                    description: "",
                    position: 'bottom-right',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
            } catch (e) {
                setIsLoadingSubmitDonation(false)
                console.log(e)
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
        if (selectedPost === null) {
            reset({
                amount: 0
            })
        }
    }, [selectedPost]);

    return (
        <Stack style={{marginBottom: 20}}>
            <Modal size={'sm'} isOpen={selectedPost !== null} onClose={() => setSelectedPost(null)}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Send tip (BTT)</ModalHeader>
                    <ModalCloseButton/>
                    <form onSubmit={handleSubmit(onSubmitDonation)}>
                        <ModalBody>
                            <FormControl
                                isInvalid={!!errors.amount}
                                mr="5%"
                            >
                                <NumberInput
                                    step={5} defaultValue={15} min={10} max={30}
                                    clampValueOnBlur={false}
                                >
                                    <NumberInputField
                                        id="amount"
                                        placeholder="Amount"
                                        {...register('amount', {
                                            required: 'This is required',
                                            min: {
                                                value: 0.0001,
                                                message: `Value must be greater than or equal to 0.0001`,
                                            },
                                        })}
                                    />
                                </NumberInput>

                                <FormErrorMessage>
                                    {errors.amount && errors.amount.message}
                                </FormErrorMessage>
                            </FormControl>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                type={'button'}
                                mr={3}
                                onClick={() => setSelectedPost(null)}
                            >
                                Close
                            </Button>
                            <Button
                                isLoading={isLoadingSubmitDonation}
                                type={'submit'}
                                colorScheme={'red'}
                            >Donate</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {isLoadingPosts && (posts?.length === 0) &&
                <Flex justify={'center'} align={'center'}>
                    <Spinner size='lg'/>
                </Flex>
            }

            {posts?.length !== 0 &&
                posts.map((item, index) =>
                    <Box my={3} key={item?.id}>
                        <PostItem setSelectedPost={setSelectedPost} postInfo={item}/>
                    </Box>
                )
            }

            {posts?.length === 0 && !isLoadingPosts &&
                <Alert status='info'>
                    <Stack>
                        <Flex>
                            <AlertIcon/>
                            <AlertTitle>No posts</AlertTitle>
                        </Flex>
                    </Stack>.
                </Alert>
            }
            {(posts?.length !== 0) && (lastPostIndex > 1) &&
                <Button isLoading={isLoadingPosts} onClick={handlerShowMore}>
                    Show more
                </Button>
            }
        </Stack>
    );
}

export default PostsList;