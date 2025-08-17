import {Col, Row} from "react-bootstrap";

export const Loading: React.FC = () => {
    return <Row className=" justify-content-center align-items-center">
        <Col className="text-center my-5 py-3">
            <h4>
                <i className="fa-solid fa-spinner fa-spin me-2"></i>Loading...
            </h4>
        </Col>

    </Row>
}