import {
  login,
  listUsers,
  listFunds,
  changePassword,
  editUser,
  subscribeToFund,
  unsubscribeFromFund,
  getTransactionsForUser,
} from "./mockService";

import type { User } from "../interfaces";
import raw from "../../public/mocks/mocks.json";

const STORAGE_KEY = "code_mock_db_v1";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(JSON.parse(JSON.stringify(raw)))
  );
});

describe("MockService Unit Tests", () => {
  test("login correcto devuelve usuario sin password", () => {
    const user = login("admin@example.com", "Admin123!");
    expect(user.email).toBe("admin@example.com");
    expect((user as User).password).toBeUndefined();
  });

  test("login con credenciales incorrectas lanza error", () => {
    expect(() => login("admin@example.com", "wrong")).toThrow(
      "Credenciales inválidas"
    );
  });

  test("listUsers devuelve usuarios", () => {
    const users = listUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("email");
    expect(users[0]).toHaveProperty("role");
  });

  test("listFunds devuelve fondos", () => {
    const funds = listFunds();
    expect(funds.length).toBeGreaterThan(0);
    expect(funds[0]).toHaveProperty("name");
    expect(funds[0]).toHaveProperty("min");
  });

  test("changePassword actualiza la contraseña correctamente", () => {
    const usersBefore = listUsers();
    const userId = usersBefore[0].id;
    const result = changePassword(userId, "NewPass123!");
    expect(result).toBe(true);
    expect(() => login(usersBefore[0].email, "NewPass123!")).not.toThrow();
  });

  test("changePassword lanza error si usuario no existe", () => {
    expect(() => changePassword("invalid-id", "pass")).toThrow(
      "Usuario no encontrado"
    );
  });

  test("editUser actualiza correctamente datos del usuario", () => {
    const users = listUsers();
    const user: User = {
      ...users[0],
      name: "Nuevo Nombre",
      email: "nuevo@example.com",
      phone: "+5700000000",
    };
    const result = editUser(user);
    expect(result).toBe(true);
    const updatedUser = listUsers().find((u) => u.id === user.id);
    expect(updatedUser?.name).toBe("Nuevo Nombre");
    expect(updatedUser?.email).toBe("nuevo@example.com");
    expect(updatedUser?.phone).toBe("+5700000000");
  });

  test("editUser lanza error si usuario no existe", () => {
    expect(() =>
      editUser({
        id: "invalid",
        name: "",
        email: "",
        phone: "",
        role: "ADMIN",
        balance: 0,
        portfolio: [],
      })
    ).toThrow("Usuario no encontrado");
  });

  test("subscribeToFund exitosa actualiza balance, portfolio y transactions", () => {
    const user = listUsers().find((u) => u.role === "CLIENT")!;
    const fund = listFunds()[0];
    const initialBalance = user.balance;

    const result = subscribeToFund(user.id, fund.id, fund.min, "email");
    expect(result.success).toBe(true);
    expect(result.user.balance).toBe(initialBalance - fund.min);
    expect(
      result.user.portfolio.find((p) => p.fundId === fund.id)
    ).toBeDefined();
  });

  test("subscribeToFund lanza error si saldo insuficiente", () => {
    const db = JSON.parse(localStorage.getItem("code_mock_db_v1")!);
    const user = db.users.find((u: User) => u.role === "CLIENT")!;
    const fund = db.funds[3];

    user.balance = fund.min - 1;
    localStorage.setItem("code_mock_db_v1", JSON.stringify(db));

    const amount = fund.min;
    expect(() => subscribeToFund(user.id, fund.id, amount)).toThrow(
      /Saldo insuficiente/
    );
  });

  test("unsubscribeFromFund devuelve balance y elimina del portfolio", () => {
    const user = listUsers().find((u) => u.role === "CLIENT")!;
    const fund = listFunds()[0];
    user.balance = 500000;
    user.portfolio = [];

    const balanceBefore = user.balance;
    subscribeToFund(user.id, fund.id, fund.min);

    const result = unsubscribeFromFund(user.id, fund.id);

    expect(result.success).toBe(true);
    expect(
      result.user.portfolio.find((p) => p.fundId === fund.id)
    ).toBeUndefined();
    expect(result.user.balance).toBe(balanceBefore); // balance vuelve al inicial
  });

  test("unsubscribeFromFund lanza error si usuario no existe", () => {
    const fund = listFunds()[0];
    expect(() => unsubscribeFromFund("invalid", fund.id)).toThrow(
      "Usuario no encontrado"
    );
  });

  test("unsubscribeFromFund lanza error si no está vinculado al fondo", () => {
    const user = listUsers().find((u) => u.role === "CLIENT")!;
    const fund = listFunds()[0];
    expect(() => unsubscribeFromFund(user.id, fund.id)).toThrow(
      "No está vinculado a ese fondo"
    );
  });

  test("getTransactionsForUser devuelve transacciones en orden descendente y paginadas", () => {
    const user = listUsers().find((u) => u.role === "CLIENT")!;
    const fund = listFunds()[0];

    for (let i = 0; i < 5; i++) {
      subscribeToFund(user.id, fund.id, fund.min);
      unsubscribeFromFund(user.id, fund.id);
    }

    const { transactions, total } = getTransactionsForUser(user.id, 1, 3);
    expect(transactions.length).toBe(3);
    expect(total).toBeGreaterThanOrEqual(10);
    expect(new Date(transactions[0].date).getTime()).toBeGreaterThanOrEqual(
      new Date(transactions[1].date).getTime()
    );
  });
});
