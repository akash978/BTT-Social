import {Box, Center, SimpleGrid, Spinner, Stat, StatLabel, StatNumber, Text, useColorModeValue} from '@chakra-ui/react';
import {useProfileStore} from "@/store/useWalletStore.tsx";
import React, {useEffect, useState} from "react";
import StatItem from "@/pages/Stats/StatItem.tsx";

const Stats = () => {
    const {contractR} = useProfileStore()
    const [postsCount, setPostsCount] = useState(0)
    const [commentsCount, setCommentsCount] = useState(0)
    const [likesCount, setLikesCount] = useState(0)
    const [usersCount, setUsersCount] = useState(0)
    const [isLoadingStats, setIsLoadingStats] = useState(false)

    useEffect(() => {
        const getStats = async () => {
            try {
                setIsLoadingStats(true)
                const postsC = await contractR!.posts_count();
                const commentsC = await contractR!.comments_count();
                const likesC = await contractR!.likes_count();
                const usersIds = await contractR!.get_users();
                setPostsCount(parseInt(postsC))
                setCommentsCount(parseInt(commentsC))
                setLikesCount(parseInt(likesC))
                setUsersCount(usersIds?.length)
                setIsLoadingStats(false)
            }catch (e) {
                console.log(e)
                setIsLoadingStats(false)
            }
        }

        if (contractR) {
            getStats()
        }
    }, [contractR]);

    return (
        <Box mt={5}>
            <Text fontSize={'35px'} fontWeight={700} align={'center'} mb={'5'}>
                Stats
            </Text>
            <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(220px, 1fr))'>
                <StatItem isLoading={isLoadingStats} value={postsCount} label={'Total posts:'}/>
                <StatItem isLoading={isLoadingStats} value={commentsCount} label={'Total comments on posts:'}/>
                <StatItem isLoading={isLoadingStats} value={likesCount} label={'Total likes on posts:'}/>
                <StatItem isLoading={isLoadingStats} value={usersCount} label={'Users interacted with app:'}/>
            </SimpleGrid>
        </Box>
    );
};

export default Stats;