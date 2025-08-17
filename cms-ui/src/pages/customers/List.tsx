import { Button, Col, Container, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { UserData } from "@/library/interfaces"; // Reuse this if it fits customers, or create a CustomerData interface
import http from "@/http";
import { DataTable, Loading } from "@/components";
import { dtFormat } from "@/library/function";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";

export const List: React.FC = () => {
    const [customers, setCustomers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        http.get('/cms/customers')
            .then(({ data }) => setCustomers(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this customer?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true);
                        http.delete(`/cms/customers/${id}`)
                            .then(() => http.get('/cms/customers'))
                            .then(({ data }) => setCustomers(data))
                            .catch(() => {})
                            .finally(() => setLoading(false));
                    }
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        });
    };

    return loading ? <Loading /> : (
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Customers</h1>
                        </Col>
                        <Col xs="auto">
                            <Link to="/customers/create" className="btn btn-dark">
                                <i className="fa-solid fa-plus me-2"></i>Add Customer
                            </Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable
                                searchable={['Name', 'Email', 'Address']}
                                data={customers.map(customer => ({
                                    'Name': customer.name,
                                    'Email': customer.email,
                                    'Phone': customer.phone,
                                    'Address': customer.address,
                                    'Status': customer.status ? 'Active' : 'Inactive',
                                    'Created At': dtFormat(customer.createdAt),
                                    'Updated At': dtFormat(customer.updatedAt),
                                    'Actions': (
                                        <>
                                            <Link
                                                to={`${customer._id}/edit`}
                                                className="btn btn-dark btn-sm me-3"
                                                title="Edit"
                                            >
                                                <i className='fa-solid fa-edit'></i>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                type="button"
                                                size="sm"
                                                title="Delete"
                                                onClick={() => handleDelete(customer._id)}
                                            >
                                                <i className="fa fa-solid fa-times"></i>
                                            </Button>
                                        </>
                                    )
                                }))}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
