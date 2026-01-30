
export enum ContactStatus {
  NOT_SENT = 'Not Sent',
  PENDING = 'Pending',
  DONE = 'Done'
}

export type Page = 'dashboard' | 'campaigns' | 'settings';

export interface Contact {
  id: string;
  phoneNumber: string;
  productName: string;
  oldAddress: string;
  newAddress?: string;
  status: ContactStatus;
  lastUpdated: string;
  conversation: Message[];
}

export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

export interface WhatsAppSession {
  isConnected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  connectedAt?: string;
  requestsCount: number;
}

export interface AppSettings {
  webhookUrl: string;
  autoDeleteDone: boolean;
  geminiApiKey: string;
  inboundApiKey: string;
  initialMessageTemplate: string;
}
