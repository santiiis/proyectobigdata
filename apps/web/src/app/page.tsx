import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirigir el root automáticamente al dashboard (o al login si el middleware lo intercepta)
  redirect("/dashboard");
}
