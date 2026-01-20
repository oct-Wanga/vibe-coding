"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type LoginInput, loginSchema, useLogin } from "@/features/auth";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/shared/ui";

export function LoginForm() {
  const login = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = (values: LoginInput) => {
    login.mutate(values);
  };

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>

            {login.isSuccess ? <span className="text-sm text-green-700">OK</span> : null}
            {login.isError ? <span className="text-sm text-red-700">Fail</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
