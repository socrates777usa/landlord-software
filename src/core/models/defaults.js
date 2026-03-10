// ============================================================
// ACME Landlord Software — Data Models & Global Defaults
// ============================================================
export const DEFAULT_SETTINGS = {
  rentGrowthRate:          4,     // % per year — user overridable globally and per property
  expenseGrowthRate:       3,
  vacancyRate:             5,
  maintenanceReservePct:   1,     // % of property value / year (suggestion only, never forced)
  capexReservePct:         1,
  valueGrowthRate:         3,
  dscrFloor:               1.20,  // alert threshold
  leaseExpiryWarningDays:  90,
  theme:                   'dark',
  currency:                'USD',
  dateFormat:              'MM/DD/YYYY',
}

export const PROPERTY_TEMPLATE = {
  address:'', city:'', state:'TX', zip:'', nickname:'',
  type:'SFR', yearBuilt:null, sqft:null, bedrooms:3, bathrooms:2,
  lotSize:null, llcId:null, acquisitionDate:null,
  purchasePrice:null, currentValue:null, section8:false, status:'active',
  loan:{ type:'DSCR', lender:'', originalAmount:null, balance:null,
    rate:null, term:30, monthlyPayment:null, refiDate:null },
  income:{ monthlyRent:null, marketRent:null, vacancyRate:5,
    section8PaymentStandard:null, rentGrowthRate:4 },
  expenses:{ propertyTax:null, insurance:null, hoa:null,
    mgmtFee:null, mgmtFeeType:'flat',
    maintenanceSuggested:null, maintenanceActual:null,
    capexSuggested:null, capexActual:null, utilities:null, other:null },
  taxHistory:[null,null,null],
  notes:'',
}

export const TENANT_TEMPLATE = {
  firstName:'', lastName:'', dateOfBirth:null, phone:'', email:'',
  emergencyContact:{ name:'', phone:'', relationship:'' },
  propertyId:null, moveInDate:null, moveOutDate:null,
  leaseStartDate:null, leaseEndDate:null, monthlyRent:null,
  securityDeposit:null, petDeposit:null,
  section8:false, hapContractNumber:'',
  paymentHistory:[], notes:'', flags:[],
  screening:{ applicationDate:null, creditScore:null, incomeVerified:false,
    backgroundCheck:null, evictionHistory:false, referencesChecked:false, notes:'' },
}

export const ENTITY_TEMPLATE = {
  name:'', type:'series_llc', parentId:null, seriesName:'',
  state:'TX', ein:'', formationDate:null, registeredAgent:'',
  bankAccounts:[], notes:'',
}

export const MAINTENANCE_TEMPLATE = {
  propertyId:null, status:'open', priority:'routine',
  description:'', reportedDate:null, resolvedDate:null,
  vendorId:null, cost:null, receiptUrl:null, notes:'',
}

export const HELOC_TEMPLATE = {
  name:'', lender:'', limit:null, balance:null, rate:null,
  drawPeriod:null, repayPeriod:null, monthlyPayment:null,
  linkedPropertyId:null, notes:'',
}
