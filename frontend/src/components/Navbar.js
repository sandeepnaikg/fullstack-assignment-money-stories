import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, TrendingUp, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div
              className="font-serif text-2xl font-bold text-zinc-950 cursor-pointer"
              onClick={() => navigate('/dashboard')}
              data-testid="navbar-logo"
            >
              ResearchHub
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                data-testid="navbar-dashboard"
                className="gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/library')}
                data-testid="navbar-library"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Library
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/insights')}
                data-testid="navbar-insights"
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Insights
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-zinc-600" data-testid="navbar-user-name">
              {user.name || 'User'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="navbar-logout-btn"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}