import { Form } from "react-bootstrap";

export type DatePreset = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime' | 'custom'

interface Props {
  value: DatePreset
  onChange: (value: DatePreset) => void
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  vertical?: boolean
}

const labels: { key: DatePreset, label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'lifetime', label: 'Life Time' },
  { key: 'custom', label: 'Custom Range' },
]

export const DateFilterPanel: React.FC<Props> = ({ value, onChange, from, to, onFromChange, onToChange }) => (
  <div className="d-flex flex-column gap-2">
    <div style={{maxWidth: 220}}><Form.Select value={value} onChange={(e) => onChange(e.target.value as DatePreset)}>{labels.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</Form.Select></div>
    {value === 'custom' && <div className="d-flex flex-wrap gap-2"><Form.Control type="date" value={from} onChange={(e) => onFromChange(e.target.value)} /><Form.Control type="date" value={to} onChange={(e) => onToChange(e.target.value)} /></div>}
  </div>
)
