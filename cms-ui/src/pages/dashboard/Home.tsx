import {Container, Row, Col, Form, Spinner} from "react-bootstrap";
import {useEffect, useMemo, useState} from "react";
import http from "@/http";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface Overview {
  productsAdded: number
  productsSold: number
  revenue: number
  newCustomers: number
  customersTotal: number
}

interface TimeseriesBucket {
  period: string
  productsAdded: number
  productsSold: number
  revenue: number
  newCustomers: number
  customersTotal: number
}

export const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [series, setSeries] = useState<TimeseriesBucket[]>([])
  const [option, setOption] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('daily')

  // derive range and interval from single selector per spec
  const { from, to, interval, label } = useMemo(() => {
    const now = new Date()
    let fromDate = new Date(now)
    let unit: 'day'|'week'|'month'|'year' = 'day'
    let label = ''

    switch(option){
      case 'daily':
        fromDate = new Date(now.getTime() - 30*24*60*60*1000) // last 30 days
        unit = 'day'
        label = 'Last 30 days · Daily'
        break
      case 'weekly':
        fromDate = new Date(now.getTime() - 12*7*24*60*60*1000) // last 12 weeks
        unit = 'week'
        label = 'Last 12 weeks · Weekly'
        break
      case 'monthly':
        // approx last 12 months
        fromDate = new Date(now)
        fromDate.setMonth(fromDate.getMonth() - 12)
        unit = 'month'
        label = 'Last 12 months · Monthly'
        break
      case 'yearly':
        fromDate = new Date(now)
        fromDate.setFullYear(fromDate.getFullYear() - 10) // last 10 years
        unit = 'year'
        label = 'Last 10 years · Yearly'
        break
      case 'lifetime':
        fromDate = new Date('1970-01-01T00:00:00.000Z')
        unit = 'year' // aggregate by year over full history
        label = 'Life Time · Yearly'
        break
    }

    return { from: fromDate.toISOString(), to: now.toISOString(), interval: unit, label }
  }, [option])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      http.get('/cms/analytics/overview', { params: { from, to } }),
      http.get('/cms/analytics/timeseries', { params: { from, to, interval } })
    ])
      .then(([ovr, ts]) => {
        setOverview(ovr.data as Overview)
        const buckets = (ts.data?.buckets || []) as TimeseriesBucket[]
        setSeries(buckets)
      })
      .finally(() => setLoading(false))
  }, [from, to, interval])

  const currency = (n?: number) => (n ?? 0).toLocaleString('ne-NP', { style: 'currency', currency: 'NPR' })

  return <>
    <Container>
      <Row>
        <Col className="my-3 py-3 bg-white rounded-2 shadow-sm">
          <Row className="align-items-center">
            <Col>
              <h1 className="mb-0">Dashboard</h1>
              <div className="text-muted small">{label}</div>
            </Col>
            <Col xs="auto">
              <Form.Select value={option} onChange={e => setOption(e.target.value as any)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Life Time</option>
              </Form.Select>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="g-3">
        {loading && (
          <Col className="text-center py-5">
            <Spinner animation="border" />
          </Col>
        )}

        {!loading && overview && (
          <>
            <Col md={3}>
              <div className="p-3 bg-white rounded-2 shadow-sm">
                <div className="text-muted">Products Added</div>
                <div className="fs-3 fw-semibold">{overview.productsAdded}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 bg-white rounded-2 shadow-sm">
                <div className="text-muted">Products Sold</div>
                <div className="fs-3 fw-semibold">{overview.productsSold}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 bg-white rounded-2 shadow-sm">
                <div className="text-muted">Revenue</div>
                <div className="fs-3 fw-semibold">{currency(overview.revenue)}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 bg-white rounded-2 shadow-sm">
                <div className="text-muted">New Customers</div>
                <div className="fs-3 fw-semibold">{overview.newCustomers}</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="p-3 bg-white rounded-2 shadow-sm">
                <div className="text-muted">Customers Total</div>
                <div className="fs-3 fw-semibold">{overview.customersTotal}</div>
              </div>
            </Col>
          </>
        )}

        {!loading && !overview && (
          <Col className="text-center py-5">
            <div>No data available for the selected period.</div>
          </Col>
        )}
      </Row>

      {/* Charts */}
      {!loading && series?.length > 0 && (
        <>
          <Row className="g-3 mt-1">
            <Col md={6}>
              <div className="p-3 bg-white rounded-2 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Revenue over time</h5>
                </div>
                <div style={{height: 280}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v)=> (v??0).toLocaleString('ne-NP')} tick={{ fontSize: 11 }}/>
                      <Tooltip formatter={(v: any)=> currency(Number(v))} labelFormatter={(l)=> `Period: ${l}`}/>
                      <Area type="monotone" dataKey="revenue" stroke="#0d6efd" fillOpacity={1} fill="url(#rev)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="p-3 bg-white rounded-2 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Products: Added vs Sold</h5>
                </div>
                <div style={{height: 280}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(l)=> `Period: ${l}`} />
                      <Legend />
                      <Bar dataKey="productsAdded" name="Added" fill="#6c757d" />
                      <Bar dataKey="productsSold" name="Sold" fill="#198754" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col>
              <div className="p-3 bg-white rounded-2 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Customers Total</h5>
                </div>
                <div style={{height: 280}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(l)=> `Period: ${l}`} />
                      <Line type="monotone" dataKey="customersTotal" stroke="#6610f2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
          </Row>

          {/* Tabular fallback for detailed inspection */}
          <Row className="mt-3">
            <Col className="p-3 bg-white rounded-2 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Activity over time</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Products Added</th>
                      <th>Products Sold</th>
                      <th>Revenue</th>
                      <th>New Customers</th>
                      <th>Customers Total</th>
                    </tr>
                  </thead>
                  <tbody>
                  {series.map((b) => (
                    <tr key={b.period}>
                      <td>{b.period}</td>
                      <td>{b.productsAdded ?? 0}</td>
                      <td>{b.productsSold ?? 0}</td>
                      <td>{currency(b.revenue)}</td>
                      <td>{b.newCustomers ?? 0}</td>
                      <td>{b.customersTotal ?? 0}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </>
      )}

      {!loading && series?.length === 0 && (
        <Row className="mt-3">
          <Col className="p-3 bg-white rounded-2 shadow-sm text-center text-muted">
            No activity in the selected period.
          </Col>
        </Row>
      )}
    </Container>
  </>
}