import SideNav from '@/app/ui/dashboard/sidenav';
import { LoadingProvider } from '@/app/ui/loading-context';

export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden bg-slate-50 text-slate-900">
      <div className="w-full flex-none md:w-64 no-print">
        <SideNav />
      </div>
      <div className="flex-grow p-3 sm:p-6 md:overflow-y-auto md:p-8 bg-slate-50">
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </div>
    </div>
  );
}