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

    this.score = 0;
    this.scoreText = "";
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
    this.createColliders();
    this.createScore();
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
    this.bird.setCollideWorldBounds(true);
  }
  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 1);

      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }
    this.pipes.setVelocityX(-200);
  }
  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem("bestScore");
    this.scoreText = this.add.text(20, 20, `Score:${this.score}`, {
      fontSize: "24px",
    });
    this.add.text(20, 40, `Best score:${bestScore}`, { fontSize: "18px" });
  }
  handleInput() {
    this.input.on("pointerdown", this.flap, this);
  }

  checkGameStatus() {
    if (
      this.bird.y >= this.config.height - this.bird.height ||
      this.bird.getBounds().top <= 0
    ) {
      this.gameOver();
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
          this.increaseScore();
          this.saveBestScore();
        }
      }
    });
  }
  saveBestScore() {
    const bestScoreText = localStorage.getItem("bestScore");
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);
    if (!bestScore || this.score > bestScore) {
      localStorage.setItem("bestScore", this.score);
    }
  }
  gameOver() {
    // this.bird.x = this.config.startPosition.x;
    // this.bird.y = this.config.startPosition.y;
    // this.bird.body.velocity.y = 0;
    this.physics.pause();
    this.bird.setTint(0x8d13eb);
    this.saveBestScore();
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score:${this.score}`);
  }
}

export default PlayScene;
