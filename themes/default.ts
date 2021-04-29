import { extendTheme } from "@chakra-ui/react";

const defaultTheme = extendTheme({
  styles: {
    global: {
      html: {
        h: "100vh",
      },
      body: {
        h: "100%",
        bg: "dark.800",
        color: "gray.300",
        "#__next": {
          h: "100%",
        },
      },
    },
  },
  colors: {
    yellowish: {
      "50": "#fffbf5",
      "100": "#fef7ea",
      "200": "#fdebcb",
      "300": "#fbdfab",
      "400": "#f9c66c",
      "500": "#F6AE2D",
      "600": "#dd9d29",
      "700": "#b98322",
      "800": "#94681b",
      "900": "#795516",
    },
    "blue-ribbon": {
      "50": "#f2f6ff",
      "100": "#e6edff",
      "200": "#bfd3ff",
      "300": "#99b9ff",
      "400": "#4d84ff",
      "500": "#004FFF",
      "600": "#0047e6",
      "700": "#003bbf",
      "800": "#002f99",
      "900": "#00277d",
    },
    "bright-turquoise": {
      "50": "#f6fefd",
      "100": "#ecfefc",
      "200": "#d1fbf7",
      "300": "#b5f9f2",
      "400": "#7df5e9",
      "500": "#45F0DF",
      "600": "#3ed8c9",
      "700": "#34b4a7",
      "800": "#299086",
      "900": "#22766d",
    },
    dark: {
      "50": "#f2f3f2",
      "100": "#e6e6e6",
      "200": "#bfc1c0",
      "300": "#999b99",
      "400": "#4d504d",
      "500": "#000501",
      "600": "#000501",
      "700": "#000401",
      "800": "#000301",
      "900": "#000200",
    },
  },
});

export default defaultTheme;
