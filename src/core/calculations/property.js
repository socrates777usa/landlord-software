// ============================================================
// ACME Landlord Software — Core Financial Calculations
// All math lives here. Shared by browser app AND mobile app.
// ============================================================

export function calcMonthlyPayment(principal, annualRate, termYears) {
  if (!principal || !annualRate || !termYears) return 0
  const r = annualRate / 100 / 12
  const n = termYears * 12
  if (r === 0) return principal / n
  return parseFloat((principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1)).toFixed(2))
}

export function calcProperty(property) {
  const { income = {}, expenses = {}, loan = {} } = property
  const monthlyRent     = income.monthlyRent      || 0
  const vacancyRate     = income.vacancyRate       ?? 5
  const effectiveIncome = monthlyRent * (1 - vacancyRate / 100)
  const propTaxMonthly  = (expenses.propertyTax   || 0) / 12
  const insuranceMonthly= (expenses.insurance     || 0) / 12
  const totalExpenses   = propTaxMonthly + insuranceMonthly +
    (expenses.hoa||0) + (expenses.mgmtFee||0) + (expenses.maintenanceActual||0) +
    (expenses.capexActual||0) + (expenses.utilities||0) + (expenses.other||0)
  const noiMonthly      = effectiveIncome - totalExpenses
  const noiAnnual       = noiMonthly * 12
  const monthlyPayment  = loan.monthlyPayment ||
    calcMonthlyPayment(loan.balance||0, loan.rate||0, loan.term||30)
  const annualDebtService = monthlyPayment * 12
  const cashFlowMonthly = noiMonthly - monthlyPayment
  const cashFlowAnnual  = cashFlowMonthly * 12
  const dscr = annualDebtService > 0
    ? parseFloat((noiAnnual / annualDebtService).toFixed(2)) : null
  const currentValue  = property.currentValue || 0
  const loanBalance   = loan.balance          || 0
  const equity        = currentValue - loanBalance
  const ltv           = currentValue > 0 ? (loanBalance / currentValue) * 100 : 0
  const capRate       = currentValue > 0 ? (noiAnnual  / currentValue) * 100 : 0
  const cashInvested  = (property.purchasePrice||currentValue) - (loan.originalAmount||0)
  const cocReturn     = cashInvested > 0 ? (cashFlowAnnual / cashInvested) * 100 : 0
  return { effectiveIncome, totalExpenses, noiMonthly, noiAnnual,
    monthlyPayment, annualDebtService, cashFlowMonthly, cashFlowAnnual,
    dscr, equity, ltv, capRate, cocReturn, loanBalance, currentValue }
}

export function calcPortfolio(properties) {
  const calcs = properties.map(p => ({ ...p, c: calcProperty(p) }))
  const valid = calcs.filter(p => p.c.dscr !== null)
  return {
    totalIncome:   calcs.reduce((s,p) => s + (p.income?.monthlyRent||0), 0),
    totalDebt:     calcs.reduce((s,p) => s + p.c.monthlyPayment, 0),
    totalCashFlow: calcs.reduce((s,p) => s + p.c.cashFlowMonthly, 0),
    totalEquity:   calcs.reduce((s,p) => s + p.c.equity, 0),
    totalValue:    calcs.reduce((s,p) => s + p.c.currentValue, 0),
    totalBalance:  calcs.reduce((s,p) => s + p.c.loanBalance, 0),
    avgDSCR: valid.length > 0
      ? parseFloat((valid.reduce((s,p)=>s+p.c.dscr,0)/valid.length).toFixed(2)) : null,
    occupied:   properties.filter(p=>p.status==='active').length,
    vacant:     properties.filter(p=>p.status==='vacant').length,
    renovation: properties.filter(p=>p.status==='renovation').length,
    properties: calcs,
  }
}
