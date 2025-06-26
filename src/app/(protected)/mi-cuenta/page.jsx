"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import DeleteAccountModal from "./DeleteAccountModal";

const MyAccount = () => {
  const { toast } = useToast();
  const { data, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (data && data.user) {
      setUserData(data.user);
      setIsLoading(false);
    } else {
      toast({
        title: "No se pudo obtener la información del usuario",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [data, status, toast]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        toast({ title: "Contraseña actualizada correctamente" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: data.error || "Error al cambiar contraseña",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error en cambio de contraseña:", err);
      toast({
        title: "Error de red al cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando información de usuario...</div>;
  }

  if (!userData) {
    return (
      <div className="error">No se pudo cargar la información del usuario</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Cuenta</h1>
        <p className="text-gray-600">
          Administra tu información personal y seguridad
        </p>
      </header>
      {/* <DeleteAccountModal userId={userData.id} userEmail={userData.email} /> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sección de Perfil */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                {userData.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {userData.name || "Usuario"}
              </h2>
              <p className="text-gray-500 mt-1">
                {userData.email || "Sin correo"}
              </p>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Perfil de Usuario</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Seguridad de la Cuenta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Cambio de Contraseña */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Cambiar Contraseña
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="form-group">
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña actual
                </label>
                <input
                  type="password"
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Cambiando...
                    </>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sección de seguridad adicional */}
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Seguridad de la Cuenta
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Autenticación de dos factores
                  </h3>
                  <p className="text-sm text-gray-600">
                    Agrega una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
                  Configurar
                </button>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Sesiones activas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Revisa dónde has iniciado sesión
                  </p>
                </div>
                <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
                  Ver sesiones
                </button>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Historial de actividad
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitorea la actividad reciente de tu cuenta
                  </p>
                </div>
                <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
                  Ver historial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
