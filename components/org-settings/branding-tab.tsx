/**
 * Branding Settings Tab
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, CheckCircle2, Upload, Palette as PaletteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";
import { auditLog } from "@/lib/audit-logger";
import { useAuth } from "@/lib/zustand/store";
import type { Organization } from "@/lib/types";

interface BrandingTabProps {
  org: Organization;
  onUpdate: (org: Organization) => void;
}

export function BrandingTab({ org, onUpdate }: BrandingTabProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    primaryColor: org.branding?.primaryColor || '#257CFF',
    secondaryColor: org.branding?.secondaryColor || '#F45A2A',
    logoUrl: org.branding?.logoUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${org.id}/logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('org-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('org-logos')
        .getPublicUrl(fileName);
      
      setFormData({ ...formData, logoUrl: publicUrl });
      
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    setShowSuccess(false);
    
    try {
      const newBranding = {
        logoUrl: formData.logoUrl,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
      };
      
      const { data, error } = await supabase
        .from('organizations')
        .update({
          branding: newBranding,
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
        action: 'ORG_BRANDING_UPDATED',
        entity: 'organizations',
        entity_id: org.id,
        diff: {
          before: org.branding,
          after: newBranding,
        },
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update branding:', error);
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
          <CardTitle>Brand Customization</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize your organization's visual identity
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Organization Logo</Label>
              <div className="flex items-center gap-4">
                {formData.logoUrl && (
                  <div className="w-24 h-24 rounded-lg border-2 overflow-hidden">
                    <img
                      src={formData.logoUrl}
                      alt="Organization logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="logo">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('logo')?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 2MB. Recommended: 512x512px
                  </p>
                </div>
              </div>
            </div>
            
            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-20 h-12 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#257CFF"
                    className="flex-1"
                  />
                </div>
                <div
                  className="h-12 rounded-lg"
                  style={{ backgroundColor: formData.primaryColor }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-20 h-12 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#F45A2A"
                    className="flex-1"
                  />
                </div>
                <div
                  className="h-12 rounded-lg"
                  style={{ backgroundColor: formData.secondaryColor }}
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="space-y-2">
              <Label>Gradient Preview</Label>
              <div
                className="h-24 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                style={{
                  background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})`,
                }}
              >
                {org.name}
              </div>
            </div>
            
            {/* Info */}
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="text-muted-foreground">
                💡 These colors will be applied throughout the platform for this organization
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
                    Branding updated successfully!
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end">
              <Button
                type="submit"
                className="gradient-bg"
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Branding
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

