export class Message {
  id: number;
  message: string;
  userId: number;
  deleted: boolean;
  edited: boolean;
  replies: [any];
}

