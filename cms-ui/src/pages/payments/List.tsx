
import { Container, Row, Col, Form } from "react-bootstrap"
import { useEffect, useMemo, useState } from "react"
import http from "@/http"
import { Loading, DateFilterPanel } from "@/components"
import type { DatePreset } from "@/components/DateFilterPanel"
import { dtFormat } from "@/library/function"
import { OrderData } from "@/library/interfaces"

const amountFor = (order: OrderData) => Number(order.payment?.amount || order.details?.reduce((sum, item) => sum + Number(item.total || 0), 0) || 0)
const formatMoney = (amount: number) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`
const paymentStatusClass = (status?: string) => {
  switch (status) {
    case 'Paid': return 'success'
    case 'Pending': return 'pending'
    case 'Failed': return 'failed'
    case 'Refunded': return 'failed'
    default: return 'neutral'
  }
}
const getPresetRange = (preset: DatePreset) => {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const start = new Date(end)
  if (preset === 'daily') start.setDate(end.getDate() - 1)
  else if (preset === 'weekly') start.setDate(end.getDate() - 7)
  else if (preset === 'monthly') start.setMonth(end.getMonth() - 1)
  else if (preset === 'yearly') start.setFullYear(end.getFullYear() - 1)
  else return { start: null as Date | null, end: null as Date | null }
  return { start, end }
}

export const List: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [preset, setPreset] = useState<DatePreset>('lifetime')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const loadOrders = () => {
    setLoading(true)
    http.get('/cms/orders').then(({data}) => setOrders(data || [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const rows = useMemo(() => {
    const customStart = from ? new Date(`${from}T00:00:00`) : null
    const customEnd = to ? new Date(`${to}T23:59:59`) : null
    const presetRange = preset === 'custom' ? { start: customStart, end: customEnd } : getPresetRange(preset)

    return orders
      .filter(order => status === 'All' ? true : (order.paymentStatus || order.payment?.status || 'Pending') === status)
      .filter(order => {
        const hay = `${order._id} ${order.user?.name || ''} ${order.user?.email || ''} ${order.payment?.transactionId || ''}`.toLowerCase()
        return hay.includes(query.toLowerCase())
      })
      .filter(order => {
        if (!presetRange.start && !presetRange.end) return true
        const orderDate = new Date(order.payment?.paidAt || order.updatedAt || order.createdAt)
        if (presetRange.start && orderDate < presetRange.start) return false
        if (presetRange.end && orderDate > presetRange.end) return false
        return true
      })
      .map(order => ({
        order,
        transactionId: order.payment?.transactionId || `QC-${String(order._id).slice(-6).toUpperCase()}`,
        amount: amountFor(order),
        status: order.paymentStatus || order.payment?.status || 'Pending',
        method: order.paymentMethod || 'COD'
      }))
  }, [orders, query, status, preset, from, to])

  return loading ? <Loading /> : <Container fluid><Row><Col>
    <div className="payments-monitor-card">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="payments-title mb-1">Transaction Monitoring</h1>
          <div className="payments-subtitle">Oversee all financial activities, payment statuses, and transaction histories.</div>
        </div>
        <button className="btn btn-outline-dark btn-sm" onClick={loadOrders}><i className="fa fa-rotate me-2"></i>Refresh</button>
      </div>
      <div className="payments-toolbar payments-toolbar-wide">
        <div className="payments-search-wrap">
          <i className="fa fa-search"></i>
          <Form.Control value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ID, user, or transaction..." />
        </div>
        <Form.Select value={status} onChange={e => setStatus(e.target.value)} className="payments-filter-select">
          <option>All</option><option>Pending</option><option>Paid</option><option>Failed</option><option>Refunded</option>
        </Form.Select>
      </div>
      <div className="mb-3">
        <DateFilterPanel value={preset} onChange={setPreset} from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      </div>
      <div className="payments-table-wrap">
        <table className="table payments-table align-middle mb-0">
          <thead><tr><th>Ref ID</th><th>Date</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(({order, transactionId, amount, status, method}) => (
              <tr key={order._id}>
                <td><span className="payment-ref-pill">{transactionId}</span></td>
                <td>{dtFormat(order.payment?.paidAt || order.updatedAt || order.createdAt)}</td>
                <td><div className="fw-semibold">{order.user?.name || 'Customer'}</div><div className="small text-muted">{order.user?.email || '—'}</div></td>
                <td><span className="payment-method-pill">{method}</span></td>
                <td className="payments-amount">{formatMoney(amount)}</td>
                <td><span className={`payment-state-badge ${paymentStatusClass(status)}`}>{status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No transactions found for the selected filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </Col></Row></Container>
}
