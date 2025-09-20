import { AllEventsResponse, EventDetailsResponse, PurchaseRequest, PurchaseResponse, UserTicketItem } from "@/typescript/cms.typescript";
import axiosInstance from "../axios/axios";
import { endPoints } from "../endPoints/endPoints";

export async function fetchAllEvents(): Promise<AllEventsResponse> {
  const { data } = await axiosInstance.get<AllEventsResponse>(endPoints.cms.eventlist);
  return data;
}

export async function fetchEventDetails(id: string): Promise<EventDetailsResponse> {
  const { data } = await axiosInstance.get<EventDetailsResponse>(`${endPoints.cms.eventdetails}/${id}`);
  return data;
}

export async function purchaseTicket(requestData: PurchaseRequest): Promise<PurchaseResponse> {
  const { data } = await axiosInstance.post<PurchaseResponse>(endPoints.cms.purchase, requestData);
  return data;
}


export async function createOrder(data: {  userId: string;  eventId: string;  tierId: string;  quantity: number;}) {
  const res = await axiosInstance.post(endPoints.cms.createOrder, data);
  return res.data; 
}


export async function verifyPayment(data: {  razorpay_payment_id: string;  razorpay_order_id: string;  razorpay_signature: string;}) {
  const res = await axiosInstance.post(endPoints.cms.verifyPayment, data);
  return res.data; 
}


export async function fetchUserTickets(): Promise<UserTicketItem[]> {
  const res = await axiosInstance.get<UserTicketItem[]>(endPoints.cms.usertickets); 
  return res.data;
}