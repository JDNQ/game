import { GameApp } from "./game/app.js";

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("#app missing");
}
new GameApp(root);
