import { useState, useMemo, useEffect, useRef } from "react";
import random from "lodash/random";
import shuffle from "lodash/shuffle";
import groupBy from "lodash/groupBy";
import dateFormat from "date-fns/format";
import startOfMinute from "date-fns/startOfMinute";
import startOfHour from "date-fns/startOfHour";
import startOfDay from "date-fns/startOfDay";
import startOfWeek from "date-fns/startOfWeek";
import differenceInSeconds from "date-fns/differenceInSeconds";
import subMinutes from "date-fns/subMinutes";
import getUnixTime from "date-fns/getUnixTime";
import Big from "big.js";

import { useDB } from "hooks/use-database";
import { Position, useTrade } from "hooks/use-trade";

type PriceSeries = [price: number, time: number][];

enum Timeframe {
  M1 = "m1",
  M5 = "m5",
  M30 = "m30",
  H1 = "h1",
  H4 = "h4",
  D1 = "d1",
  W1 = "w1",
  W4 = "w4",
}

enum DBKeys {
  Name = "masa",
  Series = "series",
}

const useChart = () => {
  const { db, isDbReady } = useDB();
  const { openPosition } = useTrade();
  const seriesRef = useRef<any>();
  const [isChartReady, setChartStatus] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.M1);
  const [hasSynced, setSyncStatus] = useState(false);
  const [data, setData] = useState<PriceSeries>([]);

  // Memoized Series
  // Get data series and take only last 100 data
  const series = useMemo(() => {
    const timeframeGroup = groupBy(data, ([time]) => {
      switch (timeframe) {
        case Timeframe.M1:
          return dateFormat(time, "dd-MM-yyyy HH:mm");

        case Timeframe.M5:
          return `${dateFormat(time, "dd-MM-yyyy HH")} ${Math.floor(
            Number(dateFormat(time, "m")) / 5
          )}`;

        case Timeframe.M30:
          return `${dateFormat(time, "dd-MM-yyyy HH")} ${Math.floor(
            Number(dateFormat(time, "m")) / 30
          )}`;

        case Timeframe.H1:
          return dateFormat(time, "dd-MM-yyyy HH");

        case Timeframe.H4:
          return `${dateFormat(time, "dd-MM-yyyy HH")} ${Math.floor(
            Number(dateFormat(time, "k")) / 4
          )}`;

        case Timeframe.D1:
          return dateFormat(time, "dd-MM-yyyy");

        case Timeframe.W1:
          return dateFormat(time, "wo MM-yyyy");

        case Timeframe.W4:
          return `${dateFormat(time, "MM-yyyy")} ${Math.floor(
            Number(dateFormat(time, "w")) / 4
          )}`;
      }
    });

    return Object.entries(timeframeGroup)
      .map(([, values]) => values)
      .map((value) => {
        const priceSeries = value.sort((a, z) => a[1] - z[1]);
        const [open, timestamp] = priceSeries[0];
        const time = new Date(timestamp);
        const [latestPrice] = priceSeries.reverse();
        const [close] = latestPrice;
        const priceValues = priceSeries.map(([price]) => price);
        const high = Math.max(...priceValues);
        const low = Math.min(...priceValues);

        let date;
        switch (timeframe) {
          case Timeframe.M1:
          case Timeframe.M5:
          case Timeframe.M30:
            date = startOfMinute(time);
            break;

          case Timeframe.H1:
          case Timeframe.H4:
            date = startOfHour(time);
            break;

          case Timeframe.D1:
            date = startOfDay(time);
            break;

          case Timeframe.W4:
          case Timeframe.W1:
            date = startOfWeek(time);
            break;
        }

        return [date, open, high, low, close];
      })
      .splice(-100);
  }, [data, timeframe]);

  // Generate data:
  // - First sync-up data from indexed-db
  // - Add tick simulator
  useEffect(() => {
    if (!process.browser) return;
    if (!isDbReady) return;

    let reqAnimFrame: number;
    let timeout;

    function getNewPriceFrom(price: number) {
      const randomPrice = random(1, 5, true);
      const randomPosition = shuffle(
        !openPosition
          ? [1, 0]
          : openPosition === Position.Buy
          ? [0, 0, 0, 1]
          : [1, 1, 1, 0]
      );
      const $price = new Big(price);
      const [isUp] = randomPosition;
      const newPrice = isUp
        ? $price.plus(randomPrice).toNumber()
        : $price.minus(randomPrice).toNumber();
      return Math.sign(newPrice) < 0 ? 0 : newPrice;
    }

    async function init() {
      let frameReqCallback: FrameRequestCallback = async () => {
        const timestamp = Date.now();
        const { price: lastPrice } = await db.current.toCollection().last();

        timeout = setTimeout(() => {
          const price = getNewPriceFrom(lastPrice);
          db.current
            .add({
              price,
              timestamp,
            })
            .then(async () => {
              const tsFrom =
                getUnixTime(subMinutes(new Date(timestamp), 60)) * 1000;
              const tsTo = timestamp;
              const data = await db.current
                .where("[timestamp]")
                .between([tsFrom], [tsTo])
                .toArray();

              setData(
                data
                  .slice(-500)
                  .map(({ price, timestamp }) => [price, timestamp])
              );
              reqAnimFrame = requestAnimationFrame(frameReqCallback);
            });
        }, random(650, 1700, false));
      };

      reqAnimFrame = requestAnimationFrame(frameReqCallback);
    }

    // Sync data before initialization
    async function sync() {
      let { price, timestamp } = await db.current.toCollection().last();

      return new Promise((resolve) => {
        timeout = setTimeout(async () => {
          const now = Date.now();
          const diffTicks = differenceInSeconds(
            new Date(now),
            new Date(timestamp)
          );

          const bulkSeries = [];
          for (let i = 0; i < diffTicks; i++) {
            if (timestamp >= now) break;
            timestamp += random(500, 2000);
            price = getNewPriceFrom(price);
            bulkSeries.push({
              price,
              timestamp,
            });
          }

          await db.current.bulkAdd(bulkSeries);
          resolve(true);
        }, 2500);
      });
    }

    sync().then(async () => {
      setSyncStatus(true);
      await init();
    });

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(reqAnimFrame);
    };
  }, [openPosition, isDbReady]);

  // Draw candlestick
  useEffect(() => {
    if (!process.browser) return;
    if (isChartReady) {
      if (!series.length) return;
      if (!seriesRef.current) return;

      if (series.length >= 100) {
        const [latestData] = [...series];
        seriesRef.current.addSeries(latestData);
      } else {
        seriesRef.current.addSeries(series);
      }
      return;
    }

    async function drawChart() {
      const anychart = (window as Window &
        typeof globalThis & {
          anychart: {
            onDocumentReady: (fn: Function) => void;
            stock: () => any;
            candlestick: () => any;
            data: any;
            plot: any;
          };
        }).anychart;

      anychart.onDocumentReady(() => {
        const chart = anychart.candlestick();
        chart.container("candlestick");
        chart.crosshair(true);
        chart.draw();
        seriesRef.current = chart;
        setChartStatus(true);
      });
    }

    window.addEventListener("load", drawChart, false);
    return () => {
      window.removeEventListener("load", drawChart, false);
    };
  }, [isChartReady, series]);

  return {
    series,
    hasSynced,
  };
};

export default useChart;
