import {useEffect, useRef, useState} from 'react'
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Image,
    Input,
    Stack,
    Textarea,
    useToast,
} from '@chakra-ui/react'
import {IconUpload} from "@tabler/icons-react";
import {useForm} from "react-hook-form";
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {useStorageUpload} from "@thirdweb-dev/react";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {CHAIN_PARAMS} from "@/utils/constants.ts";
import {ERRORS} from "@/utils/errors.ts";

type FormTypes = { name: string, bio: string, avatar: string }

const EditProfile = () => {
    const toast = useToast()
    const {profile, setProfile, isLoadingProfile, setIsLoadingProfile} = useProfileStore()
    const {mutateAsync: upload} = useStorageUpload();
    const {wallet, hasProvider, isConnecting, connectMetaMask} = useMetaMask()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isFileError, setIsFileError] = useState(false)
    const [file, setFile] = useState(null)
    const {contractW, contractR} = useProfileStore()

    const {
        reset,
        handleSubmit,
        register,
        formState: {errors},
    } = useForm<FormTypes>({
        defaultValues: {
            name: '',
            bio: '',
            avatar: '',
        },
    })

    const handleFileInputClick = () => {
        fileInputRef?.current?.click();
    };

    const handleFileChange = (event: any) => {
        if (event.target.files[0] !== undefined || event.target.files[0] !== null) {
            setIsFileError(false)
        }
        setFile(event.target.files[0])
    };

    const clearFileInput = () => {
        if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFile(null)
    }

    const resetForm = () => {
        reset({
            avatar: '',
            bio: '',
            name: '',
        })
    }

    useEffect(() => {
        if (profile) {
            reset({
                avatar: profile?.avatar,
                bio: profile?.bio,
                name: profile?.name,
            })
        }
    }, [profile]);

    const onSubmitEditProfile = async (formData: FormTypes): Promise<void> => {
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

            setIsLoadingProfile(true)
            try {
                let uploadUrl = [' ']
                if (file) {
                    uploadUrl = await upload({
                        data: [file],
                        options: {uploadWithGatewayUrl: false, uploadWithoutDirectory: true},
                    });
                }

                const tx = await contractW?.edit_profile(formData?.name, uploadUrl[0].slice(7), formData?.bio)
                await tx.wait();

                setProfile({
                    ...profile,
                    avatar: uploadUrl[0].slice(7),
                    name: formData?.name,
                    bio: formData?.bio,
                })
                toast({
                    title: 'Account Updated Successfully!',
                    description: "",
                    position: 'bottom-right',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    variant: 'subtle'
                })
                resetForm()
                clearFileInput()
                setIsLoadingProfile(false)
            } catch (e) {
                console.log(e)
                setIsLoadingProfile(false)
                resetForm()
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
        <form onSubmit={handleSubmit(onSubmitEditProfile)}>
            <Box
                borderWidth="1px"
                rounded="lg"
                shadow="1px 1px 3px rgba(0,0,0,0.3)"
                maxWidth={800}
                p={6}
                m="10px auto"
            >
                <>
                    <Heading w="100%" textAlign={'center'} fontWeight="normal" mb="2%">
                        Profile
                    </Heading>
                    <Stack>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{display: 'none'}}
                        />
                        <FormControl
                            isInvalid={!!errors.name}
                            mr="5%">
                            <FormLabel htmlFor="name" fontWeight={'normal'}>
                                Name
                            </FormLabel>
                            <Input
                                disabled={isLoadingProfile}
                                id="name" placeholder="Name"
                                {...register('name', {
                                    required: 'This is required',
                                    minLength: {value: 1, message: 'Minimum length should be 1'},
                                })}
                            />

                            <FormErrorMessage>
                                {errors.name && errors.name.message}
                            </FormErrorMessage>
                        </FormControl>

                        <FormControl id="bio" mt={1}>
                            <FormLabel
                                fontSize="sm"
                                fontWeight="md"
                                color="gray.700"
                                _dark={{color: 'gray.50'}}
                            >
                                Bio
                            </FormLabel>
                            <Textarea
                                disabled={isLoadingProfile}
                                placeholder="Bio"
                                rows={3}
                                shadow="sm"
                                focusBorderColor="brand.400"
                                fontSize={{sm: 'sm',}}
                                {...register('bio')}
                            />
                            <FormErrorMessage>
                                {errors.name && errors.name.message}
                            </FormErrorMessage>
                        </FormControl>
                        <FormControl id="file" mt={1} w={'100%'}>
                            <Stack gap={2}>
                                <Button
                                    disabled={isLoadingProfile}
                                    w={'100%'}
                                    rightIcon={<IconUpload/>}
                                    onClick={handleFileInputClick}
                                    aria-label={'upload-post-icon'}
                                >
                                    Select profile avatar
                                </Button>
                                {isFileError &&
                                    <Alert p={1} colorScheme={'red'}>
                                        {isFileError && 'Select file'}
                                    </Alert>
                                }
                            </Stack>
                        </FormControl>
                        {file &&
                            <Box
                                w={'100%'}
                                borderWidth="1px"
                                rounded="lg"
                                shadow="1px 1px 3px rgba(0,0,0,0.3)"
                                maxWidth={800}
                                p={1}
                                m="10px auto"
                            >
                                <Stack align={'flex-end'}>
                                    <Image
                                        h={'320px'}
                                        w={'full'}
                                        objectFit="cover"
                                        alt="#"
                                        src={URL.createObjectURL(file)}
                                    />
                                    <Button
                                        disabled={isLoadingProfile}
                                        onClick={clearFileInput}
                                        colorScheme={'red'}
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </Box>
                        }
                    </Stack>
                </>
                <ButtonGroup mt="5%" w="100%">
                    <Flex w="100%" justifyContent="center">
                        <Flex justify={'center'} gap={5}>
                            <Button
                                isLoading={isLoadingProfile}
                                type='submit'
                                w="7rem"
                                colorScheme={'red'}
                                variant="solid"
                            >
                                Save
                            </Button>
                            <Button
                                isLoading={isLoadingProfile}
                                colorScheme={'red'}
                                w="7rem"
                                mr="5%"
                                variant="outline"
                            >
                                Close
                            </Button>
                        </Flex>
                    </Flex>
                </ButtonGroup>
            </Box>
        </form>
    )
};

export default EditProfile