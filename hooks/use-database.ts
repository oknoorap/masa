import { useRef, useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import Dexie from "dexie";

export enum DBKeys {
  Name = "masa",
  Series = "series",
}

type SeriesSchema = {
  id?: number;
  price: number;
  timestamp: number;
};

class SeriesDB extends Dexie {
  series: Dexie.Table<SeriesSchema, number>;

  constructor() {
    super(DBKeys.Name);

    this.version(3).stores({
      series: "++id,price,[timestamp]",
    });

    this.on("populate", () => {
      this.series.add({
        price: 1,
        timestamp: Date.now(),
      });
    });
  }
}

const useDBHook = () => {
  const db = useRef<Dexie.Table<SeriesSchema, number>>();
  const [isDbReady, setDbReadyStatus] = useState(false);

  useEffect(() => {
    if (!process.browser) return;
    const seriesdb = new SeriesDB();
    db.current = seriesdb.series;
    setDbReadyStatus(true);
  }, []);

  return {
    db,
    isDbReady,
  };
};

const Container = createContainer(useDBHook);

export const useDB = Container.useContainer;

export const DBProvider = Container.Provider;

export default Container;
