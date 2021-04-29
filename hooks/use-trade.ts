import { useState } from "react";
import { createContainer } from "unstated-next";

export enum Position {
  Buy = "buy",
  Sell = "sell",
}

const useTradeHook = () => {
  const [openPosition, setPosition] = useState<Position>();
  const [tradePrice, setTradePrice] = useState<number>();

  return {
    openPosition,
  };
};

const Container = createContainer(useTradeHook);

export const useTrade = Container.useContainer;

export const TradeProvider = Container.Provider;

export default Container;
