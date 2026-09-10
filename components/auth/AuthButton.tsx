"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogIn, LogOut, Shield } from "lucide-react";
import { AuthDialog, type AuthMode } from "@/components/auth/AuthDialog";
import { Button } from "@/components/ui/button";

function getInitial(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  return source.charAt(0).toUpperCase();
}

export function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  function openDialog(nextMode: AuthMode) {
    setMode(nextMode);
    setOpen(true);
  }

  if (status === "loading") {
    return (
      <Button variant="outline" disabled className="h-11 shrink-0 rounded-full">
        ...
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pr-1 pl-2">
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-[#4CD9A0]/15 text-sm font-semibold text-[#4CD9A0]"
        >
          {getInitial(session.user.name, session.user.email)}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
          {session.user.name ?? session.user.email}
        </span>
        {session.user.role === "admin" && (
          <Link
            href="/admin"
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            title="Panel administrativo"
          >
            <Shield className="size-4 text-[#4CD9A0]" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => openDialog("login")}
        className="h-11 shrink-0 rounded-full"
      >
        <LogIn />
        Iniciar sesión
      </Button>
      <AuthDialog open={open} onOpenChange={setOpen} defaultMode={mode} />
    </>
  );
}
