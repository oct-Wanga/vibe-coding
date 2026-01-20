// @flow
import Link from "next/link";
import * as React from "react";

export const MarketingLinkBox = () => {
  return (
    <section className="flex gap-3 text-sm">
      <Link className="underline" href="/dashboard">
        /dashboard
      </Link>
      <Link className="underline" href="/projects">
        /projects
      </Link>
      <Link className="underline" href="/api/health">
        /api/health
      </Link>
    </section>
  );
};
