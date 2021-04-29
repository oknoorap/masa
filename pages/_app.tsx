import { ChakraProvider } from "@chakra-ui/react";

import { DBProvider } from "hooks/use-database";
import { TaskProvider } from "hooks/use-task";
import { TradeProvider } from "hooks/use-trade";
import theme from "themes/default";

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <DBProvider>
        <TaskProvider>
          <TradeProvider>
            <Component {...pageProps} />
          </TradeProvider>
        </TaskProvider>
      </DBProvider>
    </ChakraProvider>
  );
}

export default App;
