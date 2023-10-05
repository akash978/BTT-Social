import {
    Alert,
    AlertIcon,
    AlertTitle,
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Flex,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react'
import {CloseIcon, HamburgerIcon, MoonIcon, SearchIcon, SunIcon} from '@chakra-ui/icons'
import {Link, Outlet, useNavigate} from 'react-router-dom'
import {useProfileStore} from "@/store/useWalletStore.tsx";
import {Fragment, useEffect} from "react";
import {CONTRACT_ADDRESS, CHAIN_PARAMS, IPFS_URI} from "@/utils/constants.ts";
import SearchUserProfile from "@/components/SearchUserProfile.tsx";
import {useMetaMask} from "@/hooks/useMetaMask.tsx";
import {ethers} from 'ethers';
import {CONTRACT_ABI} from '@/utils/abi';
import {formatShortAddress} from "@/utils/string.ts";

type LinkType = {
    title: string,
    link: string
}

const HeaderLinks: LinkType[] = [
    {title: 'Posts', link: '/posts'},
    {title: 'Users', link: '/users'},
    {title: 'Stats', link: '/stats'},
]

const Layout = () => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const {
        isOpen: isOpenSearchUserModal,
        onOpen: onOpenSearchUserModal,
        onClose: onCloseSearchUserModal
    } = useDisclosure()
    const {colorMode, toggleColorMode} = useColorMode()
    const {profile, setProfile, setIsLoadingProfile} = useProfileStore()
    const {wallet, hasProvider, isConnecting, connectMetaMask, error, errorMessage, clearError} = useMetaMask()
    const {contractR} = useProfileStore()
    const {setContractR, setContractW} = useProfileStore()
    const navigate = useNavigate()


    useEffect(() => {
        const setData = async () => {
            const providerRead = new ethers.providers.JsonRpcProvider(CHAIN_PARAMS.rpcUrls[0]);
            const cr = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerRead);

            if (wallet.accounts.length > 0) {
                const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = metamaskProvider.getSigner();
                const cw = cr.connect(signer)
                setContractW(cw)
            }
            setContractR(cr)
        }
        setData()
    }, [wallet]);

    const UserProfileLinks: LinkType[] = [
        {title: 'Profile', link: `/profile/${wallet?.accounts[0]}`},
        {title: 'Edit Profile', link: `/profile/edit`},
    ]

    const getMyProfileInfo = async () => {
        setIsLoadingProfile(true)
        try {
            let userInfo = await contractR?.get_user_info(wallet.accounts[0])
            setProfile({...userInfo, id: wallet.accounts[0]})
            setIsLoadingProfile(false)
        } catch (e) {
            setIsLoadingProfile(false)
            console.log(e)
        }
    }

    useEffect(() => {
        if (wallet.accounts?.length > 0) getMyProfileInfo()
    }, [wallet]);

    return (
        <>
            <SearchUserProfile isOpen={isOpenSearchUserModal} onClose={onCloseSearchUserModal}/>
            <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
                <Container px={{base: "0", md: "18px"}} maxW='xl'>
                    <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                        <IconButton
                            size={'md'}
                            icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
                            aria-label={'Open Menu'}
                            display={{md: 'none'}}
                            onClick={isOpen ? onClose : onOpen}
                        />
                        <HStack spacing={8} alignItems={'center'}>
                            <Box>
                                <Text
                                    display={{base: "none", sm: "block"}}
                                    color={useColorModeValue('red.600', 'red.400')}
                                    fontWeight={800} fontSize={20} cursor={'pointer'} onClick={() => navigate('/')}>
                                    BTT Social
                                </Text>
                            </Box>
                            <HStack as={'nav'} spacing={4} display={{base: 'none', md: 'flex'}}>
                                {HeaderLinks.map((item) => (
                                    <Text key={item.link} fontWeight={600}>
                                        <Link to={item?.link} key={item.link}>{item?.title}</Link>
                                    </Text>
                                ))}
                            </HStack>
                        </HStack>
                        <Flex alignItems={'center'}>
                            <Button
                                bg={useColorModeValue('gray.200', 'gray.600')}
                                size={'sm'}
                                mr={4}
                                onClick={onOpenSearchUserModal}
                            >
                                <SearchIcon/>
                            </Button>

                            <Button
                                variant={'solid'}
                                colorScheme={'red'}
                                size={'sm'}
                                mr={4}
                                onClick={toggleColorMode}
                            >
                                {colorMode === 'light' ? <MoonIcon/> : <SunIcon/>}
                            </Button>

                            {!hasProvider &&
                                <Button
                                    style={{height: 38}}
                                    disabled={isConnecting}
                                >
                                    <Link to={'https://metamask.io'} target={'_blank'}>
                                        Install MetaMask
                                    </Link>
                                </Button>
                            }

                            {window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&
                                <Button
                                    bg={useColorModeValue('gray.300', 'gray.600')}
                                    variant={'solid'}
                                    style={{height: 38}}
                                    disabled={isConnecting}
                                    onClick={connectMetaMask}
                                >
                                    Connect
                                </Button>
                            }

                            {hasProvider && wallet.accounts.length > 0 &&
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        rounded={'full'}
                                        variant={'link'}
                                        cursor={'pointer'}
                                        minW={0}>
                                        <Avatar
                                            size={'sm'}
                                            src={profile?.avatar ? `${IPFS_URI}${profile?.avatar}` : ''}
                                        />
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem>
                                            <Badge style={{fontSize: '15px', width: '100%', height: '100%'}}>
                                                {formatShortAddress(wallet.accounts[0])}
                                            </Badge>
                                        </MenuItem>
                                        {UserProfileLinks?.map((item, index) =>
                                            <Fragment key={item.title}>
                                                <MenuItem>
                                                    <Link style={{width: '100%', height: '100%'}} to={item.link}>
                                                        {item.title}
                                                    </Link>
                                                </MenuItem>
                                                {index !== UserProfileLinks?.length - 1 &&
                                                    <MenuDivider/>
                                                }
                                            </Fragment>
                                        )}
                                    </MenuList>
                                </Menu>
                            }
                        </Flex>
                    </Flex>
                </Container>

                {isOpen
                    ? <Box pb={4} display={{md: 'none'}}>
                        <Stack as={'nav'} spacing={4}>
                            <Text
                                display={{base: "block", sm: "none"}}
                                color={useColorModeValue('red.600', 'red.400')}
                                fontWeight={800}
                                fontSize={20}
                                cursor={'pointer'}
                                onClick={() => {
                                    onClose()
                                    navigate('/')
                                }}
                            >
                                BTT Social
                            </Text>
                            {HeaderLinks.map((item) => (
                                <Link onClick={onClose} to={item?.link} key={item.link}>
                                    {item?.title}
                                </Link>
                            ))}
                        </Stack>
                    </Box>
                    : null
                }
            </Box>
            <Container mb={100} maxW='xl'>
                {wallet.accounts.length > 0 && CHAIN_PARAMS.chainId !== wallet.chainId &&
                    <Alert mt={3} status='error'>
                        <AlertIcon/>
                        <AlertTitle>Please switch to BTTC Testnet!</AlertTitle>
                    </Alert>
                }
                {!hasProvider &&
                    <Alert mt={3} status='error'>
                        <AlertIcon/>
                        <AlertTitle>Metamask not available!</AlertTitle>
                    </Alert>
                }
                <Outlet/>
            </Container>
        </>
    )
}

export default Layout
