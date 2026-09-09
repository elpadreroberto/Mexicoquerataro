import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const basepath = rawBase.replace(/\/$/, "") || "/";
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    ...(basepath !== "/" ? { basepath } : {}),
  });
}
