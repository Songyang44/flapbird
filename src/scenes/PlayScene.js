import Phaser from "phaser";

const PIPES_TO_RENDER = 4;

class PlayScene extends Phaser.Scene {
  constructor(config) {
    super("PlayScene");
    this.config = config;
    this.bird = null;
    this.pipes = null;
    this.pipeOpeningDistanceRange = [150, 250];
    this.pipeHorizontalDistance = 0;
    this.pipeHorizontalDistanceRange = [200, 500];

    this.VELOCITY = 200;
    this.flapVelocity = 200;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
  }

  create() {
    this.createBG();
    this.createBird();
    this.createPipes();
    this.handleInput();
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  createBG() {
    this.add.image(0, 0, "sky").setOrigin(0, 0);
  }
  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
      .setOrigin(0);

    this.bird.body.gravity.y = 400;
  }
  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, "pipe").setOrigin(0, 1);

      const lowerPipe = this.pipes.create(0, 0, "pipe").setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }
    this.pipes.setVelocityX(-200);
  }

  handleInput() {
    this.input.on("pointerdown", this.flap, this);
  }

  checkGameStatus(){
    if (this.bird.y >= this.config.height - this.bird.height) {
        this.restarBirdPosition();
      }
  }

  flap() {
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  placePipe(upperPipe, lowerPipe) {
    this.pipeHorizontalDistance = Phaser.Math.Between(
      ...this.pipeHorizontalDistanceRange
    );
    const pipeVerticalDistance = Phaser.Math.Between(
      ...this.pipeOpeningDistanceRange
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      100,
      this.config.height - 100 - pipeVerticalDistance
    );

    const rightMostX = this.getRightMostPipe();

    upperPipe.x = rightMostX + this.pipeHorizontalDistance;
    upperPipe.y = pipeVerticalPosition;

    lowerPipe.x = upperPipe.x;
    lowerPipe.y = upperPipe.y + pipeVerticalDistance;
  }

  getRightMostPipe() {
    let rightMostX = 0;
    this.pipes.getChildren().forEach(function (pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    });
    return rightMostX;
  }

  recyclePipes() {
    let tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          tempPipes = [];
        }
      }
    });
  }

  restarBirdPosition() {
    this.bird.x = this.config.startPosition.x;
    this.bird.y = this.config.startPosition.y;
    this.bird.body.velocity.y = 0;
  }
}

export default PlayScene;
