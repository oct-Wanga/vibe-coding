import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SentryTestPage from "./page";

describe("SentryTestPage", () => {
  it("renders action buttons for client/server errors", () => {
    const html = renderToStaticMarkup(<SentryTestPage />);

    expect(html).toContain("Sentry 오류 발생 테스트");
    expect(html).toContain("클라이언트 오류 전송");
    expect(html).toContain("서버 오류 요청");
  });
});
