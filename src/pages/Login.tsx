"use client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { BuildingLibraryIcon } from "@heroicons/react/24/solid";
import { login } from "../services/mockService";
import { useState } from "react";

interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = (data: LoginFormInputs) => {
    try {
      const user = login(data.email, data.password);
      setErrorMessage(null);
      localStorage.setItem("currentUser", JSON.stringify(user));
      switch (user.role) {
        case "CLIENT":
          navigate("/funds");
          break;
        case "CONSULTOR":
          navigate("/transaction");
          break;
        case "ADMIN":
          navigate("/dashboard");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error desconocido al iniciar sesión");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center ">
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-8 border rounded-2xl border-gray-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <div className="flex justify-center">
            <BuildingLibraryIcon className="h-6 w-6" />
          </div>
          <h2 className="mt-10 text-2xl/9 font-semibold tracking-tight text-gray-900">
            Fondo Voluntario de Pensión
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de correo inválido",
                    },
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Contraseña
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 4,
                      message: "La contraseña debe tener al menos 4 caracteres",
                    },
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
