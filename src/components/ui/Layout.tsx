import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  BuildingLibraryIcon,
  ArrowLongRightIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import type { User } from "../../interfaces";

interface Props {
  children?: ReactNode;
}

const allPages = {
  CONSULTOR: [{  name: "Historial de transacciones", href: "/transaction" }],
  CLIENT: [
    { name: "Fondos", href: "/funds" },
    { name: "Historial de transacciones", href: "/transaction" },
  ],
  ADMIN: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Historial de transacciones", href: "/transaction" },
  ],
};

export const Layout: FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const rolePages =
    (user?.role && allPages[user.role as keyof typeof allPages]) || [];

  return (
    <>
      <nav className="flex items-start justify-between px-6 py-3 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="flex justify-center mx-4">
            <BuildingLibraryIcon className="h-6 w-6" />
            <p className="ml-2">FVP</p>
          </div>

          {rolePages.map((page) => (
            <a
              key={page.name}
              href={page.href}
              className="text-gray-700 font-light hover:text-indigo-600 transition-colors"
            >
              {page.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleChangePassword}
            className="flex items-center gap-2 hover:text-indigo-600 transition-colors hover:cursor-pointer"
          >
            Cambiar contraseña
            <LockClosedIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors hover:cursor-pointer"
          >
            Salir
            <ArrowLongRightIcon className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <main className="p-6">{children}</main>
    </>
  );
};

export default Layout;
