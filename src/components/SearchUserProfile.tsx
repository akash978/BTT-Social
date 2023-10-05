import {
    Button,
    FormControl,
    FormErrorMessage,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast
} from "@chakra-ui/react"
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {CloseIcon, SearchIcon} from "@chakra-ui/icons";
import {usePostsStore} from "@/store/usePostsStore.tsx";
import {useForm} from "react-hook-form";
import {ethers} from "ethers";

type SearchUserProfileProps = {
    onClose: any,
    isOpen: boolean
}

const SearchUserProfile = ({onClose, isOpen}: SearchUserProfileProps) => {
    const toast = useToast()
    const navigate = useNavigate()
    const {setPostCount, setPosts} = usePostsStore()

    const handlerCloseModal = () => {
        onClose()
        reset({address: ''})
    }

    const {
        setValue,
        handleSubmit,
        register,
        formState: {errors},
        reset
    } = useForm<{
        address: string
    }>({
        defaultValues: {
            address: '',
        },
    })

    useEffect(() => {
        if (!isOpen) {
            reset({address: ''})
        }
    }, [isOpen]);

    const onSubmit = async (formData: any) => {
        if (formData?.address?.length !== 0) {
            onClose()
            reset({address: ''})
            setPostCount(0)
            setPosts([])
            navigate(`/profile/${formData?.address}`)
        } else {
            toast({
                title: 'Invalid address!',
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
        <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader>Search user</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <FormControl isInvalid={!!errors.address}>
                            <Input
                                id="address"
                                placeholder="Address"
                                {...register('address', {
                                    required: 'This is required',
                                    validate: (value) => {
                                        try {
                                            if (!(/^0x([A-Fa-f0-9]{40})$/.test(value))) {
                                                return 'Invalid address'
                                            }
                                            ethers.utils.getAddress(value);
                                            return true;
                                        } catch (error) {
                                            console.error(`Invalid Ethereum address!`);
                                            return 'Invalid address'
                                        }
                                    },
                                })}
                            />
                            <FormErrorMessage>
                                {errors.address && errors.address.message}
                            </FormErrorMessage>
                        </FormControl>

                    </ModalBody>

                    <ModalFooter>
                        <Button type={'button'} rightIcon={<CloseIcon width={3} height={5}/>} mr={3}
                                onClick={handlerCloseModal}>
                            Close
                        </Button>
                        <Button type={'submit'} colorScheme={'red'}
                                rightIcon={<SearchIcon/>}>Search</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
};

export default SearchUserProfile