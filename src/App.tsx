import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/store/authStore";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import DocumentsPage from "./pages/DocumentsPage";
import OperatorsPage from "./pages/OperatorsPage";
import TeachersPage from "./pages/TeachersPage";
import BranchesPage from "./pages/BranchesPage";
import GroupsPage from "./pages/GroupsPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import AuditLogPage from "./pages/AuditLogPage";
import CompaniesPage from "./pages/CompaniesPage";
import PlatformUsersPage from "./pages/PlatformUsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const isOwner = useAuthStore((s) => s.isOwner);
  if (!isOwner()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const DevRoute = ({ children }: { children: React.ReactNode }) => {
  const isDev = useAuthStore((s) => s.isDev);
  if (!isDev()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="filiallar" element={<OwnerRoute><BranchesPage /></OwnerRoute>} />
            <Route path="guruhlar" element={<GroupsPage />} />
            <Route path="talabalar" element={<StudentsPage />} />
            <Route path="tolovlar" element={<PaymentsPage />} />
            {/* <Route path="hujjatlar" element={<DocumentsPage />} /> */}
            <Route path="operatorlar" element={<OperatorsPage />} />
            <Route path="oqituvchilar" element={<TeachersPage />} />
            <Route path="foydalanuvchilar" element={<OwnerRoute><UsersPage /></OwnerRoute>} />
            <Route path="kompaniyalar" element={<DevRoute><CompaniesPage /></DevRoute>} />
            <Route path="platform-foydalanuvchilar" element={<DevRoute><PlatformUsersPage /></DevRoute>} />
            <Route path="audit" element={<OwnerRoute><AuditLogPage /></OwnerRoute>} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
