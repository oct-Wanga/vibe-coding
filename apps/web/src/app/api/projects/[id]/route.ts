import { type NextRequest } from "next/server";

import { bffEndpoints } from "@/shared/config/bffEndpoints";
import { handleBffRoute } from "@/shared/lib/bff/handleBffRoute";

import { DELETE as localDelete, GET as localGet, PATCH as localPatch } from "./route.local";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  return handleBffRoute({
    request,
    context,
    localHandler: (req, ctx) => localGet(req, ctx),
    buildTargetPath: async (_, ctx) => {
      const { id } = await ctx.params;
      return bffEndpoints.projects.detail(id);
    },
  });
}

export async function PATCH(request: NextRequest, context: Params) {
  return handleBffRoute({
    request,
    context,
    localHandler: (req, ctx) => localPatch(req, ctx),
    buildTargetPath: async (_, ctx) => {
      const { id } = await ctx.params;
      return bffEndpoints.projects.detail(id);
    },
  });
}

export async function DELETE(request: NextRequest, context: Params) {
  return handleBffRoute({
    request,
    context,
    localHandler: (req, ctx) => localDelete(req, ctx),
    buildTargetPath: async (_, ctx) => {
      const { id } = await ctx.params;
      return bffEndpoints.projects.detail(id);
    },
  });
}
