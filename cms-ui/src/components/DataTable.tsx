import {DataTableProps} from "@/library/interfaces"
import {Button, Col, Form, Pagination, Row, Table} from "react-bootstrap"
import {useEffect, useMemo, useState} from "react";

export const DataTable: React.FC<DataTableProps> = ({data, searchable = [], pageSize = 15}) => {
    const [term, setTerm] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const filtered = useMemo(() => {
        if (!term.trim()) return data
        return data.filter(item => Object.keys(item).some(k => searchable.includes(k) && `${item[k]}`.toLowerCase().includes(term.toLowerCase())))
    }, [term, data, searchable])
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const visible = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize])
    useEffect(() => setPage(1), [term, data])

    return <>
        <Row className="align-items-center mb-3 g-2">
            {searchable.length > 0 && <Col md={4} xl={3} className="ms-auto"><Form.Control placeholder="Search" value={term} onChange={({target: {value}}) => setTerm(value)} /></Col>}
        </Row>
        <Row><Col>
            {filtered.length > 0 ? <>
                <div className="table-responsive"><Table hover className="align-middle admin-table-real bg-white rounded-3 overflow-hidden">
                    <thead><tr>{Object.keys(data[0]).map((key: string, i: number) => <th key={i}>{key}</th>)}</tr></thead>
                    <tbody>{visible.map((item, i) => <tr key={i}>{Object.values(item).map((value, j) => (<td key={j}>{value}</td>))}</tr>)}</tbody>
                </Table></div>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="small text-muted">Showing {(page-1)*pageSize + 1} - {Math.min(page*pageSize, filtered.length)} of {filtered.length}</div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-dark" size="sm" disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))}>Previous</Button>
                        <Pagination className="mb-0">{Array.from({length: totalPages}).slice(0, 5).map((_, idx) => <Pagination.Item key={idx} active={page===idx+1} onClick={() => setPage(idx+1)}>{idx+1}</Pagination.Item>)}</Pagination>
                        <Button variant="outline-dark" size="sm" disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</Button>
                    </div>
                </div>
            </> : <h4 className="text-center text-muted fst-italic py-4">The list is empty!</h4>}
        </Col></Row>
    </>
}
