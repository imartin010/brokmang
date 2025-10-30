/**
 * Navbar - Clean Rebuild
 * Simple navigation with auth
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { signOutUser } from '@/lib/auth-simple';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import {
  Home,
  LayoutDashboard,
  Calculator,
  History,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  FileText,
  Lightbulb,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        fetchUserType(data.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserType(session.user.id);
      } else {
        setUserType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserType = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('sales_agents')
        .select('user_type')
        .eq('user_id', userId)
        .single();

      if (data?.user_type) {
        // Map database format to display format
        const mappedType = data.user_type === 'ceo' ? 'CEO' : 
                          data.user_type === 'team_leader' ? 'Team Leader' : 
                          data.user_type;
        setUserType(mappedType);
      }
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setUserType(null);
    router.push('/');
  };

  const baseLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const ceoLinks = [
    { href: '/analyze', label: 'Break-Even', icon: Calculator },
    { href: '/history', label: 'History', icon: History },
  ];

  const commonLinks = [
    { href: '/crm/sales', label: 'Team', icon: Users },
    { href: '/crm/logs', label: 'Logs', icon: ClipboardList },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
  ];

  // Show CEO links only if user type is CEO
  const showCeoLinks = userType === 'CEO';
  const links = [...baseLinks, ...(showCeoLinks ? ceoLinks : []), ...commonLinks];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
            Brokmang.
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {userType && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {userType === 'CEO' ? '👔 CEO' : '👥 Team Leader'}
              </div>
            )}

            <ThemeToggle />

            {user ? (
              <>
                <Link href="/crm/settings" className="hidden md:block">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                  className="hidden md:flex"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="gradient-bg">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {userType && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium mb-2">
                {userType === 'CEO' ? '👔 CEO' : '👥 Team Leader'}
              </div>
            )}

            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/crm/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>

            <button
              onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
