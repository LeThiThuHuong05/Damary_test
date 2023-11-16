import * as PIXI from 'pixi.js';
import { MainApp } from './app';
import Server from './Server';

const symbolTextures = {
    // '1' : null,
    // '2' : null,
    // '3' : null,
    // '4' : null,
    // '5' : null,
    // '6' : null,
    // '7' : null,
    // '8' : null,
    // 'K' : null
};
const symbolTexturesBlur = {
};

const symbolTypes = ['1', '2', '3', '4', '5', '6', '7', '8', 'K'];
export class GameScene extends PIXI.Container {
    constructor (server: Server) {
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
            .add('logo', 'images/logo.png')
            .add('symbol_1', 'images/symbol_1.png')
            .add('symbol_2', 'images/symbol_2.png')
            .add('symbol_3', 'images/symbol_3.png')
            .add('symbol_4', 'images/symbol_4.png')
            .add('symbol_5', 'images/symbol_5.png')
            .add('symbol_6', 'images/symbol_6.png')
            .add('symbol_7', 'images/symbol_7.png')
            .add('symbol_8', 'images/symbol_8.png')
            .add('symbol_K', 'images/symbol_K.png')
            .add('symbol_1_blur', 'images/symbol_1_blur.png')
            .add('symbol_2_blur', 'images/symbol_2_blur.png')
            .add('symbol_3_blur', 'images/symbol_3_blur.png')
            .add('symbol_4_blur', 'images/symbol_4_blur.png')
            .add('symbol_5_blur', 'images/symbol_5_blur.png')
            .add('symbol_6_blur', 'images/symbol_6_blur.png')
            .add('symbol_7_blur', 'images/symbol_7_blur.png')
            .add('symbol_8_blur', 'images/symbol_8_blur.png')
            .add('symbol_K_blur', 'images/symbol_K_blur.png')
            .load(this._onAssetsLoaded.bind(this));
    }

    static readonly NUMBER_OF_REELS = 5;
    static readonly NUMBER_OF_ROWS = 3;
    static readonly NUMBER_OF_ITEMS = GameScene.NUMBER_OF_REELS*GameScene.NUMBER_OF_ROWS;
    static readonly SYMBOL_WIDTH = 140;
    static readonly SYMBOL_HEIGHT = 150;

    private _server: Server;

    private _isInitialized: boolean = false;
    private _logoSprite: PIXI.Sprite;
    private _spinText: PIXI.Text;
    private _spinning: boolean = false;
    private running = false;
    private tweening = [];
    private reels = [];

    reelContainer = new PIXI.Container();
    public init (): void {

        this.addChild(this._logoSprite);
        this._logoSprite.position.set(720 / 2, 100);
        this._logoSprite.anchor.set(0.5);
        this._logoSprite.scale.set(0.5);

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
        });

        this._spinText = new PIXI.Text('Start Spin', style);
        this._spinText.x = 720 / 2 - this._spinText.width / 2;
        this._spinText.y = MainApp.inst.app.screen.height - 100 + Math.round((100 - this._spinText.height) / 2);
        this.addChild(this._spinText);

        /**
         * Enable interactive so we can click on this text
         */
        this._spinText.interactive = true;
        this._spinText.buttonMode = true;
        this._spinText.addListener('pointerdown', this._startSpin.bind(this));

        this._isInitialized = true;

        /**
         * DEMO: Temporary show a default board table
         * TODO: we should split board table to small objects and initialize/manage them
         */
        const boardContainer = this.addChild(new PIXI.Container());
        boardContainer.position = new PIXI.Point(720 / 2, 960 / 2 + 100);
        const boardWidth = GameScene.SYMBOL_WIDTH * GameScene.NUMBER_OF_REELS;
        const boardHeight = GameScene.SYMBOL_HEIGHT * GameScene.NUMBER_OF_ROWS;
        const defaultBoard = ['2', '7', '3', '4', '6', '8', '7', '3', 'K', '1', '5', '3', '4', '5', '6'];


        var rc =  this.addChild(new PIXI.Container());
        
        var reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter(),
        };

for (let idx = 0; idx < GameScene.NUMBER_OF_ITEMS; idx++) {
    const symbol = symbolTypes[Math.floor(Math.random() * symbolTypes.length)];
    const reelId = Math.floor(idx / GameScene.NUMBER_OF_ROWS);
    const symbolId = idx % GameScene.NUMBER_OF_ROWS;

    if(symbolId==0){
         rc = this.addChild(new PIXI.Container());

        rc.x = reelId* GameScene.SYMBOL_WIDTH;
        this.reelContainer.addChild(rc);
        reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter(),
        };

        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];
    }



    const pos = new PIXI.Point(reelId * GameScene.SYMBOL_WIDTH - boardWidth / 2 + GameScene.SYMBOL_WIDTH / 2, symbolId * GameScene.SYMBOL_HEIGHT - boardHeight / 2);
    const symbolSpr = new PIXI.Sprite(symbolTextures[symbol]);
    symbolSpr.position = pos;
    symbolSpr.anchor.set(0.5);
    boardContainer.addChild(symbolSpr);
    reel.symbols.push(symbolSpr);
// add data for each reel
    if((idx+1)%GameScene.NUMBER_OF_ROWS==0){

        this.reels.push(reel);  
        console.log(this.reels);
    }
}
//         defaultBoard.forEach((symbol, idx) => {

//             const reelId = Math.floor(idx / GameScene.NUMBER_OF_ROWS);
//             const symbolId = idx % GameScene.NUMBER_OF_ROWS;

//             if(symbolId==0){
//                  rc = this.addChild(new PIXI.Container());

//                 rc.x = reelId* GameScene.SYMBOL_WIDTH;
//                 this.reelContainer.addChild(rc);
//                 reel = {
//                     container: rc,
//                     symbols: [],
//                     position: 0,
//                     previousPosition: 0,
//                     blur: new PIXI.filters.BlurFilter(),
//                 };
        
//                 reel.blur.blurX = 0;
//                 reel.blur.blurY = 0;
//                 rc.filters = [reel.blur];
//             }

     

//             const pos = new PIXI.Point(reelId * GameScene.SYMBOL_WIDTH - boardWidth / 2 + GameScene.SYMBOL_WIDTH / 2, symbolId * GameScene.SYMBOL_HEIGHT - boardHeight / 2);
//             const symbolSpr = new PIXI.Sprite(symbolTextures[symbol]);
//             symbolSpr.position = pos;
//             symbolSpr.anchor.set(0.5);
//             boardContainer.addChild(symbolSpr);
//             reel.symbols.push(symbolSpr);
// // add data for each reel
//             if((idx+1)%GameScene.NUMBER_OF_ROWS==0){

//                 this.reels.push(reel);  
//                 console.log(this.reels);
//             }
//         });

        console.log(symbolTextures);
    }     

    public onUpdate (dtScalar: number) {
        const dt = dtScalar / PIXI.settings.TARGET_FPMS / 1000;
        if (this._isInitialized) {
            /**
             * Update objects in scene here using dt (delta time)
             * TODO: should call all update function of all the objects in Scene
             */
            for (let i = 0; i < this.reels.length; i++)
            {
                const r = this.reels[i];
                // Update blur filter y amount based on speed.
                // This would be better if calculated with time in mind also. Now blur depends on frame rate.
    
                r.blur.blurY = (r.position - r.previousPosition) * 8;
                r.previousPosition = r.position;
    
                // Update symbol positions on reel.
                for (let j = 0; j <r.symbols.length; j++)
                {
                    const s = r.symbols[j];
                    const prevy = s.y;
    
                    s.y = ((r.position + j) % r.symbols.length) * GameScene.SYMBOL_HEIGHT - GameScene.SYMBOL_HEIGHT;
                    if (s.y < 0 && prevy > GameScene.SYMBOL_HEIGHT )
                    {
                        // Detect going over and swap a texture.
                        // This should in proper product be determined from some logical reel.
                        s.texture = symbolTexturesBlur[Math.floor(Math.random() * symbolTypes.length)];
                        // s.scale.x = s.scale.y = Math.min(GameScene.SYMBOL_WIDTH / s.texture.width, GameScene.SYMBOL_HEIGHT / s.texture.height);
                        // s.x = Math.round((GameScene.SYMBOL_WIDTH - s.width) / 2);
                    }
                }
            }

            const now = Date.now();
            const remove = [];
        
            for (let i = 0; i < this.tweening.length; i++)
            {
                const t = this.tweening[i];
                const phase = Math.min(1, (now - t.start) / t.time);
        
                t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
                if (t.change) t.change(t);
                if (phase === 1)
                {
                    t.object[t.property] = t.target;
                    if (t.complete) t.complete(t);
                    remove.push(t);
                }
            }
            for (let i = 0; i < remove.length; i++)
            {
                this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
            }

            this._logoSprite.rotation += 0.01;
        }
    }

    private _startSpin (): void {
        console.log(` >>> start spin`);
        this._server.requestSpinData();
this._startPlay();
    }



    // Function to start playing.
    private _startPlay()
    {
        console.log(` >>> start spin1`);
        if (this.running) return;
        console.log(` >>> start spin2`);
        this.running = true;
 // Function to start the spinning process
 const spinReels = () => {
    console.log("running");
     for (let i = 0; i < this.reels.length; i++)
     {
         const r = this.reels[i];
         const extra = Math.floor(Math.random() * 3);
         const target = r.position + 10 + i * 5 + extra;
         const time = 2500 + i * 600 + extra * 600;
console.log(i," ",target);
      this.tweenTo(r, 'position', target, time, this.backout(0.5), null, i === this.reels.length - 1 ?() => {
        // When all reels complete spinning, recursively call the function or handle server response
        if (this.running) spinReels(); // If still running, continue spinning
    } : null);
     }
    }
    // Start the spinning process
    spinReels();


    // const spinInterval = setInterval(() => {
    //     for (let i = 0; i < this.reels.length; i++) {
    //         const r = this.reels[i];
    //         const extra = Math.floor(Math.random() * 3);
    //         const target = r.position + 10 + i * 5 + extra;
    //         const time = 2000 + i * 600 + extra * 600;
    //         this.tweenTo(r, 'position', target, time, this.backout(0.5));
    //     }
    // }, 5000); // Set an interval that's longer than the total spin time

    // // Stop the spinning interval after a set duration (e.g., 30s)
    // setTimeout(() => {
    //     clearInterval(spinInterval);
    //     this.running = false; // Stop spinning
    // }, 30000); // Replace with your desired duration or condition for stopping


    }
    private reelsComplete()
    {
       this. running = false;
    }
    private lerp(a1, a2, t)
    {
        return a1 * (1 - t) + a2 * t;
    }
    private tweenTo(object, property, target, time, easing, onchange, oncomplete)
{
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    this.tweening.push(tween);

    return tween;
}


private backout(amount)
{
    return (t) => (--t * t * ((amount + 1) * t + amount) + 1);
}


    private _onSpinDataResponded (data: string[]): void {
        console.log(` >>> received: ${data}`);
        // this.reelsComplete();
        /**
         * Received data from server.
         * TODO: should proceed in client here to stop the spin and show result.
         */

        for (let i = 0; i < data.length; i++) {
            const result = data[i]; // Get the result for each reel
            const r = this.reels[Math.floor(i/GameScene.NUMBER_OF_ROWS)];
            const s = r.symbols[i%GameScene.NUMBER_OF_ROWS];
            const idx = symbolTypes.indexOf(result);
            s.texture = symbolTextures[idx];
            // const target = r.position + (GameScene.NUMBER_OF_ROWS * 3) + idx; // Adjust the target based on the result

            // this.tweenTo(r, 'position', target, 2000, this.backout(0.5), null, i === this.reels.length - 1 ? this.reelsComplete.bind(this) : null);
        }
    }

    private _onAssetsLoaded (loaderInstance: PIXI.Loader, resources: Partial<Record<string, PIXI.LoaderResource>>): void {
        /**
         * After loading process is finished this function will be called
         */
        this._logoSprite = new PIXI.Sprite(resources['logo'].texture);
        symbolTypes.forEach((type) => {
            symbolTextures[type] = resources[`symbol_${type}`].texture;
            symbolTexturesBlur[type] = resources[`symbol_${type}_blur`].texture;
        });
        this.init();
    }
}