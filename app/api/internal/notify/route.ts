/**
 * Internal API: Create Notifications
 * POST /api/internal/notify
 * Creates notifications for users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema
const notificationSchema = z.object({
  org_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  type: z.enum(['MISSED_LOG', 'KPI_ALERT', 'TAX_REMINDER', 'SYSTEM', 'BREAK_EVEN_WARNING']),
  title: z.string().min(1),
  message: z.string().min(1),
  payload: z.record(z.any()).optional(),
  action_url: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = notificationSchema.parse(body);
    
    // Create Supabase client with service role
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
    
    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        org_id: validated.org_id,
        user_id: validated.user_id || null,
        type: validated.type,
        title: validated.title,
        message: validated.message,
        payload: validated.payload || {},
        action_url: validated.action_url || null,
        is_read: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create notification:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Notify API error:', error);
    
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

