import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Panel Administrativo | Business Map",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-background">
      <nav className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link href="/" className="font-semibold text-foreground">
            Business Map
          </Link>
          <div className="flex gap-1">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Usuarios
            </Link>
            <Link
              href="/admin/businesses"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Negocios
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-[#4CD9A0]/15 px-2.5 py-0.5 text-xs font-medium text-[#4CD9A0]">
              Admin
            </span>
            <span className="text-sm text-muted-foreground">
              {session.user.name ?? session.user.email}
            </span>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
