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
        validationSchema: ProductFormValidation,
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

            http.post('cms/products', fd, {
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
        ])
            .then(([{data: cData}, {data: bData}]) => {
                setCategories(cData)
                setBrand(bData)

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

    return loading ? <Loading /> : <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Add Product</h1>
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