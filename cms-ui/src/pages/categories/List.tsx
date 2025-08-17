import { Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import http from "@/http";
import { DataTable, Loading } from "@/components";
import { dtFormat } from "@/library/function";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";

export const List: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);

        http.get('/cms/categories')
            .then(({ data }) => setCategories(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this category?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true);

                        http.delete(`/cms/categories/${id}`)
                            .then(() => http.get('/cms/categories'))
                            .then(({ data }) => setCategories(data))
                            .catch(() => {})
                            .finally(() => setLoading(false));
                    }
                },
                { label: 'No' }
            ]
        });
    };

    return loading ? <Loading /> : (
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Categories</h1>
                        </Col>
                        <Col xs="auto">
                            <Link to="/categories/create" className="btn btn-dark">
                                <i className="fa-solid fa-plus me-2"></i>Add Category
                            </Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable searchable={['Name']} data={categories.map(category => ({
                                'Name': category.name,
                                'Status': category.status ? 'Active' : 'Inactive',
                                'Created At': dtFormat(category.createdAt),
                                'Updated At': dtFormat(category.updatedAt),
                                'Actions': <>
                                    <Link to={`${category._id}/edit`} className="btn btn-dark btn-sm me-3" title="Edit">
                                        <i className='fa-solid fa-edit'></i>
                                    </Link>
                                    <Button variant='danger' size="sm" title='Delete' onClick={() => handleDelete(category._id)}>
                                        <i className="fa fa-solid fa-times"></i>
                                    </Button>
                                </>
                            }))} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
