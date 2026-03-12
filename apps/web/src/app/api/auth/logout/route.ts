import { type NextRequest } from "next/server";

import { bffEndpoints } from "@/shared/config/bffEndpoints";
import { handleBffRoute } from "@/shared/lib/bff/handleBffRoute";

import { POST as localPost } from "./route.local";

export async function POST(request: NextRequest) {
  return handleBffRoute({
    request,
    context: undefined,
    localHandler: (req) => localPost(req),
    buildTargetPath: () => bffEndpoints.auth.logout,
  });
}
