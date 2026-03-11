// ============================================================
// ACME — Sample Data for Development
// Based on Brian's real Caddo Mills TX portfolio scenario
// ============================================================
import { save } from '../storage/adapter.js'
import { STORES } from '../db/schema.js'

export async function seedSampleData() {
  // ---- ENTITIES ----
  await save(STORES.ENTITIES, {
    id: 'entity-001', name: 'Moore Property Group LLC', entityType: 'Series LLC',
    state: 'TX', ein: '00-0000000', formationDate: '2026-01-01', status: 'active',
    notes: 'Parent LLC — Caddo Mills TX portfolio'
  })
  await save(STORES.ENTITIES, {
    id: 'entity-002', name: 'MPG Series A', entityType: 'Series',
    parentEntityId: 'entity-001', seriesLabel: 'Series A',
    state: 'TX', status: 'active', notes: 'Properties 1-5'
  })

  // ---- PROPERTIES ----
  const props = [
    { id:'p001', nickname:'Greenwood Dr',
      address:{ street:'142 Greenwood Dr', city:'Caddo Mills', state:'TX', zip:'75135' },
      propertyType:'SFR', bedrooms:3, bathrooms:2, sqft:1450, yearBuilt:2004,
      llcSeries:'MPG Series A', acquisitionDate:'2028-03-01', purchasePrice:185000, currentValue:195000,
      section8:true, status:'active',
      loan:{ type:'DSCR', lender:'Lima One', originalAmount:138750, balance:135200, rate:7.5, term:30, monthlyPayment:971 },
      income:{ monthlyRent:1650, marketRent:1700, vacancyRate:3, annualRentIncrease:4 },
      expenses:{ propertyTax:3600, insurance:1200, hoa:0, mgmtFee:0, maintenanceActual:100, capexActual:75, utilities:0, other:0 } },
    { id:'p002', nickname:'Ridgemont Ct',
      address:{ street:'87 Ridgemont Ct', city:'Caddo Mills', state:'TX', zip:'75135' },
      propertyType:'SFR', bedrooms:3, bathrooms:2, sqft:1380, yearBuilt:2001,
      llcSeries:'MPG Series A', acquisitionDate:'2028-06-01', purchasePrice:175000, currentValue:182000,
      section8:false, status:'active',
      loan:{ type:'DSCR', lender:'Lima One', originalAmount:131250, balance:129800, rate:7.75, term:30, monthlyPayment:938 },
      income:{ monthlyRent:1500, marketRent:1550, vacancyRate:5, annualRentIncrease:4 },
      expenses:{ propertyTax:3300, insurance:1100, hoa:0, mgmtFee:0, maintenanceActual:120, capexActual:60, utilities:0, other:0 } },
    { id:'p003', nickname:'Elm Fork Rd — Mfd',
      address:{ street:'1204 Elm Fork Rd', city:'Caddo Mills', state:'TX', zip:'75135' },
      propertyType:'Manufactured', bedrooms:3, bathrooms:2, sqft:1240, yearBuilt:1998,
      llcSeries:'MPG Series A', acquisitionDate:'2024-01-01', purchasePrice:45000, currentValue:72000,
      section8:true, status:'active',
      loan:{ type:'HELOC', lender:'HELOC', originalAmount:0, balance:0, rate:0, term:0, monthlyPayment:0 },
      income:{ monthlyRent:500, marketRent:1500, vacancyRate:5, annualRentIncrease:4 },
      expenses:{ propertyTax:1200, insurance:800, hoa:0, mgmtFee:0, maintenanceActual:80, capexActual:50, utilities:0, other:0 } },
    { id:'p004', nickname:'Sunrise Blvd',
      address:{ street:'33 Sunrise Blvd', city:'Caddo Mills', state:'TX', zip:'75135' },
      propertyType:'SFR', bedrooms:4, bathrooms:2, sqft:1820, yearBuilt:2008,
      llcSeries:'MPG Series A', acquisitionDate:'2028-09-01', purchasePrice:210000, currentValue:218000,
      section8:false, status:'active',
      loan:{ type:'DSCR', lender:'Visio', originalAmount:157500, balance:156100, rate:7.25, term:30, monthlyPayment:1074 },
      income:{ monthlyRent:1850, marketRent:1900, vacancyRate:5, annualRentIncrease:4 },
      expenses:{ propertyTax:4200, insurance:1400, hoa:0, mgmtFee:0, maintenanceActual:130, capexActual:90, utilities:0, other:0 } },
    { id:'p005', nickname:'Meadow Creek',
      address:{ street:'9 Meadow Creek Ln', city:'Royse City', state:'TX', zip:'75189' },
      propertyType:'SFR', bedrooms:3, bathrooms:2, sqft:1560, yearBuilt:2015,
      llcSeries:'MPG Series A', acquisitionDate:'2029-01-01', purchasePrice:195000, currentValue:204000,
      section8:false, status:'vacant',
      loan:{ type:'DSCR', lender:'Lima One', originalAmount:146250, balance:145500, rate:7.5, term:30, monthlyPayment:1022 },
      income:{ monthlyRent:0, marketRent:1700, vacancyRate:100, annualRentIncrease:4 },
      expenses:{ propertyTax:3900, insurance:1300, hoa:0, mgmtFee:0, maintenanceActual:0, capexActual:0, utilities:0, other:0 } },
  ]
  for (const p of props) await save(STORES.PROPERTIES, p)

  // ---- TENANTS ----
  await save(STORES.TENANTS, { id:'t001', firstName:'Marcus', lastName:'Johnson', phone:'903-555-0142',
    propertyId:'p001', moveInDate:'2028-04-01', leaseStartDate:'2028-04-01', leaseEndDate:'2029-03-31',
    monthlyRent:1650, securityDeposit:1650, section8:true, hapContractNumber:'HCV-2028-0412', status:'active' })
  await save(STORES.TENANTS, { id:'t002', firstName:'Diana', lastName:'Reyes', phone:'903-555-0278',
    propertyId:'p002', moveInDate:'2028-07-01', leaseStartDate:'2028-07-01', leaseEndDate:'2029-06-30',
    monthlyRent:1500, securityDeposit:1500, section8:false, status:'active' })
  await save(STORES.TENANTS, { id:'t003', firstName:'Bobby', lastName:'Tran', phone:'903-555-0391',
    propertyId:'p003', moveInDate:'2024-02-01', leaseStartDate:'2024-02-01', leaseEndDate:'2026-03-31',
    monthlyRent:500, securityDeposit:500, section8:false, status:'active', notes:'Legacy tenant, below market' })
  await save(STORES.TENANTS, { id:'t004', firstName:'Carla', lastName:'Mitchell', phone:'903-555-0504',
    propertyId:'p004', moveInDate:'2028-10-01', leaseStartDate:'2028-10-01', leaseEndDate:'2029-09-30',
    monthlyRent:1850, securityDeposit:1850, section8:false, status:'active' })

  // ---- MAINTENANCE ----
  await save(STORES.MAINTENANCE, { id:'m001', propertyId:'p003', status:'open', priority:'routine',
    description:'Exterior paint — prep for Section 8 inspection', dateReported:'2026-03-01', cost:'' })
  await save(STORES.MAINTENANCE, { id:'m002', propertyId:'p005', status:'open', priority:'urgent',
    description:'HVAC service before new tenant move-in', dateReported:'2026-03-08', cost:350 })
  await save(STORES.MAINTENANCE, { id:'m003', propertyId:'p002', status:'open', priority:'routine',
    description:'Replace kitchen faucet — tenant request', dateReported:'2026-03-09', cost:'' })
  await save(STORES.MAINTENANCE, { id:'m004', propertyId:'p001', status:'closed', priority:'routine',
    description:'Replaced water heater', dateReported:'2025-11-15', dateResolved:'2025-11-18', cost:875, vendor:'Caddo Mills Plumbing' })

  // ---- INSURANCE ----
  await save(STORES.INSURANCE, { id:'ins001', propertyId:'p001', insurer:'State Farm', policyNumber:'SF-2028-001',
    coverageType:'Landlord', dwellingCoverage:200000, liabilityCoverage:300000, annualPremium:1200,
    deductible:1000, effectiveDate:'2028-03-01', expirationDate:'2029-03-01', status:'active' })
  await save(STORES.INSURANCE, { id:'ins002', propertyId:'p002', insurer:'State Farm', policyNumber:'SF-2028-002',
    coverageType:'Landlord', dwellingCoverage:185000, liabilityCoverage:300000, annualPremium:1100,
    deductible:1000, effectiveDate:'2028-06-01', expirationDate:'2029-06-01', status:'active' })
  await save(STORES.INSURANCE, { id:'ins003', propertyId:'p003', insurer:'Progressive', policyNumber:'PG-2024-003',
    coverageType:'Landlord', dwellingCoverage:80000, liabilityCoverage:300000, annualPremium:800,
    deductible:1000, effectiveDate:'2024-01-01', expirationDate:'2026-12-31', status:'active' })
  await save(STORES.INSURANCE, { id:'ins004', propertyId:'p004', insurer:'State Farm', policyNumber:'SF-2028-004',
    coverageType:'Landlord', dwellingCoverage:220000, liabilityCoverage:300000, annualPremium:1400,
    deductible:1000, effectiveDate:'2028-09-01', expirationDate:'2029-09-01', status:'active' })
  await save(STORES.INSURANCE, { id:'ins005', propertyId:'p005', insurer:'State Farm', policyNumber:'SF-2029-005',
    coverageType:'Landlord', dwellingCoverage:205000, liabilityCoverage:300000, annualPremium:1300,
    deductible:1000, effectiveDate:'2029-01-01', expirationDate:'2030-01-01', status:'active' })
  await save(STORES.INSURANCE, { id:'ins006', propertyId:'all', insurer:'Travelers', policyNumber:'TR-2028-UMB',
    coverageType:'Umbrella', dwellingCoverage:0, liabilityCoverage:2000000, annualPremium:450,
    deductible:0, effectiveDate:'2028-03-01', expirationDate:'2029-03-01', status:'active', notes:'Portfolio-wide umbrella' })

  // ---- VENDORS ----
  await save(STORES.VENDORS, { id:'v001', name:'Caddo Mills Plumbing', trade:'Plumbing',
    phone:'903-555-1100', email:'info@caddoplumbing.com', licenseNumber:'TX-PLB-44812',
    rating:5, notes:'Fast response, fair pricing. Used for Greenwood water heater.' })
  await save(STORES.VENDORS, { id:'v002', name:'Hunt County HVAC', trade:'HVAC',
    phone:'903-555-2200', email:'service@huntcountyhvac.com', licenseNumber:'TX-HVAC-33291',
    rating:4, notes:'Good HVAC co. Ask for Mike. Reliable for service calls.' })
  await save(STORES.VENDORS, { id:'v003', name:'JB Electric', trade:'Electrical',
    phone:'903-555-3300', email:'jb@jbelectric.net', licenseNumber:'TX-EL-77453',
    rating:5, notes:'Licensed master electrician. Great for inspections and panel work.' })
  await save(STORES.VENDORS, { id:'v004', name:'East Texas Roofing', trade:'Roofing',
    phone:'903-555-4400', email:'quotes@etroofing.com', licenseNumber:'',
    rating:4, notes:'Competitive bids. Do full inspection first.' })
  await save(STORES.VENDORS, { id:'v005', name:'Clean Slate Painting', trade:'Painting',
    phone:'903-555-5500', email:'', licenseNumber:'',
    rating:3, notes:'Use for turnover painting. Slow but thorough. Quote needed.' })

  // ---- HELOC / CREDIT LINES ----
  await save(STORES.HELOC, { id:'h001', name:'Primary HELOC', lender:'First National Bank',
    type:'HELOC', limit:500000, balance:0, rate:8.0, minPayment:0,
    effectiveDate:'2027-06-01', notes:'Target: $500K HELOC on primary home — Q2 2027. Phase 3 foundation.' })
  await save(STORES.HELOC, { id:'h002', name:'Business LOC', lender:'Chase',
    type:'Business Line of Credit', limit:50000, balance:12000, rate:9.5, minPayment:120,
    effectiveDate:'2026-06-01', notes:'Operating reserves and bridge financing' })

  // ---- BRRRR PIPELINE ----
  await save(STORES.BRRRR, { id:'b001', nickname:'Pine Ridge Target',
    address:'441 Pine Ridge Dr, Caddo Mills TX',
    stage:'Identified', arv:195000, purchasePrice:155000, rehabEstimate:15000,
    allInCost:170000, projectedRent:1700, refiAmount:146250,
    notes:'3/2 SFR, needs kitchen and bath refresh. Good bones. Section 8 qualified zip.' })
  await save(STORES.BRRRR, { id:'b002', nickname:'Caddo Ln Deal',
    address:'92 Caddo Ln, Caddo Mills TX',
    stage:'Under Contract', arv:210000, purchasePrice:168000, rehabEstimate:8000,
    allInCost:176000, projectedRent:1850, refiAmount:157500,
    notes:'Light rehab. Under contract at $168K. Inspector scheduled 3/18.' })

  // ---- CAPITAL EVENTS ----
  await save(STORES.CAPITAL_EVENTS, { id:'ce001', type:'HELOC Draw', date:'2028-03-01',
    amount:185000, propertyId:'p001', description:'HELOC draw — Greenwood Dr purchase',
    notes:'Full purchase price from HELOC. Refi to DSCR planned after 6 months seasoning.' })
  await save(STORES.CAPITAL_EVENTS, { id:'ce002', type:'DSCR Refi', date:'2028-09-01',
    amount:138750, propertyId:'p001', description:'DSCR refi — Greenwood Dr',
    notes:'75% LTV on $185K. Lima One. Proceeds repaid HELOC.' })
  await save(STORES.CAPITAL_EVENTS, { id:'ce003', type:'HELOC Draw', date:'2028-06-01',
    amount:175000, propertyId:'p002', description:'HELOC draw — Ridgemont Ct purchase' })
  await save(STORES.CAPITAL_EVENTS, { id:'ce004', type:'DSCR Refi', date:'2028-12-01',
    amount:131250, propertyId:'p002', description:'DSCR refi — Ridgemont Ct',
    notes:'75% LTV on $175K. Lima One.' })

  // ---- TRANSACTIONS ----
  const months = ['2028-04', '2028-05', '2028-06', '2028-07', '2028-08', '2028-09',
                  '2028-10', '2028-11', '2028-12', '2029-01', '2029-02', '2029-03']
  let txId = 1
  for (const mo of months) {
    await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'income',
      category:'Rent', amount:1650, date:`${mo}-01`, propertyId:'p001', description:'Rent — Marcus Johnson' })
    if (months.indexOf(mo) >= 3) { // p002 started mid-year
      await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'income',
        category:'Rent', amount:1500, date:`${mo}-01`, propertyId:'p002', description:'Rent — Diana Reyes' })
    }
    await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'income',
      category:'Rent', amount:500, date:`${mo}-01`, propertyId:'p003', description:'Rent — Bobby Tran' })
    if (months.indexOf(mo) >= 6) { // p004 started Q4 2028
      await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'income',
        category:'Rent', amount:1850, date:`${mo}-01`, propertyId:'p004', description:'Rent — Carla Mitchell' })
    }
  }
  // Some expenses
  await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'expense',
    category:'Maintenance', amount:875, date:'2028-11-18', propertyId:'p001', description:'Water heater replacement' })
  await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'expense',
    category:'Insurance', amount:1200, date:'2028-03-01', propertyId:'p001', description:'Annual landlord insurance — State Farm' })
  await save(STORES.TRANSACTIONS, { id:`tx${String(txId++).padStart(3,'0')}`, type:'expense',
    category:'Property Tax', amount:900, date:'2028-12-01', propertyId:'p001', description:'Q4 property tax — Hunt County' })

  console.log('[ACME] Sample data seeded — Caddo Mills TX portfolio (v2)')
}
