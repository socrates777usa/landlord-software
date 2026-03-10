import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, DollarSign } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { fmtDate, fmt$ } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

export default function FinancialList() {
  const [txns, setTxns]             = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.TRANSACTIONS), getAll(STORES.PROPERTIES)])
      .then(([t, p]) => { setTxns([...t].sort((a,b)=>b.date?.localeCompare(a.date||'')||0)); setProperties(p); setLoading(false) })
  }, [])

  if (loading) return <div className="page-loading">Loading transactions...</div>

  const propMap = Object.fromEntries(properties.map(p => [p.id, p]))
  const totalIncome  = txns.filter(t=>t.txType==='income').reduce((s,t)=>s+(parseFloat(t.amount)||0),0)
  const totalExpense = txns.filter(t=>t.txType==='expense').reduce((s,t)=>s+(parseFloat(t.amount)||0),0)

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Financials</h1>
          <p className="list-sub">{txns.length} transaction{txns.length!==1?'s':''} &nbsp;|&nbsp;
            <span className="clr-pos">In: {fmt$(totalIncome)}</span> &nbsp;|&nbsp;
            <span className="clr-neg">Out: {fmt$(totalExpense)}</span> &nbsp;|&nbsp;
            <span className={totalIncome-totalExpense>=0?'clr-pos':'clr-neg'}>Net: {fmt$(totalIncome-totalExpense)}</span>
          </p>
        </div>
        <button className="btn-add" onClick={() => navigate('/financials/new')}><Plus size={16}/> Add Transaction</button>
      </div>

      {txns.length === 0 ? (
        <div className="list-empty">
          <DollarSign size={48} className="list-empty-icon"/>
          <h3>No transactions yet</h3>
          <p>Log income and expenses to track your portfolio financials.</p>
          <button className="btn-add" onClick={() => navigate('/financials/new')}><Plus size={16}/> Add Transaction</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Property</th>
                <th>Description</th>
                <th className="r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => {
                const isIncome = t.txType === 'income'
                const prop = propMap[t.propertyId]
                return (
                  <tr key={t.id} className="list-row" onClick={() => navigate(`/financials/${t.id}`)}>
                    <td>{fmtDate(t.date)}</td>
                    <td><span className={`badge ${isIncome?'badge-green':'badge-red'}`}>{isIncome?'Income':'Expense'}</span></td>
                    <td>{t.category || '—'}</td>
                    <td>{prop?.nickname || prop?.address?.street || '—'}</td>
                    <td><div className="cell-main">{t.description || '—'}</div></td>
                    <td className={`r ${isIncome?'clr-pos':'clr-neg'}`}>
                      {isIncome?'+':'-'}{fmt$(Math.abs(parseFloat(t.amount)||0))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
