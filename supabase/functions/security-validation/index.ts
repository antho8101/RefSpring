// Enhanced Security Validation Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

interface SecurityValidationRequest {
  action: 'validate_input' | 'check_permissions' | 'log_security_event' | 'check_rate_limit'
  data?: any
  userId?: string
  resourceId?: string
  resourceType?: string
  eventType?: string
  eventData?: any
  clientInfo?: {
    ip: string
    userAgent: string
    timestamp: number
  }
}

interface RateLimitEntry {
  count: number
  windowStart: number
}

// In-memory rate limiting (consider using Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

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

    const requestData = await req.json() as SecurityValidationRequest
    const { action, data, userId, resourceId, resourceType, eventType, eventData, clientInfo } = requestData

    console.log(`🔐 SECURITY VALIDATION: Processing ${action}`)

    switch (action) {
      case 'validate_input':
        return await handleInputValidation(data)

      case 'check_permissions':
        return await handlePermissionCheck(supabase, userId!, resourceId!, resourceType!)

      case 'log_security_event':
        return await handleSecurityEventLogging(supabase, eventType!, eventData, clientInfo)

      case 'check_rate_limit':
        return await handleRateLimitCheck(clientInfo!)

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        )
    }

  } catch (error) {
    console.error('❌ SECURITY VALIDATION ERROR:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Security validation error',
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function handleInputValidation(data: any) {
  try {
    const validationErrors: string[] = []

    // Comprehensive input validation
    if (typeof data === 'object' && data !== null) {
      // Check for XSS patterns
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /<object\b/gi,
        /<embed\b/gi
      ]

      const checkForXSS = (obj: any, path: string = ''): void => {
        if (typeof obj === 'string') {
          xssPatterns.forEach(pattern => {
            if (pattern.test(obj)) {
              validationErrors.push(`XSS pattern detected in ${path || 'input'}`)
            }
          })

          // Check for excessively long strings (DoS protection)
          if (obj.length > 50000) {
            validationErrors.push(`Input too long in ${path || 'input'} (${obj.length} characters)`)
          }
        } else if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            checkForXSS(obj[key], path ? `${path}.${key}` : key)
          })
        }
      }

      checkForXSS(data)

      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|OR|AND)\b)/gi,
        /('|\"|;|--|\*|\+|%)/g,
        /((\bor\b|\band\b).*=.*)/gi
      ]

      const dataString = JSON.stringify(data)
      sqlPatterns.forEach(pattern => {
        if (pattern.test(dataString)) {
          validationErrors.push('Potential SQL injection pattern detected')
        }
      })

      // Validate specific data types
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        validationErrors.push('Invalid email format')
      }

      if (data.url && !/^https?:\/\/.+/.test(data.url)) {
        validationErrors.push('Invalid URL format')
      }

      if (data.amount && (isNaN(data.amount) || data.amount < 0 || data.amount > 1000000)) {
        validationErrors.push('Invalid amount value')
      }
    }

    const isValid = validationErrors.length === 0

    if (!isValid) {
      console.log('🚨 INPUT VALIDATION FAILED:', validationErrors)
    }

    return new Response(
      JSON.stringify({
        isValid,
        errors: validationErrors,
        sanitizedData: isValid ? sanitizeData(data) : null
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Input validation error:', error)
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        errors: ['Validation processing error'] 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
}

async function handlePermissionCheck(supabase: any, userId: string, resourceId: string, resourceType: string) {
  try {
    let hasPermission = false
    let details: any = {}

    switch (resourceType) {
      case 'campaign':
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('user_id')
          .eq('id', resourceId)
          .single()

        hasPermission = campaign?.user_id === userId
        details = { campaignOwner: campaign?.user_id, requestingUser: userId }
        break

      case 'affiliate':
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('user_id, campaign_id, campaigns(user_id)')
          .eq('id', resourceId)
          .single()

        hasPermission = affiliate?.user_id === userId || affiliate?.campaigns?.user_id === userId
        details = { 
          affiliateUser: affiliate?.user_id, 
          campaignOwner: affiliate?.campaigns?.user_id,
          requestingUser: userId 
        }
        break

      case 'billing_record':
        const { data: billingRecord } = await supabase
          .from('billing_records')
          .select('user_id')
          .eq('id', resourceId)
          .single()

        hasPermission = billingRecord?.user_id === userId
        details = { recordOwner: billingRecord?.user_id, requestingUser: userId }
        break

      default:
        throw new Error(`Unknown resource type: ${resourceType}`)
    }

    // Log permission check
    if (!hasPermission) {
      await supabase.rpc('log_security_event', {
        event_type: 'unauthorized_access_attempt',
        user_id: userId,
        details: {
          resourceType,
          resourceId,
          ...details,
          timestamp: new Date().toISOString()
        }
      })
    }

    return new Response(
      JSON.stringify({
        hasPermission,
        resourceType,
        resourceId,
        userId,
        details
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Permission check error:', error)
    return new Response(
      JSON.stringify({ 
        hasPermission: false, 
        error: 'Permission check failed' 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
}

async function handleSecurityEventLogging(supabase: any, eventType: string, eventData: any, clientInfo: any) {
  try {
    // Enhanced security event logging
    const securityEvent = {
      event_type: eventType,
      event_data: {
        ...eventData,
        client_ip: clientInfo?.ip,
        user_agent: clientInfo?.userAgent,
        timestamp: clientInfo?.timestamp || new Date().toISOString(),
        severity: getSeverityLevel(eventType)
      }
    }

    // Store in database for audit trail
    await supabase.rpc('log_security_event', {
      event_type: securityEvent.event_type,
      details: securityEvent.event_data
    })

    // Critical events get immediate attention
    if (securityEvent.event_data.severity === 'critical') {
      console.error('🚨 CRITICAL SECURITY EVENT:', securityEvent)
      
      // Could send alerts here (email, Slack, etc.)
      // await sendSecurityAlert(securityEvent)
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventLogged: true,
        severity: securityEvent.event_data.severity
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Security event logging error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to log security event' 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
}

async function handleRateLimitCheck(clientInfo: { ip: string; userAgent: string; timestamp: number }) {
  try {
    const key = clientInfo.ip || 'unknown'
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 100

    let entry = rateLimitStore.get(key)

    if (!entry || (now - entry.windowStart) > windowMs) {
      // New window
      entry = { count: 1, windowStart: now }
      rateLimitStore.set(key, entry)
      
      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: maxRequests - 1,
          resetTime: now + windowMs
        }),
        { headers: corsHeaders }
      )
    }

    entry.count++

    if (entry.count > maxRequests) {
      // Rate limit exceeded
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          resetTime: entry.windowStart + windowMs,
          error: 'Rate limit exceeded'
        }),
        { status: 429, headers: corsHeaders }
      )
    }

    rateLimitStore.set(key, entry)

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: maxRequests - entry.count,
        resetTime: entry.windowStart + windowMs
      }),
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Rate limit check error:', error)
    // Allow request on error (fail open)
    return new Response(
      JSON.stringify({ 
        allowed: true, 
        error: 'Rate limit check failed' 
      }),
      { headers: corsHeaders }
    )
  }
}

function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .substring(0, 10000) // Prevent excessively long inputs
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item))
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    Object.keys(data).forEach(key => {
      const sanitizedKey = sanitizeData(key)
      sanitized[sanitizedKey] = sanitizeData(data[key])
    })
    return sanitized
  }

  return data
}

function getSeverityLevel(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'unauthorized_access_attempt': 'high',
    'xss_attempt': 'critical',
    'sql_injection_attempt': 'critical',
    'rate_limit_exceeded': 'medium',
    'invalid_input': 'low',
    'suspicious_activity': 'medium',
    'data_breach_attempt': 'critical',
    'privilege_escalation': 'critical'
  }

  return severityMap[eventType] || 'low'
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000

  rateLimitStore.forEach((entry, key) => {
    if ((now - entry.windowStart) > windowMs) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000) // Cleanup every 5 minutes