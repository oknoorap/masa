import { Stack, Box, Tooltip } from "@chakra-ui/react";

import { useChart } from "hooks/use-chart";
import { useTrade } from "hooks/use-trade";

const TradingToolsStatusView = () => {
  const { currentOHLC } = useChart();
  const { timeBalance, prodBalance } = useTrade();
  return (
    currentOHLC && (
      <Stack
        p="1"
        pl="4"
        bg="dark.500"
        alignItems="flex-start"
        fontSize="x-small"
        spacing="0.5"
      >
        <Stack direction="row">
          <Tooltip label="Your precious time value" bg="dark.500">
            <Box cursor="help">
              <strong>$TIME</strong> {timeBalance}
            </Box>
          </Tooltip>
          <Tooltip label="Your productivity value" bg="dark.500">
            <Box cursor="help">
              <strong>$PROD</strong> {prodBalance}
            </Box>
          </Tooltip>
        </Stack>
        <Stack direction="row">
          <Box as="span">Open: {currentOHLC.open}</Box>
          <Box as="span">High: {currentOHLC.high}</Box>
          <Box as="span">Low: {currentOHLC.low}</Box>
          <Box as="span">Close: {currentOHLC.close}</Box>
        </Stack>
      </Stack>
    )
  );
};

export default TradingToolsStatusView;
