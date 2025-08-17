import {Button, Col, Container, Form, Row} from "react-bootstrap"
import {useEffect, useState} from "react"
import {OrderData} from "@/library/interfaces"
import http from "@/http"
import {DataTable, Loading} from "@/components"
import {dtFormat} from "@/library/function"
import {confirmAlert} from "react-confirm-alert"

export const List: React.FC = () => {
    const [orders, setOrders] = useState<OrderData[]>([])
    const [loading, setLoading] = useState<boolean>(true)


    useEffect(() => {
        setLoading(true)

        http.get('/cms/orders')
            .then(({data}) => {
                setOrders(data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this order?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true)

                        http.delete(`/cms/orders/${id}`)
                            .then(() => http.get('/cms/orders/'))
                            .then(({data}) => setOrders(data))
                            .catch(() => {})
                            .finally(() => setLoading(false))
                    }
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        })
    }

    const handleUpdate = (id: string, status: string) => {
        setLoading(true)

        http.patch(`cms/orders/${id}`, {status})
            .then(() => http.get('/cms/orders/'))
            .then(({data}) => {setOrders(data)})
            .catch(() => {})
            .finally(() => setLoading(false))
    }

    return loading ? <Loading /> : <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Orders</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable searchable={['Name','Email','Address']} data={orders.map(order => ({
                                'Details': <ul>
                                    {order.details?.map(detail => <li key={detail._id}>
                                        {detail.qty} x {detail.product?.name} @ Rs. {detail.price} = Rs.{detail.total}
                                    </li>)}
                                </ul>,
                                'User': order.user?.name,
                                'Status': <Form.Select value={order.status} onChange={({target}) => handleUpdate(order._id, target.value)}>
                                    <option value='Processing'>Processing</option>
                                    <option value='Confirmed'>Confirmed</option>
                                    <option value='Shipping'>Shipping</option>
                                    <option value='Delivered'>Delivered</option>
                                    <option value='Cancelled'>Cancelled</option>
                                </Form.Select>,
                                'Created At': dtFormat(order.createdAt),
                                'Updated At': dtFormat(order.updatedAt),
                                'Actions': <>
                                    <Button variant='danger' type="button" size="sm" title='Delete' onClick={() => handleDelete(order._id)} >
                                        <i className="fa fa-solid fa-times"></i>
                                    </Button>
                                </>
                            }))} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </>
}