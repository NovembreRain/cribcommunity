'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'
  const secret = process.env.ADMIN_SECRET

  if (!secret || password !== secret) {
    redirect('/login?error=invalid')
  }

  const cookieStore = await cookies()
  cookieStore.set('crib_admin_session', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  redirect(next)
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('crib_admin_session')
  redirect('/login')
}
