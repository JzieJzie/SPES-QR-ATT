import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RegisterPayload = {
  email: string
  password: string
  fullName: string
  role: 'leader' | 'co-leader'
  programBatch?: ProgramBatch
  barangayName: string
  leaderAccessCode?: string
  coLeaderAccessCode?: string
  avatarBase64?: string
  avatarMimeType?: string
  appUrl?: string
}

type ProgramBatch = 'batch1' | 'batch2'

type RoleBatchCodes = {
  batch1: string
  batch2: string
}

const MAX_ATTEMPTS_PER_IP_PER_HOUR = 8
const MAX_ATTEMPTS_PER_EMAIL_PER_DAY = 5

const hashToken = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const getAvatarExtension = (mimeType: string | undefined): string => {
  if (!mimeType) return 'jpg'
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  return 'jpg'
}

const resolveProgramBatch = (
  accessCode: string | undefined,
  expectedCodes: RoleBatchCodes,
): ProgramBatch | null => {
  const normalized = accessCode?.trim()
  if (!normalized) return null

  if (normalized === expectedCodes.batch1) return 'batch1'
  if (normalized === expectedCodes.batch2) return 'batch2'
  return null
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const smtpPassword = Deno.env.get('SMTP_APP_PASSWORD')
  const leaderSignupCode = Deno.env.get('LEADER_SIGNUP_CODE')
  const leaderSignupCodeBatch1 = Deno.env.get('LEADER_SIGNUP_CODE_BATCH1')
  const leaderSignupCodeBatch2 = Deno.env.get('LEADER_SIGNUP_CODE_BATCH2')
  const coLeaderSignupCode = Deno.env.get('CO_LEADER_SIGNUP_CODE')
  const coLeaderSignupCodeBatch1 = Deno.env.get('CO_LEADER_SIGNUP_CODE_BATCH1')
  const coLeaderSignupCodeBatch2 = Deno.env.get('CO_LEADER_SIGNUP_CODE_BATCH2')

  if (!serviceRoleKey || !supabaseUrl || !smtpPassword) {
    return new Response(
      JSON.stringify({ error: 'Server is missing required environment variables.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const payload = (await request.json()) as RegisterPayload

  if (!payload.email || !payload.password || !payload.fullName || !payload.barangayName) {
    return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (payload.role !== 'leader' && payload.role !== 'co-leader') {
    return new Response(JSON.stringify({ error: 'Invalid role selected.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (payload.programBatch !== 'batch1' && payload.programBatch !== 'batch2') {
    return new Response(JSON.stringify({ error: 'Invalid batch selected.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const leaderBatchCodes: RoleBatchCodes = {
    batch1: leaderSignupCodeBatch1?.trim() || leaderSignupCode?.trim() || 'SPES_LEADER_2026_1',
    batch2: leaderSignupCodeBatch2?.trim() || 'SPES_LEADER_2026_2',
  }

  const coLeaderBatchCodes: RoleBatchCodes = {
    batch1: coLeaderSignupCodeBatch1?.trim() || coLeaderSignupCode?.trim() || 'SPES_CO-LEADER_2026_1',
    batch2: coLeaderSignupCodeBatch2?.trim() || 'SPES_CO-LEADER_2026_2',
  }

  let requestedBatch: ProgramBatch | null = null

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const normalizedEmail = payload.email.trim().toLowerCase()
  const clientIp = (request.headers.get('x-forwarded-for') ?? 'unknown')
    .split(',')[0]
    ?.trim() || 'unknown'

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count: attemptsByIp, error: attemptsByIpError } = await supabase
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', clientIp)
    .gte('created_at', oneHourAgo)

  if (attemptsByIpError) {
    return new Response(JSON.stringify({ error: attemptsByIpError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { count: attemptsByEmail, error: attemptsByEmailError } = await supabase
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .gte('created_at', oneDayAgo)

  if (attemptsByEmailError) {
    return new Response(JSON.stringify({ error: attemptsByEmailError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { error: attemptInsertError } = await supabase.from('signup_attempts').insert({
    email: normalizedEmail,
    ip_address: clientIp,
    requested_role: payload.role,
  })

  if (attemptInsertError) {
    return new Response(JSON.stringify({ error: attemptInsertError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if ((attemptsByIp ?? 0) >= MAX_ATTEMPTS_PER_IP_PER_HOUR) {
    return new Response(JSON.stringify({ error: 'Too many registration attempts. Please try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if ((attemptsByEmail ?? 0) >= MAX_ATTEMPTS_PER_EMAIL_PER_DAY) {
    return new Response(JSON.stringify({ error: 'Too many registration attempts for this email today.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (payload.role === 'leader') {
    requestedBatch = resolveProgramBatch(payload.leaderAccessCode, leaderBatchCodes)

    if (!requestedBatch) {
      return new Response(JSON.stringify({ error: 'Invalid leader access code.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  if (payload.role === 'co-leader') {
    requestedBatch = resolveProgramBatch(payload.coLeaderAccessCode, coLeaderBatchCodes)

    if (!requestedBatch) {
      return new Response(JSON.stringify({ error: 'Invalid co-leader access code.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  if (!requestedBatch) {
    return new Response(JSON.stringify({ error: 'Unable to determine registration batch.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (requestedBatch !== payload.programBatch) {
    return new Response(JSON.stringify({
      error: `The access code does not match the selected ${payload.programBatch === 'batch2' ? 'Batch 2' : 'Batch 1'}.`,
    }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let barangayId: string | null = null
  const { data: barangay, error: barangayReadError } = await supabase
    .from('barangays')
    .select('id')
    .eq('name', payload.barangayName)
    .maybeSingle()

  if (barangayReadError) {
    return new Response(JSON.stringify({ error: barangayReadError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (barangay?.id) {
    barangayId = barangay.id as string
  } else {
    const { data: insertedBarangay, error: barangayInsertError } = await supabase
      .from('barangays')
      .insert({ name: payload.barangayName })
      .select('id')
      .single()

    if (barangayInsertError) {
      return new Response(JSON.stringify({ error: barangayInsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    barangayId = insertedBarangay.id as string
  }

  const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: payload.password,
    email_confirm: false,
    user_metadata: {
      full_name: payload.fullName,
    },
  })

  if (createUserError || !createdUser.user) {
    return new Response(JSON.stringify({ error: createUserError?.message ?? 'Unable to create account.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userId = createdUser.user.id

  let avatarUrl: string | null = null
  if (payload.avatarBase64) {
    const sanitized = payload.avatarBase64.includes(',')
      ? payload.avatarBase64.split(',').at(-1) ?? payload.avatarBase64
      : payload.avatarBase64

    const binary = Uint8Array.from(atob(sanitized), (c) => c.charCodeAt(0))
    const extension = getAvatarExtension(payload.avatarMimeType)
    const path = `${userId}/avatar-${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(path, binary, {
        contentType: payload.avatarMimeType ?? 'image/jpeg',
        upsert: true,
      })

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-pictures').getPublicUrl(path)
      avatarUrl = publicUrl
    }
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      full_name: payload.fullName,
      role: payload.role,
      program_batch: requestedBatch,
      barangay_id: barangayId,
      avatar_url: avatarUrl,
      email_verified: false,
    })
    .eq('id', userId)

  if (profileUpdateError) {
    return new Response(JSON.stringify({ error: profileUpdateError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
  const tokenHash = await hashToken(token)

  await supabase
    .from('email_verification_tokens')
    .delete()
    .eq('user_id', userId)
    .is('used_at', null)

  const { error: tokenError } = await supabase.from('email_verification_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })

  if (tokenError) {
    return new Response(JSON.stringify({ error: tokenError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const appUrl = payload.appUrl ?? Deno.env.get('APP_URL') ?? 'http://localhost:5173'
  const verificationUrl = `${appUrl}/verify-account?token=${encodeURIComponent(token)}`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'spesatt@gmail.com',
      pass: smtpPassword,
    },
  })

  await transporter.sendMail({
    from: 'SPES QR Attendance <spesatt@gmail.com>',
    to: payload.email,
    subject: 'Verify your SPES QR Attendance account',
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Welcome to SPES QR Attendance</h2>
        <p style="margin: 0 0 12px;">Hello ${payload.fullName},</p>
        <p style="margin: 0 0 12px;">Please verify your account by clicking the button below.</p>
        <p style="margin: 20px 0;">
          <a href="${verificationUrl}" style="background: #111; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 4px; display: inline-block;">Verify Account</a>
        </p>
        <p style="margin: 0 0 6px; font-size: 13px;">This link expires in 24 hours.</p>
      </div>
    `,
  })

  return new Response(JSON.stringify({ message: 'Account created. Verification email sent.' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
