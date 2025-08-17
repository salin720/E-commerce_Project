import { Button, Col, Container, Row } from "react-bootstrap"
import { useEffect, useState } from "react"
import { ProductData } from "@/library/interfaces"
import http from "@/http"
import { DataTable, Loading } from "@/components"
import { dtFormat, imgUrl } from "@/library/function"
import { Link } from "react-router-dom"
import { confirmAlert } from "react-confirm-alert"

export const List: React.FC = () => {
    const [products, setProducts] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)

        http.get('/cms/products')
            .then(({ data }) => {
                setProducts(data)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this product?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true)

                        http.delete(`/cms/products/${id}`)
                            .then(() => http.get('/cms/products/'))
                            .then(({ data }) => setProducts(data))
                            .catch(() => { })
                            .finally(() => setLoading(false))
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        })
    }

    return loading ? <Loading /> : (
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Products</h1>
                        </Col>
                        <Col xs="auto">
                            <Link to="/products/create" className="btn btn-dark">
                                <i className="fa-solid fa-plus me-2"></i>Add Product
                            </Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable
                                searchable={['Name', 'Email', 'Address']}
                                data={products.map(product => ({
                                    'Name': product.name,
                                    'Image': (
                                        <a href={imgUrl(product.images[0])} target="_blank" rel="noreferrer">
                                            <img src={imgUrl(product.images[0])} className="img-sm" />
                                        </a>
                                    ),
                                    'Category': product.category?.name,
                                    'Brand': product.brand?.name,
                                    'Price': product.price,
                                    'Dis. Price': product.discountedPrice,
                                    'Status': product.status ? 'Active' : 'Inactive',
                                    'Created At': dtFormat(product.createdAt),
                                    'Updated At': dtFormat(product.updatedAt),
                                    'Actions': (
                                        <div className="d-flex gap-2">
                                            <Link to={`${product._id}/edit`} className="btn btn-dark btn-sm" title="Edit">
                                                <i className="fa-solid fa-edit"></i>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                title="Delete"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                <i className="fa fa-solid fa-times"></i>
                                            </Button>
                                        </div>
                                    )
                                }))}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}
