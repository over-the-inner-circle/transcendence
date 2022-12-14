import { GameInitialData } from '@/molecule/GameMatched';

interface Player {
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  color: string;
}

interface Ball {
  xPosition: number;
  yPosition: number;
  radius: number;
  color: string;
}

interface Net {
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  color: string;
}

export interface PongComponentsPositions {
  p1YPosition: number;
  p2YPosition: number;
  ballXPosition: number;
  ballYPosition: number;
}

export interface PongTheme {
  backgroundColor: string;
  playerColor: string;
  ballColor: string;
  netColor: string;
}

export const availablePongThemes = (): PongTheme[] => {
  const pongThemeDefault: PongTheme = {
    backgroundColor: '#000000',
    ballColor: '#FFFFFF',
    playerColor: '#FFFFFF',
    netColor: '#FFFFFF',
  };

  const pongTheme1: PongTheme = {
    backgroundColor: '#000000',
    ballColor: '#00FF38',
    playerColor: '#00FF38',
    netColor: '#00FF38',
  };

  const pongTheme2: PongTheme = {
    backgroundColor: '#000000',
    ballColor: '#FF00E5',
    playerColor: '#FF00E5',
    netColor: '#FF00E5',
  };

  return [pongThemeDefault, pongTheme1, pongTheme2];
};

class Pong {
  protected canvasContext: CanvasRenderingContext2D;
  protected p1: Player;
  protected p2: Player;
  protected ball: Ball;
  protected net: Net;

  constructor(
    context: CanvasRenderingContext2D,
    theme: PongTheme,
    initialGameData: GameInitialData,
  ) {
    this.canvasContext = context;
    const canvasHeight = this.canvasContext.canvas.height;
    const canvasWidth = this.canvasContext.canvas.width;

    this.p1 = {
      xPosition: 0,
      yPosition:
        (canvasHeight - this.relativeYValue(initialGameData.playerHeight)) / 2,
      width: this.relativeXValue(initialGameData.playerWidth),
      height: this.relativeYValue(initialGameData.playerHeight),
      color: theme.playerColor,
    };

    this.p2 = {
      xPosition: canvasWidth - this.relativeXValue(initialGameData.playerWidth),
      yPosition:
        (canvasHeight - this.relativeYValue(initialGameData.playerHeight)) / 2,
      width: this.relativeXValue(initialGameData.playerWidth),
      height: this.relativeYValue(initialGameData.playerHeight),
      color: theme.playerColor,
    };

    this.ball = {
      xPosition: canvasWidth / 2,
      yPosition: canvasHeight / 2,
      radius: this.relativeDiagonalValue(initialGameData.ballRadius),
      color: theme.ballColor,
    };

    this.net = {
      xPosition: (canvasWidth - 2) / 2,
      yPosition: 0,
      width: this.relativeXValue(4),
      height: this.relativeYValue(10),
      color: theme.netColor,
    };

    this.render();
  }

  protected relativeXValue(value: number) {
    const originalCanvasWidth = 800;
    const currentCanvasWidth = this.canvasContext.canvas.width;
    const ratio = currentCanvasWidth / originalCanvasWidth;
    return value * ratio;
  }

  protected relativeYValue(value: number) {
    const originalCanvasHeight = 600;
    const currentCanvasHeight = this.canvasContext.canvas.height;
    const ratio = currentCanvasHeight / originalCanvasHeight;
    return value * ratio;
  }

  protected relativeDiagonalValue(value: number) {
    const originalDiagonal = Math.sqrt(800 * 800 + 600 * 600);
    const currentCanvasH = this.canvasContext.canvas.height;
    const currentCanvasW = this.canvasContext.canvas.width;
    const currentDiagonal = Math.sqrt(
      currentCanvasH * currentCanvasH + currentCanvasW * currentCanvasW,
    );
    const ratio = currentDiagonal / originalDiagonal;
    return value * ratio;
  }

  protected drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
  ) {
    this.canvasContext.fillStyle = color;
    this.canvasContext.fillRect(x, y, w, h);
  }

  protected drawCircle(x: number, y: number, r: number, color: string) {
    this.canvasContext.fillStyle = color;
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, r, 0, Math.PI * 2, true);
    this.canvasContext.closePath();
    this.canvasContext.fill();
  }

  protected drawNet() {
    for (
      let i = 0;
      i <= this.canvasContext.canvas.height;
      i += this.relativeYValue(15)
    ) {
      this.drawRect(
        this.net.xPosition,
        this.net.yPosition + i,
        this.net.width,
        this.net.height,
        this.net.color,
      );
    }
  }

  public currentPositions(): PongComponentsPositions {
    return {
      p1YPosition: this.p1.yPosition,
      p2YPosition: this.p2.yPosition,
      ballXPosition: this.ball.xPosition,
      ballYPosition: this.ball.yPosition,
    };
  }

  public updateCurrentPositions(positions: PongComponentsPositions) {
    this.p1.yPosition = this.relativeYValue(positions.p1YPosition);
    this.p2.yPosition = this.relativeYValue(positions.p2YPosition);
    this.ball.xPosition = this.relativeXValue(positions.ballXPosition);
    this.ball.yPosition = this.relativeYValue(positions.ballYPosition);
  }

  public adjustAfterResize() {
    const canvasWidth = this.canvasContext.canvas.width;
    const canvasHeight = this.canvasContext.canvas.height;

    this.p1.width = this.relativeXValue(10);
    this.p1.height = this.relativeYValue(100);

    this.p2.width = this.relativeXValue(10);
    this.p2.height = this.relativeYValue(100);
    this.p2.xPosition = canvasWidth - this.relativeXValue(10);

    this.ball.radius = this.relativeDiagonalValue(10);
    // this.ball.xPosition = this.relativeXValue(this.ball.xPosition);
    // this.ball.yPosition = this.relativeYValue(this.ball.yPosition);

    this.net = {
      ...this.net,
      xPosition: (canvasWidth - 4) / 2,
      width: this.relativeXValue(4),
      height: this.relativeYValue(10),
    };
  }

  public render() {
    // clear the canvas
    this.drawRect(
      0,
      0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height,
      'black',
    );

    // draw the net
    this.drawNet();

    // draw the players
    this.drawRect(
      this.p1.xPosition,
      this.p1.yPosition,
      this.p1.width,
      this.p1.height,
      this.p1.color,
    );

    this.drawRect(
      this.p2.xPosition,
      this.p2.yPosition,
      this.p2.width,
      this.p2.height,
      this.p2.color,
    );

    // draw the ball
    this.drawCircle(
      this.ball.xPosition,
      this.ball.yPosition,
      this.ball.radius,
      this.ball.color,
    );
  }
}

export default Pong;
