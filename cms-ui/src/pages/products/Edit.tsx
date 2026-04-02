import {useFormik} from "formik"
import {CatBrandData, ProductData, ProductFormData} from "@/library/interfaces"
import {ProductEditFormValidation} from "@/library/validations"
import http from "@/http"
import {useNavigate, useParams} from "react-router-dom"
import {Button, Col, Container, Form, Row} from "react-bootstrap"
import {FeaturedField, FileField, InputField, Loading, SelectField, StatusField, SubmitBtn} from "@/components"
import {useEffect, useState} from "react"
import {imgUrl} from "@/library/function.ts";

export const Edit: React.FC = () => {
    const [categories, setCategories] = useState<CatBrandData[]>([])
    const [brands, setBrand] = useState<CatBrandData[]>([])
    const [product, setProduct] = useState<ProductData>()
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const params = useParams()
    const formik = useFormik({
        initialValues: { name: '', status: 1, brandId: '', categoryId: '', price: 0, discountedPrice: 0, stock: 0, featured: 0, description: '', shortDescription: '', images: [] } as ProductFormData,
        validationSchema: ProductEditFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            // @ts-ignore
            data.status = data.status == 1
            // @ts-ignore
            data.featured = data.featured == 1
            const fd = new FormData()
            for( let k in data ) {
                if(k == 'images'){ for(let img of data['images']) fd.append('images', img) }
                else fd.append(k, String((data as any)[k]))
            }
            http.patch(`cms/products/${params.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(() => navigate(`/products`))
                .catch(({response: {data}}) => { if(data?.validation) formik.setErrors(data.validation) })
                .finally(() => setSubmitting(false))
        }
    })

    useEffect(() => {
        setLoading(true)
        Promise.all([http.get('/cms/categories'), http.get('/cms/brands'), http.get(`/cms/products/${params.id}`)])
            .then(([{data: cData}, {data: bData}, {data: pData}]) => {
                setCategories(cData); setBrand(bData); setProduct(pData)
                if(cData.length > 0) formik.setFieldValue('categoryId', pData.categoryId || cData[0]._id)
                if(bData.length > 0) formik.setFieldValue('brandId', pData.brandId || bData[0]._id)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if(product) formik.setValues({ name: product.name, shortDescription: product.shortDescription, description: product.description, price: product.price, discountedPrice: product.discountedPrice, stock: product.stock || 0, categoryId: product.categoryId, brandId: product.brandId, status: product.status? 1 : 0, featured: product.featured? 1 : 0, images: [] })
    }, [product])

    const handleDelete = (filename: string) => { setLoading(true); http.delete(`cms/products/${params.id}/image/${filename}`).then(() => http.get(`cms/products/${params.id}`)).then(({data}) => setProduct(data)).finally(() => setLoading(false)) }

    return loading ? <Loading /> : <Container><Row><Col className="page-card">
        <div className="d-flex justify-content-between align-items-center mb-4"><div><h1 className="mb-1">Edit Product</h1><div className="text-muted">Update catalog details, price, stock and listing media.</div></div></div>
        <Form onSubmit={formik.handleSubmit}>
            <Row>
                <Col md={6}><InputField formik={formik} name="name" label="Name" /></Col>
                <Col md={3}><InputField formik={formik} name="price" label="Price" type="number" /></Col>
                <Col md={3}><InputField formik={formik} name="discountedPrice" label="Discounted Price" type="number" /></Col>
                <Col md={4}><InputField formik={formik} name="stock" label="Quantity / Stock" type="number" /></Col>
                <Col md={4}><SelectField formik={formik} name='categoryId' label='Category' data={categories as any} /></Col>
                <Col md={4}><SelectField formik={formik} name='brandId' label='Brand' data={brands as any} /></Col>
                <Col md={12}><InputField formik={formik} name="shortDescription" label="Short Description" as="textarea" /></Col>
                <Col md={12}><InputField formik={formik} name="description" label="Description" as="textarea" /></Col>
                <Col md={12}><FileField formik={formik} name='images' label='Images' multiple accept="image/*" /></Col>
            </Row>
            {formik.values.images.length > 0 && <Row className="mb-3">{formik.values.images.map((img, i) => <Col key={i} md={2} className="mb-3"><img src={URL.createObjectURL(img)} className="img-fluid rounded-3 border" /></Col>)}</Row>}
            <Row className="mb-3">{product?.images.map((img, i) => <Col md={2} key={i} className="mb-3 text-center"><img src={imgUrl(img)} className="img-fluid rounded-3 border mb-2" /><Button variant="danger" size="sm" onClick={() => handleDelete(img)}><i className="fa-solid fa-times me-2"></i>Delete</Button></Col>)}</Row>
            <Row><Col md={4}><StatusField formik={formik}/></Col><Col md={4}><FeaturedField formik={formik} /></Col></Row>
            <SubmitBtn disabled={formik.isSubmitting} label="Save Product" />
        </Form>
    </Col></Row></Container>
}
