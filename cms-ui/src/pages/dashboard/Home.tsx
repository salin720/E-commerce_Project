import {Container, Row, Col, Form, Spinner, Table, Button} from "react-bootstrap";
import {useEffect, useMemo, useState} from "react";
import http from "@/http";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {OrderData, ProductData} from "@/library/interfaces";
import {dtFormat} from "@/library/function";

interface Overview { productsAdded: number; productsSold: number; revenue: number; newCustomers: number; customersTotal: number; ordersCount: number }
interface TimeseriesBucket { period: string; productsAdded: number; productsSold: number; revenue: number; newCustomers: number; customersTotal: number; ordersCount: number }

export const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [series, setSeries] = useState<TimeseriesBucket[]>([])
  const [latestProducts, setLatestProducts] = useState<ProductData[]>([])
  const [latestOrders, setLatestOrders] = useState<OrderData[]>([])
  const [option, setOption] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime' | 'custom'>('daily')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [visibleProducts, setVisibleProducts] = useState(15)
  const [visibleOrders, setVisibleOrders] = useState(15)
  const { from, to, interval, label } = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23,59,59,999)
    let fromDate = new Date(now);
    let unit: 'day'|'week'|'month'|'year' = 'day';
    let label = '';
    switch(option){
      case 'daily': fromDate.setHours(0,0,0,0); unit = 'day'; label = 'Today'; break;
      case 'weekly': fromDate = new Date(end.getTime() - 6*24*60*60*1000); fromDate.setHours(0,0,0,0); unit = 'day'; label = 'Last 7 days'; break;
      case 'monthly': fromDate = new Date(end.getTime() - 29*24*60*60*1000); fromDate.setHours(0,0,0,0); unit = 'day'; label = 'Last 30 days'; break;
      case 'yearly': fromDate = new Date(end.getTime() - 364*24*60*60*1000); fromDate.setHours(0,0,0,0); unit = 'month'; label = 'Last 365 days'; break;
      case 'lifetime': fromDate = new Date('1970-01-01T00:00:00.000Z'); unit = 'year'; label = 'Life Time'; break;
      case 'custom': {
        fromDate = customFrom ? new Date(customFrom) : new Date(end.getTime() - 29*24*60*60*1000);
        fromDate.setHours(0,0,0,0);
        const customEnd = customTo ? new Date(customTo) : end;
        customEnd.setHours(23,59,59,999);
        return { from: fromDate.toISOString(), to: customEnd.toISOString(), interval: 'day' as const, label: customFrom && customTo ? `Custom range · ${customFrom} to ${customTo}` : 'Custom range' }
      }
    }
    return { from: fromDate.toISOString(), to: end.toISOString(), interval: unit, label }
  }, [option, customFrom, customTo])
  useEffect(() => {
    setLoading(true)
    setVisibleProducts(15)
    setVisibleOrders(15)
    Promise.all([http.get('/cms/analytics/overview', { params: { from, to } }), http.get('/cms/analytics/timeseries', { params: { from, to, interval } }), http.get('/cms/products'), http.get('/cms/orders')])
      .then(([ovr, ts, products, orders]) => {
        setOverview(ovr.data as Overview)
        setSeries((ts.data?.buckets || []) as TimeseriesBucket[])
        const pList = (products.data || []).filter((item: ProductData) => new Date(item.createdAt) >= new Date(from) && new Date(item.createdAt) <= new Date(to)).sort((a: ProductData,b: ProductData) => +new Date(b.createdAt) - +new Date(a.createdAt))
        const oList = (orders.data || []).filter((item: OrderData) => new Date(item.createdAt) >= new Date(from) && new Date(item.createdAt) <= new Date(to)).sort((a: OrderData,b: OrderData) => +new Date(b.createdAt) - +new Date(a.createdAt))
        setLatestProducts(option === 'lifetime' ? (products.data || []).sort((a: ProductData,b: ProductData) => +new Date(b.createdAt) - +new Date(a.createdAt)) : pList)
        setLatestOrders(option === 'lifetime' ? (orders.data || []).sort((a: OrderData,b: OrderData) => +new Date(b.createdAt) - +new Date(a.createdAt)) : oList)
      })
      .finally(() => setLoading(false))
  }, [from, to, interval, option])
  const currency = (n?: number) => (n ?? 0).toLocaleString('ne-NP', { style: 'currency', currency: 'NPR' })
  return <Container fluid><Row><Col className="page-card"><Row className="align-items-center"><Col><h1 className="mb-0">Dashboard</h1><div className="text-muted small">{label}</div></Col><Col xs="auto"><div className="d-flex flex-column gap-2"><Form.Select value={option} onChange={e => setOption(e.target.value as any)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="lifetime">Life Time</option><option value="custom">Custom Range</option></Form.Select>{option === 'custom' && <div className="d-flex gap-2"><Form.Control type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} /><Form.Control type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} /></div>}</div></Col></Row></Col></Row>
      <Row className="g-3 mt-1">{loading ? <Col className="text-center py-5"><Spinner animation="border" /></Col> : overview && <>{[['Products Added', overview.productsAdded], ['Products Sold', overview.productsSold], ['Revenue', currency(overview.revenue)], ['Orders', overview.ordersCount], ['New Customers', overview.newCustomers], ['Customers Total', overview.customersTotal]].map((item, idx) => <Col md={3} key={idx}><div className="metric-card"><div className="text-muted">{item[0] as string}</div><div className="fs-3 fw-semibold">{item[1] as any}</div></div></Col>)}</>}</Row>
      {!loading && series?.length > 0 && <><Row className="g-3 mt-1"><Col md={6}><div className="page-card h-100"><h5 className="mb-3">Revenue over time</h5><div style={{height: 280}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={series}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d6efd" stopOpacity={0.35}/><stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v)=> (v??0).toLocaleString('ne-NP')} tick={{ fontSize: 11 }}/><Tooltip formatter={(v: any)=> currency(Number(v))} /><Area type="monotone" dataKey="revenue" stroke="#0d6efd" fillOpacity={1} fill="url(#rev)"/></AreaChart></ResponsiveContainer></div></div></Col><Col md={6}><div className="page-card h-100"><h5 className="mb-3">Products: Added vs Sold</h5><div style={{height: 280}}><ResponsiveContainer width="100%" height="100%"><BarChart data={series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend /><Bar dataKey="productsAdded" name="Added" fill="#6c757d" /><Bar dataKey="productsSold" name="Sold" fill="#198754" /></BarChart></ResponsiveContainer></div></div></Col></Row><Row className="g-3 mt-1"><Col><div className="page-card h-100"><h5 className="mb-3">Customers Total</h5><div style={{height: 280}}><ResponsiveContainer width="100%" height="100%"><LineChart data={series}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="customersTotal" stroke="#6610f2" dot={false} /></LineChart></ResponsiveContainer></div></div></Col></Row></>}
      <Row className="g-3 mt-1"><Col lg={6}><div className="page-card"><div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Latest Added Products</h5></div><Table hover responsive><thead><tr><th>Name</th><th>Stock</th><th>Created</th></tr></thead><tbody>{latestProducts.slice(0, visibleProducts).map(item => <tr key={item._id}><td>{item.name}</td><td>{item.stock || 0}</td><td>{dtFormat(item.createdAt)}</td></tr>)}</tbody></Table>{latestProducts.length > visibleProducts && <div className="text-center"><Button variant="outline-dark" size="sm" onClick={() => setVisibleProducts(v => v + 15)}>See More</Button></div>}</div></Col><Col lg={6}><div className="page-card"><div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Latest Orders</h5></div><Table hover responsive><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Created</th></tr></thead><tbody>{latestOrders.slice(0, visibleOrders).map(item => <tr key={item._id}><td>#{item._id.slice(-8).toUpperCase()}</td><td>{item.user?.name}</td><td>{item.status}</td><td>{dtFormat(item.createdAt)}</td></tr>)}</tbody></Table>{latestOrders.length > visibleOrders && <div className="text-center"><Button variant="outline-dark" size="sm" onClick={() => setVisibleOrders(v => v + 15)}>See More</Button></div>}</div></Col></Row>
  </Container>
}
