'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

type DailyRow = {
  date: string
  registrations: number
  cumulative: number
}

const toDateInputValue = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10)
}

const toUtcStartIso = (dateString: string) => new Date(`${dateString}T00:00:00.000Z`).toISOString()

const toUtcExclusiveEndIso = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString()
}

const buildDateRange = (startDate: string, endDate: string) => {
  const dates: string[] = []
  const current = new Date(`${startDate}T00:00:00.000Z`)
  const end = new Date(`${endDate}T00:00:00.000Z`)
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { theme, styles } = useTheme()

  const isAdmin = profile?.role === 'admin'

  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return toDateInputValue(date)
  })
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()))

  const [rows, setRows] = useState<DailyRow[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalInRange, setTotalInRange] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'users' | 'sessions'>('users')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (user && !isAdmin) {
      setLoading(false)
    }
  }, [user, isAdmin])

  useEffect(() => {
    if (!user || !isAdmin) return
    if (!startDate || !endDate) return
    if (startDate > endDate) {
      setError('Start date must be before end date.')
      setRows([])
      setLoading(false)
      return
    }

    const loadStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const startIso = toUtcStartIso(startDate)
        const endIso = toUtcExclusiveEndIso(endDate)

        let totalCount = 0
        let beforeCount = 0
        let createdRows: { created_at: string }[] = []

        if (viewMode === 'users') {
          const [totalProfilesRes, totalGuestsRes, beforeProfilesRes, beforeGuestsRes, rangeProfilesRes, rangeGuestsRes] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('guest_profiles').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).lt('created_at', startIso),
            supabase.from('guest_profiles').select('id', { count: 'exact', head: true }).lt('created_at', startIso),
            supabase
              .from('profiles')
              .select('created_at')
              .gte('created_at', startIso)
              .lt('created_at', endIso)
              .order('created_at', { ascending: true }),
            supabase
              .from('guest_profiles')
              .select('created_at')
              .gte('created_at', startIso)
              .lt('created_at', endIso)
              .order('created_at', { ascending: true })
          ])

          if (totalProfilesRes.error) throw totalProfilesRes.error
          if (totalGuestsRes.error) throw totalGuestsRes.error
          if (beforeProfilesRes.error) throw beforeProfilesRes.error
          if (beforeGuestsRes.error) throw beforeGuestsRes.error
          if (rangeProfilesRes.error) throw rangeProfilesRes.error
          if (rangeGuestsRes.error) throw rangeGuestsRes.error

          totalCount = (totalProfilesRes.count || 0) + (totalGuestsRes.count || 0)
          beforeCount = (beforeProfilesRes.count || 0) + (beforeGuestsRes.count || 0)
          createdRows = [...(rangeProfilesRes.data || []), ...(rangeGuestsRes.data || [])]
        } else {
          const [totalRes, beforeRes, rangeRes] = await Promise.all([
            supabase.from('session_players').select('id', { count: 'exact', head: true }),
            supabase.from('session_players').select('id', { count: 'exact', head: true }).lt('created_at', startIso),
            supabase
              .from('session_players')
              .select('created_at')
              .gte('created_at', startIso)
              .lt('created_at', endIso)
              .order('created_at', { ascending: true })
          ])

          if (totalRes.error) throw totalRes.error
          if (beforeRes.error) throw beforeRes.error
          if (rangeRes.error) throw rangeRes.error

          totalCount = totalRes.count || 0
          beforeCount = beforeRes.count || 0
          createdRows = rangeRes.data || []
        }

        const grouped = new Map<string, number>()
        createdRows.forEach((row) => {
          const dateKey = new Date(row.created_at).toISOString().slice(0, 10)
          grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1)
        })

        const dates = buildDateRange(startDate, endDate)
        let running = beforeCount
        const nextRows = dates.map((date) => {
          const registrations = grouped.get(date) || 0
          running += registrations
          return { date, registrations, cumulative: running }
        })
        const filteredRows = nextRows.filter((row) => row.registrations > 0)

        setTotalUsers(totalCount)
        setTotalInRange(createdRows.length)
        setRows(filteredRows)
      } catch (err) {
        console.error('Failed to load admin stats', err)
        setError('Failed to load admin stats. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user, isAdmin, startDate, endDate, viewMode])

  const summaryCards = useMemo(() => {
    const isUsers = viewMode === 'users'
    return [
      { label: isUsers ? 'Total Users (incl. guests)' : 'Total Session Registrations', value: totalUsers },
      { label: isUsers ? 'Registrations in Range' : 'Session Registrations in Range', value: totalInRange },
      { label: 'Active Days', value: rows.length }
    ]
  }, [totalUsers, totalInRange, rows.length, viewMode])

  const exportToExcel = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const XLSX = await import('xlsx')
      const summaryData = [
        { Metric: viewMode === 'users' ? 'Total users (incl. guests)' : 'Total session registrations', Value: totalUsers },
        { Metric: viewMode === 'users' ? 'Registrations in range' : 'Session registrations in range', Value: totalInRange },
        { Metric: 'Range start', Value: startDate },
        { Metric: 'Range end', Value: endDate }
      ]

      const dailyData = rows.map((row) => ({
        Date: row.date,
        Registrations: row.registrations,
        Cumulative: row.cumulative
      }))

      const workbook = XLSX.utils.book_new()
      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      const dailySheet = XLSX.utils.json_to_sheet(dailyData)

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
      XLSX.utils.book_append_sheet(
        workbook,
        dailySheet,
        viewMode === 'users' ? 'Daily User Registrations' : 'Daily Session Registrations'
      )

      const exportLabel = viewMode === 'users' ? 'user-registrations' : 'session-registrations'
      XLSX.writeFile(workbook, `admin-${exportLabel}-${startDate}-to-${endDate}.xlsx`)
    } catch (err) {
      console.error('Failed to export stats', err)
      setError('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (authLoading || loading) {
    return <div style={{ padding: '2rem', color: theme.colors.text.secondary }}>Loading...</div>
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <main style={styles.container}>
        <h1 style={styles.heading1}>Admin</h1>
        <p style={{ color: theme.colors.text.secondary }}>Admins only.</p>
      </main>
    )
  }

  return (
    <main style={{ ...styles.container, maxWidth: '980px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <div>
          <h1 style={{ ...styles.heading1, marginBottom: theme.spacing.sm }}>Admin Dashboard</h1>
          <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
            {viewMode === 'users' ? 'User registrations (including guests).' : 'Session signups over time.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('users')}
            style={viewMode === 'users' ? styles.buttonPrimary : styles.buttonSecondary}
          >
            User Registrations
          </button>
          <button
            onClick={() => setViewMode('sessions')}
            style={viewMode === 'sessions' ? styles.buttonPrimary : styles.buttonSecondary}
          >
            Session Registrations
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting || rows.length === 0}
            style={{
              ...styles.buttonPrimary,
              opacity: exporting || rows.length === 0 ? 0.6 : 1
            }}
          >
            {exporting ? 'Exporting...' : 'Export XLSX'}
          </button>
        </div>
      </div>

      <section style={{ ...styles.card, marginBottom: theme.spacing.lg }}>
        <div style={{ display: 'grid', gap: theme.spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {summaryCards.map((card) => (
            <div key={card.label} style={{ background: theme.colors.background.tertiary, borderRadius: theme.borderRadius, padding: theme.spacing.md, border: `1px solid ${theme.colors.border.primary}` }}>
              <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.fontSize.sm }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.text.primary }}>{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...styles.card, marginBottom: theme.spacing.lg }}>
        <div style={{ display: 'grid', gap: theme.spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'end' }}>
          <label style={styles.label}>
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={{ ...styles.input, marginTop: theme.spacing.xs }}
            />
          </label>
          <label style={styles.label}>
            End date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              style={{ ...styles.input, marginTop: theme.spacing.xs }}
            />
          </label>
        </div>
        {error && (
          <p style={{ marginTop: theme.spacing.md, color: theme.colors.danger }}>{error}</p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={{ ...styles.heading2, marginBottom: theme.spacing.md }}>
          {viewMode === 'users' ? 'Daily registrations' : 'Daily session registrations'}
        </h2>
        {rows.length === 0 ? (
          <p style={{ color: theme.colors.text.secondary, margin: 0 }}>No registrations found for this date range.</p>
        ) : (
          <div style={{ overflowX: 'auto', color: theme.colors.text.primary }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.colors.text.primary }}>
              <thead>
                <tr style={{ textAlign: 'left', color: theme.colors.text.secondary }}>
                  <th style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${theme.colors.border.primary}` }}>Date</th>
                  <th style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${theme.colors.border.primary}` }}>Registrations</th>
                  <th style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${theme.colors.border.primary}` }}>
                    {viewMode === 'users' ? 'Cumulative Users' : 'Cumulative Registrations'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date}>
                    <td style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${theme.colors.border.primary}` }}>{row.date}</td>
                    <td style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${theme.colors.border.primary}` }}>{row.registrations}</td>
                    <td style={{ padding: theme.spacing.sm, borderBottom: `1px solid ${theme.colors.border.primary}` }}>{row.cumulative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
