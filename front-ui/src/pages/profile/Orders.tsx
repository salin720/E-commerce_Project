import {useEffect, useState} from "react"
import {OrderData} from "@/library/interfaces"
import http from "@/http"
import {DataTable, Loading} from "@/components";
import {dtFormat} from "@/library/function.ts";

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState<boolean>(true)


    useEffect(() => {
        setLoading(true)

        http.get('/profile/orders')
            .then(({data}) => {
                setOrders(data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return loading ? <Loading /> : <>
        <DataTable searchable={['Name','Email','Address']} data={orders.map(order => ({
            'Details': <ul>
                {order.details?.map(detail => <li key={detail._id}>
                    {detail.qty} x {detail.product?.name} @ Rs. {detail.price} = Rs.{detail.total}
                </li>)}
            </ul>,
            'Status': order.status,
            'Created At': dtFormat(order.createdAt),
            'Updated At': dtFormat(order.updatedAt),
        }))} />
    </>
}