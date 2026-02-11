"use client";

import { useLoginForm } from "@/features/auth";
import { Button, Input, Label } from "@/shared/ui";

export function LoginForm() {
  const { form, isPending, isSuccess, isError, onSubmit } = useLoginForm();

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={"bg-yellow-300"}>
          Password
        </Label>
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        {isSuccess ? <span className="text-sm text-green-700">OK</span> : null}
        {isError ? <span className="text-sm text-red-700">Fail</span> : null}
      </div>
    </form>
  );
}
