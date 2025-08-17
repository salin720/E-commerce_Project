import { Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import http from "@/http";
import { DataTable, Loading } from "@/components";
import { dtFormat } from "@/library/function";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";

export const List: React.FC = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);

        http.get('/cms/brands')
            .then(({ data }) => setBrands(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this brand?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true);

                        http.delete(`/cms/brands/${id}`)
                            .then(() => http.get('/cms/brands'))
                            .then(({ data }) => setBrands(data))
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
                            <h1>Brands</h1>
                        </Col>
                        <Col xs="auto">
                            <Link to="/brands/create" className="btn btn-dark">
                                <i className="fa-solid fa-plus me-2"></i>Add Brand
                            </Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable searchable={['Name']} data={brands.map(brand => ({
                                'Name': brand.name,
                                'Status': brand.status ? 'Active' : 'Inactive',
                                'Created At': dtFormat(brand.createdAt),
                                'Updated At': dtFormat(brand.updatedAt),
                                'Actions': <>
                                    <Link to={`${brand._id}/edit`} className="btn btn-dark btn-sm me-3" title="Edit">
                                        <i className='fa-solid fa-edit'></i>
                                    </Link>
                                    <Button variant='danger' size="sm" title='Delete' onClick={() => handleDelete(brand._id)}>
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
