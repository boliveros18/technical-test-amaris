import { useEffect, useState } from "react";
import { getTransactionsForUser, listUsers } from "../../services/mockService";
import type { Transaction, User } from "../../interfaces";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

const ITEMS_PER_PAGE = 10;

const TransactionsList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as User;
      setUser(parsed);

      if (parsed.role === "CLIENT") {
        fetchTransactions(parsed.id, 1);
      }
      if (parsed.role === "ADMIN" || parsed.role === "CONSULTOR") {
        const users = listUsers().filter((u) => u.role === "CLIENT");
        setClients(users as User[]);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchTransactions(selectedClientId, currentPage);
    } else if (user?.role === "CLIENT") {
      fetchTransactions(user.id, currentPage);
    } else {
      setTransactions([])
    }
  }, [user?.role, user?.id, currentPage, selectedClientId]);

  const fetchTransactions = (userId: string, page: number) => {
    const { transactions, total } = getTransactionsForUser(
      userId,
      page,
      ITEMS_PER_PAGE
    );
    setTransactions(transactions);
    setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentPage(1);
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        Debes iniciar sesión para ver tu historial.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {(user.role === "ADMIN" || user.role === "CONSULTOR") && (
        <div className="my-4 grid grid-cols-1 max-w-lg relative">
          <select
            value={selectedClientId}
            onChange={(e) => handleSelectClient(e.target.value)}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          >
            <option value="">-- Selecciona un cliente --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
          />
        </div>
      )}

      <h3 className="font-normal mb-4 text-gray-800 text-start">
        Historial de transacciones
      </h3>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No hay transacciones registradas.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-4">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Fondo</th>
                  <th className="px-4 py-2 text-right">Monto (COP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-2">
                      {new Date(transaction.date).toLocaleString("es-CO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {transaction.type === "APERTURA"
                        ? "Suscripción"
                        : "Cancelación"}
                    </td>
                    <td className="px-4 py-2">{transaction.fundName}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ${transaction.amount.toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsList;
