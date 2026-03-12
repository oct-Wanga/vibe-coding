import { type NextRequest } from "next/server";

import { isFastApiBackend } from "@/shared/config/apiBackend";
import { proxyToFastApi } from "@/shared/lib/fastapiProxy";

type RouteHandler<TContext> = (
  request: NextRequest,
  context: TContext,
) => Promise<Response> | Response;

type BuildTargetPath<TContext> = (
  request: NextRequest,
  context: TContext,
) => Promise<string> | string;

export async function handleBffRoute<TContext>(options: {
  request: NextRequest;
  context: TContext;
  localHandler: RouteHandler<TContext>;
  buildTargetPath: BuildTargetPath<TContext>;
}): Promise<Response> {
  const { request, context, localHandler, buildTargetPath } = options;

  if (!isFastApiBackend()) {
    return localHandler(request, context);
  }

  const targetPath = await buildTargetPath(request, context);
  return proxyToFastApi(request, targetPath);
}
