import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    Image,
    Input,
    Stack,
    useColorModeValue,
    useToast
} from "@chakra-ui/react";
import {useRef, useState} from "react";
import {IconSend, IconUpload} from "@tabler/icons-react";
import {useForm} from "react-hook-form";
import {useStorageUpload} from "@thirdweb-dev/react";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {CHAIN_PARAMS} from "@/utils/constants.ts";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {ERRORS} from "@/utils/errors.ts";

type FormTypes = {
    text: string
}

const CreatePosts = () => {
    const toast = useToast()
    const {addPost} = usePostsStore()
    const {mutateAsync: upload} = useStorageUpload();
    const {wallet, hasProvider, isConnecting, connectMetaMask} = useMetaMask()
    const {profile} = useProfileStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState(null)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const {contractW, contractR} = useProfileStore()
    const {
        setValue,
        handleSubmit,
        register,
        formState: {errors},
    } = useForm<FormTypes>({
        defaultValues: {
            text: '',
        },
    })

    const handleFileInputClick = () => {
        fileInputRef?.current?.click();
    }

    const handleFileChange = (event: any) => {
        setFile(event.target.files[0])
    }

    const clearFileInput = () => {
        if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null)
    }

    const onSubmit = async (formData: FormTypes): Promise<void> => {
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

            setIsSubmitLoading(true)
            try {
                let uploadUrl = [' ']
                if (file) {
                    uploadUrl = await upload({
                        data: [file],
                        options: {uploadWithGatewayUrl: false, uploadWithoutDirectory: true},
                    });
                }

                const tx = await contractW?.create_post(formData?.text, uploadUrl[0].slice(7))
                const res = await tx.wait();
                const event = res.events.find((event: any) => event.event === 'NewPost');
                const post_nr = event.args?.post_nr;
                let postInfo = await contractR?.get_post_info(parseInt(post_nr))

                addPost({
                    id: parseInt(post_nr),
                    ...postInfo,
                    author: profile,
                    isLiked: false,
                    likesCount: 0,
                    comments: []
                })
                toast({
                    title: 'Post created successfully!',
                    description: "",
                    position: 'bottom-right',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
                setValue('text', '')
                clearFileInput()
                setIsSubmitLoading(false)
            } catch (e) {
                console.log(e)
                setIsSubmitLoading(false)
                setValue('text', '')
                clearFileInput()
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box
                borderWidth="1px"
                rounded="lg"
                shadow="1px 1px 3px rgba(0,0,0,0.3)"
                bg={useColorModeValue('red.50', 'gray.900')}
                maxWidth={800}
                m="10px auto"
                p={1}
            >
                <Flex gap={3}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                    <FormControl
                        isInvalid={!!errors.text}>
                        <Input
                            bg={useColorModeValue('white', 'gray.800')}
                            placeholder='Post description'
                            {...register('text', {
                                required: 'This is required',
                                minLength: {value: 1, message: 'Minimum length should be 1'},
                            })}
                        />
                        <FormErrorMessage>
                            {errors.text && errors.text.message}
                        </FormErrorMessage>
                    </FormControl>
                    <Flex gap={3}>
                        <Button onClick={handleFileInputClick} isLoading={isSubmitLoading} variant='solid'>
                            <IconUpload/>
                        </Button>
                        <Button colorScheme={'red'} type={'submit'} isLoading={isSubmitLoading}  variant='solid'>
                            <IconSend/>
                        </Button>
                    </Flex>
                </Flex>
                {file &&
                    <Stack gap={0} align={'flex-end'}>
                        <Box
                            w={'100%'}
                            borderWidth="1px"
                            rounded="lg"
                            shadow="1px 1px 3px rgba(0,0,0,0.3)"
                            maxWidth={800}
                            p={1}
                            m="10px auto"
                        >
                            <Image
                                h={'320px'}
                                w={'full'}
                                objectFit="cover"
                                alt="#"
                                src={URL.createObjectURL(file)}
                            />
                        </Box>
                        <Button isLoading={isSubmitLoading} onClick={clearFileInput} colorScheme={'red'}>
                            Delete
                        </Button>
                    </Stack>
                }
            </Box>
        </form>
    );
}

export default CreatePosts