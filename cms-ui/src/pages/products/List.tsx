import { Button, Col, Container, Row, Badge } from "react-bootstrap"
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
    useEffect(() => { setLoading(true); http.get('/cms/products').then(({ data }) => setProducts(data)).finally(() => setLoading(false)) }, [])
    const reload = () => http.get('/cms/products/').then(({ data }) => setProducts(data))
    const handleDelete = (id: string) => confirmAlert({ title: 'Confirm Delete', message: 'Are you sure you want to delete this product?', buttons: [{ label: 'Yes', className: 'text-bg-danger', onClick: () => { setLoading(true); http.delete(`/cms/products/${id}`).then(reload).finally(() => setLoading(false)) } }, { label: 'No', onClick: () => {} }] })
    return loading ? <Loading /> : <Container><Row><Col className="page-card">
        <div className="d-flex justify-content-between align-items-center mb-4"><div><h1 className="mb-1">Products</h1><div className="text-muted">Manage catalog, stock, sales and visibility from one place.</div></div><Link to="/products/create" className="btn btn-dark"><i className="fa-solid fa-plus me-2"></i>Add Product</Link></div>
        <DataTable pageSize={15} searchable={['Name','Category','Brand']} data={products.map(product => ({
            'Name': <div><div className="fw-semibold">{product.name}</div><div className="small text-muted">{product.shortDescription}</div></div>,
            'Image': <a href={imgUrl(product.images[0])} target="_blank" rel="noreferrer"><img src={imgUrl(product.images[0])} className="img-sm rounded-3" /></a>,
            'Category': product.category?.name,
            'Brand': product.brand?.name,
            'Price': `Rs. ${product.price}`,
            'Offer Price': product.discountedPrice > 0 ? `Rs. ${product.discountedPrice}` : '-',
            'Stock': <Badge bg={(product.stock || 0) > 0 ? 'dark' : 'warning'}>{product.stock || 0}</Badge>,
            'Sold': product.totalSold || 0,
            'Views': product.totalViews || 0,
            'Status': product.status ? 'Active' : 'Inactive',
            'Created': dtFormat(product.createdAt),
            'Actions': <div className="d-flex gap-2"><Link to={`${product._id}/edit`} className="btn btn-dark btn-sm"><i className="fa-solid fa-edit"></i></Link><Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}><i className="fa fa-solid fa-times"></i></Button></div>
        }))} />
    </Col></Row></Container>
}
