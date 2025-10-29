/**
 * Internal API: Audit Logging
 * POST /api/internal/audit
 * Creates immutable audit log entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema
const auditLogSchema = z.object({
  org_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  action: z.string().min(1),
  entity: z.string().optional(),
  entity_id: z.string().optional(),
  diff: z.object({
    before: z.any().optional(),
    after: z.any().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = auditLogSchema.parse(body);
    
    // Get auth header (should be from authenticated user)
    const authHeader = request.headers.get('authorization');
    
    // Create Supabase client with service role for writing audit logs
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Capture client info
    const ip_address = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       null;
    const user_agent = request.headers.get('user-agent') || null;
    
    // Insert audit log entry
    const { error } = await supabase
      .from('system_logs')
      .insert({
        org_id: validated.org_id,
        user_id: validated.user_id || null,
        action: validated.action,
        entity: validated.entity || null,
        entity_id: validated.entity_id || null,
        diff: validated.diff || null,
        metadata: validated.metadata || {},
        ip_address,
        user_agent,
      });
    
    if (error) {
      console.error('Failed to insert audit log:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to log audit entry' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Audit API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

