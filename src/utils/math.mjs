export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const getRandomFloat = (min, max) => Math.random() * (max - min) + min
export const wrap = (a, n) => ((a % n) + n) % n
export const roundToClosestMultipleOf = (n, m) => Math.round(n / m) * m
export const getRandomItem = arr => arr[getRandomInt(0, arr.length - 1)]