import { useFormik } from "formik";
import http from "@/http";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Container, Form, Row } from "react-bootstrap";
import {InputField, Loading, StatusField, SubmitBtn, FileField} from "@/components";
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
            image: [],
        },
        onSubmit: (data, { setSubmitting }) => {
            const formData = new FormData()
            formData.append("name", data.name as any)
            formData.append("status", String((data.status as any) == 1))
            if (data.image?.[0]) formData.append("image", data.image[0])
            // @ts-ignore
            data.status = data.status == 1;

            http.patch(`/cms/brands/${params.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
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
                image: [],
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
                                <FileField formik={formik} name="image" label="Image" accept="image/*" />
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
