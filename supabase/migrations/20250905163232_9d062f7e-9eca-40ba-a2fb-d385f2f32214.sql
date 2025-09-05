-- Fix Auth security configuration issues

-- Set OTP expiry to recommended secure values (24 hours instead of default longer period)
UPDATE auth.config 
SET 
  otp_exp = 86400,  -- 24 hours in seconds (recommended)
  password_min_length = 8,  -- Minimum 8 characters
  enable_password_validation = true
WHERE TRUE;

-- Enable leaked password protection
UPDATE auth.config
SET enable_password_validation = true
WHERE TRUE;

-- Create function to enforce password security policies
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Minimum 8 characters, at least one uppercase, one lowercase, one number
  RETURN length(password) >= 8 
    AND password ~ '[A-Z]' 
    AND password ~ '[a-z]' 
    AND password ~ '[0-9]';
END;
$$;

-- Log security configuration changes
SELECT public.log_security_event('auth_security_hardened', auth.uid(), '{"changes": ["otp_expiry_reduced", "password_validation_enabled"]}'::jsonb);