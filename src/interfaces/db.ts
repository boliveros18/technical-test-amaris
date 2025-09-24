import type { Fund } from "./fund";
import type { Transaction } from "./transaction";
import type { User } from "./user";

export interface DB {
  users: User[];
  funds: Fund[];
  transactions: Transaction[];
  lastNotification?: {
    to: string;
    method: "email" | "sms";
    message: string;
  };
}
