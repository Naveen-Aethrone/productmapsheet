
export interface CompanyData {
  id: string;
  name: string;
  website?: string;
  category?: string;
  size?: string;
  countries?: string;
  uavType?: string;
  launchRecovery?: string;
  servicesRequired?: string;
  manufacturing?: string;
  composites?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  sources?: string[];
  error?: string;
}

export interface ResearchResult {
  website: string;
  category: string;
  size: string;
  countries: string;
  uavType: string;
  launchRecovery: string;
  servicesRequired: string;
  manufacturing: string;
  composites: string;
  email: string;
  phone: string;
  linkedin: string;
  sources: string[];
}
