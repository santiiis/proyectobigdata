"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh(); // Force a refresh to clear layout states
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
    >
      {isLoading ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
