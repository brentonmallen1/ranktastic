import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, LogOut, Settings, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';

export function Navbar() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/');
  };

  return (
    <nav aria-label="Main navigation" className="border-b bg-background sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <BarChart2 className="h-5 w-5 text-primary" />
          Ranktastic
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-1" />Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Settings" asChild>
                <Link to="/admin/settings"><Settings className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/login">Admin</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
