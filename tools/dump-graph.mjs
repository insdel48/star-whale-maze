import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import baseline from "./baseline-graphs.mjs";

const root = path.resolve(import.meta.dirname, "..");
const ids = ["forest", "clock", "dragon", "sea", "stars", "cloudtrain", "moonlibrary"];
const sandbox = { window: {} };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

for (const id of ids) {
  const filename = path.join(root, "levels", id + ".js");
  vm.runInContext(fs.readFileSync(filename, "utf8"), sandbox, { filename });
}

let failures = 0;
for (const id of ids) {
  const current = sandbox.window.STAR_MAZE_LEVELS[id];
  const expected = baseline[id];
  const equal =
    JSON.stringify(current.nodes) === JSON.stringify(expected.nodes) &&
    JSON.stringify(current.edges) === JSON.stringify(expected.edges) &&
    JSON.stringify(current.special) === JSON.stringify(expected.special);
  if (!equal) failures += 1;

  const point = (nodeId) => {
    const node = current.nodes[nodeId];
    return [node.x, node.y];
  };
  const specialCoordinates = {
    start: point(current.special.start),
    goal: point(current.special.goal),
    collectibles: current.special.collectibles.map(point)
  };
  console.log(
    (equal ? "PASS " : "FAIL ") + id +
    " nodes=" + current.nodes.length +
    " edges=" + current.edges.length +
    " special=" + JSON.stringify(current.special) +
    " coordinates=" + JSON.stringify(specialCoordinates)
  );
}

if (failures) process.exitCode = 1;
