"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth-errors";
import toast from "@/lib/toast";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const FIELD_ERRORS: Record<string, keyof FormErrors> = {
  [AUTH_ERROR_MESSAGES.nameTaken]: "name",
  [AUTH_ERROR_MESSAGES.emailTaken]: "email",
  [AUTH_ERROR_MESSAGES.emailNotFound]: "email",
};

type RegisterFormProps = {
  onSuccess?: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const formId = useId();
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        const field = FIELD_ERRORS[result.error];

        if (field) {
          // Error asociado a un campo → se muestra inline
          setErrors({ [field]: result.error });
        } else {
          // Error general → toast
          toast.error("No se pudo crear la cuenta", result.error);
        }
        return;
      }

      await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      toast.success("¡Cuenta creada!", `Bienvenido, ${payload.name}`);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      toast.error("Error de conexión", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={nameId}>Nombre</Label>
        <Input
          id={nameId}
          name="name"
          placeholder="Tu nombre"
          autoComplete="name"
          required
        />
        {errors.name ? (
          <p className="text-xs text-red-400">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />
        {errors.email ? (
          <p className="text-xs text-red-400">{errors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId}>Contraseña</Label>
        <div className="relative">
          <Input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            className="pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {errors.password ? (
          <p className="text-xs text-red-400">{errors.password}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">o</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={handleGoogle}
      >
        <GoogleIcon />
        Continuar con Google
      </Button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}