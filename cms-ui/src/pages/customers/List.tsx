import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import { UserData } from "@/library/interfaces"
import http from "@/http";
import { Loading, DateFilterPanel } from "@/components";
import { dtFormat, imgUrl } from "@/library/function";
import { confirmAlert } from "react-confirm-alert";

const withinRange = (date:string, preset:string, from:string, to:string) => { const d = new Date(date).getTime(); const now = new Date(); if (preset === 'custom' && from && to) return d >= new Date(from).setHours(0,0,0,0) && d <= new Date(to).setHours(23,59,59,999); const days = preset === 'daily' ? 1 : preset === 'weekly' ? 7 : preset === 'monthly' ? 31 : preset === 'yearly' ? 366 : Infinity; return preset === 'lifetime' ? true : d >= now.getTime() - days*24*60*60*1000; }

export const List: React.FC = () => {
  const [items, setItems] = useState<UserData[]>([] as any);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState<any>('daily');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [visible, setVisible] = useState(12);
  useEffect(() => { setLoading(true); http.get('/cms/customers').then(({data}) => setItems(data)).finally(() => setLoading(false)); }, []);
  const reload = () => http.get('/cms/customers').then(({data}) => setItems(data));
  const handleDelete = (id:string) => confirmAlert({ title:'Confirm Delete', message:'Are you sure want to delete?', buttons:[{ label:'Yes', className:'text-bg-danger', onClick:() => { setLoading(true); http.delete(`/cms/customers/${id}`).then(reload).finally(() => setLoading(false)); } }, { label:'No' }] });
  const filtered = useMemo(() => (items as any[]).filter(item => { const q = term.trim().toLowerCase(); const hay = [item.name,item.email,item.phone,item.address].filter(Boolean).join(' ').toLowerCase(); return (!q || hay.includes(q)) && withinRange(item.updatedAt || item.createdAt, filter, from, to); }), [items, term, filter, from, to]);
  return loading ? <Loading /> : <Container><Row><Col className="page-card"><div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4"><div><h1>Customers</h1></div><div className="d-flex flex-column gap-2" style={{minWidth:320}}><Form.Control className="quick-search-input" placeholder="Search customers" value={term} onChange={e=>{setTerm(e.target.value); setVisible(12)}} /></div></div><div className="mb-4"><DateFilterPanel value={filter} onChange={setFilter} from={from} to={to} onFromChange={setFrom} onToChange={setTo} vertical /></div><div className="entity-grid">{filtered.slice(0, visible).map((item:any) => <div className="entity-card" key={item._id}><div className="entity-card-head"><img src={item.avatar ? imgUrl(item.avatar) : '/avatar.png'} className="entity-thumb" /><div className="flex-grow-1"><h4 className="mb-1">{item.name}</h4><div className="meta">{item.email || 'Customer'}</div><p className="desc-clamp mt-2 mb-2">{item.address || item.phone || 'Customer account'}</p><div className="meta">Created {dtFormat(item.createdAt)} • Updated {dtFormat(item.updatedAt)}</div></div></div><div className="entity-actions"><Button variant="link" className="action-icon-btn danger p-0" title="Remove" onClick={() => handleDelete(item._id)}><i className="fa-solid fa-trash"></i></Button></div></div>)}</div>{filtered.length > visible && <div className="text-center mt-4"><button className="btn btn-outline-dark rounded-pill px-4" onClick={() => setVisible(v => v + 12)}>Load More</button></div>}</Col></Row></Container>
};
