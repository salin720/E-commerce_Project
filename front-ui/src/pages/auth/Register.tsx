import {Col, Container,Form, Row} from "react-bootstrap"
import {useFormik} from "formik"
import {UserFormData} from "@/library/interfaces"
import {UserFormValidation} from "@/library/validations"
import {InputField, SubmitBtn} from "@/components"
import http from "@/http"
import {useNavigate} from "react-router-dom"

export const Register: React.FC = () => {
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: {
            name: '',
            phone: '',
            address: '',
            email: '',
            password: '',
            confirmPassword: '',
        }as UserFormData,
        validationSchema: UserFormValidation,
        onSubmit: (data, {setSubmitting}) => {
           http.post('auth/register', data)
                .then(() => {
                    navigate('/login')
                })
                .catch(({response: {data: {validation}}})  => {
                    if(validation){
                        formik.setErrors(validation)
                    }
                })
               .finally(() => setSubmitting(false))
        },
    })

    return <>
        <Container>
            <Row>
                <Col xl={4} className="my-5 mx-auto py-5 px-4 bg-white rounded-4 shadow-sm border-soft">
                    <Row>
                        <Col className="text-center">
                            <h1 className="fw-bold mb-3">Register</h1>
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

                                <Form.Group className="d-grid">
                                    <SubmitBtn disabled={formik.isSubmitting} label={"Register"} icon={'fa-user-plus'}/>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container></>
}