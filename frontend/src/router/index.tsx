import { type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "~/features/auth/context/AuthContext";
import type { RoleKey } from "~/types/navigation";
import type { UserResponse } from "~/types";

// Layouts
import { DashboardLayout } from "~/components/layouts";
import { AuthLayout } from "~/components/layouts/AuthLayout";

// Features
import { LoginPage, RegisterPage, ForgotPasswordPage } from "~/features/auth";
// Owner pages
import {
    OwnerDashboard,
    PetProfilesPage,
    UnifiedBookingPage,
    BoardingTrackingPage,
    PaymentsPage,
    ProfilePage,
} from "~/features/owner";
import {
    ReceptionDashboard,
    AppointmentReceptionPage,
    GroomingBoardPage,
    BoardingLogPage,
} from "~/features/reception";
import { ReceptionMockProvider } from "~/features/reception/mockReceptionData";
import { DoctorDashboard, DoctorQueuePage, MedicalRecordPage } from "~/features/doctor";
import {
    AdminDashboard,
    AccountsPage,
    CatalogPage,
    RoomsPage,
    SchedulePage,
    ReportsPage,
} from "~/features/admin";

function getStoredUser(): UserResponse | null {
    try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? (JSON.parse(storedUser) as UserResponse) : null;
    } catch {
        return null;
    }
}

function AuthGuard({ children, requiredRole }: { children: ReactNode; requiredRole: RoleKey }) {
    const { user } = useAuth();
    const effectiveUser = user ?? getStoredUser();
      
    if (!effectiveUser) {
        return <Navigate to="/login" replace />;
    }

    const currentRole = effectiveUser?.roleCode?.toLowerCase() || "public";
    
    if (currentRole !== requiredRole) {
        const fallbackPath = currentRole === "public" ? "/login" : `/${currentRole}`;
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}

function RootRedirect() {
    const { user } = useAuth();
    const effectiveUser = user ?? getStoredUser();
    const currentRole = effectiveUser?.roleCode?.toLowerCase() || "public";
    return <Navigate to={currentRole === "public" ? "/login" : `/${currentRole}`} replace />;
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />,
    },

    // Auth routes
    {
        element: <AuthLayout />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
    },

    // OWNER ROUTES
    {
        path: "/owner",
        element: (
            <AuthGuard requiredRole="owner">
                <DashboardLayout />
            </AuthGuard>
        ),
        children: [
            { index: true, element: <OwnerDashboard /> },
            { path: "pets", element: <PetProfilesPage /> },
            { path: "book", element: <UnifiedBookingPage /> },
            { path: "boarding/tracking", element: <BoardingTrackingPage /> },
            { path: "payments", element: <PaymentsPage /> },
            { path: "profile", element: <ProfilePage /> },
        ],
    },

    // STAFF ROUTES
    {
        path: "/staff",
        element: (
            <AuthGuard requiredRole="staff">
                <ReceptionMockProvider>
                    <DashboardLayout />
                </ReceptionMockProvider>
            </AuthGuard>
        ),
        children: [
            { index: true, element: <ReceptionDashboard /> },
            { path: "appointments", element: <AppointmentReceptionPage /> },
            { path: "grooming-board", element: <GroomingBoardPage /> },
            { path: "boarding-log", element: <BoardingLogPage /> },
        ],
    },
    {
        path: "/veterinarian",
        element: (
            <AuthGuard requiredRole="veterinarian">
                <DashboardLayout />
            </AuthGuard>
        ),
        children: [
            { index: true, element: <DoctorDashboard /> },
            { path: "queue", element: <DoctorQueuePage /> },
            { path: "medical-record", element: <MedicalRecordPage /> },
        ],
    },
    {
        path: "/admin",
        element: (
            <AuthGuard requiredRole="admin">
                <DashboardLayout />
            </AuthGuard>
        ),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: "accounts", element: <AccountsPage /> },
            { path: "catalog", element: <CatalogPage /> },
            { path: "rooms", element: <RoomsPage /> },
            { path: "schedule", element: <SchedulePage /> },
            { path: "reports", element: <ReportsPage /> },
        ],
    },
]);
