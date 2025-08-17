import {Button, Col, Container, Row} from "react-bootstrap"
import {useEffect, useState} from "react"
import {ReviewData} from "@/library/interfaces"
import http from "@/http"
import {DataTable, Loading} from "@/components"
import {dtFormat} from "@/library/function"
import {confirmAlert} from "react-confirm-alert"

export const List: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)

        http.get('/cms/reviews')
            .then(({data}) => {
                setReviews(data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this review?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true)

                        http.delete(`/cms/reviews/${id}`)
                            .then(() => http.get('/cms/reviews/'))
                            .then(({data}) => setReviews(data))
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

    return loading ? <Loading /> : <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Reviews</h1>
                        </Col>
                       </Row>
                    <Row>
                        <Col>
                            <DataTable searchable={['Name','Email','Address']} data={reviews.map(review => ({
                                'Product': review.product?.name,
                                'User': review.user?.name,
                                'Comment': review.comment,
                                'Rating': review.rating,
                                'Created At': dtFormat(review.createdAt),
                                'Updated At': dtFormat(review.updatedAt),
                                'Actions': <>
                                    <Button variant='danger' type="button" size="sm" title='Delete' onClick={() => handleDelete(review._id)} >
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