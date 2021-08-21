import { benchmark } from "../Utils/fakeUtils";
import { approach1AsyncAwait } from "./approach1AsyncAwait";
import { approach2PromiseAll } from "./approach2PromiseAll";
import { approach3Observable } from "./approach3Observable";
import { approach4ObservableBuffer } from "./approach4ObservableBuffer";

const DEFAULT_RUN_TIMES = 3

export const benchmarkAllCompanies = async () => {
    const runTimes = DEFAULT_RUN_TIMES
    const avg1 = await benchmark("1-AsyncAwait", approach1AsyncAwait, runTimes);
    const avg2 = await benchmark("2-PromiseAll", approach2PromiseAll, runTimes);
    const avg3 = await benchmark("3-Observable", approach3Observable, runTimes);
    const avg4 = await benchmark(
      "4-approach4ObservableBuffer",
      approach4ObservableBuffer,
      runTimes,
    );
    console.log(`2 vs 1 speed-up: ${(avg1 / avg2).toFixed(2)}x`);
    console.log(`3 vs 2 speed-up: ${(avg2 / avg3).toFixed(2)}x`);
    console.log(`4 vs 1 speed-up: ${(avg1 / avg4).toFixed(2)}x`);
    console.log(`4 vs 2 speed-up: ${(avg2 / avg4).toFixed(2)}x`);
    console.log(`4 vs 3 speed-up: ${(avg3 / avg4).toFixed(2)}x`);
  }