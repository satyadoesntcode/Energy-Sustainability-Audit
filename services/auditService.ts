import { Audit, AuditLevel, BuildingType, ValidationResult, ComplianceRating, ClimateZone, ComplianceGoal } from '../types';

// Mock Data scaled for INR and EPI (kWh/m2/yr)
let MOCK_AUDITS: Audit[] = [
  {
    id: '1',
    name: 'Corporate HQ - Building A',
    address: '1791 Tullie Circle, N.E.',
    city: 'Atlanta, GA',
    yearBuilt: 1998,
    grossFloorArea: 55000,
    exclusionAreas: { unconditionedBasement: 5000, refugeArea: 0, stiltParking: 0 },
    buildingType: BuildingType.Office,
    auditLevel: AuditLevel.Level2,
    auditDate: '2023-10-15',
    auditorName: 'J. Kelsey',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    utilityData: [
      { fuelType: 'Electricity', unit: 'kWh', annualConsumption: 850000, annualCost: 8670000, peakDemand: 250, rateStructure: 'Time of Use' },
      { fuelType: 'Natural Gas', unit: 'therms', annualConsumption: 12000, annualCost: 1326000 }
    ],
    systemData: {
      hvacType: 'VAV with Reheat',
      hvacAge: 25,
      hvacCondition: 'Fair',
      coolingCapacity: 150,
      heatingCapacity: 2000,
      lightingType: 'T8 Fluorescent',
      lightingControls: 'None',
      percentLED: 10,
      envelopeGlassType: 'Double Pane',
      envelopeInsulation: 'Average',
      roofCondition: 'Good',
      dhwSystem: 'Electric Resistance'
    },
    ecsbcData: {
      climateZone: ClimateZone.Composite,
      complianceGoal: ComplianceGoal.Plus,
      l1_roofReflectance: true,
      l1_lightingAutoShutoff: true,
      l1_coolingTowerControl: true,
      l1_transformerStarRated: true,
      l1_powerFactor: true,
      l2_windowArea: 2000,
      l2_wallArea: 8000,
      l2_skylightArea: 0,
      l2_roofArea: 5500,
      l2_hvacSystemType: 'Chiller',
      l2_hvacCapacity: 600,
      l2_hvacEfficiency: 6.1,
      l2_lightingAreaType: 'Office',
      l2_lpd: 8.5,
      l2_motorClass: 'IE3',
      l2_hotWaterDemand: 0,
      l2_solarWaterCapacity: 0,
      plus_mandatory: true,
      plus_lpd_motor: true
    },
    wasteData: {
      segregationBins: true,
      organicWasteTreatment: 'Composting',
      constructionWasteDiverted: 0,
      hazardousWasteHandling: true
    },
    waterData: {
      waterSources: ['Municipal'],
      rainwaterHarvesting: true,
      stpInstalled: false,
      fixtureEfficiency: 'Standard',
      dailyWaterConsumption: 45
    },
    siteIEQData: {
      evChargingPoints: 4,
      greeneryCoverage: 15,
      heatIslandReductionRoof: true,
      airQualityMonitoring: true,
      daylightingPercent: 40
    },
    epi: 235.2, // kWh/m2/yr
    mepi: 210.5,
    benchmarkEpi: 240.0, // Just below benchmark
    complianceRating: 'ECBC Compliant', 
    eci: 181.75,
    endUseBreakdown: [
      { category: 'Space Heating', kbtu: 1200000, percentage: 32 },
      { category: 'Space Cooling', kbtu: 950000, percentage: 25 },
      { category: 'Interior Lighting', kbtu: 760000, percentage: 20 },
      { category: 'Plug Loads', kbtu: 450000, percentage: 12 },
      { category: 'Water Heating', kbtu: 150000, percentage: 4 },
      { category: 'Pumps/Fans', kbtu: 265000, percentage: 7 }
    ],
    eems: [
      {
        id: 'eem-1',
        title: 'LED Lighting Retrofit',
        description: 'Replace T8 fluorescents with LED tubes in open office areas.',
        type: 'Capital Investment',
        estimatedCost: 1275000,
        estimatedSavings: 382500,
        paybackPeriod: 3.3
      },
      {
        id: 'eem-2',
        title: 'Adjust AHU Schedules',
        description: 'Reduce operating hours by 2 hours/day based on occupancy study.',
        type: 'No-Cost/Low-Cost',
        estimatedCost: 17000,
        estimatedSavings: 272000,
        paybackPeriod: 0.06
      }
    ],
    complianceRecommendations: [
      {
        id: 'c1',
        system: 'Lighting',
        description: 'Install Occupancy Sensors in all private offices and conference rooms.',
        investment: 250000,
        responsibleTeam: 'Electrical Maintenance',
        targetLevel: 'ECBC+'
      },
      {
        id: 'c2',
        system: 'HVAC',
        description: 'Upgrade Chiller Plant Management System (CPMS) for optimized sequencing.',
        investment: 850000,
        responsibleTeam: 'HVAC Vendor',
        targetLevel: 'ECBC+'
      }
    ],
    notes: 'Building envelope appears sound. Significant opportunity in lighting controls.',
    status: 'Published'
  },
  {
    id: '2',
    name: 'Westside Medical Center',
    address: '400 W Main St',
    city: 'Springfield, IL',
    yearBuilt: 2005,
    grossFloorArea: 120000,
    buildingType: BuildingType.Hospital,
    auditLevel: AuditLevel.PEA,
    auditDate: '2024-01-10',
    auditorName: 'M. Deru',
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b9af92d?auto=format&fit=crop&w=800&q=80',
    utilityData: [
      { fuelType: 'Electricity', unit: 'kWh', annualConsumption: 2400000, annualCost: 24480000 },
      { fuelType: 'Natural Gas', unit: 'therms', annualConsumption: 45000, annualCost: 4590000 }
    ],
    epi: 334.5,
    benchmarkEpi: 285.0,
    complianceRating: 'Not Compliant',
    eci: 242.25,
    endUseBreakdown: [],
    eems: [],
    complianceRecommendations: [],
    notes: 'Initial billing analysis shows high baseload. Recommend Level 2 audit.',
    status: 'Draft'
  },
  {
    id: '3',
    name: 'Northside Elementary',
    address: '123 School Ln',
    city: 'Chicago, IL',
    yearBuilt: 1985,
    grossFloorArea: 45000,
    buildingType: BuildingType.School,
    auditLevel: AuditLevel.Level1,
    auditDate: '2023-11-20',
    auditorName: 'A. Admin',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    utilityData: [
      { fuelType: 'Electricity', unit: 'kWh', annualConsumption: 400000, annualCost: 4080000 },
      { fuelType: 'Natural Gas', unit: 'therms', annualConsumption: 20000, annualCost: 1870000 }
    ],
    // Partial system data relevant for walkthrough
    systemData: {
      hvacType: 'Unit Ventilators',
      hvacAge: 30,
      hvacCondition: 'Poor',
      coolingCapacity: 0,
      heatingCapacity: 0,
      lightingType: 'T12',
      lightingControls: 'None',
      percentLED: 0,
      envelopeGlassType: 'Single Pane',
      envelopeInsulation: 'Poor',
      roofCondition: 'Fair',
      dhwSystem: 'Gas Water Heater'
    },
    ecsbcData: {
      climateZone: ClimateZone.Cold,
      complianceGoal: ComplianceGoal.Compliant,
      l1_roofReflectance: false,
      l1_lightingAutoShutoff: false,
      l1_coolingTowerControl: false,
      l1_transformerStarRated: false,
      l1_powerFactor: true,
      l2_windowArea: 0,
      l2_wallArea: 0,
      l2_skylightArea: 0,
      l2_roofArea: 0,
      l2_hvacSystemType: 'Split',
      l2_hvacCapacity: 0,
      l2_hvacEfficiency: 0,
      l2_lightingAreaType: 'School',
      l2_lpd: 0,
      l2_motorClass: 'IE2',
      l2_hotWaterDemand: 0,
      l2_solarWaterCapacity: 0,
      plus_mandatory: false,
      plus_lpd_motor: false
    },
    epi: 235.8,
    benchmarkEpi: 205.0,
    complianceRating: 'Not Compliant',
    eci: 132.22,
    endUseBreakdown: [],
    eems: [
       {
        id: 'eem-3',
        title: 'Boiler Tune-up',
        description: 'Optimize O2 trim settings.',
        type: 'O&M',
        estimatedCost: 127500,
        estimatedSavings: 212500,
        paybackPeriod: 0.6
      }
    ],
    complianceRecommendations: [
      {
        id: 'c3',
        system: 'HVAC',
        description: 'Replace aging Unit Ventilators with high-efficiency VRF system.',
        investment: 4500000,
        responsibleTeam: 'Capital Projects Team',
        targetLevel: 'ECBC Compliant'
      }
    ],
    notes: 'Old boilers, good candidates for replacement in 5 years.',
    status: 'Review'
  }
];

export const getAudits = async (): Promise<Audit[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...MOCK_AUDITS]), 500));
};

export const getAuditById = async (id: string): Promise<Audit | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_AUDITS.find(a => a.id === id)), 300));
};

// --- DATA PIPELINE FUNCTIONS ---

// Updated ranges for EPI (kWh/m2/yr)
const BENCHMARK_RANGES: Record<BuildingType, { min: number; max: number }> = {
  [BuildingType.Office]: { min: 30, max: 950 },
  [BuildingType.Retail]: { min: 30, max: 1200 },
  [BuildingType.Hospital]: { min: 150, max: 1900 },
  [BuildingType.Hotel]: { min: 45, max: 1500 },
  [BuildingType.School]: { min: 30, max: 800 },
  [BuildingType.Assembly]: { min: 30, max: 800 },
  [BuildingType.Industrial]: { min: 30, max: 3000 }
};

// 1. Validation Logic
const validateAudit = (audit: Audit): ValidationResult => {
  const errors: Record<string, string> = {};
  if (!audit.name.trim()) errors.name = "Project name is required.";
  if (audit.grossFloorArea <= 0) errors.grossFloorArea = "Floor area must be positive.";
  if (audit.yearBuilt < 1800 || audit.yearBuilt > new Date().getFullYear() + 1) errors.yearBuilt = "Invalid Year Built.";
  
  // Benchmark Validation
  if (audit.benchmarkEpi !== undefined && audit.benchmarkEpi !== 0) {
    const range = BENCHMARK_RANGES[audit.buildingType];
    if (range) {
      if (audit.benchmarkEpi < range.min || audit.benchmarkEpi > range.max) {
        errors.benchmarkEpi = `Benchmark EPI for ${audit.buildingType} should be between ${range.min} and ${range.max} kWh/m²/yr.`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const determineCompliance = (epi: number, benchmark: number): ComplianceRating => {
  if (!benchmark || benchmark === 0) return 'Not Compliant';
  
  const ratio = epi / benchmark;
  
  if (ratio <= 0.6) return 'Super ECBC'; // 40% reduction or better
  if (ratio <= 0.8) return 'ECBC+';      // 20% reduction or better
  if (ratio <= 1.0) return 'ECBC Compliant';
  return 'Not Compliant';
};

// 2. Transformation / Calculation Logic
const calculateMetrics = (audit: Audit): Audit => {
  let totalCost = 0;
  let totalKWh = 0;

  audit.utilityData.forEach(util => {
    totalCost += util.annualCost;
    let kwhEquivalent = 0;

    if (util.fuelType === 'Electricity' && util.unit === 'kWh') {
      kwhEquivalent = util.annualConsumption;
    } else if (util.fuelType === 'Natural Gas' && util.unit === 'therms') {
      // 1 therm = 29.3071 kWh
      kwhEquivalent = util.annualConsumption * 29.3071; 
    } else {
      // simplified fallback
      kwhEquivalent = util.annualConsumption; 
    }
    
    totalKWh += kwhEquivalent;
  });

  // Calculate EPI: kWh / sqm / yr
  // 1 sq ft = 0.092903 sq m
  const areaSqm = audit.grossFloorArea * 0.092903;
  
  const epi = areaSqm > 0 ? Number((totalKWh / areaSqm).toFixed(1)) : 0;
  
  // ECI is usually cost/sqft or cost/sqm. Keeping as cost/sqft for now to minimize variable churn,
  // but logically it could be cost/sqm. Sticking to existing variable but just recalc.
  const eci = audit.grossFloorArea > 0 ? Number((totalCost / audit.grossFloorArea).toFixed(2)) : 0;

  // Calculate MEPI (Modeled Energy Performance Intensity) for ECSBC (Net Area)
  let netAreaSqFt = audit.grossFloorArea;
  if (audit.exclusionAreas) {
    netAreaSqFt -= (audit.exclusionAreas.unconditionedBasement || 0);
    netAreaSqFt -= (audit.exclusionAreas.refugeArea || 0);
    netAreaSqFt -= (audit.exclusionAreas.stiltParking || 0);
  }
  const netAreaM2 = netAreaSqFt * 0.092903;
  const mepi = netAreaM2 > 0 ? Number((totalKWh / netAreaM2).toFixed(2)) : 0;

  const complianceRating = determineCompliance(epi, audit.benchmarkEpi || 0);

  return {
    ...audit,
    epi,
    eci,
    mepi,
    complianceRating
  };
};

// 3. Storage Logic (Ingestion)
export const saveAudit = async (audit: Audit): Promise<{ success: boolean; data?: Audit; errors?: Record<string, string> }> => {
  // Simulate pipeline delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Step 1: Validate
  const validation = validateAudit(audit);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  // Step 2: Transform
  const processedAudit = calculateMetrics(audit);

  // Step 3: Store
  const index = MOCK_AUDITS.findIndex(a => a.id === processedAudit.id);
  if (index >= 0) {
    MOCK_AUDITS[index] = processedAudit;
  } else {
    MOCK_AUDITS.push(processedAudit);
  }

  return { success: true, data: processedAudit };
};