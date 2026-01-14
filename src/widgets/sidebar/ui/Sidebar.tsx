import {ReactNode} from "react";

import {SidebarClient} from "./SidebarClient";


export function Sidebar({children}: { children?: ReactNode }) {
  return <SidebarClient>{children}</SidebarClient>;
}
