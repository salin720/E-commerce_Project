import {Badge, Button, Col, Container, Form, Row} from "react-bootstrap"
import {useEffect, useMemo, useState} from "react"
import {OrderData} from "@/library/interfaces"
import http from "@/http"
import {Loading, DateFilterPanel} from "@/components"
import {dtFormat, imgUrl} from "@/library/function"

const withinRange = (date:string, preset:string, from:string, to:string) => { const d = new Date(date).getTime(); const now = new Date(); if (preset === 'custom' && from && to) return d >= new Date(from).setHours(0,0,0,0) && d <= new Date(to).setHours(23,59,59,999); const days = preset === 'daily' ? 1 : preset === 'weekly' ? 7 : preset === 'monthly' ? 31 : preset === 'yearly' ? 366 : Infinity; return preset === 'lifetime' ? true : d >= now.getTime() - days*24*60*60*1000 }


const badge = (value?: string) => {
    switch (value) {
        case 'Paid': case 'Delivered': return 'success'
        case 'Pending': case 'Processing': return 'warning'
        case 'Shipping': case 'Packed': return 'info'
        case 'Cancelled': case 'Failed': return 'danger'
        default: return 'secondary'
    }
}

export const List: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [filter, setFilter] = useState('')
    const [dateFilter, setDateFilter] = useState<any>('daily')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [editing, setEditing] = useState<Record<string, Partial<OrderData>>>({})
    const load = () => { setLoading(true); http.get('/cms/orders').then(({data}) => setOrders(data)).finally(() => setLoading(false)) }
    useEffect(() => { load() }, [])
    const filtered = useMemo(() => orders.filter(o => { const hit = !filter ? true : (o.user?.name?.toLowerCase().includes(filter.toLowerCase()) || o._id.toLowerCase().includes(filter.toLowerCase())); return hit && withinRange(o.updatedAt || o.createdAt, dateFilter, from, to) }), [orders, filter, dateFilter, from, to])
    const save = (orderId: string) => { http.patch(`/cms/orders/${orderId}`, editing[orderId] || {}).then(load) }
    return loading ? <Loading /> : <Container><Row><Col className="page-card">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2"><div><h1 className="mb-1">Orders</h1><div className="text-muted">Monitor customer orders, payment progress, shipping updates and admin notes.</div></div><Form.Control style={{maxWidth: 280}} placeholder="Search by customer or order id" value={filter} onChange={e => setFilter(e.target.value)} /></div><div className="mb-4"><DateFilterPanel value={dateFilter} onChange={setDateFilter} from={from} to={to} onFromChange={setFrom} onToChange={setTo} vertical /></div>
        <div className="d-flex flex-column gap-3">{filtered.map(order => {
            const patch = editing[order._id] || {}
            const amount = order.payment?.amount || order.details?.reduce((sum, item) => sum + Number(item.total || 0), 0) || 0
            return <div className="order-admin-card" key={order._id}>
                <div className="d-flex justify-content-between flex-wrap gap-2 mb-3"><div><div className="fw-semibold">Order #{order._id.slice(-8).toUpperCase()}</div><div className="small text-muted">{order.user?.name} • {order.user?.email} • {dtFormat(order.createdAt)}</div></div><div className="d-flex gap-2 flex-wrap"><Badge bg={badge(order.status)}>{order.status}</Badge><Badge bg={badge(order.paymentStatus || order.payment?.status)}>{order.paymentStatus || order.payment?.status || 'Pending'}</Badge><Badge bg="dark">{order.paymentMethod || 'COD'}</Badge></div></div>
                <div className="row g-3"><div className="col-lg-6"><div className="small text-muted mb-2">Items</div><div className="d-flex flex-column gap-2">{order.details?.map(item => <div className="order-line-admin" key={item._id}><img src={item.product?.images?.[0] ? imgUrl(item.product.images[0]) : '/vite.svg'} /><div className="flex-grow-1"><div className="fw-semibold">{item.product?.name}</div><div className="small text-muted">Qty {item.qty} × Rs. {item.price}</div></div><div className="fw-semibold">Rs. {item.total}</div></div>)}</div></div>
                    <div className="col-lg-6"><Row className="g-3"><Col md={6}><Form.Label>Order Status</Form.Label><Form.Select value={patch.status ?? order.status} onChange={e => setEditing({...editing, [order._id]: {...patch, status: e.target.value as any}})}><option>Processing</option><option>Confirmed</option><option>Packed</option><option>Shipping</option><option>Delivered</option><option>Cancelled</option></Form.Select></Col><Col md={6}><Form.Label>Payment Status</Form.Label><Form.Select value={patch.paymentStatus ?? order.paymentStatus ?? order.payment?.status ?? 'Pending'} onChange={e => setEditing({...editing, [order._id]: {...patch, paymentStatus: e.target.value as any}})}><option>Pending</option><option>Paid</option><option>Failed</option><option>Refunded</option></Form.Select></Col><Col md={6}><Form.Label>Tracking Code</Form.Label><Form.Control value={patch.trackingCode ?? order.trackingCode ?? ''} onChange={e => setEditing({...editing, [order._id]: {...patch, trackingCode: e.target.value}})} placeholder="QC-TRACK-001" /></Col><Col md={6}><Form.Label>Payment Method</Form.Label><Form.Control readOnly value={order.paymentMethod || 'COD'} /></Col><Col md={12}><Form.Label>Admin Note</Form.Label><Form.Control as="textarea" rows={2} value={patch.adminNote ?? order.adminNote ?? ''} onChange={e => setEditing({...editing, [order._id]: {...patch, adminNote: e.target.value}})} placeholder="Packing, courier handover, refund, etc." /></Col></Row><div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2"><div><div className="small text-muted">Order Amount</div><div className="fw-bold">Rs. {amount}</div></div><Button variant="dark" onClick={() => save(order._id)}>Save Update</Button></div></div></div>
            </div>
        })}</div>
    </Col></Row></Container>
}
