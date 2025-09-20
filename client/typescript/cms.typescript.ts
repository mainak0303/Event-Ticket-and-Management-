// Interface for individual event
export interface EventItem {
  _id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  subcategory?: string;
  date: string; // ISO date string
  time: string;
  organizer: string;
  price: string;
  banner: string;
  status: string;
  createdBy: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  ticketTiers: TicketTier[];
  id: string;
}

// Interface for the entire events API response
export interface AllEventsResponse {
  status: boolean;
  message: string;
  total: number;
  data: EventItem[];
}


interface TicketTier {
  _id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  benefits: string[];
  __v: number;
}

// Interface for single event details
export interface EventDetails {
  _id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  subcategory?: string;
  date: string; // ISO date string
  time: string;
  organizer: string;
  banner: string;
  status: string;
  createdBy: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  ticketTiers: TicketTier[];
}

// Interface for the event details API response
export interface EventDetailsResponse {
  status: boolean;
  message: string;
  data: EventDetails;
}

// Ticket interface
export interface Ticket {
  _id: string;
  userId: string;
  eventId: string;
  tierId: string;
  ticketCode: string;
  paymentStatus: string; // e.g. "paid"
  checkedIn: boolean;
  purchasedAt: string; // ISO date string
  __v: number;
}

// Payment interface
export interface Payment {
  _id: string;
  ticketId: string;
  amount: number;
  method: string;
  transactionId: string;
  status: string; // e.g. "success"
  paidAt: string; // ISO date string
  __v: number;
}

export interface PurchaseRequest {
  userId: string;
  eventId: string;
  tierId: string;
  quantity: number;
}

// Purchase API response interface
export interface PurchaseResponse {
  message: string; // e.g. "Ticket purchased!"
  tickets: Ticket[];
  payments: Payment[];
}

export interface UserTicketItem {
  _id: string;
  userId: string;
  eventId: string;
  tierId: string;
  ticketCode: string;
  paymentStatus: string; // e.g. "paid"
  checkedIn: boolean;
  purchasedAt: string; // ISO date string
  __v: number;

  event: EventItem[]; 
  tier: TicketTier[]; 
}

// Response for entire user tickets query
export interface UserTicketsResponse {
  status?: boolean; 
  message?: string; 
  data?: UserTicketItem[]; 
  tickets?: UserTicketItem[]; 
}
