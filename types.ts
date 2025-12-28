export enum AuditLevel {
  PEA = "Preliminary Energy-Use Analysis",
  Level1 = "Level 1 - Walk-Through",
  Level2 = "Level 2 - Energy Survey & Analysis",
  Level3 = "Level 3 - Detailed Analysis"
}

export enum BuildingType {
  Office = "Business (Daytime)",
  Retail = "Shopping Complex",
  Hospital = "Health Care",
  Hotel = "Hospitality (Star Hotel)",
  School = "Educational",
  Assembly = "Assembly",
  Industrial = "Industrial"
}

export enum ClimateZone {
  Composite = "Composite",
  HotDry = "Hot-Dry",
  WarmHumid = "Warm-Humid",
  Temperate = "Temperate",
  Cold = "Cold"
}

export enum ComplianceGoal {
  Compliant = "ECSBC Compliant",
  Plus = "ECSBC+",
  Super = "Super ECSBC"
}

export type UserRole = 'Auditor' | 'Manager' | 'Administrator';

export type ComplianceRating = 'Not Compliant' | 'ECBC Compliant' | 'ECBC+' | 'Super ECBC';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarInitials: string;
}

export interface UtilityData {
  fuelType: 'Electricity' | 'Natural Gas' | 'Oil' | 'District Steam';
  unit: string;
  annualConsumption: number;
  annualCost: number;
  peakDemand?: number; // kW, relevant for Level 2+
  rateStructure?: string; // relevant for Level 2+
}

export interface EndUseBreakdown {
  category: string; // e.g., HVAC, Lighting, Plug Loads
  kbtu: number;
  percentage: number;
}

export interface SystemDetails {
  hvacType: string;
  hvacAge: number; // years
  hvacCondition: 'Good' | 'Fair' | 'Poor';
  coolingCapacity: number; // tons
  heatingCapacity: number; // MBH
  
  lightingType: string;
  lightingControls: 'None' | 'Occupancy Sensors' | 'Daylight Harvesting' | 'Timers';
  percentLED: number;
  
  envelopeGlassType: 'Single Pane' | 'Double Pane' | 'Double Pane Low-E';
  envelopeInsulation: 'Poor' | 'Average' | 'Good';
  roofCondition: 'Good' | 'Fair' | 'Poor';
  
  dhwSystem: string; // Domestic Hot Water
}

// ECSBC 2024 Specific Data Structure
export interface EcsbcData {
  climateZone: ClimateZone;
  complianceGoal: ComplianceGoal;
  
  // Level 1: Mandatory Checks (Pass/Fail)
  l1_roofReflectance: boolean; // Roof has Solar Reflectance > 0.70? (Ref: ECSBC 5.3.1)
  l1_lightingAutoShutoff: boolean; // 90% of interior lights on Auto Shutoff? (Ref: ECSBC 7.2.2)
  l1_coolingTowerControl: boolean; // Cooling towers > 50% speed control? (Ref: ECSBC 6.2.3)
  l1_transformerStarRated: boolean; // Transformers BEE Star Rated? (Ref: ECSBC 8.2.1)
  l1_powerFactor: boolean; // PF 0.97-0.99? (Ref: ECSBC 8.2.6)

  // Level 2: Technical Inputs for Validation
  l2_windowArea: number; // m2
  l2_wallArea: number; // m2
  l2_skylightArea: number; // m2
  l2_roofArea: number; // m2
  
  l2_hvacSystemType: 'VRF' | 'Chiller' | 'Split' | 'Package' | 'Other';
  l2_hvacCapacity: number; // kWr
  l2_hvacEfficiency: number; // COP (Chiller) or ISEER (VRF)
  
  l2_lightingAreaType: string; // e.g. Office, Corridor
  l2_lpd: number; // W/m2
  
  l2_motorClass: 'IE2' | 'IE3' | 'IE4' | 'IE5';
  
  l2_hotWaterDemand: number; // LPD
  l2_solarWaterCapacity: number; // LPD

  // ECBC+ Specific Checklist
  plus_mandatory?: boolean;
  plus_lpd_motor?: boolean;
}

// ECSBC 2024 Chapter 10
export interface WasteManagement {
  segregationBins: boolean; // Color coded bins (Dry, Wet, Haz)
  organicWasteTreatment: 'None' | 'Composting' | 'Vermiculture' | 'Municipal Pickup';
  constructionWasteDiverted: number; // % diverted from landfill
  hazardousWasteHandling: boolean; // Safe disposal protocols
}

// ECSBC 2024 Chapter 9
export interface WaterManagement {
  waterSources: ('Municipal' | 'Bore-well' | 'Recycled' | 'Rainwater')[];
  rainwaterHarvesting: boolean;
  stpInstalled: boolean;
  fixtureEfficiency: 'Standard' | 'Low-Flow' | 'Ultra-Low-Flow';
  dailyWaterConsumption: number; // kL/day
}

// ECSBC 2024 Chapter 4 & 11
export interface SustainableSiteIEQ {
  evChargingPoints: number; // ECSBC 4.2.4
  evTotalPowerCapacity?: number; // kW
  evConnectorTypes?: string; // e.g., Type 2, CCS
  greeneryCoverage: number; // % of site area (ECSBC 4.2.1)
  heatIslandReductionRoof: boolean; // Cool roof / Vegetated roof (ECSBC 4.3.1)
  airQualityMonitoring: boolean; // CO2 / PM sensors (ECSBC 11.2.2)
  daylightingPercent: number; // % of floor area with daylight (ECSBC 4.2.3)
}

export interface ExclusionAreas {
  unconditionedBasement: number; // sq ft
  refugeArea: number; // sq ft
  stiltParking: number; // sq ft
}

export interface EEM {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  estimatedSavings: number; // Annual INR
  paybackPeriod: number; // Years
  type: 'No-Cost/Low-Cost' | 'Capital Investment' | 'O&M';
}

export interface ComplianceAction {
  id: string;
  system: string; // e.g., HVAC, Lighting, Envelope
  description: string;
  investment: number;
  responsibleTeam: string; // e.g., Facility Manager, Engineering, External Vendor
  targetLevel: ComplianceRating; // The level this helps achieve
}

export interface Audit {
  id: string;
  name: string;
  address: string;
  city: string;
  yearBuilt: number;
  grossFloorArea: number; // sq ft
  exclusionAreas?: ExclusionAreas; // New for ECSBC MEPI Calc
  buildingType: BuildingType;
  auditLevel: AuditLevel;
  auditDate: string;
  auditorName: string;
  imageUrl?: string;
  
  // Data Collection (Part 2 of PDF)
  utilityData: UtilityData[];
  
  // Detailed System Data (Level 2+)
  systemData?: SystemDetails;
  
  // ECSBC Specific Data
  ecsbcData?: EcsbcData;
  wasteData?: WasteManagement;
  waterData?: WaterManagement;
  
  // Added Site & IEQ Data per ECSBC Chapter 4 & 11
  siteIEQData?: SustainableSiteIEQ;
  
  // Calculated Metrics (Part 1 & 2)
  epi: number; // kWh/m2/yr (Energy Performance Index)
  mepi?: number; // kWh/m2/yr (ECSBC Standard - Net Area)
  eci: number; // $/sqft/yr
  benchmarkEpi?: number; // Comparison EPI (kWh/m2/yr)
  
  // Compliance
  complianceRating: ComplianceRating;
  complianceRecommendations: ComplianceAction[];
  
  endUseBreakdown: EndUseBreakdown[];
  eems: EEM[];
  
  notes: string;
  status: 'Draft' | 'Review' | 'Published';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}