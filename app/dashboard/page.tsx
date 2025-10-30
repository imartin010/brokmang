/**
 * Dashboard Page
 * Role-based dashboard (CEO or Team Leader)
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';
import CeoDashboard from '@/components/dashboard/CeoDashboard';
import TeamLeaderDashboard from '@/components/dashboard/TeamLeaderDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setErr('Not signed in');
          router.push('/auth/signin');
          return;
        }

        const { data, error } = await supabase
          .from('sales_agents')
          .select('user_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching role:', error);
          setErr(error.message);
          setLoading(false);
          return;
        }

        if (!data?.user_type) {
          // No role selected, redirect to selection
          router.push('/select-role');
          return;
        }

        setRole(data.user_type);
        setLoading(false);
      } catch (error: any) {
        console.error('Dashboard error:', error);
        setErr(error.message);
        setLoading(false);
      }
    })();
  }, [router]);

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

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600" role="alert">Error: {err}</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      {role === 'ceo' ? <CeoDashboard /> : <TeamLeaderDashboard />}
    </div>
  );
}
