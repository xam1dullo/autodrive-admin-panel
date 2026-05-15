import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-60 min-h-screen flex flex-col transition-all duration-300">
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
