import { useState, useEffect } from 'react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area
} from 'recharts'

const fmt$ = n => `$${Math.abs(Number(n||0)).toLocaleString()}`
const fmtK = n => {
  const v = Number(n||0)
  if (Math.abs(v) >= 1000000) return `${v<0?'-':''}$${(Math.abs(v)/1000000).toFixed(1)}M`
  if (Math.abs(v) >= 1000)    return `${v<0?'-':''}$${(Math.abs(v)/1000).toFixed(0)}K`
  return `${v<0?'-':''}$${Math.abs(v).toFixed(0)}`
}

const TipStyle = {
  background:'#07090f', border:'1px solid rgba(255,255,255,0.1)',
  color:'#e8edf8', fontSize:'12px', borderRadius:'8px', padding:'8px 12px'
}

function projectProperty(prop, years, settings) {
  const rentGrowth  = (settings.rentGrowthRate  || 4)  / 100
  const expGrowth   = (settings.expGrowthRate   || 3)  / 100
  const valueGrowth = (settings.valueGrowthRate || 3)  / 100
  const vacancy     = (settings.vacancyRate     || 5)  / 100

  const baseRent   = prop.income?.monthlyRent || 0
  const baseValue  = prop.currentValue || prop.purchasePrice || 0
  const loan       = prop.loan || {}
  const rate       = (loan.rate || 0) / 100 / 12
  const payment    = loan.monthlyPayment || 0
  let   loanBal    = loan.balance || loan.originalAmount || 0

  const baseTax   = prop.expenses?.propertyTax        || 0
  const baseIns   = prop.expenses?.insurance           || 0
  const mgmtPct   = (prop.expenses?.mgmtFee            || 0) / 100
  const baseMaint = (prop.expenses?.maintenanceActual  || 0) * 12
  const baseCapex = (prop.expenses?.capexActual        || 0) * 12
  const baseOther = (prop.expenses?.other              || 0) * 12

  const rows = []
  for (let yr = 1; yr <= years; yr++) {
    const rM = Math.pow(1 + rentGrowth,  yr - 1)
    const eM = Math.pow(1 + expGrowth,   yr - 1)
    const vM = Math.pow(1 + valueGrowth, yr)

    const annRent  = baseRent * 12 * rM * (1 - vacancy)
    const annOpEx  = (baseTax + baseIns) * eM + annRent * mgmtPct +
                     (baseMaint + baseCapex + baseOther) * eM
    const noi      = annRent - annOpEx

    let yearInt = 0, yearPrin = 0
    if (loanBal > 0 && rate > 0) {
      for (let m = 0; m < 12; m++) {
        const ic = loanBal * rate
        const pp = Math.min(payment - ic, loanBal)
        yearInt  += ic; yearPrin += pp; loanBal -= pp
        if (loanBal < 0) loanBal = 0
      }
    }

    const annDebt  = payment * 12
    const cashFlow = noi - annDebt
    const propVal  = baseValue * vM
    const equity   = propVal - loanBal

    rows.push({ year:yr, annRent:Math.round(annRent), annOpEx:Math.round(annOpEx),
      noi:Math.round(noi), annDebt:Math.round(annDebt), cashFlow:Math.round(cashFlow),
      propVal:Math.round(propVal), loanBal:Math.round(loanBal), equity:Math.round(equity) })
  }
  return rows
}

function projectPortfolio(props, years, settings) {
  if (!props.length) return []
  const all = props.map(p => projectProperty(p, years, settings))
  return Array.from({ length: years }, (_, i) => {
    return all.reduce((acc, rows) => {
      const r = rows[i] || {}
      return {
        year: i+1, annRent:  acc.annRent  + (r.annRent  ||0),
        annOpEx:  acc.annOpEx  + (r.annOpEx  ||0), noi:      acc.noi      + (r.noi      ||0),
        annDebt:  acc.annDebt  + (r.annDebt  ||0), cashFlow: acc.cashFlow + (r.cashFlow ||0),
        propVal:  acc.propVal  + (r.propVal  ||0), loanBal:  acc.loanBal  + (r.loanBal  ||0),
        equity:   acc.equity   + (r.equity   ||0),
      }
    }, { year:i+1,annRent:0,annOpEx:0,noi:0,annDebt:0,cashFlow:0,propVal:0,loanBal:0,equity:0 })
  })
}
