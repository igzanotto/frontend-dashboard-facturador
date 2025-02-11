// src/app/dashboard/layout.tsx
import DashboardLayout from '@/components/DashboardLayout';
import { GlobalProvider } from '@/lib/context/GlobalContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <GlobalProvider>
            <DashboardLayout>{children}</DashboardLayout>
        </GlobalProvider>
    );
}