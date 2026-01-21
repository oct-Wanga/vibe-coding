"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import type { SignupInput } from "@/features/auth";
import { signupSchema, useSignup } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import { Button, Input, Label } from "@/shared/ui";

export function SignupForm() {
  const signup = useSignup();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  const submitMessage = useMemo(() => {
    if (!signup.isSuccess) return null;

    const result = signup.data;
    if (!result) return null;

    if (!result.ok) return result.message;
    if (result.needsEmailConfirm) return "가입 완료! 이메일 인증을 진행해주세요.";
    return "가입 완료! 로그인할 수 있어요.";
  }, [signup.data, signup.isSuccess]);

  const onSubmit = (values: SignupInput) => {
    signup.mutate(values);
  };

  const emailErr = form.formState.errors.email?.message;
  const pwErr = form.formState.errors.password?.message;
  const cpwErr = form.formState.errors.confirmPassword?.message;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="email@example.com" {...form.register("email")} />
        {emailErr ? <p className="text-xs text-red-600">{emailErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          {...form.register("password")}
        />
        {pwErr ? <p className="text-xs text-red-600">{pwErr}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="********"
          {...form.register("confirmPassword")}
        />
        {cpwErr ? <p className="text-xs text-red-600">{cpwErr}</p> : null}
      </div>

      <div className="flex items-center gap-3 pt-1 justify-between">
        <Button type="submit" disabled={signup.isPending}>
          {signup.isPending ? "Signing up..." : "Sign up"}
        </Button>

        {signup.isSuccess && signup.data?.ok ? (
          <span
            className={cn(
              "text-sm",
              signup.data.needsEmailConfirm ? "text-amber-700" : "text-green-700",
            )}
          >
            {submitMessage}
          </span>
        ) : null}

        {signup.isError ? <span className="text-sm text-red-700">Fail</span> : null}
        {signup.isSuccess && signup.data && !signup.data.ok ? (
          <span className="text-sm text-green-700">{signup.data.message}</span>
        ) : null}
      </div>
    </form>
  );
}
