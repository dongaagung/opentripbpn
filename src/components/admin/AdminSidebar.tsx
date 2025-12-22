import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  Image, 
  MessageSquare, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/packages', label: 'Paket Trip', icon: Package },
  { path: '/admin/gallery', label: 'Galeri', icon: Image },
  { path: '/admin/testimonials', label: 'Testimoni', icon: MessageSquare },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-card/80 backdrop-blur-xl border-r border-border/50 h-screen sticky top-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          {!collapsed && (
            <Link to="/" className="font-serif text-xl font-bold text-foreground">
              opentrip.bpn
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={signOut}
            className={cn(
              'w-full justify-start gap-3 text-muted-foreground hover:text-destructive',
              collapsed && 'justify-center'
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span>Keluar</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
