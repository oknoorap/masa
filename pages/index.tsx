import Head from "next/head";
import { Box, VStack } from "@chakra-ui/react";

import { ChartProvider } from "hooks/use-chart";
import { TaskProvider } from "hooks/use-task";
import { TradeProvider } from "hooks/use-trade";

import ChartView from "views/chart";
import ChartToolsView from "views/tools";

const Homepage = () => {
  return (
    <>
      <Head>
        <title>Masa - Time Trading Productivity Tool</title>
        <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js" />
      </Head>
      <TaskProvider>
        <TradeProvider>
          <ChartProvider>
            <VStack
              p="2"
              position="relative"
              spacing={2}
              align="stretch"
              height="100%"
            >
              <ChartToolsView />
              <ChartView />
              <Box height="30%">Trading</Box>
            </VStack>
          </ChartProvider>
        </TradeProvider>
      </TaskProvider>
    </>
  );
};

export default Homepage;
