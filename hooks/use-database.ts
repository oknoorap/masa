import { useRef, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import Dexie from "dexie";
import subMinutes from "date-fns/subMinutes";
import getUnixTime from "date-fns/getUnixTime";
import random from "lodash/random";

import { getNewPriceFrom } from "utils/price";

export enum DBKeys {
  Name = "masa",
  Series = "series",
}

export type SeriesSchema = {
  id?: number;
  price: number;
  timestamp: number;
};

export type WalletSchema = {
  id?: number;
  symbol: "$TIME" | "$PROD";
  balance?: number;
};

export type TaskSchema = {
  id?: number;
  title: string;
  description: string;
  todos?: string[];
  priority?: "low" | "high";
  achievement?: string;
};

export type TradeSchema = {
  id?: number;
  price: number;
  amount: number;
  createdAt: number;
  updatedAt: number;
  position: "sell" | "buy";
  status: "open" | "close";
  taskId: number;
};

type SeriesTable = Dexie.Table<SeriesSchema, number>;
type WalletTable = Dexie.Table<WalletSchema, number>;
type TasksTable = Dexie.Table<TaskSchema, number>;
type TradesTable = Dexie.Table<TradeSchema, number>;

class MasaDB extends Dexie {
  series: SeriesTable;
  wallet: WalletTable;
  tasks: TasksTable;
  trades: TradesTable;

  constructor() {
    super(DBKeys.Name);

    this.version(3).stores({
      series: "++id,price,[timestamp]",
      wallet: "++id,balance,symbol",
      tasks: "++id,title,description,todos,priority,achievement",
      trades: "++id,price,amount,createdAt,updatedAt,position,status,taskId",
    });
  }
}

const useDBHook = () => {
  const db = useRef<MasaDB>();
  const seriesDBRef = useRef<SeriesTable>();
  const walletDBRef = useRef<WalletTable>();
  const tasksDBRef = useRef<TasksTable>();
  const tradesDBRef = useRef<TradesTable>();
  const [isDbReady, setDbReadyStatus] = useState(false);

  useEffect(() => {
    if (!process.browser) return;

    async function init() {
      const indexedDB = new MasaDB();
      const series = await indexedDB.series.limit(1).toArray();

      // We'er not using on populate event
      // since, it called once,
      // and we can't set `isDbReady` status after populate
      if (!series.length) {
        const now = Date.now();
        let timestamp = getUnixTime(subMinutes(new Date(now), 60 * 5)) * 1000;
        let price = 500;
        const series = [];

        while (timestamp <= now) {
          series.push({
            price,
            timestamp,
          });
          timestamp += random(500, 2000, true);
          price = getNewPriceFrom(price);
        }

        await indexedDB.series.bulkAdd(series);
        await indexedDB.wallet.bulkAdd([
          {
            symbol: "$TIME",
            balance: 500,
          },
          {
            symbol: "$PROD",
            balance: 500,
          },
        ]);
      }

      db.current = indexedDB;
      seriesDBRef.current = indexedDB.series;
      walletDBRef.current = indexedDB.wallet;
      tasksDBRef.current = indexedDB.tasks;
      tradesDBRef.current = indexedDB.trades;
      setDbReadyStatus(true);
    }

    init();
  }, []);

  return {
    db,
    seriesDBRef,
    walletDBRef,
    tasksDBRef,
    tradesDBRef,
    isDbReady,
  };
};

const Container = createContainer(useDBHook);

export const useDB = Container.useContainer;

export const DBProvider = Container.Provider;

export default Container;
