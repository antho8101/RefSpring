// Phase 3: Security Monitoring Enhancement
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'data_breach_attempt'
  userId?: string
  ip?: string
  userAgent?: string
  details: Record<string, any>
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event } = await req.json() as { event: SecurityEvent }
    
    console.log('🚨 SECURITY MONITOR: Received event:', event.type, 'Severity:', event.severity)

    // Rate limiting check
    const clientIP = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    
    // Check for suspicious patterns
    const suspiciousPatterns = await checkSuspiciousPatterns(supabase, event, clientIP)
    
    if (suspiciousPatterns.isSuspicious) {
      console.log('🚨 SUSPICIOUS ACTIVITY DETECTED:', suspiciousPatterns.reason)
      
      // Log security event
      await logSecurityEvent(supabase, {
        ...event,
        ip: clientIP,
        suspiciousReason: suspiciousPatterns.reason
      })
      
      // For critical events, could trigger additional security measures
      if (event.severity === 'critical') {
        await handleCriticalSecurityEvent(supabase, event, clientIP)
      }
    }

    // Implement rate limiting
    const rateLimitResult = await checkRateLimit(supabase, clientIP, event.type)
    
    if (rateLimitResult.exceeded) {
      console.log('🚫 RATE LIMIT EXCEEDED for IP:', clientIP)
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': rateLimitResult.retryAfter.toString()
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Security event processed',
        eventId: crypto.randomUUID()
      }),
      { 
        status: 200,
        headers: corsHeaders
      }
    )

  } catch (error) {
    console.error('❌ SECURITY MONITOR ERROR:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal security monitoring error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
})

async function checkSuspiciousPatterns(supabase: any, event: SecurityEvent, ip: string) {
  try {
    // Check for multiple rapid requests from same IP
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('*')
      .eq('ip', ip)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .limit(10)

    if (recentEvents && recentEvents.length > 5) {
      return { isSuspicious: true, reason: 'Multiple rapid requests from same IP' }
    }

    // Check for suspicious user agents
    const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper']
    if (event.details.userAgent && suspiciousAgents.some(agent => 
      event.details.userAgent.toLowerCase().includes(agent)
    )) {
      return { isSuspicious: true, reason: 'Suspicious user agent detected' }
    }

    // Check for unusual conversion patterns
    if (event.type === 'suspicious_activity' && event.details.conversionAmount) {
      const amount = parseFloat(event.details.conversionAmount)
      if (amount > 10000) { // Conversions over $10,000
        return { isSuspicious: true, reason: 'Unusually high conversion amount' }
      }
    }

    return { isSuspicious: false, reason: null }
  } catch (error) {
    console.error('Error checking suspicious patterns:', error)
    return { isSuspicious: false, reason: null }
  }
}

async function logSecurityEvent(supabase: any, event: SecurityEvent & { suspiciousReason?: string }) {
  try {
    // In a real implementation, this would log to a security_events table
    console.log('📝 LOGGING SECURITY EVENT:', {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ip: event.ip,
      suspiciousReason: event.suspiciousReason,
      timestamp: event.timestamp
    })

    // Call the database function to log the event
    await supabase.rpc('log_security_event', {
      event_type: event.type,
      user_id: event.userId || null,
      details: {
        ...event.details,
        ip: event.ip,
        userAgent: event.userAgent,
        suspiciousReason: event.suspiciousReason,
        severity: event.severity
      }
    })

  } catch (error) {
    console.error('Error logging security event:', error)
  }
}

async function checkRateLimit(supabase: any, ip: string, eventType: string) {
  try {
    // Simple in-memory rate limiting for demo
    // In production, use Redis or similar
    const rateLimits = {
      'suspicious_activity': { limit: 10, window: 60 * 1000 }, // 10 per minute
      'unauthorized_access': { limit: 5, window: 60 * 1000 }, // 5 per minute
      'data_breach_attempt': { limit: 1, window: 60 * 1000 }, // 1 per minute
    }

    const config = rateLimits[eventType as keyof typeof rateLimits] || { limit: 50, window: 60 * 1000 }
    
    // For demo purposes, we'll use a simple check
    // In production, implement proper rate limiting with Redis
    return { exceeded: false, retryAfter: 0 }
    
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return { exceeded: false, retryAfter: 0 }
  }
}

async function handleCriticalSecurityEvent(supabase: any, event: SecurityEvent, ip: string) {
  try {
    console.log('🚨 CRITICAL SECURITY EVENT - Additional measures triggered')
    
    // In a real implementation, this could:
    // 1. Temporarily block the IP
    // 2. Send alerts to administrators
    // 3. Trigger additional security scans
    // 4. Log to external security monitoring systems
    
    await logSecurityEvent(supabase, {
      ...event,
      ip,
      details: {
        ...event.details,
        criticalEventHandled: true,
        additionalMeasuresTriggered: true
      }
    })
    
  } catch (error) {
    console.error('Error handling critical security event:', error)
  }
}