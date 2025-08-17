import { useFormik } from "formik";
import http from "@/http";
import { useNavigate } from "react-router-dom";
import { Col, Container, Form, Row } from "react-bootstrap";
import {InputField, StatusField, SubmitBtn} from "@/components";

export const Create: React.FC = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            status: 1,
        },
        onSubmit: (data, { setSubmitting }) => {
            // @ts-ignore
            data.status = data.status == 1;

            http.post('/cms/categories', data)
                .then(() => navigate('/categories'))
                .catch(({ response: { data } }) => {
                    if (data?.validation) {
                        formik.setErrors(data.validation);
                    }
                })
                .finally(() => setSubmitting(false));
        }
    });

    return (
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Add Category</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form onSubmit={formik.handleSubmit}>
                                <InputField formik={formik} name="name" label="Name" />
                                <StatusField formik={formik} />
                                <SubmitBtn disabled={formik.isSubmitting} />
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
