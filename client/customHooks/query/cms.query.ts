import { createOrder, fetchAllEvents, fetchEventDetails, fetchUserTickets, purchaseTicket, verifyPayment } from "@/api/functions/cms.api";
import { AllEventsResponse, EventDetailsResponse, PurchaseRequest, PurchaseResponse, UserTicketItem } from "@/typescript/cms.typescript";
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useGlobalHooks } from "../globalHooks/globalHooks";
import toast from "react-hot-toast";
import { useRouter } from "next/router";


// all events
export const useAllEvents = () =>
{
    const { queryClient } = useGlobalHooks();

    return useQuery<AllEventsResponse, Error>( {
        queryKey: [ "ALL_EVENTS" ],
        queryFn: fetchAllEvents,

    } );
};
//event details
export const useEventDetails = ( id: string ) =>
{
    const { queryClient } = useGlobalHooks();

    return useQuery<EventDetailsResponse, Error>( {
        queryKey: [ "EVENT_DETAILS", id ],
        queryFn: () => fetchEventDetails( id ),

    } );
};

export const usePurchaseTicket = (): UseMutationResult<
  PurchaseResponse,
  unknown,
  PurchaseRequest
> => {
    const router = useRouter()
  return useMutation<PurchaseResponse, unknown, PurchaseRequest>({
    mutationFn: purchaseTicket,
    onSuccess: (res: any) => {
      if (res?.message) {
        toast.success(res.message);
      } else {
        toast.success("Ticket purchased successfully!");
      }
    },
    onError: () => {
      toast.error("Failed to purchase ticket. Please Login first.");
      router.push("/user/login")
    },
  });
};


// Create Razorpay order mutation
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
  });
};

// Verify Razorpay payment mutation
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: verifyPayment,
  });
};


export const useUserTickets = (): UseQueryResult<UserTicketItem[], Error> => {
  return useQuery<UserTicketItem[], Error>({
    queryKey: ["USER_TICKETS"],
    queryFn: fetchUserTickets,
  });
};