export class LiveFeed {
  isWriting: boolean;
  userName: string;
  sessionId: string;
  parentId: number;

  constructor(isWriting: boolean, userName: string, sessionId: string, parentId: number ) {
    this.isWriting = isWriting;
    this.userName = userName;
    this.sessionId = sessionId;
    this.parentId = parentId;
  }

}

