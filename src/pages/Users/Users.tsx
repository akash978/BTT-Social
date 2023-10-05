import React, {useEffect, useState} from 'react';
import {Alert, AlertDescription, AlertIcon, Box, Center, SimpleGrid, Spinner} from "@chakra-ui/react";
import UserItem from "@/pages/Users/UserItem.tsx";
import {useProfileStore} from "@/store/useWalletStore.tsx";

export type UserType = {
    addr: string,
    avatar: string
    bio: string,
    id: string
    name: string
}

const Users = () => {
    const [users, setUsers] = useState<UserType[]>([])
    const [usersCount, setUsersCount] = useState(0)
    const [isLoadingPosts, setIsLoadingPosts] = useState(true)
    const {contractR} = useProfileStore()

    const getPostComments = async () => {
        setIsLoadingPosts(true)
        const arr = []
        try {
            let txPostCommentsCount = await contractR?.get_users()
            setUsersCount(txPostCommentsCount.length)
            for (let i = 0; i < txPostCommentsCount.length; i++) {
                let postInfo = await contractR?.get_user_info(txPostCommentsCount[i])
                arr.push({id: txPostCommentsCount[i], ...postInfo})
            }
            setUsers(arr)
            setIsLoadingPosts(false)
        } catch (e) {
            console.log(e)
            setIsLoadingPosts(false)
        }
    }

    useEffect(() => {
        if (contractR) getPostComments()
    }, [contractR]);

    return (
        <Box mt={'5'}>
            <Alert status='info'>
                <AlertIcon/>
                <AlertDescription>
                    This list includes users who interacted with the application at least once: created a post, liked
                    it, left a comment, or something else.
                </AlertDescription>
            </Alert>
            {isLoadingPosts &&
                <Center w={'100%'}>
                    <Spinner/>
                </Center>
            }
            <SimpleGrid mt={5} spacing={4} templateColumns='repeat(auto-fill, minmax(220px, 1fr))'>
                {!isLoadingPosts && users.map(item =>
                    <UserItem key={item.id} user={item}/>
                )}
            </SimpleGrid>
        </Box>
    );
};

export default Users;