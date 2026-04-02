import {useEffect, useMemo, useState} from "react"
import {OrderData} from "@/library/interfaces"
import http from "@/http"
import {Loading} from "@/components";
import {dtFormat, imgUrl} from "@/library/function.ts";

const badgeClass = (status?: string) => {
    switch (status) {
        case 'Paid': return 'bg-success-subtle text-success'
        case 'Pending': return 'bg-warning-subtle text-warning-emphasis'
        case 'Failed': return 'bg-danger-subtle text-danger'
        case 'Delivered': return 'bg-success-subtle text-success'
        case 'Shipping': return 'bg-info-subtle text-info-emphasis'
        case 'Cancelled': return 'bg-danger-subtle text-danger'
        default: return 'bg-secondary-subtle text-secondary'
    }
}

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        setLoading(true)
        http.get('/profile/orders').then(({data}) => setOrders(data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    const totalPending = useMemo(() => orders.filter(order => (order.paymentStatus || order.payment?.status) !== 'Paid').length, [orders])

    if (loading) return <Loading />

    return <div>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
                <h4 className="mb-1">Your Orders</h4>
                <div className="text-muted small">Track delivery progress and payment status clearly.</div>
            </div>
            <span className="badge rounded-pill text-bg-dark">{totalPending} pending payment/order updates</span>
        </div>
        <div className="d-flex flex-column gap-3">
            {orders.length ? orders.map(order => {
                const total = order.details?.reduce((sum, item) => sum + Number(item.total || 0), 0) || order.payment?.amount || 0
                return <div className="order-card-real" key={order._id}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                        <div>
                            <div className="fw-semibold">Order #{order._id.slice(-8).toUpperCase()}</div>
                            <div className="small text-muted">Placed on {dtFormat(order.createdAt)}</div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                            <span className={`badge rounded-pill ${badgeClass(order.status)}`}>{order.status}</span>
                            <span className={`badge rounded-pill ${badgeClass(order.paymentStatus || order.payment?.status)}`}>{order.paymentStatus || order.payment?.status || 'Pending Payment'}</span>
                            <span className="badge rounded-pill text-bg-light border">{order.paymentMethod || 'COD'}</span>
                        </div>
                    </div>
                    <div className="d-flex flex-column gap-2">
                        {order.details?.map(item => <div className="order-item-real" key={item._id}>
                            <img src={item.product?.images?.[0] ? imgUrl(item.product.images[0]) : '/avatar.png'} alt={item.product?.name || 'Product'} />
                            <div className="flex-grow-1">
                                <div className="fw-semibold">{item.product?.name}</div>
                                <div className="small text-muted">Qty {item.qty} × Rs. {item.price}</div>
                            </div>
                            <div className="fw-semibold">Rs. {item.total}</div>
                        </div>)}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                        <div className="small text-muted">Tracking: {order.trackingCode || 'Will be assigned by admin after confirmation.'}</div>
                        <div className="fw-bold">Total: Rs. {total}</div>
                    </div>
                </div>
            }) : <div className="text-center text-muted py-4">No orders yet.</div>}
        </div>
    </div>
}
