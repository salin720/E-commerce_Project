import {DataListType, DataTableProps} from "@/library/interfaces"
import {Col, Form, Row, Table} from "react-bootstrap"
import {useEffect, useState} from "react";
export const DataTable: React.FC<DataTableProps> = ({data, searchable = []}) => {
    const [term, setTerm] = useState<string>('')
    const [filtered, setFiltered] = useState<DataListType>([])

    useEffect(() => {
        if(term.length > 0){
            let temp = data.filter(item => {
                for(let k in item){
                    if(searchable.includes(k) && `${item[k]}`.toLowerCase().includes(term.toLowerCase())) {
                        return true
                    }
                }
                return false
            })

            setFiltered(temp)
        } else {
            setFiltered(data)
        }
    }, [term, data]);

    return <>
    {searchable.length > 0 && <Row>
            <Col md={4} xl={3} className="ms-auto mb-3">
                <Form.Control
                    placeholder="Search"
                    value={term}
                    onChange={({target: {value}}) => setTerm(value)}
                />
            </Col>
        </Row>}
        <Row>
            <Col>
                {filtered.length > 0 ? <Table striped bordered hover size="sm">
                    <thead className="table-dark">
                    <tr>
                        {Object.keys(data[0]).map((key: string, i: number) => <th key={i}>{key}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((item, i) => <tr key={i}>
                            {Object.values(item).map((value, j) => (<td key={j}>{value}</td>))}
                        </tr>
                    ) }
                    </tbody>
                </Table> : <h4 className="text-center text-muted fst-italic">
                    The list is empty!
                </h4>}
            </Col>
        </Row>
    </>
}