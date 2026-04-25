import { type Metadata } from 'next'
import { prisma } from '@crib/db'
import { formatDate } from '@crib/lib'
import { StatusSelect } from '@/components/StatusSelect'
import { updateUserRole, createUser } from './actions'

export const metadata: Metadata = { title: 'Users' }
export const dynamic = 'force-dynamic'

const ROLES = ['USER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { created_at: 'desc' } })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-text-high mb-1">Users</h1>
          <p className="text-text-low text-sm">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Add user form */}
      <form action={createUser} className="flex items-end gap-3 p-5 bg-surface-dark rounded-2xl border border-gold-border/20">
        <div className="space-y-1.5 flex-1">
          <label htmlFor="email" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Email</label>
          <input id="email" name="email" type="email" placeholder="newuser@example.com" required
            className="w-full bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-high placeholder:text-text-low focus:outline-none focus:border-primary/40 transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-xs text-text-low uppercase tracking-[0.1em] font-medium">Role</label>
          <select id="role" name="role" defaultValue="EDITOR"
            className="bg-background-dark border border-gold-border/20 rounded-xl px-4 py-2.5 text-sm text-text-medium focus:outline-none focus:border-primary/40 transition-colors">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          Add User
        </button>
      </form>

      {users.length === 0 ? (
        <div className="bg-surface-dark rounded-2xl p-12 text-center border border-gold-border/20">
          <p className="text-text-low text-sm">No users yet.</p>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-2xl border border-gold-border/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-border/20">
                {['Email', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-text-low text-xs uppercase tracking-[0.1em] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-text-high">{user.email}</td>
                  <td className="px-4 py-3">
                    <form action={updateUserRole}>
                      <input type="hidden" name="id" value={user.id} />
                      <StatusSelect name="role" defaultValue={user.role} options={ROLES} />
                    </form>
                  </td>
                  <td className="px-4 py-3 text-text-low text-xs">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
