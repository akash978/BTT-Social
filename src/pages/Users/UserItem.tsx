import React from 'react';
import {Avatar, Badge, Box, Button, Center, Flex, Heading, Stack, useColorModeValue} from "@chakra-ui/react";
import {UserType} from "@/pages/Users/Users.tsx";
import {useNavigate} from "react-router-dom";
import {IPFS_URI} from "@/utils/constants.ts";
import {formatShortAddress} from "@/utils/string.ts";

const UserItem = ({user}: {
    user: UserType
}) => {
    const navigate = useNavigate()

    return (
        <Center h={'100%'} pb={5}>
            <Box
                bg={useColorModeValue('red.50', 'gray.900')}
                role={'group'}
                p={6}
                w={'full'}
                borderWidth={2}
                boxShadow={'md'}
                rounded={'lg'}
                pos={'relative'}
                zIndex={1}
                h={'100%'}
            >
                <Flex
                    justify={'center'}
                    align={'center'}
                    rounded={'lg'}
                    pos={'relative'}
                >
                    <Center>
                        <Avatar
                            rounded={'50%'}
                            size={'2xl'}
                            objectFit={'cover'}
                            src={user?.avatar ? `${IPFS_URI}${user?.avatar}` : ''}
                        />
                    </Center>
                </Flex>
                <Stack mt={5} align={'center'}>
                    <Badge textTransform={'none'} size='xl' fontSize={15} px={2} py={1} rounded={5}>
                        {formatShortAddress(user.id)?.toLowerCase()}
                    </Badge>
                    <Heading minH={25} fontSize={'xl'} fontFamily={'body'} fontWeight={500}>
                        {user.name ?? ' '}
                    </Heading>
                    <Stack direction={'row'} align={'center'}>
                        <Button onClick={() => navigate(`/profile/${user.id}`)} size={'sm'}>
                            Open
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Center>
    );
};

export default UserItem;
