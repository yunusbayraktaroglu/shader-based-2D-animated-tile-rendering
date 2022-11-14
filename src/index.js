import { GameManager } from "./GameManager";

const domTarget = document.querySelector("#game");
const options = {
  resources: {
    textures: [{ id: "gorillaTexture", url: "gorilla.png" }]
  },
  prefabs: [
    {
      type: "sprite",
      id: "gorilla",
      texture: "gorillaTexture",
      transparent: false,
      tile: [7, 3],
      fps: 50,
      width: 50,
      position: {
        top: 50,
        left: 50,
        origin: [0.5, 0.5] // x & y origin
      },
      z: 0
    }
  ]
};

window.gameManager = new GameManager();
window.gameManager.createGame(domTarget, options);
