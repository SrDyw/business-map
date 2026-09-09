"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export type AuthMode = "login" | "register";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
};

const COPY: Record<AuthMode, { title: string; description: string }> = {
  login: {
    title: "Welcome back",
    description: "Please enter your details to sign in.",
  },
  register: {
    title: "Create account",
    description: "Please enter your details to sign up.",
  },
};

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  useEffect(() => {
    if (open) setMode(defaultMode);
  }, [open, defaultMode]);

  function close() {
    onOpenChange(false);
  }

  function toggleMode() {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl bg-[#2C2C2E] p-6 shadow-2xl sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-[#4CD9A0]/15 text-xl font-semibold text-[#4CD9A0]"
          >
            {mode === "login" ? "B" : "+"}
          </span>
          <DialogTitle className="text-xl">{COPY[mode].title}</DialogTitle>
          <DialogDescription className="text-gray-300">
            {COPY[mode].description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {mode === "login" ? (
            <LoginForm onSuccess={close} />
          ) : (
            <RegisterForm onSuccess={close} />
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-300">
          {mode === "login" ? (
            <>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
