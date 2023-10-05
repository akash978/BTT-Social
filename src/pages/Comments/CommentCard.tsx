import {Avatar, Box, Card, CardBody, CardHeader, Divider, Flex, Text} from "@chakra-ui/react";
import {PostCommentType} from "@/store/usePostsStore.tsx";
import {formatDate} from "@/utils/formatDate.ts";
import CopyButton from "@/components/CopyButton.tsx";
import {IPFS_URI} from "@/utils/constants.ts";
import {formatShortAddress} from "@/utils/string.ts";

type CommentCardProps = PostCommentType & {
    postId: number
}

const CommentCard = ({text, created_timestamp, author}: CommentCardProps) => {
    return (
        <Card key={'outline'} variant={'outline'}>
            <CardHeader style={{marginTop: 0, padding: 10, paddingBottom: 0}}>
                <Flex gap='4'>
                    <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'>
                        <Avatar size={'sm'} src={author?.avatar ? `${IPFS_URI}${author?.avatar}` : ''}/>
                        <Box>
                            <CopyButton value={author?.id} str={formatShortAddress(author?.id)}/>
                            <Text fontSize={14}>
                                {formatDate(new Date(parseInt(created_timestamp?.toString()) * 1000))}
                            </Text>
                        </Box>
                    </Flex>
                </Flex>
            </CardHeader>
            <Divider mt={2}/>
            <CardBody style={{marginTop: 0, paddingTop: 0, padding: 10}}>
                <Text>
                    {text}
                </Text>
            </CardBody>
        </Card>
    );
}

export default CommentCard;