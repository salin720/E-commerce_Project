import { Container, Row, Col, Form } from "react-bootstrap"
import { useEffect, useMemo, useState } from "react"
import http from "@/http"
import { Loading } from "@/components"
import { dtFormat } from "@/library/function"
import { OrderData } from "@/library/interfaces"

const amountFor = (order: OrderData) => Number(order.payment?.amount || order.details?.reduce((sum, item) => sum + Number(item.total || 0), 0) || 0)
const paymentStatusClass = (status?: string) => {
  switch (status) {
    case 'Paid': return 'success'
    case 'Pending': return 'pending'
    case 'Failed': return 'failed'
    case 'Refunded': return 'failed'
    default: return 'neutral'
  }
}

export const List: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    setLoading(true)
    http.get('/cms/orders').then(({data}) => setOrders(data || [])).finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => orders
    .filter(order => status === 'All' ? true : (order.paymentStatus || order.payment?.status || 'Pending') === status)
    .filter(order => {
      const hay = `${order._id} ${order.user?.name || ''} ${order.user?.email || ''} ${order.payment?.transactionId || ''}`.toLowerCase()
      return hay.includes(query.toLowerCase())
    })
    .map(order => ({
      order,
      transactionId: order.payment?.transactionId || `QC-${String(order._id).slice(-6).toUpperCase()}`,
      amount: amountFor(order),
      status: order.paymentStatus || order.payment?.status || 'Pending',
      method: order.paymentMethod || 'COD'
    })), [orders, query, status])

  return loading ? <Loading /> : <Container fluid><Row><Col>
    <div className="payments-monitor-card">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="payments-title mb-1">Transaction Monitoring</h1>
          <div className="payments-subtitle">Oversee all financial activities, payment statuses, and transaction histories.</div>
        </div>
        <button className="btn btn-outline-dark btn-sm" onClick={() => window.location.reload()}><i className="fa fa-rotate me-2"></i>Refresh</button>
      </div>
      <div className="payments-toolbar">
        <div className="payments-search-wrap">
          <i className="fa fa-search"></i>
          <Form.Control value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ID, user, or transaction..." />
        </div>
        <Form.Select value={status} onChange={e => setStatus(e.target.value)} className="payments-filter-select">
          <option>All</option><option>Pending</option><option>Paid</option><option>Failed</option><option>Refunded</option>
        </Form.Select>
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
                <td className="payments-amount">Rs. {amount}</td>
                <td><span className={`payment-state-badge ${paymentStatusClass(status)}`}>{status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Col></Row></Container>
}
