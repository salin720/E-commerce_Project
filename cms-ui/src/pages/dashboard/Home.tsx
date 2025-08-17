import {Container, Row, Col} from "react-bootstrap";

export const Home: React.FC = () => {
    return <>
        <Container>
            <Row>
                <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
                    <Row>
                        <Col>
                            <h1>Dashboard</h1>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    </>
}