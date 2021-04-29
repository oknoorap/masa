import { Box, VStack } from "@chakra-ui/react";
import Head from "next/head";

import useChart from "hooks/use-chart";

const Homepage = () => {
  useChart();

  return (
    <>
      <Head>
        <script src="https://cdn.anychart.com/releases/8.9.0/js/anychart-core.min.js" />
        <script src="https://cdn.anychart.com/releases/8.9.0/js/anychart-cartesian.min.js" />
      </Head>
      <VStack
        p="2"
        position="relative"
        spacing={2}
        align="stretch"
        height="100%"
      >
        <Box position="absolute" top="1" left="1">
          sdsfwef
        </Box>
        <Box height="70%" overflow="hidden" rounded="lg" bg="dark.400">
          <div id="candlestick" />
        </Box>
        <Box height="30%">Trading</Box>
      </VStack>
    </>
  );
};

export default Homepage;
