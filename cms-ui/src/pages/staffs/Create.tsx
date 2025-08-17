import {useFormik} from "formik"
import {UserFormData} from "@/library/interfaces"
import {UserFormValidation} from "@/library/validations"
import http from "@/http"
import {useNavigate} from "react-router-dom"
import {Col, Container, Form, Row} from "react-bootstrap"
import {InputField, StatusField, SubmitBtn} from "@/components"

export const Create: React.FC = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            address: '',
            email: '',
            status: 1,
            password: '',
            confirmPassword: '',
        } as UserFormData,
        validationSchema: UserFormValidation,
        onSubmit: (data, {setSubmitting}) => {
           // @ts-ignore
            data.status = data.status == 1

            http.post('cms/staffs', data)
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

    return <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Add Staff</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form onSubmit={formik.handleSubmit}>

                                <InputField formik={formik} name="name" label="Name" />

                                <InputField formik={formik} name="phone" label="Phone" />

                                <InputField formik={formik} name="address" label="Address" as="textarea" />

                                <InputField formik={formik} name="email" label="Email" type="email" />

                                <InputField formik={formik} name="password" label="New Password" type="password" />

                                <InputField formik={formik} name="confirmPassword" label="Confirm Password" type="password" />

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