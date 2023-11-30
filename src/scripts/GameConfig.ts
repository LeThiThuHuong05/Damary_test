export class GameConfig {
    public static readonly REELS_NUMBER: number = 5; // Số lượng reels của game
    public static readonly SYMBOLS_PER_REEL: number = 3 ; // Số lượng symbol trên mỗi reel
    public static readonly REEL_WIDTH: number = 150; // Chiều rộng của một reel
    public static readonly REEL_HEIGHT: number = 100; // Chiều cao của một reel
    public static readonly SPIN_SPEED: number = 30; // Tốc độ quay của reel
    public static readonly STOP_TIME: number = 2000; // Thời gian dừng của reel
    public static readonly SPIN_DELAY: number = 300; // Khoảng cách thời gian giữa hai reel bắt đầu quay
    public static readonly SYMBOL_WIDTH = 140;
    public static readonly SYMBOL_HEIGHT = 150;
    public static readonly OUT_TIME = 30; // Khoảng thời gian hiệu ứng khi dừng vòng quay
    public static readonly IN_TIME = 30; // Khoảng thời gian hiệu ứng khi bắt đầu vòng quay
    
      public static readonly SCENE_WIDTH = 720;
      public static readonly SCENE_HEIGHT = 960;

    public static readonly SYMBOL_TYPES = ["1", "2", "3", "4", "5", "6", "7", "8", "K"];
    public static symbolTextures = {};
    public static symbolTexturesBlur = {};
  }

