import {Col, Container,Form, Row} from "react-bootstrap"
import {useFormik} from "formik"
import {LoginFormData} from "@/library/interfaces"
import {LoginFormValidation} from "@/library/validations"
import {InputField, SubmitBtn} from "@/components"
import {useState} from "react"
import http from "@/http"
import {inStorage} from "@/library/function"
import {setUser} from "@/store"
import {useDispatch} from "react-redux"
import {useNavigate} from "react-router-dom"

export const Login: React.FC = () => {
    const [remember, setRemember] = useState<boolean>(false)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: {
            email: '',
            password:'',
        }as LoginFormData,
        validationSchema: LoginFormValidation,
        onSubmit: (data, {setSubmitting}) => {
           http.post('auth/login', data)
                .then(({data}) => {
                    inStorage('m3pmctoken', data.token, remember)

                    return http.get('/profile/details')
                })
                .then(({data}) => {
                    dispatch(setUser(data))
                    navigate('/')
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
        <Container fluid className="cms-login-shell px-3">
            <Row className="w-100 justify-content-center mx-0">
                <Col xl={4} lg={5} md={7} sm={10} className="py-5 px-4 bg-white rounded-4 shadow-sm border-soft mx-auto">
                    <Row>
                        <Col className="text-center">
                            <h1 className="fw-bold mb-3">Login</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form onSubmit={formik.handleSubmit}>
                               <InputField formik={formik} name={"email"} label={"Email"} type={"email"} />

                                <InputField formik={formik} name={"password"} label={"Password"} type={"password"} />

                                <Form.Check className="mb-3">
                                    <Form.Check.Input id={"remember"} checked={remember} onChange={()  => setRemember(!remember)} />
                                    <Form.Check.Label htmlFor={"remember"}>Remember Me</Form.Check.Label>
                                </Form.Check>

                                <Form.Group className="d-grid">
                                    <SubmitBtn disabled={formik.isSubmitting} label={"Log In"} icon={'fa-arrow-right-to-bracket'}/>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container></>
}