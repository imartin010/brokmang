/**
 * General Settings Tab
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";
import { auditLog } from "@/lib/audit-logger";
import { useAuth } from "@/lib/zustand/store";
import type { Organization } from "@/lib/types";

interface GeneralTabProps {
  org: Organization;
  onUpdate: (org: Organization) => void;
}

export function GeneralTab({ org, onUpdate }: GeneralTabProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: org.name,
    slug: org.slug,
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.slug || formData.slug.length < 2) {
      newErrors.slug = "Slug must be at least 2 characters";
    }
    
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setShowSuccess(false);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          slug: formData.slug,
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
        diff: {
          before: { name: org.name, slug: org.slug },
          after: { name: formData.name, slug: formData.slug },
        },
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update organization:', error);
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
          <CardTitle>General Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your organization's basic information
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({});
                }}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  brokmang.com/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    setErrors({});
                  }}
                  className={errors.slug ? "border-red-500" : ""}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This is your organization's unique identifier in the URL
              </p>
            </div>
            
            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Organization ID
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
                {org.id}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Created: {new Date(org.created_at).toLocaleDateString()}
              </p>
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
                    Changes saved successfully!
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-3">
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

