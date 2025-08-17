import {Col, Container, Row, Form,} from "react-bootstrap";
import {UserFormData, UserType} from "@/library/interfaces"
import {useDispatch, useSelector} from "react-redux"
import {useFormik} from "formik"
import {ProfileFormValidation} from "@/library/validations"
import {InputField, SubmitBtn} from "@/components";
import http from "@/http";
import {setUser} from "@/store";

export const Edit: React.FC = ()=> {
    const user: UserType = useSelector((state: any) => state.user.value)

    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            name: user?.name,
            phone: user?.phone,
            address: user?.address
        } as UserFormData,
        validationSchema: ProfileFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            http.patch('/profile/update', data)
                .then(() => {
                    return http.get(`/profile/details`)
                })
                .then(() => {
                    dispatch(setUser(data))
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
                            <h1>Edit Profile</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form onSubmit={formik.handleSubmit}>

                                <InputField formik={formik} name="name" label="Name" />

                                <InputField formik={formik} name="phone" label="Phone" />

                                <InputField formik={formik} name="address" label="Address" as="textarea" />

                                <SubmitBtn disabled={formik.isSubmitting} />
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </>
}