import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  ShieldCheck,
  Wallet,
  Boxes,
  Megaphone,
  LogOut,
  Search,
  Check,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  Menu,
  AlertTriangle,
  MessageSquareText,
  Sparkles,
  Send,
} from 'lucide-react'
import Toast from './Toast.jsx'

// ---- Mock data -------------------------------------------------------

const MOCK_BOOKINGS = [
  { id: 1, name: 'Ananya Sharma', style: 'Fine Line', date: '2026-08-18', time: '2:00 PM', deposit: 2000, status: 'pending' },
  { id: 2, name: 'Rohit Verma', style: 'Blackwork', date: '2026-08-19', time: '11:00 AM', deposit: 2000, status: 'approved' },
  { id: 3, name: 'Priya Nair', style: 'Realism', date: '2026-08-19', time: '4:30 PM', deposit: 2000, status: 'approved' },
  { id: 4, name: 'Karan Malhotra', style: 'Geometric', date: '2026-08-20', time: '1:00 PM', deposit: 2000, status: 'pending' },
  { id: 5, name: 'Sneha Reddy', style: 'Japanese', date: '2026-08-21', time: '3:00 PM', deposit: 2000, status: 'approved' },
  { id: 6, name: 'Aditya Kumar', style: 'Minimalist', date: '2026-08-22', time: '10:30 AM', deposit: 2000, status: 'rejected' },
  { id: 7, name: 'Ishaan Gupta', style: 'Traditional', date: '2026-08-23', time: '5:00 PM', deposit: 2000, status: 'pending' },
]

const MOCK_WAIVERS = [
  { id: 1, name: 'Ananya Sharma', signedAt: '2026-08-14 09:12 AM', status: 'complete' },
  { id: 2, name: 'Rohit Verma', signedAt: '2026-08-13 06:40 PM', status: 'complete' },
  { id: 3, name: 'Priya Nair', signedAt: '2026-08-13 02:05 PM', status: 'complete' },
  { id: 4, name: 'Sneha Reddy', signedAt: '2026-08-12 11:20 AM', status: 'complete' },
  { id: 5, name: 'Karan Malhotra', signedAt: '2026-08-11 07:55 PM', status: 'complete' },
]

const MOCK_EXPENSES = [
  { id: 1, label: 'Needle cartridges (bulk)', category: 'Needles', amount: 3200, date: '2026-08-10' },
  { id: 2, label: 'Premium ink set — 12 colors', category: 'Ink', amount: 4500, date: '2026-08-06' },
  { id: 3, label: 'Studio rent — August', category: 'Rent', amount: 12000, date: '2026-08-01' },
  { id: 4, label: 'Disposable grips & gloves', category: 'Supplies', amount: 1100, date: '2026-07-28' },
  { id: 5, label: 'Aftercare products restock', category: 'Supplies', amount: 900, date: '2026-07-22' },
]

const MONTHLY_REVENUE = [
  { month: 'Mar', value: 58000 },
  { month: 'Apr', value: 61000 },
  { month: 'May', value: 67000 },
  { month: 'Jun', value: 72000 },
  { month: 'Jul', value: 79000 },
  { month: 'Aug', value: 85000 },
]

const TOTAL_REVENUE = 85000
const TOTAL_EXPENSES = 12000
const NET_PROFIT = TOTAL_REVENUE - TOTAL_EXPENSES

const MOCK_ARTISTS = [
  { id: 1, name: 'Avinish Deka', role: 'Lead Artist', split: 60, revenue: 52000 },
  { id: 2, name: 'Junior Artist — Rimi', role: 'Junior Artist', split: 40, revenue: 21000 },
  { id: 3, name: 'Junior Artist — Deep', role: 'Junior Artist', split: 40, revenue: 12000 },
]

const MOCK_INVENTORY = [
  { id: 1, item: 'Numbing Cream', unit: 'tubes', stock: 3, threshold: 8, burnRate: '2/week' },
  { id: 2, item: 'Stencil Paper', unit: 'sheets', stock: 14, threshold: 20, burnRate: '6/week' },
  { id: 3, item: 'Needles — Liner (RL)', unit: 'packs', stock: 22, threshold: 15, burnRate: '5/week' },
  { id: 4, item: 'Needles — Shader (RS)', unit: 'packs', stock: 6, threshold: 15, burnRate: '4/week' },
  { id: 5, item: 'Black Ink — 1oz', unit: 'bottles', stock: 9, threshold: 6, burnRate: '3/week' },
  { id: 6, item: 'Disposable Grips', unit: 'units', stock: 40, threshold: 25, burnRate: '10/week' },
]

const MOCK_HEALED_QUEUE = [
  { id: 1, name: 'Meera Iyer', style: 'Fine Line', sessionDate: '2026-08-01', smsSent: false },
  { id: 2, name: 'Arjun Rao', style: 'Blackwork', sessionDate: '2026-08-01', smsSent: false },
  { id: 3, name: 'Divya Menon', style: 'Realism', sessionDate: '2026-07-31', smsSent: true },
]

const MOCK_TOUCHUP_QUEUE = [
  { id: 1, name: 'Vikram Singh', style: 'Traditional', sessionDate: '2026-02-14', tag: '6-month' },
  { id: 2, name: 'Neha Kapoor', style: 'Geometric', sessionDate: '2026-02-10', tag: '6-month' },
  { id: 3, name: 'Farhan Ali', style: 'Japanese', sessionDate: '2026-02-08', tag: '6-month' },
  { id: 4, name: 'Ritika Bose', style: 'Portrait', sessionDate: '2026-02-05', tag: '6-month' },
]

// ---- Shared sub-components ----------------------------------------------

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-500/10 text-green-400 border-green-500/30',
    pending: 'bg-gold/10 text-gold border-gold/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  }
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full border tracking-wide uppercase ${map[status]}`}>
      {status}
    </span>
  )
}

// ---- Tab 1: Bookings ------------------------------------------------

function BookingsTab() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [query, setQuery] = useState('')

  const updateStatus = (id, status) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const filtered = bookings.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.style.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl mb-1">Bookings</h2>
          <p className="text-white/40 text-sm">{bookings.length} total consultations</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search client or style..."
            className="bg-black/40 border border-ink-line rounded-md pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors w-64"
          />
        </div>
      </div>

      <div className="border border-ink-line rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left text-white/40 text-xs uppercase tracking-wide">
                <th className="px-5 py-3.5 font-medium">Client</th>
                <th className="px-5 py-3.5 font-medium">Style</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Deposit</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-ink-line last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-white/90">{b.name}</td>
                  <td className="px-5 py-4 text-white/60">{b.style}</td>
                  <td className="px-5 py-4 text-white/60">
                    {b.date} · {b.time}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
                      Deposit Paid: ₹{b.deposit.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => updateStatus(b.id, 'approved')}
                        className="p-1.5 rounded-md border border-ink-line text-white/50 hover:border-green-500/50 hover:text-green-400 transition-colors"
                        aria-label="Approve"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'rejected')}
                        className="p-1.5 rounded-md border border-ink-line text-white/50 hover:border-red-500/50 hover:text-red-400 transition-colors"
                        aria-label="Reject"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">
                    No bookings match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---- Tab 2: Legal Vault ------------------------------------------------

function LegalVaultTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl mb-1">Legal Vault</h2>
        <p className="text-white/40 text-sm">{MOCK_WAIVERS.length} signed digital waivers</p>
      </div>

      <div className="border border-ink-line rounded-lg divide-y divide-ink-line">
        {MOCK_WAIVERS.map((w) => (
          <div key={w.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} className="text-gold" />
              </div>
              <div>
                <p className="text-sm text-white/90">{w.name}</p>
                <p className="text-xs text-white/40">Signed {w.signedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 uppercase tracking-wide">
                {w.status}
              </span>
              <button className="flex items-center gap-1.5 text-xs text-white/50 hover:text-gold border border-ink-line hover:border-gold/40 rounded-md px-3 py-1.5 transition-colors">
                <FileText size={13} />
                View PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Tab 3: Financials & Payroll ------------------------------------------------

function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-3 h-40 px-2">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end justify-center h-32">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-[28px] rounded-t-sm bg-gradient-to-t from-gold-dim to-gold"
            />
          </div>
          <span className="text-[11px] text-white/40">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

function FinancialsTab() {
  const [expenses, setExpenses] = useState(MOCK_EXPENSES)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({ label: '', category: 'Supplies', amount: '' })

  const handleAddExpense = () => {
    if (!newExpense.label || !newExpense.amount) return
    setExpenses((prev) => [
      {
        id: Date.now(),
        label: newExpense.label,
        category: newExpense.category,
        amount: Number(newExpense.amount),
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setNewExpense({ label: '', category: 'Supplies', amount: '' })
    setShowAddForm(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl mb-1">Financials &amp; Payroll</h2>
        <p className="text-white/40 text-sm">Revenue, expenses, and automated commission splits</p>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-ink-panel border border-ink-line rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest2 text-white/40">Total Revenue</p>
            <TrendingUp size={15} className="text-green-400" />
          </div>
          <p className="font-serif text-3xl">₹{TOTAL_REVENUE.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-ink-panel border border-ink-line rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest2 text-white/40">Monthly Expenses</p>
            <TrendingDown size={15} className="text-red-400" />
          </div>
          <p className="font-serif text-3xl">₹{TOTAL_EXPENSES.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-white/30 mt-1">Needles, Ink, Rent</p>
        </div>
        <div className="bg-ink-panel border border-gold/30 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest2 text-gold">Net Profit</p>
            <Wallet size={15} className="text-gold" />
          </div>
          <p className="font-serif text-3xl text-gold">₹{NET_PROFIT.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-ink-panel border border-ink-line rounded-lg p-6 mb-8">
        <p className="text-xs uppercase tracking-widest2 text-white/40 mb-5">
          Revenue — Last 6 Months
        </p>
        <MiniBarChart data={MONTHLY_REVENUE} />
      </div>

      {/* Payroll engine */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest2 text-white/40 mb-4">
          Artist Roster — Automated Commission Splits
        </p>
        <div className="border border-ink-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left text-white/40 text-xs uppercase tracking-wide">
                <th className="px-5 py-3.5 font-medium">Artist</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Split</th>
                <th className="px-5 py-3.5 font-medium">Revenue Generated</th>
                <th className="px-5 py-3.5 font-medium text-right">Pending Payout</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ARTISTS.map((a) => {
                const payout = Math.round((a.revenue * a.split) / 100)
                return (
                  <tr key={a.id} className="border-b border-ink-line last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-white/90">{a.name}</td>
                    <td className="px-5 py-4 text-white/50">{a.role}</td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold">
                        {a.split}% split
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/60">₹{a.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-right text-gold font-medium">
                      ₹{payout.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses list */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest2 text-white/40">Recent Expenses</p>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gold border border-gold/40 rounded-md px-3 py-1.5 hover:bg-gold/5 transition-colors"
        >
          <Plus size={13} />
          Add Expense
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-black/30 border border-ink-line rounded-lg p-4 mb-4 grid sm:grid-cols-4 gap-3">
              <input
                value={newExpense.label}
                onChange={(e) => setNewExpense({ ...newExpense, label: e.target.value })}
                placeholder="Expense description"
                className="sm:col-span-2 bg-black/40 border border-ink-line rounded-md px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold"
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="bg-black/40 border border-ink-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
              >
                <option>Needles</option>
                <option>Ink</option>
                <option>Rent</option>
                <option>Supplies</option>
                <option>Other</option>
              </select>
              <div className="flex gap-2">
                <input
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value.replace(/\D/g, '') })}
                  placeholder="₹ Amount"
                  inputMode="numeric"
                  className="flex-1 bg-black/40 border border-ink-line rounded-md px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold"
                />
                <button onClick={handleAddExpense} className="gold-btn !px-3 !py-2 text-xs shrink-0">
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border border-ink-line rounded-lg divide-y divide-ink-line">
        {expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm text-white/90">{e.label}</p>
              <p className="text-xs text-white/40">
                {e.category} · {e.date}
              </p>
            </div>
            <p className="text-sm text-white/70">₹{e.amount.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Tab 4: Inventory Burn Rate ------------------------------------------------

function InventoryTab() {
  const [inventory, setInventory] = useState(MOCK_INVENTORY)

  const lowStockItems = inventory.filter((i) => i.stock < i.threshold)

  const adjustStock = (id, delta) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)),
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl mb-1">Inventory — Burn Rate</h2>
        <p className="text-white/40 text-sm">Stock levels for critical consumables</p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-5 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">
              Low Stock Alert — Reorder Before the Weekend
            </p>
            <p className="text-xs text-white/50">
              {lowStockItems.map((i) => i.item).join(', ')}{' '}
              {lowStockItems.length === 1 ? 'is' : 'are'} running below the safe threshold.
            </p>
          </div>
        </div>
      )}

      <div className="border border-ink-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-line text-left text-white/40 text-xs uppercase tracking-wide">
              <th className="px-5 py-3.5 font-medium">Item</th>
              <th className="px-5 py-3.5 font-medium">Stock</th>
              <th className="px-5 py-3.5 font-medium">Burn Rate</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => {
              const low = i.stock < i.threshold
              return (
                <tr key={i.id} className="border-b border-ink-line last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-white/90">{i.item}</td>
                  <td className="px-5 py-4 text-white/60">
                    {i.stock} {i.unit}
                  </td>
                  <td className="px-5 py-4 text-white/50">{i.burnRate}</td>
                  <td className="px-5 py-4">
                    {low ? (
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 uppercase tracking-wide">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 uppercase tracking-wide">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => adjustStock(i.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-ink-line text-white/50 hover:border-white/30 transition-colors"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <button
                        onClick={() => adjustStock(i.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-ink-line text-white/50 hover:border-white/30 transition-colors"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Tab 5: Marketing & Automation ------------------------------------------------

function MarketingTab() {
  const [healedQueue, setHealedQueue] = useState(MOCK_HEALED_QUEUE)
  const [touchupSent, setTouchupSent] = useState(false)

  const triggerSms = (id) => {
    setHealedQueue((prev) => prev.map((c) => (c.id === id ? { ...c, smsSent: true } : c)))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl mb-1">Marketing &amp; Automation</h2>
        <p className="text-white/40 text-sm">Review requests and touch-up re-engagement</p>
      </div>

      {/* Healed & Happy loop */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText size={15} className="text-gold" />
          <p className="text-xs uppercase tracking-widest2 text-white/40">
            The "Healed &amp; Happy" Loop — Day 14 Follow-Up
          </p>
        </div>
        <div className="border border-ink-line rounded-lg divide-y divide-ink-line">
          {healedQueue.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-white/90">{c.name}</p>
                <p className="text-xs text-white/40">
                  {c.style} · Session on {c.sessionDate}
                </p>
              </div>
              {c.smsSent ? (
                <span className="text-[11px] px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 uppercase tracking-wide">
                  SMS Sent
                </span>
              ) : (
                <button
                  onClick={() => triggerSms(c.id)}
                  className="flex items-center gap-1.5 text-xs text-gold border border-gold/40 rounded-md px-3 py-1.5 hover:bg-gold/5 transition-colors"
                >
                  <Send size={12} />
                  Trigger Day-14 SMS
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/30 mt-3">
          Message preview: "How did your ink heal? Reply with a photo! We'd
          love a Google review if you're happy with the result 🖤"
        </p>
      </div>

      {/* Touch-up pipeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-gold" />
            <p className="text-xs uppercase tracking-widest2 text-white/40">
              Touch-Up Pipeline — 6-Month Tag
            </p>
          </div>
          <button
            onClick={() => setTouchupSent(true)}
            disabled={touchupSent}
            className="flex items-center gap-1.5 text-xs text-gold border border-gold/40 rounded-md px-3 py-1.5 hover:bg-gold/5 transition-colors disabled:opacity-40"
          >
            <Send size={12} />
            {touchupSent ? 'Promo Sent' : 'Bulk-Send 6-Month Promo'}
          </button>
        </div>
        <div className="border border-ink-line rounded-lg divide-y divide-ink-line">
          {MOCK_TOUCHUP_QUEUE.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-white/90">{c.name}</p>
                <p className="text-xs text-white/40">
                  {c.style} · Last session {c.sessionDate}
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold uppercase tracking-wide">
                {c.tag}
              </span>
            </div>
          ))}
        </div>
        {touchupSent && (
          <p className="text-[11px] text-green-400/80 mt-3">
            Promo queued for {MOCK_TOUCHUP_QUEUE.length} clients: "It's been
            6 months — ready for a touch-up? Book this week for 15% off."
          </p>
        )}
      </div>
    </div>
  )
}

// ---- Main dashboard ------------------------------------------------------

const TABS = [
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'vault', label: 'Legal Vault', icon: ShieldCheck },
  { id: 'financials', label: 'Financials & Payroll', icon: Wallet },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutToast, setLogoutToast] = useState(false)

  const lowStockCount = MOCK_INVENTORY.filter((i) => i.stock < i.threshold).length

  const handleLogout = () => {
    setLogoutToast(true)
    setTimeout(() => navigate('/'), 900)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-ink-charcoal border-r border-ink-line flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 py-6 border-b border-ink-line flex items-center gap-2">
          <LayoutDashboard size={18} className="text-gold" />
          <span className="font-serif text-lg">
            Ink<span className="text-gold">finity</span> CRM
          </span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3">
                <tab.icon size={16} />
                {tab.label}
              </span>
              {tab.id === 'inventory' && lowStockCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px] font-medium">
                  {lowStockCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-6 border-t border-ink-line">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-ink-line px-6 py-4 flex items-center justify-between lg:justify-end">
          <button
            className="lg:hidden text-white/60"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-xs text-gold font-medium">
              A
            </div>
            <span className="text-sm text-white/60 hidden sm:inline">Studio Admin</span>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-6xl">
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'vault' && <LegalVaultTab />}
          {activeTab === 'financials' && <FinancialsTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'marketing' && <MarketingTab />}
        </main>
      </div>

      <Toast show={logoutToast} title="Logged out" message="Redirecting to storefront..." />
    </div>
  )
}
