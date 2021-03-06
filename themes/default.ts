import { extendTheme } from "@chakra-ui/react";

const colors = {
  yellowish: {
    50: "#fffbf5",
    100: "#fef7ea",
    200: "#fdebcb",
    300: "#fbdfab",
    400: "#f9c66c",
    500: "#F6AE2D",
    600: "#dd9d29",
    700: "#b98322",
    800: "#94681b",
    900: "#795516",
  },
  "blue-ribbon": {
    50: "#f2f6ff",
    100: "#e6edff",
    200: "#bfd3ff",
    300: "#99b9ff",
    400: "#4d84ff",
    500: "#004FFF",
    600: "#0047e6",
    700: "#003bbf",
    800: "#002f99",
    900: "#00277d",
  },
  "bright-turquoise": {
    50: "#f6fefd",
    100: "#ecfefc",
    200: "#d1fbf7",
    300: "#b5f9f2",
    400: "#7df5e9",
    500: "#45F0DF",
    600: "#3ed8c9",
    700: "#34b4a7",
    800: "#299086",
    900: "#22766d",
  },
  dark: {
    100: "#22262d", //grid border
    200: "#474d57",
    300: "#1b1e24",
    400: "#13171c", // bg
    500: "#1a1c20", // chart bg
  },
};

const defaultTheme = extendTheme({
  styles: {
    global: {
      html: {
        h: "100vh",
      },
      body: {
        h: "100%",
        bg: "dark.400",
        color: "gray.300",
        "#__next": {
          h: "100%",
        },
      },
    },
  },
  colors,
});

export default defaultTheme;
