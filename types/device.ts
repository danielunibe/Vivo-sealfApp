export interface DeviceKnowledge {
  heroTitle: string;
  summary: string;
  confidence?: 'confirmed' | 'partial' | 'pending';
  sourceRegion?: string;
  positioning?: string;
  idealCustomer?: string;
  quickPitch?: string;
  shortCardLine?: string;
  topStrengths?: string[];
  keySpecs: string[];
  salesArguments: Array<string | { title: string; description: string }>;
  objectionsAndResponses: Array<{ objection: string; response: string }>;
  comparisonNotes?: Array<{ comparedTo: string; note: string }>;
  bestFor?: string[];
  avoidIf?: string[];
  recommendedClosing: string;
  sources?: Array<{
    label: string;
    url?: string;
    type: 'official' | 'retailer' | 'media' | 'internal';
    note?: string;
  }>;
  updatedAt?: string;
}

export interface Device {
  id: string;
  name: string;
  margin: number;
  active?: boolean;
  
  // Custom management fields
  series?: string;
  description?: string;
  specs?: string;
  colors?: Array<{ hex: string; name: string }>;
  imageDataUrl?: string; // base64 compressed local photo
  imageUrl?: string; // fallback static asset url
  knowledge?: DeviceKnowledge; // Sales Guide data
  createdAt?: number;
  updatedAt?: number;
}
