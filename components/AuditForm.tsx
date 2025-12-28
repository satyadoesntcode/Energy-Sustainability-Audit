import React, { useState, useEffect } from 'react';
import { Audit, AuditLevel, BuildingType, UtilityData, EEM, ClimateZone, ComplianceGoal } from '../types';
import { Save, Plus, Trash2, Lock, CheckCircle, Search, Filter, Upload, Image as ImageIcon, Info, Thermometer, Lightbulb, Home, Droplets, ArrowRight, Wind, Leaf, ClipboardList, CheckSquare, PlusCircle, Calculator, AlertTriangle, Wand2, Settings, BatteryCharging } from 'lucide-react';

interface AuditFormProps {
  initialData?: Audit;
  onSave: (audit: Audit) => void;
  readOnly?: boolean;
  canPublish?: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ initialData, onSave, readOnly = false, canPublish = false }) => {
  const [activeTab, setActiveTab] = useState<'site' | 'utility' | 'ecsbc' | 'systems' | 'water_waste' | 'site_ieq'>('site');
  
  // State for EEM filtering
  const [eemSearchTerm, setEemSearchTerm] = useState('');
  const [eemFilterType, setEemFilterType] = useState<string>('All');

  // State for new manual EEM
  const [newEem, setNewEem] = useState<Partial<EEM>>({
    title: '',
    description: '',
    type: 'No-Cost/Low-Cost',
    estimatedCost: 0,
    estimatedSavings: 0,
    paybackPeriod: 0
  });

  const [formData, setFormData] = useState<Audit>(initialData || {
    id: Date.now().toString(),
    name: '',
    address: '',
    city: '',
    yearBuilt: 2000,
    grossFloorArea: 0,
    exclusionAreas: { unconditionedBasement: 0, refugeArea: 0, stiltParking: 0 },
    buildingType: BuildingType.Office,
    auditLevel: AuditLevel.Level1,
    auditDate: new Date().toISOString().split('T')[0],
    auditorName: '',
    utilityData: [],
    epi: 0,
    eci: 0,
    endUseBreakdown: [],
    eems: [],
    complianceRating: 'Not Compliant',
    complianceRecommendations: [],
    notes: '',
    status: 'Draft',
    ecsbcData: {
      climateZone: ClimateZone.Composite,
      complianceGoal: ComplianceGoal.Compliant,
      l1_roofReflectance: false,
      l1_lightingAutoShutoff: false,
      l1_coolingTowerControl: false,
      l1_transformerStarRated: false,
      l1_powerFactor: false,
      l2_windowArea: 0,
      l2_wallArea: 0,
      l2_skylightArea: 0,
      l2_roofArea: 0,
      l2_hvacSystemType: 'Chiller',
      l2_hvacCapacity: 0,
      l2_hvacEfficiency: 0,
      l2_lightingAreaType: 'Office',
      l2_lpd: 0,
      l2_motorClass: 'IE2',
      l2_hotWaterDemand: 0,
      l2_solarWaterCapacity: 0,
      plus_mandatory: false,
      plus_lpd_motor: false
    },
    systemData: {
      hvacType: '',
      hvacAge: 0,
      hvacCondition: 'Fair',
      coolingCapacity: 0,
      heatingCapacity: 0,
      lightingType: '',
      lightingControls: 'None',
      percentLED: 0,
      envelopeGlassType: 'Double Pane',
      envelopeInsulation: 'Average',
      roofCondition: 'Fair',
      dhwSystem: ''
    },
    waterData: {
      waterSources: [],
      rainwaterHarvesting: false,
      stpInstalled: false,
      fixtureEfficiency: 'Standard',
      dailyWaterConsumption: 0
    },
    wasteData: {
      segregationBins: false,
      organicWasteTreatment: 'None',
      constructionWasteDiverted: 0,
      hazardousWasteHandling: false
    },
    siteIEQData: {
      evChargingPoints: 0,
      greeneryCoverage: 0,
      heatIslandReductionRoof: false,
      airQualityMonitoring: false,
      daylightingPercent: 0
    }
  });

  // OR Logic: Detailed fields are required if Audit Level is high OR Compliance Goal is high
  const isHighLevelAudit = formData.auditLevel === AuditLevel.Level2 || formData.auditLevel === AuditLevel.Level3;
  const isHighComplianceGoal = formData.ecsbcData?.complianceGoal === ComplianceGoal.Plus || formData.ecsbcData?.complianceGoal === ComplianceGoal.Super;
  const isDetailedAudit = isHighLevelAudit || isHighComplianceGoal;

  // Sync EEMs and initial data if updated externally
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        ecsbcData: initialData.ecsbcData || prev.ecsbcData,
        systemData: initialData.systemData || prev.systemData,
        exclusionAreas: initialData.exclusionAreas || prev.exclusionAreas,
        waterData: initialData.waterData || prev.waterData,
        wasteData: initialData.wasteData || prev.wasteData,
        siteIEQData: initialData.siteIEQData || prev.siteIEQData,
      }));
    }
  }, [initialData]);

  const handleInputChange = (field: keyof Audit, value: any) => {
    if (readOnly) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExclusionChange = (field: keyof typeof formData.exclusionAreas, value: number) => {
    if (readOnly) return;
    setFormData(prev => ({
      ...prev,
      exclusionAreas: { ...prev.exclusionAreas!, [field]: value }
    }));
  };

  const handleNestedChange = (parent: 'systemData' | 'waterData' | 'wasteData' | 'siteIEQData' | 'ecsbcData', field: string, value: any) => {
    if (readOnly) return;
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const updateUtilityData = (index: number, field: keyof UtilityData, value: any) => {
    if (readOnly) return;
    const newData = [...formData.utilityData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(prev => ({ ...prev, utilityData: newData }));
  };

  const addUtilityRow = () => {
    if (readOnly) return;
    setFormData(prev => ({
      ...prev,
      utilityData: [...prev.utilityData, { fuelType: 'Electricity', unit: 'kWh', annualConsumption: 0, annualCost: 0, peakDemand: 0 }]
    }));
  };

  const removeUtilityRow = (index: number) => {
    if (readOnly) return;
    const newData = formData.utilityData.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, utilityData: newData }));
  };

  const getRecommendedUnit = (fuelType: string) => {
    switch (fuelType) {
      case 'Electricity': return 'kWh';
      case 'Natural Gas': return 'therms';
      case 'Oil': return 'gallons';
      case 'District Steam': return 'MMBtu';
      default: return '';
    }
  };

  const autoPopulateUnits = () => {
    if (readOnly) return;
    const updated = formData.utilityData.map(item => ({
      ...item,
      unit: getRecommendedUnit(item.fuelType) || item.unit
    }));
    setFormData(prev => ({ ...prev, utilityData: updated }));
  };

  const updateEEM = (id: string, field: keyof EEM, value: any) => {
    if (readOnly) return;
    setFormData(prev => ({
      ...prev,
      eems: prev.eems.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // Logic for adding a manual EEM
  const handleNewEemChange = (field: keyof EEM, value: any) => {
    setNewEem(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calc payback if cost/savings change
      if (field === 'estimatedCost' || field === 'estimatedSavings') {
        const cost = field === 'estimatedCost' ? value : prev.estimatedCost || 0;
        const savings = field === 'estimatedSavings' ? value : prev.estimatedSavings || 0;
        if (savings > 0) {
          updated.paybackPeriod = parseFloat((cost / savings).toFixed(2));
        } else {
          updated.paybackPeriod = 0;
        }
      }
      return updated;
    });
  };

  const addManualEEM = () => {
    if (!newEem.title) {
      alert("Please enter a measure title.");
      return;
    }
    
    const eem: EEM = {
      id: `manual-${Date.now()}`,
      title: newEem.title || 'New Measure',
      description: newEem.description || '',
      type: (newEem.type as any) || 'No-Cost/Low-Cost',
      estimatedCost: newEem.estimatedCost || 0,
      estimatedSavings: newEem.estimatedSavings || 0,
      paybackPeriod: newEem.paybackPeriod || 0
    };

    setFormData(prev => ({
      ...prev,
      eems: [...prev.eems, eem]
    }));

    // Reset form
    setNewEem({
      title: '',
      description: '',
      type: 'No-Cost/Low-Cost',
      estimatedCost: 0,
      estimatedSavings: 0,
      paybackPeriod: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) onSave(formData);
  };

  const handlePublish = () => {
    if (canPublish) {
      onSave({ ...formData, status: 'Published' });
    }
  };
  
  const handleNext = () => {
    if (activeTab === 'site') setActiveTab('utility');
    else if (activeTab === 'utility') setActiveTab('ecsbc');
    else if (activeTab === 'ecsbc') setActiveTab('systems');
    else if (activeTab === 'systems') setActiveTab('water_waste');
    else if (activeTab === 'water_waste') setActiveTab('site_ieq');
  };

  // ECSBC Validation Logic
  const getEcsbcValidation = () => {
    if (!formData.ecsbcData) {
      return { 
        wwr: 0, 
        wwrStatus: 'N/A', 
        srr: 0, 
        srrStatus: 'N/A', 
        hvacStatus: 'N/A', 
        solarStatus: 'N/A',
        lpdStatus: 'N/A',
        lpdLimit: 0,
        motorStatus: 'N/A',
        requiredMotorLevel: 0
      };
    }
    
    const { l2_windowArea, l2_wallArea, l2_skylightArea, l2_roofArea, l2_hvacSystemType, l2_hvacCapacity, l2_hvacEfficiency, l2_solarWaterCapacity, l2_hotWaterDemand, l2_lpd, l2_motorClass } = formData.ecsbcData;
    
    // WWR Calculation
    const totalWallArea = l2_windowArea + l2_wallArea;
    const wwr = totalWallArea > 0 ? (l2_windowArea / totalWallArea) * 100 : 0;
    const wwrStatus = wwr > 40 ? 'Non-Compliant' : 'Compliant';

    // SRR Calculation
    const totalRoofArea = l2_skylightArea + l2_roofArea;
    const srr = totalRoofArea > 0 ? (l2_skylightArea / totalRoofArea) * 100 : 0;
    const srrStatus = srr > 5 ? 'Non-Compliant' : 'Compliant';

    // HVAC Logic (Simplified from ECSBC)
    let hvacStatus = 'Compliant';
    if (l2_hvacSystemType === 'Chiller' && l2_hvacCapacity >= 530) {
       // Table 6.12 simplified check
       if (l2_hvacEfficiency < 5.8) hvacStatus = 'Non-Compliant (Low COP)';
    } else if (l2_hvacSystemType === 'VRF' && l2_hvacCapacity < 40) {
       if (l2_hvacEfficiency < 5.4) hvacStatus = 'Non-Compliant (Low ISEER)';
    }

    // Solar Water Heating (Hospitality/Health)
    let solarStatus = 'N/A';
    if (formData.buildingType === BuildingType.Hotel || formData.buildingType === BuildingType.Hospital) {
       const reqPercentage = formData.ecsbcData.complianceGoal === ComplianceGoal.Super ? 1.0 : (formData.ecsbcData.complianceGoal === ComplianceGoal.Plus ? 0.6 : 0.4);
       if (l2_hotWaterDemand > 0) {
         solarStatus = (l2_solarWaterCapacity / l2_hotWaterDemand) >= reqPercentage ? 'Compliant' : `Non-Compliant (<${reqPercentage*100}%)`;
       }
    }

    // LPD Validation (ECSBC 7.3.1)
    const lpdLimit = formData.ecsbcData.complianceGoal === ComplianceGoal.Super ? 5.0 : (formData.ecsbcData.complianceGoal === ComplianceGoal.Plus ? 7.6 : 9.5);
    const lpdStatus = l2_lpd > 0 && l2_lpd <= lpdLimit ? 'Compliant' : (l2_lpd === 0 ? 'N/A' : `Non-Compliant (> ${lpdLimit})`);

    // Motor Validation (ECSBC 8.2.2)
    const motorMap: Record<string, number> = { 'IE2': 2, 'IE3': 3, 'IE4': 4, 'IE5': 5 };
    const requiredMotorLevel = formData.ecsbcData.complianceGoal === ComplianceGoal.Super ? 5 : (formData.ecsbcData.complianceGoal === ComplianceGoal.Plus ? 4 : 3);
    const currentMotorLevel = motorMap[l2_motorClass] || 0;
    const motorStatus = currentMotorLevel >= requiredMotorLevel ? 'Compliant' : `Non-Compliant (Req IE${requiredMotorLevel})`;

    return { wwr, wwrStatus, srr, srrStatus, hvacStatus, solarStatus, lpdStatus, lpdLimit, motorStatus, requiredMotorLevel };
  };

  const ecsbcValidation = getEcsbcValidation();

  // Filter EEMs logic
  const filteredEEMs = formData.eems.filter(eem => {
    const term = eemSearchTerm.toLowerCase().trim();
    const matchesSearch = (eem.title?.toLowerCase() || '').includes(term) || 
                          (eem.description?.toLowerCase() || '').includes(term);
    const matchesType = eemFilterType === 'All' || eem.type === eemFilterType;
    return matchesSearch && matchesType;
  });

  // Checklist Generation Logic - Updated for Combined Scope
  const getScopeRequirements = (level: AuditLevel, goal: ComplianceGoal = ComplianceGoal.Compliant) => {
    const items: string[] = [];
    let color = "bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200";

    // ASHRAE Scope
    switch (level) {
      case AuditLevel.PEA:
        items.push("Utility Bill Analysis (12-36 mo)", "Benchmarking (EPI)");
        color = "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
        break;
      case AuditLevel.Level1:
        items.push("Utility Bill Analysis", "Walk-through Survey", "Low-Cost/No-Cost EEMs");
        color = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
        break;
      case AuditLevel.Level2:
      case AuditLevel.Level3:
        items.push("Detailed Energy Survey", "End-Use Breakdown", "Capital Intensive EEMs", "Financial Analysis");
        color = "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200";
        break;
    }

    // ECBC Scope
    if (goal === ComplianceGoal.Plus || goal === ComplianceGoal.Super) {
        items.push(`Mandatory Checks (${goal})`);
        items.push("LPD & Motor Efficiency Check");
        items.push("Detailed System Efficiency (COP/ISEER)");
        if (!isHighLevelAudit) {
           // Warning color if Audit Level is low but Compliance is high
           color = "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200"; 
        }
    } else {
        items.push("Mandatory Compliance Checks");
    }

    return {
      title: "Combined Audit & Compliance Scope",
      items,
      color
    };
  };

  const currentScope = getScopeRequirements(formData.auditLevel, formData.ecsbcData?.complianceGoal);

  const inputClass = "w-full rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 border p-2 disabled:bg-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-400";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const subLabelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 relative transition-colors duration-200">
      {readOnly && (
        <div className="absolute top-0 right-0 p-4 z-10">
           <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-700">
             <Lock className="w-3 h-3" />
             <span>Read Only Mode</span>
           </span>
        </div>
      )}

      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <nav className="flex -mb-px min-w-max">
          <button
            onClick={() => setActiveTab('site')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'site' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            1. Site & Setup
          </button>
          <button
            onClick={() => setActiveTab('utility')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'utility' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            2. Utility Data
          </button>
          <button
            onClick={() => setActiveTab('ecsbc')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ecsbc' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            3. ECSBC Compliance
          </button>
          <button
            onClick={() => setActiveTab('systems')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'systems' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            4. Systems & Measures
          </button>
          <button
            onClick={() => setActiveTab('water_waste')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'water_waste' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            5. Water & Waste
          </button>
          <button
            onClick={() => setActiveTab('site_ieq')}
            className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'site_ieq' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            6. Site & IEQ
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {activeTab === 'site' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Project Name</label>
              <input
                type="text"
                required
                disabled={readOnly}
                className={inputClass}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="md:row-span-4">
              <label className={labelClass}>Building Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <div className="space-y-1 text-center">
                  {formData.imageUrl ? (
                     <div className="relative group">
                       <img src={formData.imageUrl} alt="Preview" className="mx-auto h-48 object-cover rounded shadow-md" />
                       {!readOnly && (
                         <button 
                           type="button"
                           onClick={() => handleInputChange('imageUrl', undefined)}
                           className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                     </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                        <label className={`relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 focus-within:outline-none ${readOnly ? 'cursor-not-allowed opacity-50' : ''}`}>
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            disabled={readOnly} 
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Scope Section */}
            <div className="col-span-1 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-4 bg-indigo-50/50 dark:bg-indigo-900/10">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Regulatory & Compliance Scope
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-1">ASHRAE Audit Level</label>
                  <select
                    disabled={readOnly}
                    className="w-full rounded border-indigo-200 dark:border-indigo-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm disabled:bg-white/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={formData.auditLevel}
                    onChange={(e) => handleInputChange('auditLevel', e.target.value)}
                  >
                    {Object.values(AuditLevel).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-1">ECBC Target</label>
                    <select
                      disabled={readOnly}
                      className="w-full rounded border-indigo-200 dark:border-indigo-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm disabled:bg-white/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={formData.ecsbcData?.complianceGoal}
                      onChange={(e) => handleNestedChange('ecsbcData', 'complianceGoal', e.target.value)}
                    >
                      {Object.values(ComplianceGoal).map(goal => (
                        <option key={goal} value={goal}>{goal}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-1">Climate Zone</label>
                    <select
                      disabled={readOnly}
                      className="w-full rounded border-indigo-200 dark:border-indigo-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm disabled:bg-white/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      value={formData.ecsbcData?.climateZone}
                      onChange={(e) => handleNestedChange('ecsbcData', 'climateZone', e.target.value)}
                    >
                      {Object.values(ClimateZone).map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Checklist */}
            <div className={`col-span-1 rounded-lg border p-4 ${currentScope.color}`}>
              <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                <ClipboardList className="w-4 h-4" />
                {currentScope.title}
              </h4>
              <ul className="space-y-1.5">
                {currentScope.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <CheckSquare className="w-3.5 h-3.5 mt-0.5 opacity-60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                disabled={readOnly}
                className={inputClass}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Building Classification</label>
              <select
                disabled={readOnly}
                className={inputClass}
                value={formData.buildingType}
                onChange={(e) => handleInputChange('buildingType', e.target.value)}
              >
                {Object.values(BuildingType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gross Floor Area (sq ft)</label>
              <input
                type="number"
                required
                disabled={readOnly}
                className={inputClass}
                value={formData.grossFloorArea}
                onChange={(e) => handleInputChange('grossFloorArea', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Year Built</label>
              <input
                type="number"
                disabled={readOnly}
                className={inputClass}
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value))}
              />
            </div>

            <div className="col-span-1 md:col-span-2 mt-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Areas Excluded from MEPI Calculation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={subLabelClass}>Unconditioned Basement (sq ft)</label>
                  <input
                    type="number"
                    disabled={readOnly}
                    className={inputClass}
                    value={formData.exclusionAreas?.unconditionedBasement || 0}
                    onChange={(e) => handleExclusionChange('unconditionedBasement', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className={subLabelClass}>Refuge Area (sq ft)</label>
                  <input
                    type="number"
                    disabled={readOnly}
                    className={inputClass}
                    value={formData.exclusionAreas?.refugeArea || 0}
                    onChange={(e) => handleExclusionChange('refugeArea', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className={subLabelClass}>Stilt Parking Area (sq ft)</label>
                  <input
                    type="number"
                    disabled={readOnly}
                    className={inputClass}
                    value={formData.exclusionAreas?.stiltParking || 0}
                    onChange={(e) => handleExclusionChange('stiltParking', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ECSBC COMPLIANCE TAB --- */}
        {activeTab === 'ecsbc' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Current Scope:</span> {formData.auditLevel} with {formData.ecsbcData?.complianceGoal} target in {formData.ecsbcData?.climateZone} zone.
                <button type="button" onClick={() => setActiveTab('site')} className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline">Edit in Setup</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-md font-bold text-slate-800 dark:text-white">Level 1: Mandatory Checklist</h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Must be TRUE for Compliance</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { key: 'l1_roofReflectance', label: 'Envelope: Roof has Solar Reflectance > 0.70?' },
                  { key: 'l1_lightingAutoShutoff', label: 'Lighting: 90% of interior lights on Auto Shutoff?' },
                  { key: 'l1_coolingTowerControl', label: 'HVAC: Cooling towers have >50% speed control?' },
                  { key: 'l1_transformerStarRated', label: 'Electrical: Transformers are BEE Star Rated?' },
                  { key: 'l1_powerFactor', label: 'Electrical: Power Factor 0.97 - 0.99 maintained?' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={!!(formData.ecsbcData as any)?.[item.key]}
                        onChange={(e) => handleNestedChange('ecsbcData', item.key, e.target.checked)}
                        disabled={readOnly}
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* ECBC+ Compliance Checklist Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mt-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
                 <h3 className="text-md font-bold text-blue-900 dark:text-blue-100">ECBC+ Compliance Checklist</h3>
                 <span className="text-xs font-mono text-blue-600 dark:text-blue-300">Required for ECBC+ & Super</span>
               </div>
               <div className="p-4 space-y-3">
                 {[
                   { key: 'plus_mandatory', label: 'Mandatory Checks (ECBC+ Compliance)' },
                   { key: 'plus_lpd_motor', label: 'LPD & Motor Efficiency (ECBC+ Targets)' },
                 ].map((item) => (
                   <div key={item.key} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                     <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                         type="checkbox" 
                         className="sr-only peer"
                         checked={!!(formData.ecsbcData as any)?.[item.key]}
                         onChange={(e) => handleNestedChange('ecsbcData', item.key, e.target.checked)}
                         disabled={readOnly}
                       />
                       <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                     </label>
                   </div>
                 ))}
               </div>
            </div>

            {isDetailedAudit ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Envelope Validation */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-between">
                    <span>Level 2: Envelope Validation</span>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${ecsbcValidation.wwrStatus === 'Compliant' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>WWR: {ecsbcValidation.wwrStatus}</span>
                      <span className={`text-xs px-2 py-1 rounded ${ecsbcValidation.srrStatus === 'Compliant' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>SRR: {ecsbcValidation.srrStatus}</span>
                    </div>
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={subLabelClass}>Window Area (m²)</label>
                        <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_windowArea} onChange={(e) => handleNestedChange('ecsbcData', 'l2_windowArea', parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label className={subLabelClass}>Wall Area (m²)</label>
                        <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_wallArea} onChange={(e) => handleNestedChange('ecsbcData', 'l2_wallArea', parseFloat(e.target.value))} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Calculated WWR: <span className="font-bold">{ecsbcValidation.wwr.toFixed(1)}%</span> (Limit: 40%)</p>
                    
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className={subLabelClass}>Skylight Area (m²)</label>
                        <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_skylightArea} onChange={(e) => handleNestedChange('ecsbcData', 'l2_skylightArea', parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label className={subLabelClass}>Roof Area (m²)</label>
                        <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_roofArea} onChange={(e) => handleNestedChange('ecsbcData', 'l2_roofArea', parseFloat(e.target.value))} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Calculated SRR: <span className="font-bold">{ecsbcValidation.srr.toFixed(1)}%</span> (Limit: 5%)</p>
                  </div>
                </div>

                {/* HVAC, Lighting & Systems Validation */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-between">
                    <span>Level 2: Systems & Efficiency</span>
                    <span className={`text-xs px-2 py-1 rounded ${ecsbcValidation.hvacStatus.includes('Non') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{ecsbcValidation.hvacStatus}</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={subLabelClass}>System Type</label>
                        <select className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_hvacSystemType} onChange={(e) => handleNestedChange('ecsbcData', 'l2_hvacSystemType', e.target.value)}>
                          <option value="Chiller">Chiller</option>
                          <option value="VRF">VRF</option>
                          <option value="Split">Split Unit</option>
                          <option value="Package">Package Unit</option>
                        </select>
                      </div>
                      <div>
                        <label className={subLabelClass}>Capacity (kWr)</label>
                        <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_hvacCapacity} onChange={(e) => handleNestedChange('ecsbcData', 'l2_hvacCapacity', parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label className={subLabelClass}>Efficiency (COP/ISEER)</label>
                        <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_hvacEfficiency} onChange={(e) => handleNestedChange('ecsbcData', 'l2_hvacEfficiency', parseFloat(e.target.value))} />
                      </div>
                    </div>
                    
                    {/* Lighting & Electrical Section */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-3">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Lighting & Electrical</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={subLabelClass}>Area Type</label>
                          <input type="text" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_lightingAreaType} onChange={(e) => handleNestedChange('ecsbcData', 'l2_lightingAreaType', e.target.value)} />
                        </div>
                        <div>
                          <label className={subLabelClass}>LPD (W/m²)</label>
                          <input type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_lpd} onChange={(e) => handleNestedChange('ecsbcData', 'l2_lpd', parseFloat(e.target.value))} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Status: <span className={`font-bold ${ecsbcValidation.lpdStatus === 'Compliant' ? 'text-green-600 dark:text-green-400' : (ecsbcValidation.lpdStatus === 'N/A' ? 'text-slate-500 dark:text-slate-400' : 'text-red-600 dark:text-red-400')}`}>{ecsbcValidation.lpdStatus}</span> (Max: {ecsbcValidation.lpdLimit})
                      </p>

                      <div className="mt-3">
                        <label className={subLabelClass}>Motor Efficiency Class</label>
                        <select className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_motorClass} onChange={(e) => handleNestedChange('ecsbcData', 'l2_motorClass', e.target.value)}>
                          <option value="IE2">IE2 (Standard)</option>
                          <option value="IE3">IE3 (Premium)</option>
                          <option value="IE4">IE4 (Super Premium)</option>
                          <option value="IE5">IE5 (Ultra Premium)</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Status: <span className={`font-bold ${ecsbcValidation.motorStatus.includes('Non') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{ecsbcValidation.motorStatus}</span> (Req: IE{ecsbcValidation.requiredMotorLevel})
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                       <label className={subLabelClass}>Service Water Heating (Hotels/Hospitals)</label>
                       <div className="grid grid-cols-2 gap-3">
                          <input placeholder="Demand (LPD)" type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_hotWaterDemand} onChange={(e) => handleNestedChange('ecsbcData', 'l2_hotWaterDemand', parseFloat(e.target.value))} />
                          <input placeholder="Solar Cap (LPD)" type="number" className={inputClass} disabled={readOnly} value={formData.ecsbcData?.l2_solarWaterCapacity} onChange={(e) => handleNestedChange('ecsbcData', 'l2_solarWaterCapacity', parseFloat(e.target.value))} />
                       </div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status: <span className={`font-bold ${ecsbcValidation.solarStatus.includes('Non') ? 'text-red-600 dark:text-red-400' : (ecsbcValidation.solarStatus === 'N/A' ? 'text-slate-500 dark:text-slate-400' : 'text-green-600 dark:text-green-400')}`}>{ecsbcValidation.solarStatus}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800 flex items-start gap-3 mt-6">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Advanced Inputs Required</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Level 2 technical validation (WWR, LPD, HVAC Efficiency) is only available for Level 2 and Level 3 audits. 
                    Please upgrade the Audit Level in the "Site & Building" tab to unlock these fields.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Utility Tab --- */}
        {activeTab === 'utility' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Historical Utility Bills</h3>
                {isDetailedAudit && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Level 2/3 requires detailed Demand (kW) and Rate Structure analysis.</p>
                )}
              </div>
              <div className="flex gap-2">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={autoPopulateUnits}
                    className="flex items-center space-x-1 text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded transition-colors"
                    title="Set standard units based on Fuel Type"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto-fill Units</span>
                  </button>
                )}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={addUtilityRow}
                    className="flex items-center space-x-1 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Meter</span>
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {formData.utilityData.map((data, idx) => (
                <div key={idx} className="flex flex-wrap lg:flex-nowrap gap-4 items-end bg-slate-50 dark:bg-slate-900/30 p-4 rounded border border-slate-200 dark:border-slate-700">
                  <div className="w-full lg:w-1/6">
                    <label className={subLabelClass}>Fuel Type</label>
                    <select
                      disabled={readOnly}
                      className={inputClass}
                      value={data.fuelType}
                      onChange={(e) => updateUtilityData(idx, 'fuelType', e.target.value)}
                    >
                      <option>Electricity</option>
                      <option>Natural Gas</option>
                      <option>Oil</option>
                      <option>District Steam</option>
                    </select>
                  </div>
                  <div className="w-full lg:w-1/6">
                    <label className={subLabelClass}>Annual Cons. ({data.unit})</label>
                    <input
                      type="number"
                      disabled={readOnly}
                      className={inputClass}
                      value={data.annualConsumption}
                      onChange={(e) => updateUtilityData(idx, 'annualConsumption', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-full lg:w-1/6">
                    <label className={subLabelClass}>Annual Cost (₹)</label>
                    <input
                      type="number"
                      disabled={readOnly}
                      className={inputClass}
                      value={data.annualCost}
                      onChange={(e) => updateUtilityData(idx, 'annualCost', parseFloat(e.target.value))}
                    />
                  </div>
                  
                  {/* Additional fields for Detailed Audits (Level 2+) */}
                  {isDetailedAudit && (
                    <>
                      <div className="w-full lg:w-1/6">
                        <label className={subLabelClass}>Peak Demand (kW)</label>
                        <input
                          type="number"
                          disabled={readOnly}
                          className={inputClass}
                          value={data.peakDemand || ''}
                          onChange={(e) => updateUtilityData(idx, 'peakDemand', parseFloat(e.target.value))}
                          placeholder="Max kW"
                        />
                      </div>
                      <div className="w-full lg:w-1/6">
                        <label className={subLabelClass}>Rate Structure</label>
                        <input
                          type="text"
                          disabled={readOnly}
                          className={inputClass}
                          value={data.rateStructure || ''}
                          onChange={(e) => updateUtilityData(idx, 'rateStructure', e.target.value)}
                          placeholder="e.g. TOU-A"
                        />
                      </div>
                    </>
                  )}

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeUtilityRow(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {formData.utilityData.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No utility data added. {readOnly ? '' : "Click 'Add Meter' to begin."}</p>
              )}
            </div>
          </div>
        )}

        {/* --- SYSTEMS & MEASURES TAB --- */}
        {activeTab === 'systems' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HVAC Section */}
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  HVAC System
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                       <label className={subLabelClass}>System Type</label>
                       <input type="text" className={inputClass} disabled={readOnly} value={formData.systemData?.hvacType} onChange={(e) => handleNestedChange('systemData', 'hvacType', e.target.value)} placeholder="e.g. VAV with Reheat" />
                    </div>
                    <div>
                       <label className={subLabelClass}>Age (Years)</label>
                       <input type="number" className={inputClass} disabled={readOnly} value={formData.systemData?.hvacAge} onChange={(e) => handleNestedChange('systemData', 'hvacAge', parseInt(e.target.value))} />
                    </div>
                    <div>
                       <label className={subLabelClass}>Condition</label>
                       <select className={inputClass} disabled={readOnly} value={formData.systemData?.hvacCondition} onChange={(e) => handleNestedChange('systemData', 'hvacCondition', e.target.value)}>
                         <option>Good</option>
                         <option>Fair</option>
                         <option>Poor</option>
                       </select>
                    </div>
                    <div>
                       <label className={subLabelClass}>Cooling Cap (Tons)</label>
                       <input type="number" className={inputClass} disabled={readOnly} value={formData.systemData?.coolingCapacity} onChange={(e) => handleNestedChange('systemData', 'coolingCapacity', parseFloat(e.target.value))} />
                    </div>
                    <div>
                       <label className={subLabelClass}>Heating Cap (MBH)</label>
                       <input type="number" className={inputClass} disabled={readOnly} value={formData.systemData?.heatingCapacity} onChange={(e) => handleNestedChange('systemData', 'heatingCapacity', parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lighting Section */}
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Lighting System
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className={subLabelClass}>Fixture Type</label>
                    <input type="text" className={inputClass} disabled={readOnly} value={formData.systemData?.lightingType} onChange={(e) => handleNestedChange('systemData', 'lightingType', e.target.value)} placeholder="e.g. T8 Fluorescent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={subLabelClass}>Controls</label>
                      <select className={inputClass} disabled={readOnly} value={formData.systemData?.lightingControls} onChange={(e) => handleNestedChange('systemData', 'lightingControls', e.target.value)}>
                        <option>None</option>
                        <option>Occupancy Sensors</option>
                        <option>Daylight Harvesting</option>
                        <option>Timers</option>
                      </select>
                    </div>
                    <div>
                      <label className={subLabelClass}>% LED</label>
                      <input type="number" className={inputClass} disabled={readOnly} value={formData.systemData?.percentLED} onChange={(e) => handleNestedChange('systemData', 'percentLED', parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Envelope Section */}
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Building Envelope & DHW
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className={subLabelClass}>Glass Type</label>
                       <select className={inputClass} disabled={readOnly} value={formData.systemData?.envelopeGlassType} onChange={(e) => handleNestedChange('systemData', 'envelopeGlassType', e.target.value)}>
                         <option>Single Pane</option>
                         <option>Double Pane</option>
                         <option>Double Pane Low-E</option>
                       </select>
                     </div>
                     <div>
                       <label className={subLabelClass}>Insulation</label>
                       <select className={inputClass} disabled={readOnly} value={formData.systemData?.envelopeInsulation} onChange={(e) => handleNestedChange('systemData', 'envelopeInsulation', e.target.value)}>
                         <option>Poor</option>
                         <option>Average</option>
                         <option>Good</option>
                       </select>
                     </div>
                     <div>
                       <label className={subLabelClass}>Roof Condition</label>
                       <select className={inputClass} disabled={readOnly} value={formData.systemData?.roofCondition} onChange={(e) => handleNestedChange('systemData', 'roofCondition', e.target.value)}>
                         <option>Good</option>
                         <option>Fair</option>
                         <option>Poor</option>
                       </select>
                     </div>
                     <div>
                       <label className={subLabelClass}>DHW System</label>
                       <input type="text" className={inputClass} disabled={readOnly} value={formData.systemData?.dhwSystem} onChange={(e) => handleNestedChange('systemData', 'dhwSystem', e.target.value)} />
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* EEM Management */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Energy Efficiency Measures (EEMs)</h3>
                <div className="flex space-x-2">
                   <div className="relative">
                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search measures..." 
                        className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm w-48 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-green-500 focus:border-green-500"
                        value={eemSearchTerm}
                        onChange={(e) => setEemSearchTerm(e.target.value)}
                      />
                   </div>
                   <div className="relative">
                      <Filter className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <select 
                        className="pl-9 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        value={eemFilterType}
                        onChange={(e) => setEemFilterType(e.target.value)}
                      >
                         <option value="All">All Types</option>
                         <option value="No-Cost/Low-Cost">No/Low Cost</option>
                         <option value="Capital Investment">Capital</option>
                         <option value="O&M">O&M</option>
                      </select>
                   </div>
                </div>
              </div>

              {/* Add New EEM Form */}
              {!readOnly && (
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                   <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add Manual Measure</h4>
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-3">
                        <label className={subLabelClass}>Title</label>
                        <input type="text" className={inputClass} value={newEem.title} onChange={(e) => handleNewEemChange('title', e.target.value)} />
                      </div>
                      <div className="md:col-span-4">
                        <label className={subLabelClass}>Description</label>
                        <input type="text" className={inputClass} value={newEem.description} onChange={(e) => handleNewEemChange('description', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                         <label className={subLabelClass}>Type</label>
                         <select className={inputClass} value={newEem.type} onChange={(e) => handleNewEemChange('type', e.target.value)}>
                           <option>No-Cost/Low-Cost</option>
                           <option>Capital Investment</option>
                           <option>O&M</option>
                         </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className={subLabelClass}>Cost (₹)</label>
                        <input type="number" className={inputClass} value={newEem.estimatedCost} onChange={(e) => handleNewEemChange('estimatedCost', parseFloat(e.target.value))} />
                      </div>
                      <div className="md:col-span-1">
                        <label className={subLabelClass}>Save (₹)</label>
                        <input type="number" className={inputClass} value={newEem.estimatedSavings} onChange={(e) => handleNewEemChange('estimatedSavings', parseFloat(e.target.value))} />
                      </div>
                      <div className="md:col-span-1">
                        <button type="button" onClick={addManualEEM} className="w-full bg-green-600 text-white rounded p-2 hover:bg-green-700 flex justify-center"><PlusCircle className="w-5 h-5" /></button>
                      </div>
                   </div>
                </div>
              )}

              {/* List */}
              <div className="space-y-3">
                 {filteredEEMs.map((eem) => (
                   <div key={eem.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">{eem.title}</span>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                            eem.type === 'No-Cost/Low-Cost' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800' : 
                            eem.type === 'O&M' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800' : 
                            'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800'
                          }`}>{eem.type}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{eem.description}</p>
                      </div>
                      <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                         <div className="text-center">
                           <div className="text-xs text-slate-400 uppercase">Cost</div>
                           <div className="font-medium">₹{eem.estimatedCost.toLocaleString()}</div>
                         </div>
                         <div className="text-center">
                           <div className="text-xs text-slate-400 uppercase">Savings</div>
                           <div className="font-medium text-green-600 dark:text-green-400">₹{eem.estimatedSavings.toLocaleString()}</div>
                         </div>
                         <div className="text-center">
                           <div className="text-xs text-slate-400 uppercase">Payback</div>
                           <div className="font-medium">{eem.paybackPeriod} yrs</div>
                         </div>
                      </div>
                   </div>
                 ))}
                 {filteredEEMs.length === 0 && (
                   <div className="text-center py-8 text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 rounded border border-slate-100 dark:border-slate-800">No measures found matching your filters.</div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* --- WATER & WASTE TAB --- */}
        {activeTab === 'water_waste' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Water Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    Water Management
                  </h3>
                  <div className="space-y-4">
                     {/* Daily Consumption */}
                     <div>
                       <label className={labelClass}>
                         Daily Water Consumption (kL)
                         <span className="text-slate-400 text-xs font-normal ml-2">Total site usage</span>
                       </label>
                       <input 
                         type="number" 
                         className={inputClass} 
                         disabled={readOnly} 
                         value={formData.waterData?.dailyWaterConsumption} 
                         onChange={(e) => handleNestedChange('waterData', 'dailyWaterConsumption', parseFloat(e.target.value))} 
                       />
                     </div>
                     {/* Fixture Efficiency */}
                     <div>
                       <label className={labelClass}>
                         Fixture Efficiency
                       </label>
                       <select 
                         className={inputClass} 
                         disabled={readOnly} 
                         value={formData.waterData?.fixtureEfficiency} 
                         onChange={(e) => handleNestedChange('waterData', 'fixtureEfficiency', e.target.value)}
                       >
                         <option>Standard</option>
                         <option>Low-Flow</option>
                         <option>Ultra-Low-Flow</option>
                       </select>
                     </div>
                     {/* RWH */}
                     <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Rainwater Harvesting System?</span>
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 text-green-600 rounded border-gray-300 dark:border-slate-600 focus:ring-green-500" 
                          disabled={readOnly} 
                          checked={formData.waterData?.rainwaterHarvesting} 
                          onChange={(e) => handleNestedChange('waterData', 'rainwaterHarvesting', e.target.checked)} 
                        />
                     </div>
                     {/* STP */}
                     <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Sewage Treatment Plant (STP) Installed?</span>
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 text-green-600 rounded border-gray-300 dark:border-slate-600 focus:ring-green-500" 
                          disabled={readOnly} 
                          checked={formData.waterData?.stpInstalled} 
                          onChange={(e) => handleNestedChange('waterData', 'stpInstalled', e.target.checked)} 
                        />
                     </div>
                  </div>
                </div>

                {/* Waste Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                    Waste Management
                  </h3>
                  <div className="space-y-4">
                     {/* Organic Waste */}
                     <div>
                       <label className={labelClass}>
                         Organic Waste Treatment
                       </label>
                       <select 
                         className={inputClass} 
                         disabled={readOnly} 
                         value={formData.wasteData?.organicWasteTreatment} 
                         onChange={(e) => handleNestedChange('wasteData', 'organicWasteTreatment', e.target.value)}
                       >
                         <option>None</option>
                         <option>Composting</option>
                         <option>Vermiculture</option>
                         <option>Municipal Pickup</option>
                       </select>
                     </div>
                     {/* Construction Waste */}
                     <div>
                       <label className={labelClass}>
                         Construction Waste Diverted (%)
                         <span className="text-slate-400 text-xs font-normal ml-2">From landfill</span>
                       </label>
                       <input 
                         type="number" 
                         className={inputClass} 
                         disabled={readOnly} 
                         value={formData.wasteData?.constructionWasteDiverted} 
                         onChange={(e) => handleNestedChange('wasteData', 'constructionWasteDiverted', parseFloat(e.target.value))} 
                       />
                     </div>
                     {/* Segregation */}
                     <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Segregation Bins (Color Coded)?</span>
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 text-green-600 rounded border-gray-300 dark:border-slate-600 focus:ring-green-500" 
                          disabled={readOnly} 
                          checked={formData.wasteData?.segregationBins} 
                          onChange={(e) => handleNestedChange('wasteData', 'segregationBins', e.target.checked)} 
                        />
                     </div>
                     {/* Hazardous */}
                     <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Hazardous Waste Protocols?</span>
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 text-green-600 rounded border-gray-300 dark:border-slate-600 focus:ring-green-500" 
                          disabled={readOnly} 
                          checked={formData.wasteData?.hazardousWasteHandling} 
                          onChange={(e) => handleNestedChange('wasteData', 'hazardousWasteHandling', e.target.checked)} 
                        />
                     </div>
                  </div>
                </div>
             </div>
           </div>
        )}

        {/* --- SITE & IEQ TAB --- */}
        {activeTab === 'site_ieq' && (
           <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Sustainable Site & IEQ
                </h3>
                
                {/* New EV Section */}
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4" />
                    EV Charging Infrastructure
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={subLabelClass}>Number of Stations</label>
                      <input 
                        type="number" 
                        className={inputClass} 
                        disabled={readOnly} 
                        value={formData.siteIEQData?.evChargingPoints} 
                        onChange={(e) => handleNestedChange('siteIEQData', 'evChargingPoints', parseInt(e.target.value))} 
                      />
                    </div>
                    <div>
                      <label className={subLabelClass}>Total Power Capacity (kW)</label>
                      <input 
                        type="number" 
                        className={inputClass} 
                        disabled={readOnly} 
                        value={formData.siteIEQData?.evTotalPowerCapacity || ''} 
                        onChange={(e) => handleNestedChange('siteIEQData', 'evTotalPowerCapacity', parseFloat(e.target.value))} 
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className={subLabelClass}>Connector Type</label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        disabled={readOnly} 
                        value={formData.siteIEQData?.evConnectorTypes || ''} 
                        onChange={(e) => handleNestedChange('siteIEQData', 'evConnectorTypes', e.target.value)} 
                        placeholder="e.g., Type 2, CCS"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Greenery Coverage (%)</label>
                    <input type="number" className={inputClass} disabled={readOnly} value={formData.siteIEQData?.greeneryCoverage} onChange={(e) => handleNestedChange('siteIEQData', 'greeneryCoverage', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className={labelClass}>Daylighting (% Floor Area)</label>
                    <input type="number" className={inputClass} disabled={readOnly} value={formData.siteIEQData?.daylightingPercent} onChange={(e) => handleNestedChange('siteIEQData', 'daylightingPercent', parseFloat(e.target.value))} />
                  </div>
                  <div className="flex flex-col justify-end space-y-3">
                     <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Heat Island Reduction (Cool Roof)?</span>
                        <input type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300 dark:border-slate-600" disabled={readOnly} checked={formData.siteIEQData?.heatIslandReductionRoof} onChange={(e) => handleNestedChange('siteIEQData', 'heatIslandReductionRoof', e.target.checked)} />
                     </div>
                     <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Air Quality Monitoring (CO2/PM)?</span>
                        <input type="checkbox" className="h-4 w-4 text-green-600 rounded border-gray-300 dark:border-slate-600" disabled={readOnly} checked={formData.siteIEQData?.airQualityMonitoring} onChange={(e) => handleNestedChange('siteIEQData', 'airQualityMonitoring', e.target.checked)} />
                     </div>
                  </div>
                </div>
             </div>
           </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
             type="button"
             onClick={handlePublish}
             disabled={!canPublish || readOnly || formData.status === 'Published'}
             className={`px-6 py-2 rounded-lg font-medium transition-colors ${
               canPublish && formData.status !== 'Published' && !readOnly
                 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                 : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
             }`}
          >
            {formData.status === 'Published' ? 'Published' : 'Publish Audit'}
          </button>

          <button
            type="submit"
            disabled={readOnly}
            className={`px-6 py-2 rounded-lg font-medium flex items-center shadow-md transition-all ${
               readOnly ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuditForm;