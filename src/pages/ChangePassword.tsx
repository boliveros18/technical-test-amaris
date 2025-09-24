"use client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BuildingLibraryIcon } from "@heroicons/react/24/solid";
import { changePassword } from "../services/mockService";
import { useState } from "react";
import Layout from "../components/ui/Layout";

interface ChangePasswordInputs {
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInputs>();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = (data: ChangePasswordInputs) => {
    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      setErrorMessage("Debes iniciar sesión para cambiar la contraseña");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      changePassword(user.id, data.newPassword);
      setErrorMessage(null);
      setSuccessMessage("✅ Contraseña cambiada exitosamente");
      setTimeout(() => {
        navigate("/funds");
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error desconocido al cambiar contraseña");
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-8 border rounded-2xl border-gray-100 max-w-sm mx-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <div className="flex justify-center">
            <BuildingLibraryIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-10 text-2xl/9 font-semibold tracking-tight text-gray-900">
            Fondo Voluntario de Pensión
          </h2>
        </div>
        <div className="mt-10 w-full ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Nueva Contraseña
              </label>
              <div className="mt-2">
                <input
                  id="newPassword"
                  type="password"
                  {...register("newPassword", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 4,
                      message: "Debe tener al menos 4 caracteres",
                    },
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Confirmar Contraseña
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Debes confirmar la contraseña",
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600">{successMessage}</p>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Cambiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
