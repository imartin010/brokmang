/**
 * Select Role Page (After Signup)
 * User chooses CEO or Team Leader
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-browser';
import { cn } from '@/lib/utils';

type UserType = 'ceo' | 'team_leader';

export default function SelectRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);

  const handleSelect = async (type: UserType) => {
    setLoading(true);
    setSelectedRole(type);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated. Please sign in first.');
      }

      console.log('Saving user type:', type, 'for user:', user.id);

      // Insert or update user type
      const { data, error } = await supabase
        .from('sales_agents')
        .upsert({
          user_id: user.id,
          user_type: type,
          full_name: user.email?.split('@')[0] || 'User',
          is_active: true,
        }, {
          onConflict: 'user_id',
          returning: 'minimal'
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to save role');
      }

      console.log('Role saved successfully');

      // Success - redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 500);

    } catch (error: any) {
      console.error('Error selecting role:', error);
      alert(`Error: ${error.message || 'Could not save role. Please try again.'}`);
      setLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
            Choose Your Role
          </h1>
          <p className="text-muted-foreground text-lg">
            Select the role that best describes your position
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CEO Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className={cn(
                "glass cursor-pointer hover:shadow-xl transition-all h-full border-2",
                loading ? "opacity-50 pointer-events-none" : "hover:scale-105 hover:border-primary/50",
                selectedRole === 'ceo' && "border-primary"
              )}
              onClick={() => !loading && handleSelect('ceo')}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-4 rounded-full transition-colors",
                    selectedRole === 'ceo' ? "bg-primary/20" : "bg-primary/10"
                  )}>
                    <Briefcase className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">CEO</CardTitle>
                <CardDescription className="text-center text-base">
                  Chief Executive Officer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4 font-medium">
                  Full access to all features
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Financial analysis and break-even tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Team management and performance tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Reports, insights, and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Organization settings and configuration</span>
                  </li>
                </ul>
                <Button 
                  type="button"
                  disabled={loading} 
                  className="w-full gradient-bg mt-4"
                  size="lg"
                  onClick={() => handleSelect('ceo')}
                >
                  {loading && selectedRole === 'ceo' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Select CEO'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Leader Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className={cn(
                "glass cursor-pointer hover:shadow-xl transition-all h-full border-2",
                loading ? "opacity-50 pointer-events-none" : "hover:scale-105 hover:border-primary/50",
                selectedRole === 'team_leader' && "border-primary"
              )}
              onClick={() => !loading && handleSelect('team_leader')}
            >
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-4 rounded-full transition-colors",
                    selectedRole === 'team_leader' ? "bg-primary/20" : "bg-primary/10"
                  )}>
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Team Leader</CardTitle>
                <CardDescription className="text-center text-base">
                  Sales Team Manager
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4 font-medium">
                  Team management focused
                </p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Team member management and tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Daily logs and activity recording</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Team performance reports and insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>KPI monitoring and goal tracking</span>
                  </li>
                </ul>
                <Button 
                  type="button"
                  disabled={loading} 
                  className="w-full gradient-bg mt-4"
                  size="lg"
                  onClick={() => handleSelect('team_leader')}
                >
                  {loading && selectedRole === 'team_leader' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Select Team Leader'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

