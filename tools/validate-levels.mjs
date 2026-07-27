import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const defaultIds = ["forest", "clock", "dragon", "sea", "stars", "cloudtrain", "moonlibrary"];
const suppliedFile = process.argv[2] ? path.resolve(process.argv[2]) : null;
const suppliedMissionCount = suppliedFile ? Number(process.argv[3]) : null;
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const sandbox = { window: {} };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

if (suppliedFile) {
  vm.runInContext(fs.readFileSync(suppliedFile, "utf8"), sandbox, { filename: suppliedFile });
} else {
  for (const id of defaultIds) {
    const filename = path.join(root, "levels", id + ".js");
    vm.runInContext(fs.readFileSync(filename, "utf8"), sandbox, { filename });
  }
}

const levels = sandbox.window.STAR_MAZE_LEVELS;
const ids = suppliedFile ? Object.keys(levels) : defaultIds;
const missionCounts = {};
const chapterPattern = /mission:\s*"([^"]+)"[\s\S]*?theme:\s*"([^"]+)"/g;
for (const match of appSource.matchAll(chapterPattern)) {
  const countMatch = match[1].match(/\d+/);
  if (!countMatch) throw new Error(match[2] + ": mission has no collectible count");
  missionCounts[match[2]] = Number(countMatch[0]);
}
if (suppliedFile) {
  if (!Number.isInteger(suppliedMissionCount) || suppliedMissionCount < 1) {
    throw new Error("single-file validation requires a positive mission count as the second argument");
  }
  ids.forEach((id) => { missionCounts[id] = suppliedMissionCount; });
}

function adjacencyFor(level) {
  const adjacency = Array.from({ length: level.nodes.length }, () => []);
  const seen = new Set();
  for (const edge of level.edges) {
    if (!Array.isArray(edge) || edge.length !== 2) throw new Error(level.id + ": broken maze edge");
    const [a, b] = edge;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a === b || !level.nodes[a] || !level.nodes[b]) {
      throw new Error(level.id + ": broken maze edge");
    }
    const edgeKey = a < b ? a + ":" + b : b + ":" + a;
    if (seen.has(edgeKey)) throw new Error(level.id + ": duplicate maze edge");
    seen.add(edgeKey);
    adjacency[a].push(b);
    adjacency[b].push(a);
  }
  return adjacency;
}

function distances(adjacency, start) {
  const distance = Array(adjacency.length).fill(-1);
  const queue = [start];
  distance[start] = 0;
  for (let index = 0; index < queue.length; index += 1) {
    for (const next of adjacency[queue[index]]) {
      if (distance[next] !== -1) continue;
      distance[next] = distance[queue[index]] + 1;
      queue.push(next);
    }
  }
  return distance;
}

function validate(level) {
  if (!level || level.nodes.length < 50) throw new Error((level?.id || "unknown") + ": maze is not complex enough");
  level.nodes.forEach((node, index) => {
    if (node.id !== index || !Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      throw new Error(level.id + ": invalid maze node");
    }
  });
  const adjacency = adjacencyFor(level);
  if (level.edges.length < level.nodes.length || adjacency.filter((links) => links.length >= 3).length < 4) {
    throw new Error(level.id + ": maze needs more loops and crossroads");
  }
  const special = level.special;
  const landmarks = special && [special.start, special.goal, ...special.collectibles];
  if (!special || landmarks.length !== 5 || new Set(landmarks).size !== 5 || landmarks.some((id) => !level.nodes[id])) {
    throw new Error(level.id + ": invalid story landmarks");
  }
  const reach = distances(adjacency, special.start);
  if (reach.some((distance) => distance < 0)) throw new Error(level.id + ": disconnected maze region");
  if (reach[special.goal] < 12 || [special.goal, ...special.collectibles].some((id) => reach[id] < 4)) {
    throw new Error(level.id + ": challenge route is too short");
  }
  if (missionCounts[level.id] !== special.collectibles.length) {
    throw new Error(level.id + ": mission count does not match collectibles");
  }
  console.log(
    "PASS " + level.id +
    " nodes=" + level.nodes.length +
    " edges=" + level.edges.length +
    " crossroads=" + adjacency.filter((links) => links.length >= 3).length +
    " goalDistance=" + reach[special.goal]
  );
}

ids.forEach((id) => validate(levels[id]));
console.log("PASS " + ids.length + "/" + ids.length + " levels");
