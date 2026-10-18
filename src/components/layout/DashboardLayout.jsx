import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import {
  LayoutDashboard, Pill, Users, Calendar, Bell, FileText, Settings,
  Menu, X, LogOut, Sun, Moon, Monitor, ScanLine, Stethoscope
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { mode, changeMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Medicines', href: '/app/medicines', icon: Pill },
    { name: 'Scan', href: '/app/scan/prescription', icon: ScanLine },
    { name: 'Family Hub', href: '/app/family', icon: Users },
    { name: 'Care Plans', href: '/app/care-plans', icon: Stethoscope },
    { name: 'Reports', href: '/app/reports', icon: FileText },
  ];

  const isActive = (href) => {
    if (href === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'rgb(var(--color-background))' }}
    >
      {/* Mobile Header */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          backgroundColor: 'rgb(var(--color-background))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[rgb(var(--color-secondary))]"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
            <span className="font-bold">MediTrack</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/notifications"
              className="p-2 rounded-lg hover:bg-[rgb(var(--color-secondary))] relative"
            >
              <Bell className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-64 z-50 border-r transition-transform
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'rgb(var(--color-background))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <Pill className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
          <span className="font-bold text-lg">MediTrack</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: active ? 'rgb(var(--color-primary) / 0.1)' : 'transparent',
                    color: active ? 'rgb(var(--color-primary))' : 'rgb(var(--color-foreground))',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t space-y-1" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <Link
              to="/app/notifications"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[rgb(var(--color-secondary))]"
            >
              <Bell className="w-5 h-5" />
              <span className="font-medium">Notifications</span>
            </Link>

            <Link
              to="/app/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[rgb(var(--color-secondary))]"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[rgb(var(--color-secondary))]"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'rgb(var(--color-primary))',
                  color: 'rgb(var(--color-primary-foreground))',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  {user?.email}
                </p>
              </div>
            </button>

            {userMenuOpen && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border shadow-lg overflow-hidden"
                style={{
                  backgroundColor: 'rgb(var(--color-card))',
                  borderColor: 'rgb(var(--color-border))',
                }}
              >
                <button
                  onClick={() => {
                    const modes = ['light', 'dark', 'system'];
                    const currentIndex = modes.indexOf(mode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    changeMode(nextMode);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--color-secondary))] transition-colors"
                >
                  {mode === 'light' && <Sun className="w-4 h-4" />}
                  {mode === 'dark' && <Moon className="w-4 h-4" />}
                  {mode === 'system' && <Monitor className="w-4 h-4" />}
                  <span className="text-sm">Theme: {mode}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--color-secondary))] transition-colors text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
