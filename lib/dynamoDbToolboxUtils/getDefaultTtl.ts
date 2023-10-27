import { oneHourInSeconds } from '../constants';

const getDefaultTtl = (): number =>
  Math.ceil(new Date().getTime() / 1000) + oneHourInSeconds;

export default getDefaultTtl;
