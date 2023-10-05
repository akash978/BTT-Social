import {useState} from "react";
import {useForm} from "react-hook-form";
import {Box, Button, Flex, FormControl, FormErrorMessage, Input, useColorModeValue, useToast} from "@chakra-ui/react";
import {IconSend} from "@tabler/icons-react";
import {PostType} from "@/pages/Posts/PostsList.tsx";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {CHAIN_PARAMS} from "@/utils/constants.ts";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {ERRORS} from "@/utils/errors.ts";

type FormTypes = {
    message: string
}

type CreatePostCommentProps = {
    postsCommentsCount: any,
    setPostsCommentCount: any,
    postInfo: PostType
}

const CreatePostComment = ({postInfo, postsCommentsCount, setPostsCommentCount}: CreatePostCommentProps) => {
    const toast = useToast()
    const {wallet, hasProvider, isConnecting, connectMetaMask} = useMetaMask()
    const {addPostComment, setPostComments} = usePostsStore()
    const [isLoadingCreateComment, setIsLoadingCreateComment] = useState(false)
    const {contractR, contractW} = useProfileStore()
    const {profile} = useProfileStore()

    const {
        setValue,
        handleSubmit,
        register,
        formState: {errors},
    } = useForm<FormTypes>({
        defaultValues: {message: ''},
    })

    const onSubmitCreateComment = async (formData: FormTypes): Promise<void> => {
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

            setIsLoadingCreateComment(true)
            try {
                const tx = await contractW?.add_comment(postInfo?.id, formData?.message)
                const res = await tx.wait();
                const event = res.events.find((event: any) => event.event === 'NewComment');
                const comment_nr = event.args?.comment_nr;

                addPostComment(postInfo?.id, {
                    author: profile!,
                    created_timestamp: new Date().getTime() / 1000 as any,
                    id: parseInt(comment_nr).toString(),
                    text: formData.message
                })

                setPostsCommentCount(postsCommentsCount + 1)

                toast({
                    title: 'Comment added successfully!',
                    description: "",
                    position: 'bottom-right',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })

                setValue('message', '')
                setIsLoadingCreateComment(false)
            } catch (e) {
                console.log(e)
                setIsLoadingCreateComment(false)
                setValue('message', '')
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

    return (
        <Box
            borderWidth="1px"
            rounded="lg"
            shadow="1px 1px 3px rgba(0,0,0,0.3)"
            p={1}
            mt="10px"
            bg={useColorModeValue('white', 'gray.900')}
        >
            <form onSubmit={handleSubmit(onSubmitCreateComment)}>
                <Flex gap={2}>
                    <FormControl
                        isInvalid={!!errors.message}
                    >
                        <Input
                            id="name" placeholder="Leave comment..."
                            {...register('message', {
                                required: 'This is required',
                                minLength: {value: 1, message: 'Minimum length should be 1'},
                            })}
                        />
                        <FormErrorMessage>
                            {errors.message && errors.message.message}
                        </FormErrorMessage>
                    </FormControl>
                    <Button isLoading={isLoadingCreateComment} type={'submit'}>
                        <IconSend/>
                    </Button>
                </Flex>
            </form>
        </Box>
    );
}

export default CreatePostComment;