import FollowerItem from "./FollowerItem.tsx";
import {Flex} from "@chakra-ui/react";
import {UserType} from "@/pages/Users/Users.tsx";

type FollowersListProps = {
    followers: Array<UserType & {address: string}> | null
}

const FollowersList = ({followers}: FollowersListProps) => {
    return (
        <Flex justify={'center'} gap={5} wrap={'wrap'}>
            {followers?.map(item =>
                <FollowerItem key={item?.address} follower={item}/>
            )}
        </Flex>
    );
}

export default FollowersList;