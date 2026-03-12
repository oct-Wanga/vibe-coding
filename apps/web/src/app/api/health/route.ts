import { type NextRequest } from "next/server";

import { bffEndpoints } from "@/shared/config/bffEndpoints";
import { handleBffRoute } from "@/shared/lib/bff/handleBffRoute";

import { GET as localGet } from "./route.local";

export async function GET(request: NextRequest) {
  return handleBffRoute({
    request,
    context: undefined,
    localHandler: () => localGet(),
    buildTargetPath: () => bffEndpoints.health,
  });
}
