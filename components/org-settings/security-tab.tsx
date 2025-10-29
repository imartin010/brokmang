/**
 * Security Settings Tab
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Save, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";
import { auditLog } from "@/lib/audit-logger";
import { useAuth } from "@/lib/zustand/store";
import type { Organization } from "@/lib/types";

interface SecurityTabProps {
  org: Organization;
  onUpdate: (org: Organization) => void;
}

export function SecurityTab({ org, onUpdate }: SecurityTabProps) {
  const { user } = useAuth();
  const [twoFAEnabled, setTwoFAEnabled] = useState(org.settings?.twoFA || false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    setShowSuccess(false);
    
    try {
      const newSettings = {
        ...org.settings,
        twoFA: twoFAEnabled,
      };
      
      const { data, error } = await supabase
        .from('organizations')
        .update({
          settings: newSettings,
        })
        .eq('id', org.id)
        .select()
        .single();
      
      if (error) throw error;
      
      onUpdate(data);
      
      // Log audit entry
      await auditLog({
        org_id: org.id,
        user_id: user?.id,
        action: 'ORG_UPDATED',
        entity: 'organizations',
        entity_id: org.id,
        metadata: {
          setting: '2FA',
          enabled: twoFAEnabled,
        },
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update security settings:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage security features for your organization
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Two-Factor Authentication (2FA)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Require all organization members to use 2FA for enhanced security.
                    Email OTP will be sent on each login.
                  </p>
                  
                  {/* Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={twoFAEnabled}
                        onChange={(e) => setTwoFAEnabled(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-14 h-8 rounded-full transition-colors ${
                        twoFAEnabled 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          twoFAEnabled ? 'translate-x-6' : ''
                        }`} />
                      </div>
                    </div>
                    <span className="font-medium">
                      {twoFAEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Warning */}
            {twoFAEnabled && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Important Note
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Enabling 2FA will require all members to verify their email on next login.
                      Make sure all members have access to their email accounts.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional Security Info */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Active Security Features
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✅ Row-level security (RLS) active</li>
                <li>✅ Role-based access control (RBAC)</li>
                <li>✅ Session-based authentication</li>
                <li>✅ Encrypted data at rest</li>
                <li>✅ Audit logging enabled</li>
                <li>{twoFAEnabled ? '✅' : '⏸️'} Two-factor authentication</li>
              </ul>
            </div>
            
            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    Security settings updated successfully!
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="gradient-bg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

