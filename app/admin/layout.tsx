import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Uproszczona wersja: nie sprawdzaj ścieżki, tylko niech layout admina chroni wszystko poza loginem
// a layout strony logowania NIE sprawdza sesji (czyli /admin/login nie jest chronione)

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
