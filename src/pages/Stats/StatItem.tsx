import React from "react";
import {Spinner, Stat, StatLabel, StatNumber, useColorModeValue} from "@chakra-ui/react";

const StatItem = ({label, value, isLoading}: {isLoading: boolean, label: string, value: string | number }) => {
    return <Stat
        bg={useColorModeValue('red.50', 'gray.900')}
        p={{base: 1, md: 3}}
        shadow={'md'}
        border={'1px solid'}
        borderColor={useColorModeValue('gray.400', 'gray.700')}
        rounded={'lg'}
    >
        <StatLabel>{label}</StatLabel>
        <StatNumber>
            {isLoading
                ? <Spinner/>
                : value
            }
        </StatNumber>
    </Stat>
}

export default StatItem