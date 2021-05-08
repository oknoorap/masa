import { useState, useEffect, useCallback } from "react";
import { createContainer } from "unstated-next";
import Big from "big.js";

import { useDB, TradeSchema, TaskSchema } from "hooks/use-database";
import { useTask } from "hooks/use-task";

const useTradeHook = () => {
  const { walletDBRef, tradesDBRef, isDbReady } = useDB();
  const { addTask, todos } = useTask();
  const [timeBalance, setTimeBalance] = useState<number>();
  const [prodBalance, setProdBalance] = useState<number>();
  const [openPosition, setOpenPosition] = useState<"buy" | "sell">();

  const addTrade = useCallback(
    async (trade: Omit<TradeSchema, "id">) => {
      if (!isDbReady) return;
      await tradesDBRef.current.add(trade);

      const symbol = trade.position === "sell" ? "$TIME" : "$PROD";
      const wallet = await walletDBRef.current.get({ symbol });
      const $balance = await wallet.balance;
      const balance = new Big($balance).minus(trade.amount).toNumber();
      await walletDBRef.current.update(wallet.id, { balance });
    },
    [isDbReady]
  );

  const sell = useCallback(
    async (amount: number, price: number, task: Omit<TaskSchema, "id">) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const position = "sell";
      const status = "open";
      const taskId = await addTask({ ...task, todos });
      await addTrade({
        createdAt,
        updatedAt,
        position,
        amount,
        price,
        status,
        taskId,
      });
      setOpenPosition("sell");
    },
    [addTrade, addTask, todos]
  );

  const buy = useCallback(
    async (
      amount: number,
      price: number,
      task: Pick<
        TaskSchema,
        "title" | "description" | "achievement" | "priority"
      >
    ) => {
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const position = "buy";
      const status = "open";
      const taskId = await addTask(task);
      await addTrade({
        createdAt,
        updatedAt,
        position,
        amount,
        price,
        status,
        taskId,
      });
      setOpenPosition("buy");
    },
    [addTrade, addTask]
  );

  useEffect(() => {
    if (!walletDBRef.current) return;

    async function init() {
      const balance = await walletDBRef.current.limit(2).toArray();
      const $TIME = balance.find(({ symbol }) => symbol === "$TIME");
      const $PROD = balance.find(({ symbol }) => symbol === "$PROD");

      if ($TIME) {
        setTimeBalance($TIME.balance);
      }

      if ($PROD) {
        setProdBalance($PROD.balance);
      }
    }

    init();
  });

  useEffect(() => {
    if (!isDbReady) return;
    if (!tradesDBRef.current) return;

    async function init() {
      const openPosition = await tradesDBRef.current
        .where({ status: "open" })
        .last();
      if (openPosition) {
        setOpenPosition(openPosition.position);
      }
    }

    init();
  }, [isDbReady]);

  return {
    openPosition,
    timeBalance,
    prodBalance,
    buy,
    sell,
  };
};

const Container = createContainer(useTradeHook);

export const useTrade = Container.useContainer;

export const TradeProvider = Container.Provider;

export default Container;
