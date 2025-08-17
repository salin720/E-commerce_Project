import {useFormik} from "formik"
import {UserFormData, UserType} from "@/library/interfaces"
import {UserEditFormValidation} from "@/library/validations"
import http from "@/http"
import {useNavigate} from "react-router-dom"
import {Col, Container, Form, Row} from "react-bootstrap"
import {InputField, Loading, StatusField, SubmitBtn} from "@/components"
import {useParams} from "react-router-dom"
import {useEffect, useState} from "react"

export const Edit: React.FC = () => {
    const [staff, setStaff] = useState<UserType>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const navigate = useNavigate()

    const params = useParams()

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            address: '',
            status: 1,
        } as UserFormData,
        validationSchema: UserEditFormValidation,
        onSubmit: (data, {setSubmitting}) => {
           // @ts-ignore
            data.status = data.status == 1

            http.patch(`cms/staffs/${params.id}`, data)
                .then(() => {
                    navigate(`/staffs`)
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

        http.get(`/cms/staffs/${params.id}`)
            .then(({data}) => setStaff(data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if(staff){
            formik.setValues({
                name: staff.name,
                status: staff.status ? 1: 0,
                phone: staff.phone,
                address: staff.address,
            })
        }
    }, [staff]);

    return loading ? <Loading /> : <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Edit Staff</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form onSubmit={formik.handleSubmit}>

                                <InputField formik={formik} name="name" label="Name" />

                                <InputField formik={formik} name="phone" label="Phone" />

                                <InputField formik={formik} name="address" label="Address" as="textarea" />

                                <StatusField formik={formik}/>

                                <SubmitBtn disabled={formik.isSubmitting} />
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </>
}