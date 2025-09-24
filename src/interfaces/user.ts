import type { UserPortfolioItem } from "./userPorfolioItem";

export interface User {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  balance: number;
  role: string;
  portfolio: UserPortfolioItem[];
}