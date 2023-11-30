import * as PIXI from "pixi.js";
import { GameConfig } from "./GameConfig";

export class Symbol extends PIXI.Sprite{
  private readonly _texture: PIXI.Texture;
  private symbolSpr: PIXI.Sprite;
  private id
  constructor(id: number, symbol: string) {
    super();
    this.init(id, symbol);
  }

  init(id: number, symbol: string) {
    // Khởi tạo texture của symbol
    this.id = id;
    this.updateSprite( symbol);
  //  const pos = new PIXI.Point(0, (this.id-0.5) * GameConfig.SYMBOL_HEIGHT - GameConfig.SCENE_HEIGHT / 2);
    const pos = new PIXI.Point(0, GameConfig.SYMBOL_HEIGHT * (id+1)-GameConfig.SCENE_HEIGHT / 2);
    this.symbolSpr.position = pos;
    this.symbolSpr.anchor.set(0.5);
  }

  public updateSprite( symbol: string){
    this.removeChildren();
    this.symbolSpr = new PIXI.Sprite(GameConfig.symbolTextures[symbol]);
    this.symbolSpr.anchor.set(0.5);
    this.addChild(this.symbolSpr);

  }

  public swap(){
    const symbol =
    GameConfig.SYMBOL_TYPES[Math.floor(Math.random() * GameConfig.SYMBOL_TYPES.length)];
    this.removeChildren();
    this.symbolSpr = new PIXI.Sprite(GameConfig.symbolTexturesBlur[symbol]);
    this.symbolSpr.anchor.set(0.5);
    this.addChild(this.symbolSpr);
  }
}