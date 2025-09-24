import { v4 as uuidv4 } from "uuid";
import raw from "../../mocks/mocks.json";
import type {
  DB,
  User,
  UserPortfolioItem,
  Fund,
  Transaction,
} from "../interfaces";

const STORAGE_KEY = "code_mock_db_v1";

function readDB(): DB {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as DB;
    } catch {
      const initialDB = JSON.parse(JSON.stringify(raw)) as DB;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
      return initialDB;
    }
  }
  const initialDB = JSON.parse(JSON.stringify(raw)) as DB;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
}

function writeDB(db: DB): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function login(email: string, pass: string): Omit<User, "password"> {
  const db = readDB();
  const user = db.users.find((u) => u.email === email && u.password === pass);
  if (!user) throw new Error("Credenciales inválidas");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

export function listUsers(): User[] {
  const db = readDB();
  return db.users;
}

export function listFunds(): Fund[] {
  const db = readDB();
  return db.funds;
}

export function changePassword(userId: string, newPassword: string): boolean {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuario no encontrado");
  user.password = newPassword;
  writeDB(db);
  return true;
}

export function editUser(user: User): boolean {
  const db = readDB();
  const u = db.users.find((u) => u.id === user.id);
  if (!u) throw new Error("Usuario no encontrado");
  u.name = user.name;
  u.email = user.email;
  u.phone = user.phone;
  writeDB(db);
  return true;
}

export function subscribeToFund(
  userId: string,
  fundId: string,
  amount: number,
  notifyMethod: "email" | "sms" = "email"
): { success: boolean; txId: string; user: User } {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  const fund = db.funds.find((f) => f.id === fundId);
  if (!user || !fund) throw new Error("Usuario o fondo no encontrado");

  if (amount < fund.min)
    throw new Error(
      `El monto mínimo para el fondo ${fund.name} es ${fund.min}`
    );
  if (user.balance < amount)
    throw new Error(`Saldo insuficiente para el fondo ${fund.name}`);

  const txId = uuidv4();
  user.balance -= amount;

  const link: UserPortfolioItem = {
    id: uuidv4(),
    fundId: fund.id,
    fundName: fund.name,
    amount,
    date: new Date().toISOString(),
  };
  user.portfolio.push(link);

  db.transactions.push({
    id: txId,
    userId,
    type: "APERTURA",
    fundId: fund.id,
    fundName: fund.name,
    amount,
    date: new Date().toISOString(),
    notifyMethod,
  });

  db.lastNotification = {
    to: notifyMethod === "sms" ? user.phone ?? "" : user.email ?? "",
    method: notifyMethod,
    message: `Suscripción al fondo ${fund.name} realizada.`,
  };

  writeDB(db);
  return { success: true, txId, user };
}

export function unsubscribeFromFund(
  userId: string,
  fundId: string
): { success: boolean; txId: string; user: User } {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuario no encontrado");

  const index = user.portfolio.findIndex((p) => p.fundId === fundId);
  if (index === -1) throw new Error("No está vinculado a ese fondo");

  const link = user.portfolio.splice(index, 1)[0];
  user.balance += link.amount;

  const txId = uuidv4();
  db.transactions.push({
    id: txId,
    userId,
    type: "CANCELACION",
    fundId,
    fundName: link.fundName,
    amount: link.amount,
    date: new Date().toISOString(),
  });

  writeDB(db);
  return { success: true, txId, user };
}
export function getTransactionsForUser(
  userId: string,
  page: number = 1,
  limit: number = 10
): { transactions: Transaction[]; total: number } {
  const db = readDB();
  const allTx = db.transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const start = (page - 1) * limit;
  const end = page * limit;

  return { transactions: allTx.slice(start, end), total: allTx.length };
}
