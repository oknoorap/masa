import { Box, Stack } from "@chakra-ui/react";

import Buttons from "./buttons";
import Status from "./status";

const TradeToolsView = () => {
  return (
    <Box position="absolute" top="1" left="1" zIndex="99" p="2">
      <Stack direction="row" spacing={0.5} align="center">
        <Buttons />
        <Status />
      </Stack>
    </Box>
  );
};

export default TradeToolsView;
