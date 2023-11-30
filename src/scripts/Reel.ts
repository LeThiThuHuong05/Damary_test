import * as PIXI from "pixi.js";
import { GameConfig } from "./GameConfig";
import { Symbol } from "./Symbol";
import { MainApp } from "./app";
export class Reel {
  public readonly container: PIXI.Container;
  public readonly textures;
  public sprites: Array<Symbol> = [];
  public blur;
  private id;
  public spinning: boolean; // true: khi gọi hàm quay
  private timeStop: number;
  private stopping: boolean = false; // true: khi đã nhận kết quả
  public eventEmitter;
  private resultArr: Array<string> = [];
  private canStop: boolean = false; // true: stopping == true và reel quay đến vị trí thích hợp để gọi hàm dừng
  private symbolId: number;
  private finalOffset: number;
  private finalPosition: number;
  private time: number;

  constructor(app: PIXI.Application, position: number) {
    this.container = new PIXI.Container();
    this.textures = GameConfig.symbolTextures;
    this.generate(position);
    this.blur = new PIXI.filters.BlurFilter();
    this.spinning = false;
    this.stopping = false;
    this.canStop = false;
    var events = require("events");
    this.eventEmitter = new events.EventEmitter();
    MainApp.inst.app.ticker.add(this.update, this);
  }

  // Gen symbols
  public generate(position: number) {
    this.id = position;
    var pos = position - Math.floor(GameConfig.REELS_NUMBER / 2);
    const widthUnit = GameConfig.SCENE_WIDTH / GameConfig.REELS_NUMBER;
    this.container.x = pos * widthUnit;
    this.container.y = 150;
    for (let i = 0; i < GameConfig.SYMBOLS_PER_REEL; i++) {
      const symbol =
        GameConfig.SYMBOL_TYPES[
          Math.floor(Math.random() * GameConfig.SYMBOL_TYPES.length)
        ];
      const symbolSpr = new Symbol(i, symbol);
      this.sprites.push(symbolSpr);
      this.container.addChild(symbolSpr);
    }
  }

  public spin(): void {
    this.time = 0;
    this.spinning = true;
  }

  public stop(): void {
    this.finalOffset = 1;
    this.stopping = true;
    this.timeStop = this.time;
  }

  private _setFinalPos() {
    this.finalPosition =
      GameConfig.REEL_HEIGHT -
      GameConfig.SYMBOL_HEIGHT -
      this.container.children[this.symbolId].y;
  }

  private update(delta: number): void {
    if (!this.spinning) return;

    // update elapse time
    this.time += delta;

    // update tiles Y position
    const speed = this._getSpeed(delta);
    for (const tile of this.sprites) {
      tile.y += speed;
    }
    
    const limitY: number = GameConfig.REEL_HEIGHT + GameConfig.SYMBOL_HEIGHT;
    for (let i: number = this.sprites.length - 1; i >= 0; i--) {
      if (this.container.y + this.sprites[i].y > limitY) {
        this.sprites[i].y =
          this.container.children[0].y - GameConfig.SYMBOL_HEIGHT;
        if (!this.stopping) {
          // change symbol when spin
          this.sprites[i].swap();
        } else {
          if (i == this.sprites.length - 1 && this.canStop == false) {
            this.symbolId = i;
            this.canStop = true;
            this._setFinalPos();
          }
        }
        this.container.addChildAt(this.sprites[i], 0);
      }
      if (this.canStop) {
        // set result symboll
        var symbol =
          i < this.resultArr.length
            ? this.resultArr[i]
            : this.resultArr[this.resultArr.length - 1];
        this.sprites[i].updateSprite(symbol);
      }
    }
  }

  private _getSpeed(delta: number): number {
    let speed = delta * GameConfig.SPIN_SPEED;

    if (this.canStop) {
      const n = 1 - (this.time - this.timeStop) / GameConfig.OUT_TIME;
      const r = this._easeInBack(n);
      speed = (this.finalOffset - r) * this.finalPosition;
      this.finalOffset = r;
      if (n <= 0) {
        this._onComplete();
      }
    } else if (this.time < GameConfig.IN_TIME) {
      const n = this.time / GameConfig.IN_TIME;
      speed *= this._easeInBack(n);
    }

    return speed;
  }

  private _onComplete(): void {
    this.stopping = false;
    this.spinning = false;
    this.canStop = false;
    this.eventEmitter.emit("spincomplete", { target: this, id: this.id });
  }

  private _easeInBack(n: number): number {
    const s = 1;
    return n * n * ((s + 1) * n - s);
  }

  public _setResult(result: Array<string>) {
    this.resultArr = result;
    console.log("Reel: ", this.id, " result = ", this.resultArr);
  }
}
