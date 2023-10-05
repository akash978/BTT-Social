import {Avatar, Box, Center, Heading, useColorModeValue} from '@chakra-ui/react'
import {Link} from "react-router-dom";

import {IPFS_URI} from "@/utils/constants.ts";
import {UserType} from "@/pages/Users/Users.tsx";

import {formatShortAddress} from "@/utils/string.ts";

type FollowerItemProps = {
    follower: UserType & { address: string }
}

const FollowerItem = ({follower}: FollowerItemProps) => {
    return (
        <Center>
            <Box
                maxW={'100px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.900')}
                borderWidth="2px"
                rounded={'lg'}
                textAlign={'center'}
                p={3}
            >
                <Avatar
                    size={'md'}
                    src={follower?.avatar ? `${IPFS_URI}${follower?.avatar}` : ''}
                    pos={'relative'}
                />
                <Heading style={{marginTop: 5}} fontSize={'sm'}>
                    <Link to={`/profile/${follower?.address}`}>
                        {formatShortAddress(follower?.address, 10)}
                    </Link>
                </Heading>
            </Box>
        </Center>
    )
}

export default FollowerItem