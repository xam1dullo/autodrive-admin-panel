import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoader } from "@/components/layout/PageLoader";
import { useAuthStore } from "@/store/authStore";

import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const StudentsPage = lazy(() => import("./pages/StudentsPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const OperatorsPage = lazy(() => import("./pages/OperatorsPage"));
const TeachersPage = lazy(() => import("./pages/TeachersPage"));
const BranchesPage = lazy(() => import("./pages/BranchesPage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const CompaniesPage = lazy(() => import("./pages/CompaniesPage"));
const CompanyDetailPage = lazy(() => import("./pages/CompanyDetailPage"));
const PlatformUsersPage = lazy(() => import("./pages/PlatformUsersPage"));
const SystemHealthPage = lazy(() => import("./pages/SystemHealthPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Owner page is also accessible to dev (platform admin sees everything)
const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "owner" && role !== "dev") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const DevRoute = ({ children }: { children: React.ReactNode }) => {
  const isDev = useAuthStore((s) => s.isDev);
  if (!isDev()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const LoginRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="kompaniyalar"
              element={
                <DevRoute>
                  <Suspense fallback={<PageLoader />}>
                    <CompaniesPage />
                  </Suspense>
                </DevRoute>
              }
            />
            <Route
              path="kompaniyalar/:id"
              element={
                <DevRoute>
                  <Suspense fallback={<PageLoader />}>
                    <CompanyDetailPage />
                  </Suspense>
                </DevRoute>
              }
            />
            <Route
              path="platform-foydalanuvchilar"
              element={
                <DevRoute>
                  <Suspense fallback={<PageLoader />}>
                    <PlatformUsersPage />
                  </Suspense>
                </DevRoute>
              }
            />
            <Route
              path="system-health"
              element={
                <DevRoute>
                  <Suspense fallback={<PageLoader />}>
                    <SystemHealthPage />
                  </Suspense>
                </DevRoute>
              }
            />
            <Route
              path="filiallar"
              element={
                <OwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <BranchesPage />
                  </Suspense>
                </OwnerRoute>
              }
            />
            <Route
              path="guruhlar"
              element={
                <Suspense fallback={<PageLoader />}>
                  <GroupsPage />
                </Suspense>
              }
            />
            <Route
              path="talabalar"
              element={
                <Suspense fallback={<PageLoader />}>
                  <StudentsPage />
                </Suspense>
              }
            />
            <Route
              path="tolovlar"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PaymentsPage />
                </Suspense>
              }
            />
            <Route
              path="operatorlar"
              element={
                <Suspense fallback={<PageLoader />}>
                  <OperatorsPage />
                </Suspense>
              }
            />
            <Route
              path="oqituvchilar"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TeachersPage />
                </Suspense>
              }
            />
            <Route
              path="foydalanuvchilar"
              element={
                <OwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <UsersPage />
                  </Suspense>
                </OwnerRoute>
              }
            />
            <Route
              path="audit"
              element={
                <OwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AuditLogPage />
                  </Suspense>
                </OwnerRoute>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
