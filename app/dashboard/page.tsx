/**
 * Dashboard Page - Clean Rebuild
 * Client-side auth check with role-based rendering
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';
import CeoDashboard from '@/components/dashboard/CeoDashboard';
import TeamLeaderDashboard from '@/components/dashboard/TeamLeaderDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      setUser(session.user);

      // Check user type
      const { data: agent } = await supabase
        .from('sales_agents')
        .select('user_type')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!agent?.user_type) {
        // No role selected, redirect to selection
        router.push('/select-account-type');
        return;
      }

      setUserType(agent.user_type);
        setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  const isCEO = userType === 'ceo' || userType === 'CEO';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      {isCEO ? <CeoDashboard /> : <TeamLeaderDashboard />}
    </div>
  );
}
