import React from "react";
import { Dropdown } from "./components/Dropdown";
import { Wrapper } from "./components/Wrapper";
import { Box, Button, useColorMode } from "@chakra-ui/react";
import { TimetableContainer } from "./containers/TimetableContainer";

const App = () => {
    const { toggleColorMode } = useColorMode();
    return (
        <Wrapper>
            <Box>
                <Dropdown onChange={(e) => console.log(e.target.value)}>
                    {["s2 2019", "s1 2020", "s2 2020", "s1 2021"]}
                </Dropdown>
            </Box>
            <TimetableContainer />
            <Button onClick={() => toggleColorMode()}>Change color mode</Button>
        </Wrapper>
    );
};

export default App;
