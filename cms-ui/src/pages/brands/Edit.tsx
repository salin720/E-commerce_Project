import { useFormik } from "formik";
import http from "@/http";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Container, Form, Row } from "react-bootstrap";
import {InputField, Loading, StatusField, SubmitBtn} from "@/components";
import { useEffect, useState } from "react";

export const Edit: React.FC = () => {
    const [brand, setBrand] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const params = useParams();

    const formik = useFormik({
        initialValues: {
            name: '',
            status: 1,
        },
        onSubmit: (data, { setSubmitting }) => {
            // @ts-ignore
            data.status = data.status == 1;

            http.patch(`/cms/brands/${params.id}`, data)
                .then(() => navigate('/brands'))
                .catch(({ response: { data } }) => {
                    if (data?.validation) {
                        formik.setErrors(data.validation);
                    }
                })
                .finally(() => setSubmitting(false));
        }
    });

    useEffect(() => {
        setLoading(true);

        http.get(`/cms/brands/${params.id}`)
            .then(({ data }) => setBrand(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (brand) {
            formik.setValues({
                name: brand.name,
                status: brand.status ? 1 : 0,
            });
        }
    }, [brand]);

    return loading ? <Loading /> : (
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Edit Brand</h1>
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
