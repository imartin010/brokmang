/**
 * Select Role Page
 * User chooses CEO or Team Leader (after signup)
 * Uses Server Action with proper validation
 */

'use client';

import { useState, useTransition } from 'react';
import { setUserRole } from './actions';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SelectRolePage() {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ceo' | 'team_leader' | null>(null);
  const router = useRouter();

  function submitRole(role: 'ceo' | 'team_leader') {
    const fd = new FormData();
    fd.set('user_type', role);
    setSelectedRole(role);
    setErr(null);
    
    startTransition(async () => {
      const res = await setUserRole(fd);
      if (!res.ok) {
        setErr(res.error ?? 'Failed to save role');
        setSelectedRole(null);
      } else {
        router.replace('/dashboard');
      }
    });
  }

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
            Select Your Role
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the role that best describes your position
          </p>
        </div>

        {/* Error Message */}
        {err && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-center"
            role="alert"
          >
            {err}
          </motion.div>
        )}

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
                pending ? "opacity-50 pointer-events-none" : "hover:scale-105 hover:border-primary/50",
                selectedRole === 'ceo' && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => !pending && submitRole('ceo')}
              role="button"
              tabIndex={0}
              aria-busy={pending && selectedRole === 'ceo'}
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
                <div className="pt-4">
                  {pending && selectedRole === 'ceo' ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Saving...</span>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-primary font-medium">
                      Click to select
                    </div>
                  )}
                </div>
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
                pending ? "opacity-50 pointer-events-none" : "hover:scale-105 hover:border-primary/50",
                selectedRole === 'team_leader' && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => !pending && submitRole('team_leader')}
              role="button"
              tabIndex={0}
              aria-busy={pending && selectedRole === 'team_leader'}
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
                <div className="pt-4">
                  {pending && selectedRole === 'team_leader' ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Saving...</span>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-primary font-medium">
                      Click to select
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            {pending ? 'Saving your selection...' : 'Choose one to continue'}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
