import React, { useMemo, useState } from 'react';
import { Audit } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ReferenceLine } from 'recharts';
import { IndianRupee, Zap, TrendingDown, Building, Scale, Award, TrendingUp, Users, Leaf, Sun, Wind, BatteryCharging } from 'lucide-react';

interface DashboardProps {
  audit: Audit;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC<DashboardProps> = ({ audit }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'compliance'>('overview');
  
  const totalCost = useMemo(() => 
    audit.utilityData.reduce((acc, curr) => acc + curr.annualCost, 0), 
  [audit]);

  const potentialSavings = useMemo(() => 
    audit.eems.reduce((acc, curr) => acc + curr.estimatedSavings, 0),
  [audit]);

  const totalInvestment = useMemo(() => 
    audit.eems.reduce((acc, curr) => acc + curr.estimatedCost, 0),
  [audit]);

  const complianceInvestment = useMemo(() => 
    audit.complianceRecommendations ? audit.complianceRecommendations.reduce((acc, curr) => acc + curr.investment, 0) : 0,
  [audit]);

  const cashFlowData = useMemo(() => {
    const data = [];
    // 10 Year projection
    for (let i = 0; i <= 10; i++) {
      data.push({
        year: `Yr ${i}`,
        value: -totalInvestment + (potentialSavings * i),
      });
    }
    return data;
  }, [totalInvestment, potentialSavings]);

  const benchmarkData = [
    { name: 'This Building', epi: audit.epi },
    { name: 'Benchmark', epi: audit.benchmarkEpi || 0 },
  ];

  // Helper for Compliance Badge Color
  const getComplianceColor = (rating: string) => {
    switch (rating) {
      case 'Super ECBC': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'ECBC+': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'ECBC Compliant': return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      default: return 'text-red-700 bg-red-100 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-500 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">EPI & MEPI</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-slate-900">{audit.epi}</span>
              <span className="text-xs text-slate-500 mb-1">kWh/m²/yr</span>
            </div>
            {audit.mepi && (
              <div className="flex items-center space-x-2 text-sm mt-1">
                <span className="font-semibold text-blue-600">{audit.mepi}</span>
                <span className="text-slate-400 text-xs">kWh/m²/yr (MEPI)</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-500 mb-2">
            <IndianRupee className="w-5 h-5" />
            <span className="text-sm font-medium">Annual Energy Cost</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            ₹{totalCost.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">₹{audit.eci.toFixed(2)} / sq ft</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-500 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">ECBC Rating</span>
          </div>
          <div className="mt-1">
             <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getComplianceColor(audit.complianceRating)}`}>
               {audit.complianceRating}
             </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
             Target: {audit.complianceRating === 'Not Compliant' ? 'ECBC Compliant' : (audit.complianceRating === 'ECBC Compliant' ? 'ECBC+' : 'Super ECBC')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex items-center space-x-3 text-slate-500 mb-2">
            <Building className="w-5 h-5" />
            <span className="text-sm font-medium">Audit Level</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {audit.auditLevel.split('-')[0].trim()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {audit.status}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'financials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Financial Analysis
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            ECBC Compliance Strategy
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-2">
        {activeTab === 'overview' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Benchmarking Chart */}
            <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Benchmarking (EPI)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="epi" fill="#16a34a" name="EPI (kWh/m²/yr)" radius={[0, 4, 4, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Comparison of your building's Energy Performance Index against standard benchmarks for {audit.buildingType}s.
              </p>
            </div>

            {/* End Use Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Energy End-Use Breakdown</h3>
              <div className="h-64">
                {audit.endUseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={audit.endUseBreakdown as any[]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="percentage"
                        label={({name, value}: any) => `${name} (${value}%)`}
                      >
                        {audit.endUseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    No breakdown data available for PEA level.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Cumulative Cash Flow Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Cumulative Cash Flow Projection</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Legend />
                        <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="value" name="Net Cumulative Cash Flow" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Investment Stats */}
                <div className="bg-white p-6 rounded-lg shadow border border-slate-200 flex flex-col justify-center space-y-6">
                   <div>
                      <div className="text-slate-500 text-sm font-medium uppercase">Total Capex Required</div>
                      <div className="text-3xl font-bold text-slate-900 mt-1">₹{totalInvestment.toLocaleString()}</div>
                   </div>
                   <div>
                      <div className="text-slate-500 text-sm font-medium uppercase">Annual Savings Projected</div>
                      <div className="text-3xl font-bold text-green-600 mt-1">₹{potentialSavings.toLocaleString()}</div>
                   </div>
                   <div>
                      <div className="text-slate-500 text-sm font-medium uppercase">Simple Payback Period</div>
                      <div className="text-3xl font-bold text-blue-600 mt-1">
                        {potentialSavings > 0 ? (totalInvestment / potentialSavings).toFixed(1) : 0} Years
                      </div>
                   </div>
                </div>
             </div>

              {/* EEM List Table */}
              <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800">Energy Efficiency Measures (EEMs)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">Measure</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Est. Cost</th>
                        <th className="px-6 py-3 text-right">Annual Savings</th>
                        <th className="px-6 py-3 text-right">Payback (Yrs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.eems.length > 0 ? (
                        audit.eems.map((eem) => (
                          <tr key={eem.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">
                              {eem.title}
                              <div className="text-xs text-slate-500 font-normal mt-1">{eem.description}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                eem.type === 'No-Cost/Low-Cost' ? 'bg-blue-100 text-blue-800' :
                                eem.type === 'O&M' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {eem.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">₹{eem.estimatedCost.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-green-600 font-medium">₹{eem.estimatedSavings.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">{eem.paybackPeriod}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No measures defined yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className={`p-4 rounded-full ${
                    audit.complianceRating === 'Super ECBC' ? 'bg-emerald-100 text-emerald-600' : 
                    audit.complianceRating === 'ECBC+' ? 'bg-blue-100 text-blue-600' :
                    audit.complianceRating === 'ECBC Compliant' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-red-100 text-red-600'
                 }`}>
                   <Award className="w-10 h-10" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">Current Status: {audit.complianceRating}</h3>
                   <p className="text-slate-500 text-sm mt-1">
                     Your EPI of <span className="font-semibold text-slate-700">{audit.epi}</span> vs Benchmark <span className="font-semibold text-slate-700">{audit.benchmarkEpi}</span>
                   </p>
                 </div>
              </div>
              <div className="flex gap-8 text-center md:text-right">
                <div>
                   <div className="text-sm text-slate-500 font-medium uppercase">Next Target</div>
                   <div className="text-xl font-bold text-blue-600">
                      {audit.complianceRating === 'Not Compliant' ? 'ECBC Compliant' : 
                       audit.complianceRating === 'ECBC Compliant' ? 'ECBC+' : 
                       audit.complianceRating === 'ECBC+' ? 'Super ECBC' : 'Maintained'}
                   </div>
                </div>
                <div>
                   <div className="text-sm text-slate-500 font-medium uppercase">Est. Investment</div>
                   <div className="text-xl font-bold text-slate-900">₹{complianceInvestment.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Site & IEQ Summary Card */}
            {audit.siteIEQData && (
              <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
                 <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Sustainable Site & IEQ Status</h3>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                       <BatteryCharging className="w-8 h-8 text-blue-400" />
                       <div>
                          <div className="text-xs text-slate-500 uppercase font-medium">EV Charging</div>
                          <div className="font-bold text-slate-900">{audit.siteIEQData.evChargingPoints} Points</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Leaf className="w-8 h-8 text-green-400" />
                       <div>
                          <div className="text-xs text-slate-500 uppercase font-medium">Greenery</div>
                          <div className="font-bold text-slate-900">{audit.siteIEQData.greeneryCoverage}% Coverage</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Sun className="w-8 h-8 text-amber-400" />
                       <div>
                          <div className="text-xs text-slate-500 uppercase font-medium">Daylighting</div>
                          <div className="font-bold text-slate-900">{audit.siteIEQData.daylightingPercent}% Floor Area</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Wind className="w-8 h-8 text-slate-400" />
                       <div>
                          <div className="text-xs text-slate-500 uppercase font-medium">Air Quality</div>
                          <div className={`font-bold ${audit.siteIEQData.airQualityMonitoring ? 'text-green-600' : 'text-slate-400'}`}>
                             {audit.siteIEQData.airQualityMonitoring ? 'Monitored' : 'Not Monitored'}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Recommendations Table */}
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Recommendations to Achieve Next Rating</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Specific system-level interventions required to meet compliance targets.</p>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                      <tr>
                        <th className="px-6 py-3">Target Level</th>
                        <th className="px-6 py-3">System</th>
                        <th className="px-6 py-3">Recommended Action</th>
                        <th className="px-6 py-3">Responsible Team</th>
                        <th className="px-6 py-3 text-right">Investment Required</th>
                      </tr>
                    </thead>
                    <tbody>
                       {audit.complianceRecommendations && audit.complianceRecommendations.length > 0 ? (
                         audit.complianceRecommendations.map((rec, idx) => (
                           <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                             <td className="px-6 py-4">
                               <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs font-medium">
                                 {rec.targetLevel}
                               </span>
                             </td>
                             <td className="px-6 py-4 font-semibold text-slate-800">{rec.system}</td>
                             <td className="px-6 py-4">{rec.description}</td>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <Users className="w-3 h-3 text-slate-400" />
                                 <span>{rec.responsibleTeam}</span>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-right font-medium text-slate-900">₹{rec.investment.toLocaleString()}</td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                             <p>No specific compliance recommendations generated yet.</p>
                             <p className="text-xs mt-1">Use the AI Assistant to generate a roadmap.</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                    {audit.complianceRecommendations && audit.complianceRecommendations.length > 0 && (
                      <tfoot className="bg-slate-50 font-semibold text-slate-900">
                        <tr>
                          <td colSpan={4} className="px-6 py-3 text-right">Total Investment Required:</td>
                          <td className="px-6 py-3 text-right">₹{complianceInvestment.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;