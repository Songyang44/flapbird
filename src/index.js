import Phaser, { Physics } from "phaser";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
};

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  physics: {
    //Arcade physics plugin,manages physics simulation
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [new PlayScene(SHARED_CONFIG)],
};


new Phaser.Game(config);
