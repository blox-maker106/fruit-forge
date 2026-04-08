import { Skeleton } from "@/components/ui/skeleton";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import { AppProvider } from "./context/AppContext";

const DrawPage = lazy(() => import("./pages/DrawPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));

const PageFallback = () => (
  <div className="flex-1 flex flex-col gap-4 p-4">
    <Skeleton className="h-8 w-48 rounded-xl" />
    <Skeleton className="flex-1 rounded-2xl" />
    <Skeleton className="h-32 rounded-2xl" />
  </div>
);

const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </Layout>
    </AppProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/draw" />,
});

const drawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/draw",
  component: DrawPage,
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/result",
  component: ResultPage,
});

const routeTree = rootRoute.addChildren([indexRoute, drawRoute, resultRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
