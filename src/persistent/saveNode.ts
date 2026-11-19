import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  parseWorldJson,
  serializeWorld,
  type PersistentWorldState,
} from "./save.js";

export async function saveWorldToFile(
  world: PersistentWorldState,
  filePath: string,
): Promise<void> {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, serializeWorld(world), "utf8");
}

export async function loadWorldFromFile(
  filePath: string,
): Promise<PersistentWorldState> {
  const raw = await readFile(filePath, "utf8");
  return parseWorldJson(raw);
}
