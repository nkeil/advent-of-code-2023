import * as fs from "fs";
const lines = fs.readFileSync("input.txt", "utf8").split("\n");

// exclusive on end
type Range = [number, number];

type Map = [number, number, number][];

// Get initial seed ranges
const line0Nums = lines[0]
  .match(/^seeds: +([\d +]*)$/)![1]
  .split(/ +/)
  .map((x) => parseInt(x));
const seedRanges: Range[] = [];
for (let i = 0; i < line0Nums.length; i += 2) {
  let [lo, range] = line0Nums.slice(i, i + 2);
  seedRanges.push([lo, lo + range]);
}

// Get maps
const maps = [];
let currentMap: Map = [];
for (const line of lines.slice(1)) {
  if (!line) continue;
  if (line.endsWith("map:")) {
    if (currentMap.length > 0) maps.push(currentMap);
    currentMap = [];
  } else {
    const numbers = line.split(/ +/).map((x) => parseInt(x));
    if (numbers.length !== 3) throw new Error();
    currentMap.push([numbers[0], numbers[1], numbers[2]]);
  }
}
if (currentMap.length > 0) maps.push(currentMap);
if (!seedRanges) throw new Error();

// Run all seed ranges through maps
let currentSeedRanges = [...seedRanges];
for (const map of maps) {
  // Run all seed ranges through current map
  let unusedSeedRanges = currentSeedRanges;
  let mappedSeedRanges: Range[] = [];
  for (const [destLo, sourceLo, offset] of map) {
    const sourceHi = sourceLo + offset;
    const destChange = destLo - sourceLo;

    // seed ranges that didn't get mapped by the current map range
    // (still may get mapped by a future map range)
    let newUnusedSeedRanges: Range[] = [];

    for (const [seedLo, seedHi] of unusedSeedRanges) {
      if (sourceLo >= seedHi || sourceHi < seedLo) {
        newUnusedSeedRanges.push([seedLo, seedHi]);
        continue;
      } else if (sourceLo <= seedLo && seedHi <= sourceHi) {
        mappedSeedRanges.push([seedLo + destChange, seedHi + destChange]);
      } else {
        if (seedLo < sourceLo) {
          newUnusedSeedRanges.push([seedLo, sourceLo]);
        }
        if (sourceHi < seedHi) {
          newUnusedSeedRanges.push([sourceHi, seedHi]);
        }
        mappedSeedRanges.push([
          Math.max(seedLo, sourceLo) + destChange,
          Math.min(seedHi, sourceHi) + destChange,
        ]);
      }
    }
    unusedSeedRanges = newUnusedSeedRanges;
  }
  currentSeedRanges = [...unusedSeedRanges, ...mappedSeedRanges];
}

console.log(Math.min(...currentSeedRanges.map((r) => r[0])));
