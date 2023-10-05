import {ThirdwebProvider} from "@thirdweb-dev/react";
import Routes from "./Routes.tsx";
import {BrowserRouter} from "react-router-dom";
import {ChakraProvider} from "@chakra-ui/react";
import {MetaMaskContextProvider} from "@/hooks/useMetaMask.tsx";

const Providers = () => {
    return <BrowserRouter>
        <MetaMaskContextProvider>
            <ThirdwebProvider clientId={import.meta.env.VITE_THIRDWEB_SECRET_KEY}>
                <ChakraProvider>
                    <Routes/>
                </ChakraProvider>
            </ThirdwebProvider>
        </MetaMaskContextProvider>
    </BrowserRouter>
}

export default Providers