import { Tooltip, Button, Box, useDisclosure } from "@chakra-ui/react";

import { useChart, MarketSentiment } from "hooks/use-chart";

import BuyModal from "./buy-modal";
import SellModal from "./sell-modal";

const TradeToolsButtonsView = () => {
  const { lastPrice, sentiment } = useChart();

  const {
    isOpen: isBuyModalOpen,
    onOpen: onBuy,
    onClose: onBuyClose,
  } = useDisclosure();

  const {
    isOpen: isSellModalOpen,
    onOpen: onSell,
    onClose: onSellClose,
  } = useDisclosure();

  const sentimentColor =
    sentiment === MarketSentiment.Bullish
      ? "blue-ribbon"
      : sentiment === MarketSentiment.Bearish
      ? "red"
      : "black";

  const buttons = [
    {
      tooltip: "Sell: Sacrifice your time, be more productive!",
      label: "Sell",
      onClick: onSell,
    },
    {
      tooltip: "Buy: Enjoy your time, please be wise!",
      label: "Buy",
      onClick: onBuy,
    },
  ];

  return (
    <>
      {buttons.map(({ tooltip, label, onClick }, index) => (
        <Tooltip key={`button-${index}`} label={tooltip} bg="dark.50">
          <Button
            display="inline-flex"
            flexDir="column"
            size="md"
            _focus={{ outline: "none" }}
            roundedTopLeft={index === 0 ? "lg" : "none"}
            roundedBottomLeft={index === 0 ? "lg" : "none"}
            roundedTopRight={index === 0 ? "none" : "lg"}
            roundedBottomRight={index === 0 ? "none" : "lg"}
            colorScheme={sentimentColor}
            onClick={onClick}
          >
            <Box as="strong" fontSize="md">
              {label} $TIME
            </Box>
            <Box as="span" fontSize="xs">
              @{lastPrice}
            </Box>
          </Button>
        </Tooltip>
      ))}

      <BuyModal isOpen={isBuyModalOpen} onClose={onBuyClose} />
      <SellModal isOpen={isSellModalOpen} onClose={onSellClose} />
    </>
  );
};

export default TradeToolsButtonsView;
