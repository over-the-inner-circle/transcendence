import { io, Socket } from 'socket.io-client';

export class GameSocketManager {
  private static instance: GameSocketManager;

  public socket: Socket | null;

  private constructor() {
    this.socket = null;
  }

  public initSocket(socketUrl: string, accessToken: string) {
    this.socket = io(socketUrl, {
      auth: { access_token: accessToken },
    });
  }

  public static getInstance(): GameSocketManager {
    if (!GameSocketManager.instance) {
      GameSocketManager.instance = new GameSocketManager();
    }
    return GameSocketManager.instance;
  }
}
