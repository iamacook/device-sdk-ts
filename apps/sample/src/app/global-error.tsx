"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Error, { ErrorProps } from "next/error";

export default function GlobalError({ error }: { error: ErrorProps }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <Error {...error} />
      </body>
    </html>
  );
}
