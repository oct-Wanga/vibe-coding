"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

type ResultState = {
  title: string;
  detail?: string;
};

export default function SentryTestPage() {
  const [result, setResult] = useState<ResultState | null>(null);

  const handleClientError = () => {
    const error = new Error("Sentry test: client error");
    Sentry.captureException(error, {
      tags: { source: "sentry-test", kind: "client" },
    });
    setResult({ title: "클라이언트 오류 전송 완료", detail: error.message });
  };

  const handleServerError = async () => {
    setResult({ title: "서버 오류 요청 중..." });
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      });

      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setResult({
        title: "서버 오류 요청 완료",
        detail: data.message ?? "응답 메시지를 확인하세요.",
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "sentry-test", kind: "network" },
      });
      setResult({
        title: "요청 실패",
        detail: error instanceof Error ? error.message : "알 수 없는 오류",
      });
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Sentry 오류 발생 테스트</h1>
        <p className="text-sm text-gray-600">
          아래 버튼을 눌러 클라이언트/서버 오류 이벤트를 발생시키고 Sentry 대시보드에서 확인하세요.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50"
          type="button"
          onClick={handleClientError}
        >
          클라이언트 오류 전송
        </button>
        <button
          className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-50"
          type="button"
          onClick={handleServerError}
        >
          서버 오류 요청
        </button>
      </div>

      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium">최근 결과</p>
        <p className="mt-2">{result?.title ?? "아직 실행되지 않았습니다."}</p>
        {result?.detail ? <p className="mt-1 text-xs text-gray-500">{result.detail}</p> : null}
      </div>
    </main>
  );
}
