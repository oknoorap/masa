import { useState, useMemo, useEffect, useRef } from "react";
import { createContainer } from "unstated-next";
import random from "lodash/random";
import groupBy from "lodash/groupBy";
import fromEntries from "lodash/fromPairs";
import dateFormat from "date-fns/format";
import startOfMinute from "date-fns/startOfMinute";
import startOfHour from "date-fns/startOfHour";
import startOfDay from "date-fns/startOfDay";
import startOfWeek from "date-fns/startOfWeek";
import subMinutes from "date-fns/subMinutes";
import getUnixTime from "date-fns/getUnixTime";

import { useDB } from "hooks/use-database";
import { useTrade } from "hooks/use-trade";
import { getNewPriceFrom, RandomPrice } from "utils/price";
import theme from "themes/default";

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

export enum MarketSentiment {
  Bullish,
  Bearish,
  Neutral,
}

type OHLC = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type PriceSeries = [price: number, time: number][];

const digit = 4;

const useChartHook = () => {
  const { seriesDBRef, isDbReady } = useDB();
  const { openPosition } = useTrade();
  const seriesRef = useRef<any>();
  const [isChartReady, setChartStatus] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.M1);
  const [hasSynced, setSyncStatus] = useState(false);
  const [data, setData] = useState<PriceSeries>([]);
  const lastPrice = useMemo(
    () => [...data].reverse()?.[0]?.[0]?.toFixed(digit) ?? 0,
    [data]
  );
  const secondLastPrice = useMemo(
    () => [...data].reverse()?.[1]?.[0]?.toFixed(digit) ?? 0,
    [data]
  );
  const isPriceUp = useMemo(() => lastPrice > secondLastPrice, [
    lastPrice,
    secondLastPrice,
  ]);
  const isPriceStuck = useMemo(() => lastPrice === secondLastPrice, [
    lastPrice,
    secondLastPrice,
  ]);

  // Memoized Series
  // Get data series and take only last 100 data
  const series = useMemo(() => {
    const timeframeGroup = groupBy(data, ([, timestamp]) => {
      switch (timeframe) {
        case Timeframe.M1:
          return dateFormat(timestamp, "dd-MM-yyyy HH:mm");

        case Timeframe.M5:
          return `${dateFormat(timestamp, "dd-MM-yyyy HH")} ${Math.floor(
            Number(dateFormat(timestamp, "m")) / 5
          )}`;

        case Timeframe.M30:
          return `${dateFormat(timestamp, "dd-MM-yyyy HH")} ${Math.floor(
            Number(dateFormat(timestamp, "m")) / 30
          )}`;

        case Timeframe.H1:
          return dateFormat(timestamp, "dd-MM-yyyy HH");

        case Timeframe.H4:
          return `${dateFormat(timestamp, "dd-MM-yyyy HH")} ${Math.floor(
            Number(dateFormat(timestamp, "k")) / 4
          )}`;

        case Timeframe.D1:
          return dateFormat(timestamp, "dd-MM-yyyy");

        case Timeframe.W1:
          return dateFormat(timestamp, "wo MM-yyyy");

        case Timeframe.W4:
          return `${dateFormat(timestamp, "MM-yyyy")} ${Math.floor(
            Number(dateFormat(timestamp, "w")) / 4
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

        return { time: getUnixTime(date), open, high, low, close };
      });
  }, [data, timeframe]);

  const [ohlc, setOHLC] = useState<OHLC>();
  const currentOHLC = useMemo(
    () =>
      fromEntries(
        Object.entries(
          ohlc ? ohlc : [...series].reverse()?.[0] ?? {}
        ).map(([key, val]) => [key, key === "time" ? val : val.toFixed(digit)])
      ),
    [series, ohlc]
  );

  const sentiment = useMemo<MarketSentiment>(() => {
    const [lastMarket] = [...series].reverse();
    if (!lastMarket) return MarketSentiment.Neutral;
    return lastMarket.close < lastMarket.open
      ? MarketSentiment.Bearish
      : MarketSentiment.Bullish;
  }, [series]);

  // Generate data:
  // - First sync data with indexed-db
  // - Add tick simulator
  useEffect(() => {
    if (!process.browser) return;
    if (!isDbReady) return;

    let reqAnimFrame: number;
    let timeout;
    const randomPricePosition = !openPosition
      ? [1, 0]
      : openPosition === "buy"
      ? [0, 0, 1]
      : [1, 1, 0];
    const randomPrice: RandomPrice = !openPosition ? [1, 5] : [1, 2];

    async function init() {
      let frameReqCallback: FrameRequestCallback = async () => {
        const timestamp = Date.now();
        const {
          price: lastPrice,
        } = await seriesDBRef.current.toCollection().last();

        timeout = setTimeout(() => {
          const price = getNewPriceFrom(
            lastPrice,
            randomPricePosition,
            randomPrice
          );
          seriesDBRef.current
            .add({
              price,
              timestamp,
            })
            .then(async () => {
              const tsFrom =
                getUnixTime(subMinutes(new Date(timestamp), 60)) * 1000;
              const tsTo = timestamp;
              const data = await seriesDBRef.current
                .where("[timestamp]")
                .between([tsFrom], [tsTo])
                .limit(20000)
                .toArray();

              const series: PriceSeries = data.map(({ price, timestamp }) => [
                price,
                timestamp,
              ]);
              setData(series);
              cancelAnimationFrame(reqAnimFrame);
              reqAnimFrame = requestAnimationFrame(frameReqCallback);
            });
        }, random(650, 1700, false));
      };

      reqAnimFrame = requestAnimationFrame(frameReqCallback);
    }

    // Sync data before initialization
    async function sync() {
      let {
        price,
        timestamp,
      } = await seriesDBRef.current.toCollection().last();

      return new Promise((resolve) => {
        timeout = setTimeout(async () => {
          const now = Date.now();
          const bulkSeries = [];
          while (timestamp <= now) {
            timestamp += random(500, 2000);
            price = getNewPriceFrom(price, randomPricePosition);
            bulkSeries.push({
              price,
              timestamp,
            });
          }

          await seriesDBRef.current.bulkAdd(bulkSeries);
          resolve(true);
        }, 2500);
      });
    }

    if (hasSynced) {
      init();
    } else {
      sync().then(async () => {
        await init();
        setSyncStatus(true);
      });
    }

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(reqAnimFrame);
    };
  }, [openPosition, hasSynced, isDbReady]);

  // Draw candlestick
  useEffect(() => {
    if (!process.browser) return;
    if (!isDbReady) return;
    if (!series.length) return;

    if (isChartReady) {
      if (!seriesRef.current) return;
      seriesRef.current.setData(series);
      return;
    }

    async function onCrossHairMove(param) {
      if (!param.point) {
        setOHLC(null);
        return;
      }

      const { seriesPrices } = param;
      const ohlc: OHLC = seriesPrices.values().next().value;
      if (ohlc?.open) setOHLC(ohlc);
    }

    async function drawChart() {
      const candlestickElement = document.querySelector<HTMLElement>(
        "#candlestick"
      );
      const chart = (window as any).LightweightCharts.createChart(
        candlestickElement,
        {
          width: candlestickElement.clientWidth,
          height: candlestickElement.clientHeight,
          layout: {
            backgroundColor: theme.colors.dark[500],
            textColor: theme.colors.gray[400],
            fontSize: 12,
            fontFamily: "sans-serif",
          },
          priceScale: {
            borderColor: theme.colors.dark[200],
          },
          timeScale: {
            timeVisible: true,
          },
          crosshair: {
            vertLine: {
              color: theme.colors.dark[200],
            },
            horzLine: {
              color: theme.colors.dark[200],
            },
          },
          grid: {
            vertLines: {
              color: theme.colors.dark[100],
            },
            horzLines: {
              color: theme.colors.dark[100],
            },
          },
        }
      );
      chart.subscribeCrosshairMove(onCrossHairMove);
      seriesRef.current = chart.addCandlestickSeries();
      setChartStatus(true);
    }

    drawChart();
  }, [isDbReady, isChartReady, series]);

  return {
    data,
    isPriceUp,
    isPriceStuck,
    lastPrice,
    secondLastPrice,
    currentOHLC,
    sentiment,
    hasSynced,
  };
};

const Container = createContainer(useChartHook);

export const useChart = Container.useContainer;

export const ChartProvider = Container.Provider;

export default Container;
