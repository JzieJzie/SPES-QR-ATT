import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Missing authorization header', { status: 401 })
  }

  const { beneficiaryId, deviceInfo } = await request.json()

  if (!beneficiaryId || typeof beneficiaryId !== 'string') {
    return new Response('beneficiaryId is required', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    },
  )

  const { data, error } = await supabase.rpc('record_attendance_scan', {
    p_beneficiary_id: beneficiaryId,
    p_device_info: deviceInfo ?? null,
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data?.[0] ?? null), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
