import { FC } from "react";
import { Box, Divider, useColorModeValue } from "@chakra-ui/react";
import { footerHeight } from "./constants";

type Props = {};

export const Footer: FC<Props> = () => {
    const bgColor = useColorModeValue("gray.100", "gray.900");
    return (
        <Box h={footerHeight} w="100%" bgColor={bgColor}>
            <Divider w="100%" />
            Footer
            <Divider w="100%" position="absolute" bottom={0} />
        </Box>
    );
};
