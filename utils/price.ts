import random from "lodash/random";
import shuffle from "lodash/shuffle";
import Big from "big.js";

export type RandomPrice = [minPrice: number, maxPrice: number];

export function getNewPriceFrom(
  price: number,
  randomizer: number[] = [1, 0],
  minMaxPrice: RandomPrice = [1, 5]
) {
  const randomPrice = random(minMaxPrice[0], minMaxPrice[1], true);
  const randomPosition = shuffle(randomizer);
  const $price = new Big(price);
  const [isUp] = shuffle(randomPosition);
  const newPrice = isUp
    ? $price.plus(randomPrice).toNumber()
    : $price.minus(randomPrice).toNumber();
  return Math.sign(newPrice) < 0 ? 0 : newPrice;
}
