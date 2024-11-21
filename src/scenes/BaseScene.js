import Phaser from "phaser";

class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key);
    this.config = config;
    this.centerPosition = [config.width / 2, config.height / 2];

    
  }

  create() {
    this.createBG();
  }

  createBG() {
    this.add.image(0, 0, "sky").setOrigin(0, 0);
  }

  createMenu(menu,setupMenuEvents) {
    let lastMenuItemPositionY = 0;
    menu.forEach((menuItem) => {
      const menuPosition = [
        this.centerPosition[0],
        this.centerPosition[1] + lastMenuItemPositionY,
      ];
      menuItem.textGO=this.add.text(...menuPosition, menuItem.text, {
        fontSize: "32px",
        fill: "#88f011",
      }).setOrigin(0.5,1);
      lastMenuItemPositionY += 42;
      setupMenuEvents(menuItem);
    });

  }

  
}

export default BaseScene;
