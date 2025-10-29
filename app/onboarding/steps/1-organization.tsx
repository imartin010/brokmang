/**
 * Onboarding Step 1: Organization Setup
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/zustand/store";

interface OrganizationStepProps {
  onNext: () => void;
}

export function OrganizationStep({ onNext }: OrganizationStepProps) {
  const { data, updateData } = useOnboarding();
  
  const [formData, setFormData] = useState({
    name: data.organization?.name || "",
    slug: data.organization?.slug || "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      name,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50),
    }));
    setErrors({});
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Organization name must be at least 2 characters";
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
    
    setLoading(true);
    
    try {
      // Save to onboarding state
      updateData({
        organization: {
          name: formData.name,
          slug: formData.slug,
        },
      });
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error('Failed to save organization:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create Your Organization</CardTitle>
              <p className="text-muted-foreground mt-1">
                Let's start by setting up your company profile
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Organization Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Acme Real Estate"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your company or brokerage name
              </p>
            </div>
            
            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-base">
                URL Slug *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">brokmang.com/</span>
                <Input
                  id="slug"
                  type="text"
                  placeholder="acme-real-estate"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className={errors.slug ? "border-red-500" : ""}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Unique identifier for your organization (auto-generated from name)
              </p>
            </div>
            
            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Set up your office branches</li>
                <li>• Create sales teams</li>
                <li>• Add your agents</li>
                <li>• Configure KPI targets</li>
                <li>• Set financial parameters</li>
              </ul>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                className="gradient-bg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
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

