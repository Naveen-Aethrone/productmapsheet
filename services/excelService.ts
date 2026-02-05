
import * as XLSX from 'xlsx';
import { CompanyData } from '../types';

export const parseFile = async (file: File): Promise<CompanyData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const formattedData: CompanyData[] = jsonData.map((row, index) => {
          const nameKey = Object.keys(row).find(k => k.toLowerCase() === 'name' || k.toLowerCase() === 'company') || Object.keys(row)[0];
          
          return {
            id: crypto.randomUUID(),
            name: row[nameKey] || 'Unknown Company',
            status: 'pending',
          };
        });

        resolve(formattedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (companies: CompanyData[]) => {
  const dataToExport = companies.map(c => ({
    'Company Name': c.name,
    'Website': c.website || '',
    'Category/Products': c.category || '',
    'Company Size': c.size || '',
    'Countries': c.countries || '',
    'UAV Segment': c.uavType || '',
    'Launch/Recovery': c.launchRecovery || '',
    'Services Required': c.servicesRequired || '',
    'Needs Precision Mfg': c.manufacturing || '',
    'Needs Advanced Composites': c.composites || '',
    'Email': c.email || '',
    'Phone': c.phone || '',
    'LinkedIn': c.linkedin || '',
    'Sources': (c.sources || []).join(', ')
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "UAV Industry Enrichment");
  XLSX.writeFile(workbook, `uav_enrichment_${new Date().toISOString().split('T')[0]}.xlsx`);
};
