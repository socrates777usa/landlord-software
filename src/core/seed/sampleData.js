// ============================================================
// ACME — Sample Data for Development
// Based on Brian's real Caddo Mills TX portfolio scenario
// Run seedSampleData() once on first load if DB is empty
// ============================================================
import { save } from '../storage/adapter.js'
import { STORES } from '../db/schema.js'

export async function seedSampleData() {
  // Entity: Brian's Series LLC
  await save(STORES.ENTITIES, {
    id: 'entity-001', name: 'Moore Property Group LLC', type: 'series_llc',
    parentId: null, seriesName: '', state: 'TX', ein: '00-0000000',
    formationDate: '2026-01-01', notes: 'Parent LLC — Caddo Mills TX portfolio'
  })
  await save(STORES.ENTITIES, {
    id: 'entity-002', name: 'MPG Series A', type: 'series', parentId: 'entity-001',
    seriesName: 'Series A', state: 'TX', notes: 'Properties 1-5'
  })

  // Properties — Caddo Mills TX area
  const props = [
    { id:'p001', nickname:'Greenwood Dr', address:'142 Greenwood Dr', city:'Caddo Mills', zip:'75135',
      type:'SFR', bedrooms:3, bathrooms:2, sqft:1450, yearBuilt:2004, llcId:'entity-002',
      acquisitionDate:'2028-03-01', purchasePrice:185000, currentValue:195000, section8:true, status:'active',
      loan:{ type:'DSCR', lender:'Lima One', originalAmount:138750, balance:135200, rate:7.5, term:30, monthlyPayment:971 },
      income:{ monthlyRent:1650, marketRent:1700, vacancyRate:3, rentGrowthRate:4 },
      expenses:{ propertyTax:3600, insurance:1200, mgmtFee:0, maintenanceActual:100, capexActual:75, utilities:0 },
      taxHistory:[3200,3400,3600] },
    { id:'p002', nickname:'Ridgemont Ct', address:'87 Ridgemont Ct', city:'Caddo Mills', zip:'75135',
      type:'SFR', bedrooms:3, bathrooms:2, sqft:1380, yearBuilt:2001, llcId:'entity-002',
      acquisitionDate:'2028-06-01', purchasePrice:175000, currentValue:182000, section8:false, status:'active',
      loan:{ type:'DSCR', lender:'Lima One', originalAmount:131250, balance:129800, rate:7.75, term:30, monthlyPayment:938 },
      income:{ monthlyRent:1500, marketRent:1550, vacancyRate:5, rentGrowthRate:4 },
      expenses:{ propertyTax:3300, insurance:1100, mgmtFee:0, maintenanceActual:120, capexActual:60, utilities:0 },
      taxHistory:[2900,3100,3300] },
    { id:'p003', nickname:'Elm Fork Rd — Mfd', address:'1204 Elm Fork Rd', city:'Caddo Mills', zip:'75135',
      type:'Manufactured', bedrooms:3, bathrooms:2, sqft:1240, yearBuilt:1998, llcId:'entity-002',
      acquisitionDate:'2024-01-01', purchasePrice:45000, currentValue:72000, section8:true, status:'active',
      loan:{ type:'HELOC-funded', lender:'HELOC', originalAmount:0, balance:0, rate:0, term:0, monthlyPayment:0 },
      income:{ monthlyRent:500, marketRent:1500, vacancyRate:5, rentGrowthRate:4 },
      expenses:{ propertyTax:1200, insurance:800, mgmtFee:0, maintenanceActual:80, capexActual:50, utilities:0 },
      taxHistory:[1000,1100,1200], notes:'Needs renovation to reach market rent. Section 8 target.' },
    { id:'p004', nickname:'Sunrise Blvd', address:'33 Sunrise Blvd', city:'Caddo Mills', zip:'75135',
      type:'SFR', bedrooms:4, bathrooms:2, sqft:1820, yearBuilt:2008, llcId:'entity-002',
      acquisitionDate:'2028-09-01', purchasePrice:210000, currentValue:218000, section8:false, status:'active',
      loan:{ type:'DSCR', lender:'Visio', originalAmount:157500, balance:156100, rate:7.25, term:30, monthlyPayment:1074 },
      income:{ monthlyRent:1850, marketRent:1900, vacancyRate:5, rentGrowthRate:4 },
      expenses:{ propertyTax:4200, insurance:1400, mgmtFee:0, maintenanceActual:130, capexActual:90, utilities:0 },
      taxHistory:[3800,4000,4200] },
    { id:'p005', nickname:'Meadow Creek', address:'9 Meadow Creek Ln', city:'Royse City', zip:'75189',
      type:'SFR', bedrooms:3, bathrooms:2, sqft:1560, yearBuilt:2015, llcId:'entity-002',
      acquisitionDate:'2029-01-01', purchasePrice:195000, currentValue:204000, section8:false, status:'vacant',
      loan:{ type:'DSCR', lender:'Lima One', originalAmount:146250, balance:145500, rate:7.5, term:30, monthlyPayment:1022 },
      income:{ monthlyRent:0, marketRent:1700, vacancyRate:100, rentGrowthRate:4 },
      expenses:{ propertyTax:3900, insurance:1300, mgmtFee:0, maintenanceActual:0, capexActual:0, utilities:0 },
      taxHistory:[3500,3700,3900], notes:'Currently vacant — marketing for tenant' },
  ]
  for (const p of props) await save(STORES.PROPERTIES, p)

  // Tenants
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

  // Maintenance
  await save(STORES.MAINTENANCE, { id:'m001', propertyId:'p003', status:'open', priority:'routine',
    description:'Exterior paint — prep for Section 8 inspection', reportedDate:'2026-03-01', cost:null })
  await save(STORES.MAINTENANCE, { id:'m002', propertyId:'p005', status:'open', priority:'urgent',
    description:'HVAC service before new tenant move-in', reportedDate:'2026-03-08', cost:null })
  await save(STORES.MAINTENANCE, { id:'m003', propertyId:'p002', status:'open', priority:'routine',
    description:'Replace kitchen faucet — tenant request', reportedDate:'2026-03-09', cost:null })

  console.log('[ACME] Sample data seeded — Caddo Mills TX portfolio')
}
