import Phaser from "phaser";
import BaseScene from "./BaseScene";

class ScoreScene extends BaseScene {
  constructor(config) {
    super("ScoreScene", config);
    this.centerPosition = [config.width / 2, config.height / 2];
    this.lefttopcprner = [config.width / 10, config.height / 10];
  }

  create() {
    super.create();

    const bestScore = localStorage.getItem("bestScore");
    const timeStamp=localStorage.getItem("bestScoreTimeStamp")
    const date=new Date(parseInt(timeStamp, 10));
    const bestScoreTimeStamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    this.add
      .text(...this.centerPosition, `BestScore:${bestScore || 0}`, {
        fontSize: "32px",
        fill: "#fff",
      })
      .setOrigin(0.5, 1);
    this.add
      .text(this.centerPosition[0],this.centerPosition[1]+42, `Saved on:${bestScoreTimeStamp || 0}`, {
        fontSize: "24px",
        fill: "#fff",
      })
      .setOrigin(0.5, 1);

    const backbutton = this.add
      .text(...this.lefttopcprner, "Back", {
        fontSize: "32px",
        fill: "#fff",
      })
      .setOrigin(0.5, 1);

    this.handleBack(backbutton);
  }

  handleBack(backbutton) {
    backbutton.setInteractive();
    backbutton.on("pointerover", () => {
      backbutton.setStyle({ fill: "#1ce874" });
    });
    backbutton.on("pointerout", () => {
      backbutton.setStyle({ fill: "#fff" });
    });
    backbutton.on("pointerup", () => this.scene.start("MenuScene"));
  }
}

export default ScoreScene;
