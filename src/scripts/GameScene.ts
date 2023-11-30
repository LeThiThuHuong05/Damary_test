import * as PIXI from "pixi.js";
import { MainApp } from "./app";
import Server from "./Server";
import { GameConfig } from "./GameConfig";
import { Reel } from "./Reel";

export class GameScene extends PIXI.Container {
  constructor(server: Server) {
    super();

    /**
     * Register spin data responded event handler
     */
    this._server = server;
    this._server.registerDataRespondEvent(this._onSpinDataResponded.bind(this));

    /**
     * Added onUpdate function to PIXI Ticker so it will be called every frame
     */
    MainApp.inst.app.ticker.add(this.onUpdate, this);
    /**
     * Ask PIXI Loader to load needed resources
     */
    MainApp.inst.app.loader
      .add("logo", "images/logo.png")
      .add("frame", "images/frame.png")
      .add("symbol_1", "images/symbol_1.png")
      .add("symbol_2", "images/symbol_2.png")
      .add("symbol_3", "images/symbol_3.png")
      .add("symbol_4", "images/symbol_4.png")
      .add("symbol_5", "images/symbol_5.png")
      .add("symbol_6", "images/symbol_6.png")
      .add("symbol_7", "images/symbol_7.png")
      .add("symbol_8", "images/symbol_8.png")
      .add("symbol_K", "images/symbol_K.png")
      .add("symbol_1_blur", "images/symbol_1_blur.png")
      .add("symbol_2_blur", "images/symbol_2_blur.png")
      .add("symbol_3_blur", "images/symbol_3_blur.png")
      .add("symbol_4_blur", "images/symbol_4_blur.png")
      .add("symbol_5_blur", "images/symbol_5_blur.png")
      .add("symbol_6_blur", "images/symbol_6_blur.png")
      .add("symbol_7_blur", "images/symbol_7_blur.png")
      .add("symbol_8_blur", "images/symbol_8_blur.png")
      .add("symbol_K_blur", "images/symbol_K_blur.png")
      .load(this._onAssetsLoaded.bind(this));
  }

  static readonly NUMBER_OF_REELS = 5;
  static readonly NUMBER_OF_ROWS = 3;
  static readonly NUMBER_OF_ITEMS =
    GameScene.NUMBER_OF_REELS * GameScene.NUMBER_OF_ROWS;
  static readonly SYMBOL_WIDTH = 140;
  static readonly SYMBOL_HEIGHT = 150;
  static readonly SCENE_WIDTH = 1000;
  static readonly SCENE_HEIGHT = 960;
  static readonly SPIN_SPEED = 0.3;

  private _server: Server;

  private _isInitialized: boolean = false;
  private _logoSprite: PIXI.Sprite;
  private _frameSprite: PIXI.Sprite;
  private _spinText: PIXI.Text;
  private tweening = [];
  private reels = [];
  private resultSpin = [];
  //public readonly reels: Array<Reel> = [];
  public container: PIXI.Container;

  private reelsContainer = new PIXI.Container();
  public init(): void {
    // add logo
    this.addChild(this._logoSprite);
    this._logoSprite.position.set(GameConfig.SCENE_WIDTH / 2, 100);
    this._logoSprite.anchor.set(0.5);
    this._logoSprite.scale.set(0.5);

    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 50,
      fontWeight: "bold",
      fill: ["#ffffff", "#f0a500"], // gradient
      stroke: "#4a1850",
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    this._spinText = new PIXI.Text("Start Spin", style);
    this._spinText.x = GameConfig.SCENE_WIDTH / 2 - this._spinText.width / 2;
    this._spinText.y =
      MainApp.inst.app.screen.height -
      150 +
      Math.round((100 - this._spinText.height) / 2);
    this.addChild(this._spinText);

    /**
     * Enable interactive so we can click on this text
     */
    this._spinText.interactive = true;
    this._spinText.buttonMode = true;
    this._spinText.addListener("pointerdown", this._startSpin.bind(this));

    this._isInitialized = true;
    this._createBoard();
    // let's create a mask
    this._createMask(this.reelsContainer);
  }

  private _createBoard() {
    // Create BOARD
    const boardContainer = this.addChild(new PIXI.Container());
    boardContainer.position = new PIXI.Point(
      GameConfig.SCENE_WIDTH / 2,
      GameConfig.SCENE_HEIGHT / 2 + 100
    );

    for (let i = 0; i < GameConfig.REELS_NUMBER; i++) {
      const reel = new Reel(MainApp.inst.app, i);
      reel.eventEmitter.on("spincomplete", this._onReelSpinComplete.bind(this));
      this.reels.push(reel);
      boardContainer.addChild(reel.container);
    }

    this.reelsContainer = boardContainer;
  }

  private _createMask(boardContainer: PIXI.Container) {
    MainApp.inst.app.stage.addChild(boardContainer);
    const thing = new PIXI.Graphics();
    MainApp.inst.app.stage.addChild(thing);
    thing.position = boardContainer.position;
    thing.beginFill(0x8bc5ff, 1);
    thing.drawRect(
      -(boardContainer.width / 2),
      -(boardContainer.height / 2) - 40,
      boardContainer.width,
      boardContainer.height
    );
    thing.lineStyle(0);
    boardContainer.mask = thing;
    // add frame
    this.addChild(this._frameSprite);
    this._frameSprite.position.set(
      GameConfig.SCENE_WIDTH / 2,
      boardContainer.height + GameConfig.SYMBOL_HEIGHT / 2
    );
    this._frameSprite.width = boardContainer.width * 1.05;
    this._frameSprite.height = boardContainer.height * 1.2;
    this._frameSprite.anchor.set(0.5);
  }

  public onUpdate(dtScalar: number) {
    const dt = dtScalar / PIXI.settings.TARGET_FPMS / 1000;
    if (this._isInitialized) {
      /**
       * Update objects in scene here using dt (delta time)
       * TODO: should call all update function of all the objects in Scene
       */
    }
  }

  // Function to start playing.
  private _startSpin(): void {
    console.log(` >>> start spin`);
    this._server.requestSpinData();
    this._udpateStyleSpinBtn(false);
    this._spinReels();
  }

  // Function to start the spinning process
  private _spinReels() {
    let timeout = 0;
    for (const reel of this.reels) {
      setTimeout(reel.spin.bind(reel), timeout);
      timeout += GameConfig.SPIN_DELAY;
    }
  }

  private _stopReels(): void {
    let timeout = 0;
    for (const reel of this.reels) {
      setTimeout(reel.stop.bind(reel), timeout);
      timeout += GameConfig.SPIN_DELAY;
    }
  }

  /**
   * When spin complete
   * @param data
   */
  private _onReelSpinComplete(data): void {
    var id = data["id"];
    if (id + 1 == this.reels.length) {
      // all reels are stopped
      this._udpateStyleSpinBtn(true);
    }
  }

  private _onSpinDataResponded(data: string[]): void {
    console.log(` >>> received: ${data}`);
    this.resultSpin = data;
    this._setReelResult();
    setTimeout(this._stopReels.bind(this), GameConfig.STOP_TIME);
  }

  // set result for each reel
  private _setReelResult() {
    this.reels.forEach((reel) => {
      var result = [];
      this.resultSpin.forEach((symbol, index) => {
        if (Math.floor(index / GameConfig.SYMBOLS_PER_REEL) == reel.id) {
          result.push(symbol);
        }
      });
      reel.setResult(result);
    });
  }

  private _onAssetsLoaded(
    loaderInstance: PIXI.Loader,
    resources: Partial<Record<string, PIXI.LoaderResource>>
  ): void {
    /**
     * After loading process is finished this function will be called
     */
    this._logoSprite = new PIXI.Sprite(resources["logo"].texture);
    this._frameSprite = new PIXI.Sprite(resources["frame"].texture);
    GameConfig.SYMBOL_TYPES.forEach((type) => {
      GameConfig.symbolTextures[type] = resources[`symbol_${type}`].texture;
      GameConfig.symbolTexturesBlur[type] =
        resources[`symbol_${type}_blur`].texture;
    });
    this.init();
  }

  private _udpateStyleSpinBtn(canSpin: boolean) {
    if (canSpin) {
      this._spinText.interactive = true;
      this._spinText.style.fill = ["#ffffff", "#f0a500"];
    } else {
      this._spinText.interactive = false;
      this._spinText.style.fill = ["#ffffff", "#696969"];
    }
  }
}
