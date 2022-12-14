import { Socket } from 'socket.io';

const DIFFERENCE_SCORE = +process.env.DIFFERENCE_SCORE || 200;
const WAITING_TIME = +process.env.WAITING_TIME || 30;

export class MatchMaking {
  constructor() {
    this.matchingQueue = new Map();
  }
  matchingQueue: Map<string, number>;

  leaveMatchingQueue(socketId: string): void {
    this.matchingQueue.delete(socketId);
  }

  joinMatchingQueue(socketId: string, mmr: number): void {
    this.matchingQueue.set(socketId, mmr);
  }

  findUser(socketId: string, differenceScore: number, mmr: number): string {
    let matchingPlayerId: string;
    let min: number = differenceScore;
    this.matchingQueue.forEach((v, k) => {
      if (Math.abs(mmr - v) < min && k !== socketId) {
        min = Math.abs(mmr - v);
        matchingPlayerId = k;
      }
    });
    if (matchingPlayerId !== undefined) {
      this.matchingQueue.delete(matchingPlayerId);
      this.matchingQueue.delete(socketId);
      return matchingPlayerId;
    }
    return socketId;
  }

  matchMaking(clientSocket: Socket): string {
    const userInfo = clientSocket['user_info'];
    clientSocket['user_info'].waiting++;
    if (
      this.matchingQueue.size === 0 ||
      (this.matchingQueue.size === 1 &&
        this.matchingQueue.get(clientSocket.id) !== undefined)
    ) {
      return clientSocket.id;
    } else {
      if (userInfo.waiting < WAITING_TIME) {
        return this.findUser(
          clientSocket.id,
          DIFFERENCE_SCORE,
          userInfo.user.mmr,
        );
      } else if (clientSocket['user_info'].waiting < WAITING_TIME * 2) {
        return this.findUser(
          clientSocket.id,
          DIFFERENCE_SCORE * 2,
          userInfo.user.mmr,
        );
      } else if (clientSocket['user_info'].waiting < WAITING_TIME * 3) {
        return this.findUser(
          clientSocket.id,
          DIFFERENCE_SCORE * 4,
          userInfo.user.mmr,
        );
      } else if (clientSocket['user_info'].waiting < WAITING_TIME * 4) {
        return this.findUser(
          clientSocket.id,
          DIFFERENCE_SCORE * 8,
          userInfo.user.mmr,
        );
      } else if (clientSocket['user_info'].waiting < WAITING_TIME * 5) {
        return this.findUser(
          clientSocket.id,
          DIFFERENCE_SCORE * 16,
          userInfo.user.mmr,
        );
      } else {
        return this.findUser(
          clientSocket.id,
          DIFFERENCE_SCORE * 50,
          userInfo.user.mmr,
        );
      }
    }
  }
  getMatchingQueue() {
    return this.matchingQueue;
  }
}
