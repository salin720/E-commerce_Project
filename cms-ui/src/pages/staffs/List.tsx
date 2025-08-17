import {Button, Col, Container, Row} from "react-bootstrap"
import {useEffect, useState} from "react"
import {UserData} from "@/library/interfaces"
import http from "@/http"
import {DataTable, Loading} from "@/components"
import {dtFormat} from "@/library/function"
import {Link} from "react-router-dom"
import {confirmAlert} from "react-confirm-alert"

export const List: React.FC = () => {
    const [staffs, setStaffs] = useState<UserData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)

        http.get('/cms/staffs')
            .then(({data}) => {
                setStaffs(data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleDelete = (id: string) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this staff?',
            buttons: [
                {
                    label: 'Yes',
                    className: 'text-bg-danger',
                    onClick: () => {
                        setLoading(true)

                        http.delete(`/cms/staffs/${id}`)
                            .then(() => http.get('/cms/staffs/'))
                            .then(({data}) => setStaffs(data))
                            .catch(() => {})
                            .finally(() => setLoading(false))
                    }
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        })
    }

    return loading ? <Loading /> : <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Staffs</h1>
                        </Col>
                        <Col xs="auto">
                            <Link to="/staffs/create" className="btn btn-dark">
                                <i className="fa-solid fa-plus me-2"></i>Add Staff
                            </Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <DataTable searchable={['Name','Email','Address']} data={staffs.map(staff => ({
                                'Name': staff.name,
                                'Email': staff.email,
                                'Phone': staff.phone,
                                'Address': staff.address,
                                'Status': staff.status ? 'Active' : 'Inactive',
                                'Created At': dtFormat(staff.createdAt),
                                'Updated At': dtFormat(staff.updatedAt),
                                'Actions': <>
                                    <Link to={`${staff._id}/edit`} className="btn btn-dark btn-sm me-3" title="Edit">
                                        <i className='fa-solid fa-edit'></i>
                                    </Link>
                                    <Button variant='danger' type="button" size="sm" title='Delete' onClick={() => handleDelete(staff._id)} >
                                        <i className="fa fa-solid fa-times"></i>
                                    </Button>
                                 </>
                            }))} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </>
}