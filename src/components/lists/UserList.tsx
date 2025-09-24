"use client";
import { useEffect, useState } from "react";
import type { User, UserPortfolioItem } from "../../interfaces";
import {
  listUsers,
  changePassword,
  editUser,
} from "../../services/mockService";
import { useForm } from "react-hook-form";
import {
  ArrowRightStartOnRectangleIcon,
  ArrowPathRoundedSquareIcon,
  PencilSquareIcon,
} from "@heroicons/react/16/solid";
import UiButton from "../ui/UiButton";

interface ChangePasswordInputs {
  newPassword: string;
  confirmPassword: string;
}

interface EditUserInputs {
  name: string;
  email: string;
  phone?: string;
}

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<
    UserPortfolioItem[] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openPass, setOpenPass] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [currentUserForPassword, setCurrentUserForPassword] =
    useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordForm = useForm<ChangePasswordInputs>();
  const editForm = useForm<EditUserInputs>();

  useEffect(() => {
    const allUsers = listUsers();
    setUsers(allUsers);
  }, []);

  const openPortfolioModal = (portfolio: UserPortfolioItem[]) => {
    setSelectedPortfolio(portfolio);
    setOpenPass(false);
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openPasswordModal = (user: User) => {
    setCurrentUserForPassword(user);
    setOpenPass(true);
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setOpenPass(false);
    setSelectedPortfolio(null);
    editForm.reset({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPortfolio(null);
    setEditingUser(null);
    setCurrentUserForPassword(null);
    setIsModalOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    passwordForm.reset();
    editForm.reset();
  };

  const onSubmitPassword = (data: ChangePasswordInputs) => {
    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }
    if (!currentUserForPassword) return;

    try {
      changePassword(currentUserForPassword.id, data.newPassword);
      setErrorMessage(null);
      setSuccessMessage("✅ Contraseña cambiada exitosamente");
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage("Error desconocido al cambiar contraseña");
    }
  };

  const onSubmitEditUser = (data: EditUserInputs) => {
    if (!editingUser) return;

    const updatedUser = { ...editingUser, ...data };
    editUser(updatedUser);

    const updatedUsers = users.map((u) =>
      u.id === editingUser.id ? updatedUser : u
    );

    setUsers(updatedUsers);
    setErrorMessage(null);
    setSuccessMessage("✅ Usuario actualizado correctamente");

    setTimeout(() => closeModal(), 1000);
  };

  return (
    <div>
      <h3 className="font-normal mb-6 text-gray-800 text-start">
        Listado de usuarios
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-4">
        <table className="min-w-full divide-y divide-gray-200 text-sm table-auto">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Balance (COP)</th>
              <th className="px-4 py-2 text-left">Portafolio</th>
              <th className="px-4 py-2 text-center">Editar</th>
              <th className="px-4 py-2 text-center">Contraseña</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">{user.phone ?? "-"}</td>
                <td className="px-4 py-2 font-semibold">
                  ${user.balance.toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-2">
                  {user.portfolio.length === 0 ? (
                    <span className="text-gray-500">Sin inversiones</span>
                  ) : (
                    <button
                      onClick={() => openPortfolioModal(user.portfolio)}
                      className="flex bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-700 transition-colors hover:cursor-pointer"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5 flex-shrink-0 mr-1" />
                      ({user.portfolio.length})
                    </button>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => openEditUserModal(user)}
                    className="inline-flex items-center justify-center bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700 transition-colors hover:cursor-pointer"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => openPasswordModal(user)}
                    className="inline-flex items-center justify-center bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors hover:cursor-pointer"
                  >
                    <ArrowPathRoundedSquareIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          {openPass ? (
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-6 rounded-lg shadow-lg">
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Cambiar contraseña ({currentUserForPassword?.name})
                </h3>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 4,
                        message: "Debe tener al menos 4 caracteres",
                      },
                    })}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword", {
                      required: "Debes confirmar la contraseña",
                    })}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-600">{successMessage}</p>
                )}
                <div className="flex justify-center">
                  <UiButton
                    onClick={closeModal}
                    variant="secondary"
                    className="mr-4"
                  >
                    Cancelar
                  </UiButton>
                  <UiButton type="submit" variant="danger">
                    Cambiar
                  </UiButton>
                </div>
              </form>
            </div>
          ) : editingUser ? (
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-6 rounded-lg shadow-lg">
              <form
                onSubmit={editForm.handleSubmit(onSubmitEditUser)}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Editar usuario ({editingUser.name})
                </h3>
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900 mb-1">
                    Nombre
                  </label>
                  <input
                    {...editForm.register("name", { required: "Obligatorio" })}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900 mb-1">
                    Email
                  </label>
                  <input
                    {...editForm.register("email", { required: "Obligatorio" })}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900 mb-1">
                    Teléfono
                  </label>
                  <input
                    {...editForm.register("phone")}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 border border-gray-200"
                  />
                </div>
                {successMessage && (
                  <p className="text-sm text-green-600">{successMessage}</p>
                )}
                <div className="flex justify-center">
                  <UiButton
                    onClick={closeModal}
                    variant="secondary"
                    className="mr-4"
                  >
                    Cancelar
                  </UiButton>
                  <UiButton type="submit" variant="alternative">
                    Guardar
                  </UiButton>
                </div>
              </form>
            </div>
          ) : (
            selectedPortfolio && (
              <div className="bg-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Portafolio del usuario
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                      <tr>
                        <th className="px-4 py-2 text-left">Fondo</th>
                        <th className="px-4 py-2 text-right">Monto (COP)</th>
                        <th className="px-4 py-2 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                      {selectedPortfolio.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">{item.fundName}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            ${item.amount.toLocaleString("es-CO")}
                          </td>
                          <td className="px-4 py-2">
                            {new Date(item.date).toLocaleString("es-CO", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-400 px-4 py-2 rounded-md hover:bg-gray-300 text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default UsersTable;
