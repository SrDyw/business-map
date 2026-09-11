"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, LogOut, Shield, Store, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthDialog, type AuthMode } from "@/components/auth/AuthDialog";
import { Button } from "@/components/ui/button";

function getInitial(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  return source.charAt(0).toUpperCase();
}

type AuthButtonProps = {
  onRegisterBusiness?: () => void;
};

export function AuthButton({ onRegisterBusiness }: AuthButtonProps = {}) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [signOutOpen, setSignOutOpen] = useState(false);

  function openDialog(nextMode: AuthMode) {
    setMode(nextMode);
    setOpen(true);
  }

  if (status === "loading") {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className="size-11 shrink-0 rounded-full"
        aria-label="Cargando sesión"
      >
        <Loader2 className="size-5 animate-spin" />
      </Button>
    );
  }

  if (session?.user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0 rounded-full border border-border bg-card shadow-lg"
                aria-label="Menú de cuenta"
              >
                <Avatar size="sm" className="size-8">
                  {session.user.image && (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name ?? ""}
                    />
                  )}
                  <AvatarFallback>
                    {getInitial(session.user.name, session.user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {session.user.name ?? session.user.email}
                {session.user.email && session.user.name && (
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {session.user.email}
                  </span>
                )}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {onRegisterBusiness && (
              <DropdownMenuItem onClick={onRegisterBusiness}>
                <Store />
                Registrar negocio
              </DropdownMenuItem>
            )}
            {session.user.role === "admin" && (
              <>
                <DropdownMenuItem render={<Link href="/admin" />}>
                  <Shield />
                  Panel administrativo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setSignOutOpen(true)}
            >
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
          <DialogContent align="center" showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>¿Cerrar sesión?</DialogTitle>
              <DialogDescription>
                Deberás iniciar sesión de nuevo para volver a tu cuenta.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end items-center flex-row">
              <Button
                variant="outline"
                onClick={() => setSignOutOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut />
                Cerrar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AuthDialog open={open} onOpenChange={setOpen} defaultMode={mode} />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => openDialog("login")}
        size="icon"
        className="size-11 shrink-0 rounded-full"
        aria-label="Iniciar sesión"
        title="Iniciar sesión"
      >
        <User className="size-5" />
      </Button>
      <AuthDialog open={open} onOpenChange={setOpen} defaultMode={mode} />
    </>
  );
}