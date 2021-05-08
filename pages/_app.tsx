import { ChakraProvider } from "@chakra-ui/react";

import { DBProvider } from "hooks/use-database";
import theme from "themes/default";

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <DBProvider>
        <Component {...pageProps} />
      </DBProvider>
    </ChakraProvider>
  );
}

export default App;
