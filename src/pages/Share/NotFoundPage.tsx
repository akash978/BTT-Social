import {useNavigate} from "react-router-dom";
import {Alert, AlertIcon, AlertTitle, Button, Stack} from "@chakra-ui/react";

export const NotFoundPage = () => {
    const navigate = useNavigate()
    return (
        <Stack mt={10}>
            <Alert status='error'>
                <AlertIcon/>
                <AlertTitle>404 Page Not Found</AlertTitle>
            </Alert>
            <Button onClick={() => navigate('/')}>
                Home
            </Button>
        </Stack>
    );
};