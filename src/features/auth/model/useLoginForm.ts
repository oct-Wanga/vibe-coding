"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type LoginInput, loginSchema, useLogin } from "@/features/auth";

export function useLoginForm() {
  const { mutate, isPending, isSuccess, isError } = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = (values: LoginInput) => {
    mutate(values);
  };

  return {
    form,
    isPending,
    isSuccess,
    isError,
    onSubmit,
  };
}
