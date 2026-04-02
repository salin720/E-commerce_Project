import {useFormik} from "formik"
import {CatBrandData, ProductFormData} from "@/library/interfaces"
import {ProductFormValidation} from "@/library/validations"
import http from "@/http"
import {useNavigate} from "react-router-dom"
import {Col, Container, Form, Row} from "react-bootstrap"
import {FeaturedField, FileField, InputField, Loading, SelectField, StatusField, SubmitBtn} from "@/components"
import {useEffect, useState} from "react";

export const Create: React.FC = () => {
    const [categories, setCategories] = useState<CatBrandData[]>([])
    const [brands, setBrand] = useState<CatBrandData[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: { name: '', status: 1, brandId: '', categoryId: '', price: 0, discountedPrice: 0, stock: 0, featured: 0, description: '', shortDescription: '', images: [] } as ProductFormData,
        validationSchema: ProductFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            // @ts-ignore
            data.status = data.status == 1
            // @ts-ignore
            data.featured = data.featured == 1
            const fd = new FormData()
            for (let k in data) {
                if (k === 'images') {
                    for (let img of data.images) fd.append('images', img)
                } else fd.append(k, String((data as any)[k]))
            }
            http.post('cms/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(() => navigate(`/products`))
                .catch(({response: {data}}) => data?.validation && formik.setErrors(data.validation))
                .finally(() => setSubmitting(false))
        }
    })

    useEffect(() => {
        setLoading(true)
        Promise.all([http.get('/cms/categories'), http.get('/cms/brands')])
            .then(([{data: cData}, {data: bData}]) => {
                setCategories(cData); setBrand(bData)
                if(cData.length > 0) formik.setFieldValue('categoryId', cData[0]._id)
                if(bData.length > 0) formik.setFieldValue('brandId', bData[0]._id)
            })
            .finally(() => setLoading(false))
    }, [])

    return loading ? <Loading /> : <Container><Row><Col className="page-card">
        <div className="d-flex justify-content-between align-items-center mb-4"><div><h1 className="mb-1">Add Product</h1><div className="text-muted">Create a product with price, stock, images and listing status.</div></div></div>
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
            <Row><Col md={4}><StatusField formik={formik}/></Col><Col md={4}><FeaturedField formik={formik} /></Col></Row>
            <SubmitBtn disabled={formik.isSubmitting} label="Create Product" />
        </Form>
    </Col></Row></Container>
}
