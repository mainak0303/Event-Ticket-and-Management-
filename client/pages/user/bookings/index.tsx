import React, { useState } from 'react';
import { Card, CardContent, Typography, Stack, Box, Chip, Pagination } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useUserTickets } from '@/customHooks/query/cms.query';

const PAGE_SIZE = 9;

const Index = () =>
{
    const { data: tickets, isLoading, isError, error } = useUserTickets();
    const [ page, setPage ] = useState( 1 );

    if ( isLoading )
        return (
            <Typography variant="h6" align="center" mt={ 4 } color="#7e6020">
                Loading tickets...
            </Typography>
        );
    if ( isError )
        return (
            <Typography variant="h6" align="center" color="error" mt={ 4 }>
                Error: { ( error as Error ).message }
            </Typography>
        );
    if ( !tickets || tickets.length === 0 )
        return (
            <Typography variant="h6" align="center" mt={ 4 } color="#7e6020">
                No tickets found.
            </Typography>
        );

    // Pagination calculations
    const totalPages = Math.ceil( tickets.length / PAGE_SIZE );
    const displayedTickets = tickets.slice( ( page - 1 ) * PAGE_SIZE, page * PAGE_SIZE );

    const handlePageChange = ( event: React.ChangeEvent<unknown>, value: number ) =>
    {
        setPage( value );
        window.scrollTo( { top: 0, behavior: 'smooth' } ); // scroll to top on page change
    };

    return (
        <Box sx={ { p: 4, backgroundColor: '#fbf8f0', minHeight: '100vh' } }>
            <Typography variant="h4" gutterBottom sx={ { fontWeight: 'bold', color: '#7e6020', mb: 4 } }>
                Your Tickets
            </Typography>
            <Stack spacing={ 4 }>
                { displayedTickets.map( ( ticket ) => (
                    <Card
                        key={ ticket._id }
                        elevation={ 4 }
                        sx={ {
                            borderRadius: 3,
                            bgcolor: '#fff8dc',
                            boxShadow: '0 4px 12px rgba(126, 96, 32, 0.3)',
                            '&:hover': { boxShadow: '0 6px 18px rgba(126, 96, 32, 0.5)' },
                            px: 2,
                        } }
                    >
                        <Box
                            sx={ {
                                display: 'flex',
                                alignItems: 'stretch',
                                justifyContent: 'space-between',
                                minHeight: 130,
                            } }
                        >
                            {/* Left side: Ticket details */ }
                            <CardContent
                                sx={ {
                                    flex: 1,
                                    minWidth: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    py: 3,
                                } }
                            >
                                <Typography variant="h6" gutterBottom color="#7e6020" sx={ { fontWeight: 'bold' } }>
                                    { ticket.event[ 0 ]?.title || 'No Event' }
                                </Typography>

                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Tier:</strong> { ticket.tier[ 0 ]?.name || 'Unknown' }
                                </Typography>

                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Purchase Date:</strong> { new Date( ticket.purchasedAt ).toLocaleString() }
                                </Typography>

                                <Box sx={ { mb: 1, display: 'flex', alignItems: 'center', gap: 1 } }>
                                    <Typography variant="subtitle1" sx={ { fontWeight: 'bold' } }>
                                        Payment Status:
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={ ticket.paymentStatus.toUpperCase() }
                                        color={ ticket.paymentStatus === 'paid' ? 'success' : 'warning' }
                                        icon={
                                            ticket.paymentStatus === 'paid' ? (
                                                <VerifiedIcon sx={ { color: '#4b3e74' } } />
                                            ) : (
                                                <CircleIcon sx={ { color: '#bfa758' } } />
                                            )
                                        }
                                        sx={ {
                                            fontWeight: 'bold',
                                            bgcolor: ticket.paymentStatus === 'paid' ? '#d6e6d6' : '#f7e7b6',
                                            color: '#4b3e74',
                                        } }
                                    />
                                </Box>

                                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                                    <Typography variant="subtitle1" sx={ { fontWeight: 'bold' } }>
                                        Checked In:
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={ ticket.checkedIn ? 'Yes' : 'No' }
                                        color={ ticket.checkedIn ? 'primary' : 'default' }
                                        sx={ { fontWeight: 'bold' } }
                                    />
                                </Box>
                            </CardContent>
                            {/* Right side: Big ticket code */ }
                            <Box
                                sx={ {
                                    px: { xs: 1, md: 3 },
                                    py: 3,
                                    minWidth: { xs: 110, md: 200 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#fff',
                                    borderRadius: 3,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                } }
                            >
                                <Typography
                                    variant="subtitle2"
                                    color="#bfa758"
                                    sx={ { textAlign: 'center', mb: 1, fontWeight: 'bold', fontSize: 16 } }
                                >
                                    Ticket Code
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="#7e6020"
                                    sx={ {
                                        fontWeight: 'bold',
                                        letterSpacing: 2,
                                        fontSize: { xs: 22, md: 26 },
                                        textAlign: 'center',
                                    } }
                                >
                                    { ticket.ticketCode }
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                ) ) }
            </Stack>
            {/* Pagination controls */ }
            <Box sx={ { display: 'flex', justifyContent: 'center', mt: 6 } }>
                <Pagination
                    count={ totalPages }
                    page={ page }
                    onChange={ handlePageChange }
                    color="standard" 
                    sx={ {
                        '& .Mui-selected': {
                            bgcolor: '#7e6020',
                            color: '#fff',
                            fontWeight: 'bold',
                            borderRadius: '50%',
                        },
                        '& .MuiPaginationItem-root': {
                            color: '#7e6020',
                            fontWeight: 600,
                        },
                    } }
                />

            </Box>
        </Box>
    );
};

export default Index;
