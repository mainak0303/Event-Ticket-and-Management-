import React from "react";
import { useRouter } from "next/router";
import
{
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { motion } from "framer-motion";
import Image from "next/image";
import
{
  useCreateOrder,
  useEventDetails,
  usePurchaseTicket,
  useVerifyPayment,
} from "@/customHooks/query/cms.query";
import { EventDetails } from "@/typescript/cms.typescript";
import toast from "react-hot-toast";
import { useUserStore } from "@/utils/store/store";

const API_IMAGE = "http://localhost:5000/uploads/";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const MAX_TICKETS = 5;
const MIN_TICKETS = 1;

const EventDetailsPage = () =>
{
  // Load Razorpay script once
  React.useEffect( () =>
  {
    const script = document.createElement( "script" );
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild( script );
  }, [] );

  const router = useRouter();
  const { id } = router.query as { id: string };
  const { user, token } = useUserStore();
  const { data, isLoading, error } = useEventDetails( id );
  const purchaseMutation = usePurchaseTicket();
  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const [ activeTier, setActiveTier ] = React.useState<string | null>( null );
  const [ ticketQuantity, setTicketQuantity ] = React.useState<{
    [ tierId: string ]: number;
  }>( {} );

  const cleanString = ( text: string ) =>
    text ? text.replace( /^[0-9a-fA-F]{24}\s*/, "" ) : "";

  // increment/decrement helpers
  const incrementQuantity = ( tierId: string ) =>
  {
    setTicketQuantity( ( prev ) =>
    {
      const current = prev[ tierId ] || 1;
      if ( current < MAX_TICKETS )
      {
        return { ...prev, [ tierId ]: current + 1 };
      }
      return prev;
    } );
  };

  const decrementQuantity = ( tierId: string ) =>
  {
    setTicketQuantity( ( prev ) =>
    {
      const current = prev[ tierId ] || 1;
      if ( current > MIN_TICKETS )
      {
        return { ...prev, [ tierId ]: current - 1 };
      }
      return prev;
    } );
  };

  const handlePurchase = async ( tierId: string ) =>
  {
    console.log( "Purchase started with:", { tierId, user: user?.id } );
    if ( !user || !token )
    {
      toast.error( "Please login to purchase tickets." );
      router.push( "/user/login" );
      return;
    }

    const quantity = ticketQuantity[ tierId ] || 1;
    setActiveTier( tierId );

    try
    {
      // Step 1: create order in backend
      const order = await createOrderMutation.mutateAsync( {
        userId: user.id,
        eventId: data!.data._id,
        tierId,
        quantity,
      } );
      console.log( "Order from backend:", order );
      console.log( "Order created:", order );
      console.log( "Razorpay key:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: order.amount,
        currency: order.currency,
        name: "EVENTY",
        description: "Event Ticket Purchase",
        order_id: order.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        handler: async function ( response: any )
        {
          // Step 3: send payment info to backend to verify
          const verifyRes = await verifyPaymentMutation.mutateAsync( {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            tierId: tierId,
            eventId: data!.data._id,
            quantity: quantity,
          } );

          toast.success( "Payment successful! Tickets booked." );
          console.log( "Verify response:", verifyRes );
          setTicketQuantity( ( prev ) => ( {
            ...prev,
            [ tierId ]: 1,
          } ) );
        },
        // ✅ ADD ERROR HANDLING:
        modal: {
          ondismiss: function ()
          {
            toast.error( "Payment was cancelled" );
            setActiveTier( null );
          }
        },
        theme: {
          color: "#412505",
        },
      };

      // @ts-ignore
      const rzp1 = new window.Razorpay( options );
      rzp1.open();
    } catch ( err )
    {
      console.error( err );
      toast.error( "Something went wrong during payment." );
    } finally
    {
      setActiveTier( null );
    }
  };

  // UI loading states
  if ( isLoading )
  {
    return (
      <Box width="100%" display="flex" justifyContent="center" mt={ 10 }>
        <CircularProgress />
      </Box>
    );
  }

  if ( error || !data?.status || !data.data )
  {
    return (
      <Box width="100%" display="flex" justifyContent="center" mt={ 10 }>
        <Typography variant="h6" color="error">
          Unable to fetch event details.
        </Typography>
      </Box>
    );
  }

  const event: EventDetails = data.data;

  return (
    <Box
      sx={ {
        bgcolor: "#faf7ed",
        minHeight: "100vh",
        pb: 6,
        pt: { xs: 2, md: 5 },
        px: { xs: 2, md: 0 },
      } }
    >
      <motion.div
        variants={ fadeInUp }
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Box
          display="flex"
          flexDirection={ { xs: "column", md: "row" } }
          maxWidth={ 1200 }
          mx="auto"
          gap={ 3 }
          alignItems="flex-start"
        >
          {/* Left side */ }
          <Box flex={ 6 } minWidth={ { xs: "100%", md: 580 } }>
            <Box
              sx={ {
                height: { xs: 220, sm: 320, md: 340 },
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                background: "#eaddcf",
                boxShadow: 1,
              } }
            >
              <Image
                src={ API_IMAGE + event.banner }
                alt={ cleanString( event.title ) }
                fill
                style={ { objectFit: "cover" } }
                priority
              />
            </Box>
            <Typography
              sx={ {
                mt: 3,
                color: "text.primary",
                fontSize: { xs: 15, md: 16 },
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                maxWidth: { xs: "100%", md: 580 },
              } }
            >
              { event.description }
            </Typography>
          </Box>

          {/* Right side */ }
          <Paper
            sx={ {
              flex: 5,
              minWidth: 320,
              maxWidth: 430,
              borderRadius: 3,
              px: 3,
              py: 4,
              bgcolor: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: { xs: 4, md: 0 },
            } }
            elevation={ 1 }
          >
            <Typography variant="h5" fontWeight="bold" component="h1">
              { cleanString( event.title ) }
            </Typography>

            <Box
              sx={ {
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              } }
            >
              <Typography variant="subtitle2" color="text.secondary">
                { cleanString( event.category ) }
              </Typography>
              { event.subcategory && (
                <Chip
                  label={ cleanString( event.subcategory ) }
                  size="small"
                  sx={ { color: "#856014" } }
                />
              ) }
            </Box>

            {/* Ticket tiers */ }
            { event.ticketTiers && event.ticketTiers.length > 0 && (
              <Box sx={ { mt: 3 } }>
                { event.ticketTiers.map( ( tier, i ) =>
                {
                  const cleanName = cleanString( tier.name );
                  const quantityForTier = ticketQuantity[ tier._id ] || 1;

                  return (
                    <motion.div
                      key={ tier._id }
                      initial={ { opacity: 0, x: 40 } }
                      animate={ { opacity: 1, x: 0 } }
                      transition={ { delay: i * 0.15 } }
                    >
                      <Paper
                        variant="outlined"
                        sx={ {
                          p: 2,
                          borderLeft: "5px solid #d6b85a",
                          mb: 2,
                          borderRadius: 2,
                        } }
                      >
                        <Box
                          sx={ {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          } }
                        >
                          <Typography variant="body1" fontWeight="bold">
                            { cleanName } - ₹{ tier.price } ({ tier.quantity }{ " " }
                            available)
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={ { mt: 0.5 } }>
                            Total: ₹{ tier.price * quantityForTier }
                          </Typography>

                          {/* Quantity selector */ }
                          <Box
                            sx={ {
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              border: "1px solid #ccc",
                              borderRadius: 1,
                              width: 110,
                              justifyContent: "space-between",
                              px: 1,
                              userSelect: "none",
                            } }
                          >
                            <IconButton
                              size="small"
                              onClick={ () => decrementQuantity( tier._id ) }
                              disabled={ quantityForTier <= MIN_TICKETS }
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={ { width: 20, textAlign: "center" } }
                            >
                              { quantityForTier }
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={ () => incrementQuantity( tier._id ) }
                              disabled={ quantityForTier >= MAX_TICKETS }
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        { tier.benefits && tier.benefits.length > 0 && (
                          <Box component="ul" sx={ { pl: 3, mb: 0 } }>
                            { tier.benefits.map( ( benefit, idx ) => (
                              <li key={ idx }>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  { benefit }
                                </Typography>
                              </li>
                            ) ) }
                          </Box>
                        ) }

                        <Button
                          variant="contained"
                          sx={ {
                            mt: 1,
                            bgcolor: "#412505",
                            "&:hover": { bgcolor: "#574012" },
                            width: "100%",
                            fontWeight: "bold",
                          } }
                          disabled={
                            purchaseMutation.isPending && activeTier === tier._id
                          }
                          onClick={ () => handlePurchase( tier._id ) }
                        >
                          { purchaseMutation.isPending &&
                            activeTier === tier._id
                            ? "Processing..."
                            : `Book ${ cleanName } Ticket${ quantityForTier > 1 ? "s" : ""
                            }` }
                        </Button>
                      </Paper>
                    </motion.div>
                  );
                } ) }
              </Box>
            ) }

            {/* No tiers */ }
            { !event.ticketTiers?.length && (
              <Button
                variant="contained"
                sx={ {
                  mt: 3,
                  fontWeight: "bold",
                  bgcolor: "#412505",
                  "&:hover": { bgcolor: "#574012" },
                } }
                fullWidth
                onClick={ () => handlePurchase( "" ) }
                disabled={ purchaseMutation.isPending && activeTier === "notier" }
              >
                { purchaseMutation.isPending && activeTier === "notier"
                  ? "Processing..."
                  : "Book Tickets" }
              </Button>
            ) }
          </Paper>
        </Box>
      </motion.div>
    </Box>
  );
};

export default EventDetailsPage;
