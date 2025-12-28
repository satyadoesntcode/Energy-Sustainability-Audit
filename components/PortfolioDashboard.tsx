import React, { useMemo, useState } from 'react';
import { Audit, BuildingType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Zap, TrendingDown, Filter, PieChart } from 'lucide-react';

interface PortfolioDashboardProps {
  audits: Audit[];
}

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ audits }) => {
  // Filters State
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All');

  // Utility: Get Quarter from date
  const getQuarter = (dateStr: string) => {
    const month = new Date(dateStr).getMonth() + 1;
    return Math.ceil(month / 3);
  };

  // Filter Logic
  const filteredAudits = useMemo(() => {
    return audits.filter(a => {
      const aDate = new Date(a.auditDate);
      const yearMatch = selectedYear === 'All' || aDate.getFullYear().toString() === selectedYear;
      const quarterMatch = selectedQuarter === 'All' || getQuarter(a.auditDate).toString() === selectedQuarter;
      const typeMatch = selectedType === 'All' || a.buildingType === selectedType;
      return yearMatch && quarterMatch && typeMatch;
    });
  }, [audits, selectedType, selectedYear, selectedQuarter]);

  // Aggregations
  const stats = useMemo(() => {
    // Note: grossFloorArea in Audit type is sq ft.
    // To weight EPI (which is kWh/m2), we should ideally convert area to m2 first, 
    // but the ratio holds true if we just use area as weight.
    const totalArea = filteredAudits.reduce((sum, a) => sum + a.grossFloorArea, 0);
    const totalCost = filteredAudits.reduce((sum, a) => sum + (a.eci * a.grossFloorArea), 0);
    const totalSavings = filteredAudits.reduce((sum, a) => sum + a.eems.reduce((s, e) => s + e.estimatedSavings, 0), 0);
    
    // Weighted Average EPI
    const weightedEPI = totalArea > 0 
      ? filteredAudits.reduce((sum, a) => sum + (a.epi * a.grossFloorArea), 0) / totalArea 
      : 0;

    return { totalArea, totalCost, totalSavings, weightedEPI };
  }, [filteredAudits]);

  // Chart Data Preparation
  const epiByBuildingData = filteredAudits.map(a => ({
    name: a.name,
    epi: a.epi,
    benchmark: a.benchmarkEpi || 0
  }));

  const savingsByBuildingData = filteredAudits.map(a => ({
    name: a.name,
    savings: a.eems.reduce((sum, e) => sum + e.estimatedSavings, 0),
    cost: a.eci * a.grossFloorArea
  }));

  // Unique years for filter
  const years = Array.from(new Set(audits.map(a => new Date(a.auditDate).getFullYear()))).sort();

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-slate-500 font-medium">
          <Filter className="w-4 h-4 mr-2" />
          Filters:
        </div>
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
          className="border-slate-300 rounded text-sm p-1.5 bg-slate-50"
        >
          <option value="All">All Building Types</option>
          {Object.values(BuildingType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border-slate-300 rounded text-sm p-1.5 bg-slate-50"
        >
          <option value="All">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
          value={selectedQuarter} 
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className="border-slate-300 rounded text-sm p-1.5 bg-slate-50"
        >
          <option value="All">All Quarters</option>
          <option value="1">Q1</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>
        
        <div className="ml-auto text-sm text-slate-500">
          Showing {filteredAudits.length} Audits
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Energy Cost</div>
          <div className="text-2xl font-bold text-slate-900">₹{stats.totalCost.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Filtered Portfolio</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg EPI (Weighted)</div>
          <div className="text-2xl font-bold text-slate-900">{stats.weightedEPI.toFixed(1)}</div>
          <div className="text-xs text-slate-400 mt-1">kWh/m²/yr</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Identified Savings</div>
          <div className="text-2xl font-bold text-emerald-600">₹{stats.totalSavings.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Potential Annual</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Compliance Rate</div>
          <div className="text-2xl font-bold text-slate-900">
            {Math.round((filteredAudits.filter(a => a.status === 'Published').length / (filteredAudits.length || 1)) * 100)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Published Audits</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">EPI vs Benchmark by Facility</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={epiByBuildingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={60}/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="epi" name="Actual EPI" fill="#3b82f6" />
                <Bar dataKey="benchmark" name="Benchmark" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cost vs Savings Potential</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsByBuildingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="cost" name="Annual Cost" fill="#ef4444" stackId="a" />
                <Bar dataKey="savings" name="Potential Savings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;