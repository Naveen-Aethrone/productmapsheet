
import React, { useState, useCallback, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Download, 
  Play, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Search,
  Users,
  Globe,
  Zap,
  Cpu,
  Layers,
  Settings2
} from 'lucide-react';
import { CompanyData } from './types';
import { parseFile, exportToExcel } from './services/excelService';
import { researchCompany } from './services/geminiService';

const App: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseFile(file);
      setCompanies(data);
      setProgress(0);
    } catch (error) {
      alert("Error reading file. Please ensure it is a valid Excel or CSV.");
    }
  };

  const processBatch = async () => {
    if (companies.length === 0) return;
    setIsProcessing(true);
    const updatedCompanies = [...companies];

    for (let i = 0; i < updatedCompanies.length; i++) {
      if (updatedCompanies[i].status === 'completed') continue;

      updatedCompanies[i].status = 'processing';
      setCompanies([...updatedCompanies]);

      try {
        const result = await researchCompany(updatedCompanies[i].name);
        updatedCompanies[i] = {
          ...updatedCompanies[i],
          ...result,
          status: 'completed'
        };
      } catch (err) {
        updatedCompanies[i].status = 'error';
        updatedCompanies[i].error = 'Failed to fetch data';
      }

      setCompanies([...updatedCompanies]);
      setProgress(Math.round(((i + 1) / updatedCompanies.length) * 100));
      
      await new Promise(r => setTimeout(r, 500));
    }

    setIsProcessing(false);
  };

  const clearAll = () => {
    setCompanies([]);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const completedCount = companies.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">UAV Intelligence Hub</h1>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">B2B Product Mapper</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              disabled={isProcessing || companies.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
              Clear
            </button>
            <button
              onClick={() => exportToExcel(companies)}
              disabled={isProcessing || companies.length === 0}
              className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Result
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-3 bg-white
                ${companies.length === 0 ? 'border-slate-300 h-48 hover:border-blue-500 cursor-pointer shadow-sm' : 'border-green-200 h-28'}`}
              onClick={() => companies.length === 0 && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
              />
              <div className={`p-2 rounded-full ${companies.length === 0 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                {companies.length === 0 ? <Upload className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 text-sm">
                  {companies.length === 0 ? 'Upload Sheet' : `${companies.length} Loaded`}
                </p>
                {companies.length === 0 && <p className="text-[11px] text-slate-500 uppercase font-semibold">Excel or CSV</p>}
              </div>
              {companies.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  REPLACE FILE
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Control Center</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>PROGRESS</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold">READY</div>
                    <div className="text-sm font-bold text-slate-800">{companies.length - completedCount}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-100">
                    <div className="text-[10px] text-green-500 font-bold">ENRICHED</div>
                    <div className="text-sm font-bold text-green-700">{completedCount}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={processBatch}
                disabled={isProcessing || companies.length === 0 || completedCount === companies.length}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    MAPPING...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    START RESEARCH
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presence</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">UAV Segment</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">L/R Needs</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Services</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offer Targets</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-20 text-center text-slate-300">
                          <Search className="w-10 h-10 mx-auto mb-2 opacity-10" />
                          <p className="text-sm font-medium italic">Load a company sheet to populate the intelligence grid</p>
                        </td>
                      </tr>
                    ) : (
                      companies.map((company) => (
                        <tr key={company.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                          <td className="px-4 py-3 min-w-[180px]">
                            <div className="font-bold text-slate-800 truncate">{company.name}</div>
                            {company.website && company.website !== 'N/A' && (
                              <a 
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                target="_blank" 
                                className="text-[10px] text-blue-500 font-semibold hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[140px]"
                              >
                                Site <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={company.status} />
                          </td>
                          <td className="px-4 py-3">
                            {company.countries && company.countries !== 'N/A' ? (
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {company.countries.split(',').map((c, i) => (
                                  <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase truncate">
                                    {c.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                             <TechLabel value={company.uavType} icon={<Zap className="w-3 h-3"/>} />
                          </td>
                          <td className="px-4 py-3">
                             <TechLabel value={company.launchRecovery} />
                          </td>
                          <td className="px-4 py-3">
                             <TechLabel value={company.servicesRequired} icon={<Cpu className="w-3 h-3"/>} />
                          </td>
                          <td className="px-4 py-3">
                             <div className="space-y-1">
                                <OfferBadge value={company.manufacturing} label="MFG" icon={<Settings2 className="w-2.5 h-2.5"/>} />
                                <OfferBadge value={company.composites} label="CMP" icon={<Layers className="w-2.5 h-2.5"/>} />
                             </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[10px] space-y-0.5">
                              {company.linkedin && company.linkedin !== 'N/A' && (
                                <a href={company.linkedin} target="_blank" className="text-blue-600 font-bold hover:underline block truncate max-w-[100px]">LinkedIn</a>
                              )}
                              {company.email && company.email !== 'N/A' && <div className="text-slate-500 font-medium truncate max-w-[100px]">{company.email}</div>}
                              {company.size && company.size !== 'N/A' && <div className="text-slate-400 font-bold uppercase text-[9px]">{company.size} EMP</div>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>UAV Intelligence Engine</span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            System Active
          </span>
        </div>
      </footer>
    </div>
  );
};

const TechLabel: React.FC<{ value?: string, icon?: React.ReactNode }> = ({ value, icon }) => {
  if (!value || value === 'N/A') return <span className="text-slate-300 text-xs">—</span>;
  
  const isHighValue = value.toLowerCase().includes('both') || value.toLowerCase().includes('big');
  
  return (
    <div className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1.5 max-w-[120px] 
      ${isHighValue ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
      {icon}
      <span className="truncate">{value}</span>
    </div>
  );
};

const OfferBadge: React.FC<{ value?: string, label: string, icon: React.ReactNode }> = ({ value, label, icon }) => {
  const isEligible = value?.toLowerCase().includes('yes');
  if (!isEligible) return null;
  
  return (
    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-black uppercase tracking-tight">
      {icon}
      {label}
    </div>
  );
};

const StatusBadge: React.FC<{ status: CompanyData['status'] }> = ({ status }) => {
  const configs = {
    pending: { label: 'Queue', class: 'bg-slate-100 text-slate-400', icon: null },
    processing: { label: 'Researching', class: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100', icon: <Loader2 className="w-2.5 h-2.5 animate-spin" /> },
    completed: { label: 'Mapped', class: 'bg-green-50 text-green-700 ring-1 ring-green-100', icon: <CheckCircle2 className="w-2.5 h-2.5" /> },
    error: { label: 'Failed', class: 'bg-red-50 text-red-600 ring-1 ring-red-100', icon: <AlertCircle className="w-2.5 h-2.5" /> }
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${config.class}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default App;
