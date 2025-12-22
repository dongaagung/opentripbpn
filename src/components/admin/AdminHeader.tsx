import { useAuth } from '@/hooks/useAuth';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-card/60 backdrop-blur-xl border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border/50">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
