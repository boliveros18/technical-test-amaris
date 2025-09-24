import { useState, useEffect } from "react";
import {
  listFunds,
  subscribeToFund,
  unsubscribeFromFund,
} from "../../services/mockService";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { Fund, User } from "../../interfaces";
import { sendEmail } from "../../services/sendEmail";
import UiButton from "../ui/UiButton";

interface Message {
  text: string;
  type: "success" | "error";
}

const FundsList = () => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [balance, SetBalance] = useState<number | undefined>(0);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setFunds(listFunds());
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      SetBalance(user?.balance);
    }
  }, [user?.balance]);

  function updateUser(updated: User) {
    setUser(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
  }

  function showMessage(
    fundId: string,
    text: string,
    type: "success" | "error"
  ) {
    setMessages((prev) => ({ ...prev, [fundId]: { text, type } }));
    setTimeout(() => {
      setMessages((prev) => {
        const copy = { ...prev };
        delete copy[fundId];
        return copy;
      });
    }, 2000);
  }

  const handleSubscribe = async (fund: Fund) => {
    if (!user) {
      showMessage(fund.id, "Debes iniciar sesión para suscribirte.", "error");
      return;
    }

    try {
      const rawAmount = amounts[fund.id] ?? "";
      const numeric = Number(rawAmount);
      if (isNaN(numeric) || numeric <= 0) {
        showMessage(fund.id, "El monto debe ser un número válido.", "error");
        return;
      }

      const res = subscribeToFund(user.id, fund.id, numeric, "email");

      updateUser(res.user);
      setAmounts((prev) => ({ ...prev, [fund.id]: "" }));
      showMessage(fund.id, `Suscripción exitosa`, "success");
      await sendEmail(
        user.email,
        "Suscripción exitosa",
        `Te has suscrito al fondo ${fund.name} con un monto de ${numeric}`
      );
    } catch (e: unknown) {
      showMessage(fund.id, `Error: ${(e as Error).message}`, "error");
    }
  };

  const handleUnsubscribe = async (fund: Fund) => {
    if (!user) {
      showMessage(
        fund.id,
        "Debes iniciar sesión para cancelar tu suscripción.",
        "error"
      );
      return;
    }

    try {
      const res = unsubscribeFromFund(user.id, fund.id);
      updateUser(res.user);
      showMessage(fund.id, `Cancelación exitosa`, "success");
      await sendEmail(
        user.email,
        "Cancelación exitosa",
        `Has cancelado tu suscripción al fondo ${fund.name}.`
      );
    } catch (e: unknown) {
      showMessage(fund.id, `Error: ${(e as Error).message}`, "error");
    }
  };

  function isSubscribed(fundId: string): boolean {
    return (
      user?.portfolio?.some((portfolio) => portfolio.fundId === fundId) ?? false
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between">
        <h3 className="font-normal mb-6 text-gray-800 text-start">
          Listado de fondos
        </h3>
        <div>Balance: ${balance} COP</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
        {funds.map((fund) => (
          <div
            key={fund.id}
            className="border border-gray-300 rounded-lg p-4 w-full shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-gray-900 font-medium text-sm">{fund.name}</p>
            </div>
            <div className="text-sm font-normal text-gray-600">
              Categoria: {fund.category}
            </div>
            <div className="text-sm font-normal text-gray-600">
              Monto mínimo: COP ${fund.min}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
              {!isSubscribed(fund.id) ? (
                <>
                  <input
                    type="number"
                    placeholder="Monto a vincular"
                    value={amounts[fund.id] ?? ""}
                    onChange={(e) =>
                      setAmounts((prev) => ({
                        ...prev,
                        [fund.id]: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                  <UiButton
                    onClick={() => handleSubscribe(fund)}
                    variant="primary"
                  >
                    Suscribirme
                  </UiButton>
                </>
              ) : (
                <UiButton
                  onClick={() => handleUnsubscribe(fund)}
                  variant="danger"
                >
                  Cancelarlo
                </UiButton>
              )}
            </div>
            {messages[fund.id] && (
              <p
                className={`flex items-center gap-2 mt-3 text-sm font-medium px-3 py-2 rounded-md ${
                  messages[fund.id].type === "success"
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {messages[fund.id].type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                )}
                <span>{messages[fund.id].text}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FundsList;
