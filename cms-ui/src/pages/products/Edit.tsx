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
        initialValues: {
            name: '',
            status: 1,
            brandId: '',
            categoryId: '',
            price: 0,
            discountedPrice: 0,
            featured: 0,
            description: '',
            shortDescription: '',
            images: [],
        } as ProductFormData,
        validationSchema: ProductEditFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            // @ts-ignore
            data.status = data.status == 1
            // @ts-ignore
            data.featured = data.featured == 1

            const fd = new FormData()

            for( let k in data ) {
                if(k == 'images'){
                    for(let img of data['images']){
                        fd.append('images', img)
                    }
                }else{
                    // @ts-ignore
                    fd.append(k, data[k])
                }
            }

            http.patch(`cms/products/${params.id}`, fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(() => {
                    navigate(`/products`)
                })
                .catch(({response: {data}}) => {
                    if(data?.validation){
                        formik.setErrors(data.validation)
                    }
                })
                .finally(() => {
                    setSubmitting(false)
                })
        }
    })

    useEffect(() => {
        setLoading(true)

        Promise.all([
            http.get('/cms/categories'),
            http.get('/cms/brands'),
            http.get(`/cms/products/${params.id}`),
        ])
            .then(([{data: cData}, {data: bData}, {data: pData}]) => {
                setCategories(cData)
                setBrand(bData)
                setProduct(pData)

                if(cData.length > 0) {
                    formik.setFieldValue('categoryId', cData[0]._id)
                }

                if(bData.length > 0) {
                    formik.setFieldValue('brandId', bData[0]._id)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if(product) {
            formik.setValues({
                name: product.name,
                shortDescription: product.shortDescription,
                description: product.description,
                price: product.price,
                discountedPrice: product.discountedPrice,
                categoryId: product.categoryId,
                brandId: product.brandId,
                status: product.status? 1 : 0,
                featured: product.featured? 1 : 0,
                images: [],
            })
        }
    }, [product])

    const handleDelete = (filename: string) => {
        setLoading(true)

        http.delete(`cms/products/${params.id}/image/${filename}`)
            .then(() => http.get(`cms/products/${params.id}`))
            .then(({data}) => setProduct(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }

    return loading ? <Loading /> : <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Edit Product</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form onSubmit={formik.handleSubmit}>

                                <InputField formik={formik} name="name" label="Name" />

                                <InputField formik={formik} name="description" label="Description" as="textarea" />

                                <InputField formik={formik} name="shortDescription" label="Short Description" as="textarea" />

                                <InputField formik={formik} name="price" label="Price" />

                                <InputField formik={formik} name="discountedPrice" label="Dis. Price" />

                                    {/*@ts-ignore*/}
                                <SelectField formik={formik} name='categoryId' label='Category' data={categories} />

                                    {/*@ts-ignore*/}
                                <SelectField formik={formik} name='brandId' label='Brand' data={brands} />

                                <FileField formik={formik} name='images' label='Images' multiple accept="image/*" />

                                    {formik.values.images.length > 0 && <Row>
                                        {formik.values.images.map((img, i) => <Col  key={i} md={3} className="mb-3">
                                            <img src={URL.createObjectURL(img)} className="img-fluid" />
                                        </Col>)}
                                    </Row>}

                                    <Row>
                                        {product?.images.map((img, i) => <Col md={3} key={i} className="mb-3">
                                            <Row>
                                                <Col>
                                                    <img src={imgUrl(img)}  className="img-fluid" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col className="text-center mt-3">
                                                    <Button variant="danger" size="sm" onClick={() => handleDelete(img)}>
                                                        <i className="fa-solid fa-times me-2"></i>Delete
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Col> )}
                                    </Row>

                                <StatusField formik={formik}/>

                                <FeaturedField formik={formik} />

                                <SubmitBtn disabled={formik.isSubmitting} />

                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </>
}