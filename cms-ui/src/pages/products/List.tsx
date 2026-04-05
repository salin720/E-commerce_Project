import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { useEffect, useMemo, useState } from "react"
import { ProductData } from "@/library/interfaces"
import http from "@/http"
import { Loading, DateFilterPanel } from "@/components"
import { dtFormat, imgUrl } from "@/library/function"
import { Link } from "react-router-dom"
import { confirmAlert } from "react-confirm-alert"

const withinRange = (date:string, preset:string, from:string, to:string) => {
  const d = new Date(date).getTime();
  const now = new Date();
  if (preset === 'custom' && from && to) return d >= new Date(from).setHours(0,0,0,0) && d <= new Date(to).setHours(23,59,59,999)
  const days = preset === 'daily' ? 1 : preset === 'weekly' ? 7 : preset === 'monthly' ? 31 : preset === 'yearly' ? 366 : Infinity
  return preset === 'lifetime' ? true : d >= now.getTime() - days*24*60*60*1000
}

export const List: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [term, setTerm] = useState('')
  const [filter, setFilter] = useState<any>('daily')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [visible, setVisible] = useState(12)
  useEffect(() => { setLoading(true); http.get('/cms/products').then(({ data }) => setProducts(data)).finally(() => setLoading(false)) }, [])
  const reload = () => http.get('/cms/products/').then(({ data }) => setProducts(data))
  const handleDelete = (id: string) => confirmAlert({ title: 'Confirm Delete', message: 'Are you sure want to delete this product?', buttons: [{ label: 'Yes', className: 'text-bg-danger', onClick: () => { setLoading(true); http.delete(`/cms/products/${id}`).then(reload).finally(() => setLoading(false)) } }, { label: 'No' }] })
  const filtered = useMemo(() => products.filter(product => {
    const q = term.trim().toLowerCase()
    const matches = !q || [product.name, product.category?.name, product.brand?.name, product.shortDescription].filter(Boolean).join(' ').toLowerCase().includes(q)
    const matchesDate = withinRange(product.updatedAt || product.createdAt, filter, from, to)
    return matches && matchesDate
  }), [products, term, filter, from, to])
  const suggestions = useMemo(() => term.trim() ? filtered.slice(0,5) : [], [filtered, term])
  return loading ? <Loading /> : <Container><Row><Col className="page-card">
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4"><div><h1 className="mb-1">Products</h1><div className="text-muted">Manage catalog, stock, sales and visibility from one place.</div></div><div className="d-flex flex-column align-items-stretch gap-2" style={{minWidth: 320}}><div className="quick-search-wrap"><Form.Control className="quick-search-input" placeholder="Search products" value={term} onChange={e => { setTerm(e.target.value); setVisible(12) }} />{suggestions.length > 0 && <div className="quick-search-dropdown">{suggestions.map(item => <button key={item._id} type="button" className="quick-search-option" onClick={() => setTerm(item.name)}><img src={item.images?.[0] ? imgUrl(item.images[0]) : '/avatar.png'} /><div><div className="fw-semibold">{item.name}</div><div className="small text-muted">{item.brand?.name || item.category?.name || 'Product'}</div></div></button>)}</div>}</div><Link to="/products/create" className="btn btn-dark rounded-pill"><i className="fa-solid fa-plus me-2"></i>Add Product</Link></div></div>
    <div className="mb-4"><DateFilterPanel value={filter} onChange={v=>{setFilter(v); setVisible(12)}} from={from} to={to} onFromChange={setFrom} onToChange={setTo} vertical /></div>
    <div className="entity-grid">{filtered.slice(0, visible).map(product => { const realPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price; const discount = product.discountedPrice > 0 && product.price > 0 ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0; return <div className="entity-card" key={product._id}><div className="entity-card-head"><img src={product.images?.[0] ? imgUrl(product.images[0]) : '/avatar.png'} className="entity-thumb" /><div className="flex-grow-1"><div className="d-flex justify-content-between gap-2 align-items-start"><h4 className="mb-1">{product.name}</h4><span className="badge text-bg-dark rounded-pill">{product.stock || 0} stock</span></div><div className="meta">{product.category?.name} • {product.brand?.name}</div><p className="desc-clamp mt-2 mb-2">{product.shortDescription}</p><div className="d-flex align-items-center gap-2 flex-wrap"><span className="fw-bold fs-4">Rs. {realPrice}</span>{product.discountedPrice > 0 && <span className="text-decoration-line-through text-muted">Rs. {product.price}</span>}{discount > 0 && <span className="badge rounded-pill text-bg-warning">{discount}% OFF</span>}<span className="ms-auto text-muted">Sold {product.totalSold || 0}</span></div><div className="meta mt-2">Updated {dtFormat(product.updatedAt)}</div></div></div><div className="entity-actions"><Link to={`${product._id}/edit`} className="action-icon-btn dark" title="Edit"><i className="fa-solid fa-pen"></i></Link><Button variant="link" className="action-icon-btn danger p-0" title="Delete" onClick={() => handleDelete(product._id)}><i className="fa-solid fa-trash"></i></Button></div></div>})}</div>
    {filtered.length > visible && <div className="text-center mt-4"><button className="btn btn-outline-dark rounded-pill px-4" onClick={() => setVisible(v => v + 12)}>Load More</button></div>}
  </Col></Row></Container>
}
