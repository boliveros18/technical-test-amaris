export type TransactionType = "APERTURA" | "CANCELACION";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  fundId: string;
  fundName: string;
  amount: number;
  date: string;
  notifyMethod?: "email" | "sms";
}