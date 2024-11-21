import BaseScene from "./BaseScene";
const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);
    this.bird = null;
    this.pipes = null;
    this.pipeOpeningDistanceRange = [150, 250];
    this.pipeHorizontalDistance = 0;
    this.pipeHorizontalDistanceRange = [200, 500];

    this.VELOCITY = 200;
    this.flapVelocity = 200;

    this.score = 0;
    this.scoreText = "";

    this.isPaused = false;

    this.currenDifficulties = "easy";
    this.difficulties = {
      'easy': {
        pipeHorizontalDistanceRange: [200, 500],
        pipeOpeningDistanceRange: [100, 250],
      },
      'normal': {
        pipeHorizontalDistanceRange: [200, 400],
        pipeOpeningDistanceRange: [100, 200],
      },
      'hard': {
        pipeHorizontalDistanceRange: [200, 350],
        pipeOpeningDistanceRange: [150, 200],
      },
    };
  }

  create() {
    this.currenDifficulties='easy';
    super.create();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInput();
    this.listenToEvents();

    this.anims.create({
      key:"fly",
      frames:this.anims.generateFrameNumbers('bird',{start:8,end:15}),
      frameRate:96,
      repeat:-1
    });
    this.bird.play("fly")
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  // createBG() {
  //   this.add.image(0, 0, "sky").setOrigin(0, 0);
  // }
  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
      .setFlipX(true)
      .setScale(2)
      .setOrigin(0);

    this.bird.setBodySize(this.bird.width,this.bird.height)
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

  createPause() {
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setScale(3)
      .setOrigin(1)
      .setInteractive(); //set this button interactive
    pauseButton.on("pointerdown", () => {
      this.isPaused = true;
      this.physics.pause();
      this.scene.pause();
      this.scene.launch("PauseScene");
    });
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
    if (this.isPaused) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  placePipe(upperPipe, lowerPipe) {
    const difficulty = this.difficulties[this.currenDifficulties];
    const rightMostX = this.getRightMostPipe();
    this.pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange
    );
    const pipeVerticalDistance = Phaser.Math.Between(
      ...difficulty.pipeOpeningDistanceRange
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      100,
      this.config.height - 100 - pipeVerticalDistance
    );

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
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty(){
    if(this.score===5){
      this.currenDifficulties='normal'
    }
    if(this.score===15){
      this.currenDifficulties='hard'
    }
  }
  saveBestScore() {
    const bestScoreText = localStorage.getItem("bestScore");
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);
    if (!bestScore || this.score > bestScore) {
      localStorage.setItem("bestScore", this.score);
      localStorage.setItem("bestScoreTimeStamp", Date.now());
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

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }
    this.pauseEvent = this.events.on("resume", () => {
      this.initalTime = 3;
      this.nowTime = this.initalTime;
      this.countDownText = this.add
        .text(...this.centerPosition, "Fly in " + this.nowTime, {
          fontSize: "34px",
          fill: "#fff",
        })
        .setOrigin(0.5);
      this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDownt,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDownt() {
    this.initalTime--;
    this.countDownText.setText("Fly in " + this.initalTime);
    if (this.initalTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText("");
      this.physics.resume();
      this.timeEvent.remove();
    }
  }
}

export default PlayScene;
