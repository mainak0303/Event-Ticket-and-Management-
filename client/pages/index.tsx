import React, { useMemo, useState } from "react";
import Head from "next/head";
import { Box, Typography, Paper, CircularProgress, Button, IconButton, MenuItem, FormControl, Select, InputLabel, } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAllEvents } from "@/customHooks/query/cms.query";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const ITEMS_PER_PAGE = 6;

const Home = ( { searchText }: { searchText: string } ) =>
{
  const router = useRouter();
  const { data, isLoading } = useAllEvents();
  const events = data?.data ?? [];
  const [ bannerIndex, setBannerIndex ] = useState( 0 );
  const [ page, setPage ] = useState( 1 );

  // Sidebar filter states
  const [ subcategory, setSubcategory ] = useState<string>( "" );
  const [ date, setDate ] = useState<string>( "" );
  const [ time, setTime ] = useState<string>( "" );
  const [ organizer, setOrganizer ] = useState<string>( "" );

  // Unique options for each filter
  const subcategories = useMemo(
    () => [ ...new Set( events.map( ( ev ) => ev.subcategory ).filter( Boolean ) ) ],
    [ events ]
  );
  const dates = useMemo(
    () => [ ...new Set( events.map( ( ev ) => ev.date ).filter( Boolean ) ) ],
    [ events ]
  );
  const times = useMemo(
    () => [ ...new Set( events.map( ( ev ) => ev.time ).filter( Boolean ) ) ],
    [ events ]
  );
  const organizers = useMemo(
    () => [ ...new Set( events.map( ( ev ) => ev.organizer ).filter( Boolean ) ) ],
    [ events ]
  );

  // Event filtering logic
  const filteredEvents = useMemo( () =>
  {
    const lwr = searchText.toLowerCase();
    return events.filter( ( ev ) =>
    {
      const matchesSearch =
        ev.title.toLowerCase().includes( lwr ) ||
        ev.description.toLowerCase().includes( lwr ) ||
        ev.location.toLowerCase().includes( lwr );
      const matchesSubcategory = subcategory ? ev.subcategory === subcategory : true;
      const matchesDate = date ? ev.date === date : true;
      const matchesTime = time ? ev.time === time : true;
      const matchesOrganizer = organizer ? ev.organizer === organizer : true;
      return (
        matchesSearch &&
        matchesSubcategory &&
        matchesDate &&
        matchesTime &&
        matchesOrganizer
      );
    } );
  }, [ events, searchText, subcategory, date, time, organizer ] );

  // Pagination logic
  const pageCount = Math.ceil( filteredEvents.length / ITEMS_PER_PAGE );
  const paginatedEvents = useMemo( () =>
  {
    const startIdx = ( page - 1 ) * ITEMS_PER_PAGE;
    return filteredEvents.slice( startIdx, startIdx + ITEMS_PER_PAGE );
  }, [ filteredEvents, page ] );

  const bannerEvents = events.slice( 0, 10 );
  const bannerEvent = bannerEvents[ bannerIndex ];
  const handleBannerPrev = () =>
    setBannerIndex( ( i ) => ( i === 0 ? bannerEvents.length - 1 : i - 1 ) );
  const handleBannerNext = () =>
    setBannerIndex( ( i ) => ( i === bannerEvents.length - 1 ? 0 : i + 1 ) );

  // Pagination controls handlers
  const handlePagePrev = () => setPage( ( p ) => Math.max( p - 1, 1 ) );
  const handlePageNext = () => setPage( ( p ) => Math.min( p + 1, pageCount ) );

  return (
    <>
      <Head>
        <title>EveNTy - Home</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Discover events near you" />
      </Head>
      <Box
        sx={ {
          bgcolor: "rgba(252, 242, 227, 0.9)",
          minHeight: "100vh",
          p: { xs: 2, sm: 4, md: 6 },
        } }
      >
        {/* Banner */ }
        <Paper
          elevation={ 0 }
          sx={ {
            position: "relative",
            minHeight: { xs: 360, sm: 400, md: 450 },
            borderRadius: { xs: 3, sm: 4, md: 6 },
            overflow: "visible",
            mb: { xs: 3, sm: 5 },
            bgcolor: "transparent",
            boxShadow: "none",
            maxWidth: "1200px",
            mx: "auto",
          } }
        >
          { bannerEvent ? (
            <motion.div
              key={ bannerEvent._id }
              initial="initial"
              animate="animate"
              exit="exit"
              variants={ {
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
                exit: { opacity: 0 },
              } }
            >
              <Box
                sx={ {
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  px: { xs: 2, sm: 3, md: 6 },
                  py: { xs: 3, sm: 4, md: 5 },
                  position: "relative",
                  boxSizing: "border-box",
                } }
              >
                {/* Background */ }
                <Box
                  sx={ {
                    position: "absolute",
                    inset: 0,
                    borderRadius: { xs: 3, sm: 4, md: 6 },
                    backgroundColor: "rgba(247, 231, 197, 0.9)",
                    backdropFilter: "blur(18px) saturate(120%)",
                    border: "1.5px solid #eddea5",
                    boxShadow:
                      "0 12px 48px 0 rgba(23,32,53,0.12), 0 2px 6px 0 rgba(212,218,220,0.2)",
                    zIndex: 0,
                  } }
                />
                {/* Left Content */ }
                <motion.div
                  variants={ fadeInUp }
                  style={ {
                    flex: 1,
                    zIndex: 1,
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    minWidth: 260,
                  } }
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    { new Date( bannerEvent.date ).toLocaleDateString( "en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    } ) }{ " " }
                    { bannerEvent.time }
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h2"
                    fontWeight="bold"
                    gutterBottom
                    sx={ { lineHeight: 1 } }
                  >
                    { bannerEvent.title }
                  </Typography>
                  <Typography variant="subtitle1" color="text.primary" gutterBottom>
                    { bannerEvent.location }
                  </Typography>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={ () => router.push( `/cms/events/${ bannerEvent._id }` ) }
                    sx={ {
                      mt: 2,
                      px: 3,
                      py: 1,
                      minWidth: 140,
                      fontWeight: 700,
                      bgcolor: "text.primary",
                      color: "background.paper",
                      "&:hover": { bgcolor: "text.secondary" },
                    } }
                  >
                    Book tickets
                  </Button>
                </motion.div>
                {/* Right Content (Image) */ }
                <motion.div
                  variants={ fadeInUp }
                  style={ {
                    flexShrink: 0,
                    width: 230,
                    height: 320,
                    borderRadius: 6,
                    overflow: "hidden",
                    boxShadow: "0 16px 32px rgba(0,0,0,0.1)",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    border: "2px solid #f1deb5",
                    marginLeft: "1rem",
                    position: "relative",
                    zIndex: 2,
                  } }
                >
                  <Image
                    src={ `http://localhost:5000/uploads/${ bannerEvent.banner }` }
                    alt={ bannerEvent.title }
                    fill
                    style={ { objectFit: "cover" } }
                    priority
                  />
                </motion.div>
                {/* Arrows */ }
                <IconButton
                  aria-label="Previous"
                  onClick={ handleBannerPrev }
                  sx={ {
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "background.paper",
                    borderRadius: "50%",
                    boxShadow: 3,
                    border: "1px solid #ddd",
                    zIndex: 10,
                  } }
                >
                  <ArrowBackIos />
                </IconButton>
                <IconButton
                  aria-label="Next"
                  onClick={ handleBannerNext }
                  sx={ {
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "background.paper",
                    borderRadius: "50%",
                    boxShadow: 3,
                    border: "1px solid #ddd",
                    zIndex: 10,
                  } }
                >
                  <ArrowForwardIos />
                </IconButton>
                {/* Pagination */ }
                <Box
                  sx={ {
                    position: "absolute",
                    bottom: 20,
                    left: 35,
                    display: "flex",
                    gap: 1.5,
                    zIndex: 10,
                  } }
                >
                  { bannerEvents.map( ( _, idx ) => (
                    <Box
                      key={ idx }
                      sx={ {
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: idx === bannerIndex ? "#222" : "#cacaca",
                        transition: "background-color 0.3s",
                      } }
                    />
                  ) ) }
                </Box>
              </Box>
            </motion.div>
          ) : (
            <Typography textAlign="center" p={ 10 } color="text.secondary">
              Loading banner...
            </Typography>
          ) }
        </Paper>
        {/* Sidebar and cards */ }
        <Box
          sx={ {
            mt: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "row",
            gap: 3,
            maxWidth: "1200px",
            mx: "auto",
          } }
        >
          {/* Sidebar Filters */ }
          <Paper
            sx={ {
              minWidth: 220,
              p: 2,
              flexShrink: 0,
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: "#fefaf4",
              border: "1px solid #e8d9b5",
              height: "fit-content",
            } }
            elevation={ 1 }
          >
            <Typography variant="h6" fontWeight="bold" mb={ 2 } color="text.primary">
              Filters
            </Typography>
            {/* Subcategory */ }
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="subcategory-label">Subcategory</InputLabel>
              <Select
                labelId="subcategory-label"
                label="Subcategory"
                value={ subcategory }
                onChange={ ( e ) => setSubcategory( e.target.value ) }
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                { subcategories.map( ( subcat ) => (
                  <MenuItem key={ subcat } value={ subcat }>
                    { subcat }
                  </MenuItem>
                ) ) }
              </Select>
            </FormControl>
            {/* Date */ }
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="date-label">Date</InputLabel>
              <Select
                labelId="date-label"
                label="Date"
                value={ date }
                onChange={ ( e ) => setDate( e.target.value ) }
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                { dates.map( ( d ) => (
                  <MenuItem key={ d } value={ d }>
                    { new Date( d ).toLocaleDateString() }
                  </MenuItem>
                ) ) }
              </Select>
            </FormControl>
            {/* Time */ }
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="time-label">Time</InputLabel>
              <Select
                labelId="time-label"
                label="Time"
                value={ time }
                onChange={ ( e ) => setTime( e.target.value ) }
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                { times.map( ( t ) => (
                  <MenuItem key={ t } value={ t }>
                    { t }
                  </MenuItem>
                ) ) }
              </Select>
            </FormControl>
            {/* Organizer */ }
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="organizer-label">Organizer</InputLabel>
              <Select
                labelId="organizer-label"
                label="Organizer"
                value={ organizer }
                onChange={ ( e ) => setOrganizer( e.target.value ) }
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                { organizers.map( ( org ) => (
                  <MenuItem key={ org } value={ org }>
                    { org }
                  </MenuItem>
                ) ) }
              </Select>
            </FormControl>
            {/* Clear Filters */ }
            <Button
              variant="outlined"
              fullWidth
              sx={ {
                mt: 2,
                color: "#6b4f32",
                borderColor: "#e8d9b5",
                "&:hover": { borderColor: "#c8a96b", bgcolor: "#f8f1e0" },
              } }
              onClick={ () =>
              {
                setSubcategory( "" );
                setDate( "" );
                setTime( "" );
                setOrganizer( "" );
                setPage( 1 ); // Reset page on filter clear
              } }
            >
              Clear Filters
            </Button>
          </Paper>
          {/* Card grid */ }
          <Box sx={ { flex: 1, minWidth: 0 } }>
            { isLoading ? (
              <Box textAlign="center" mt={ 8 }>
                <CircularProgress />
              </Box>
            ) : paginatedEvents.length === 0 ? (
              <Typography variant="h6" color="text.secondary" textAlign="center" mt={ 5 }>
                No events found.
              </Typography>
            ) : (
              <>
                <Box
                  sx={ {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 3,
                    px: 1,
                    overflow: "hidden",
                  } }
                >
                  { paginatedEvents.map( ( event ) => (
                    <motion.div
                      key={ event._id }
                      initial={ { opacity: 0, y: 30 } }
                      animate={ { opacity: 1, y: 0 } }
                      transition={ { duration: 0.4 } }
                      style={ {
                        cursor: "pointer",
                        flex: "1 1 calc(25% - 24px)",
                        maxWidth: "calc(25% - 24px)",
                        minWidth: 250,
                      } }
                      onClick={ () => router.push( `/cms/events/${ event._id }` ) }
                      role="button"
                      tabIndex={ 0 }
                      aria-label={ `View details for ${ event.title }` }
                    >
                      <Paper
                        sx={ {
                          bgcolor: "#fffaf3",
                          borderRadius: 3,
                          boxShadow: 3,
                          border: "1px solid #f1deb5",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          "&:hover": { boxShadow: 7 },
                        } }
                      >
                        <Box sx={ { position: "relative", height: 180 } }>
                          <Image
                            src={ `http://localhost:5000/uploads/${ event.banner }` }
                            alt={ event.title }
                            fill
                            style={ { objectFit: "cover" } }
                            priority
                          />
                        </Box>
                        <Box sx={ { p: 2, flexGrow: 1 } }>
                          <Typography variant="subtitle1" fontWeight="bold" noWrap>
                            { event.title }
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            { event.location }
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            { new Date( event.date ).toLocaleDateString() } { event.time }
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            sx={ {
                              mt: 1.5,
                              bgcolor: "text.primary",
                              color: "background.paper",
                              fontWeight: 600,
                              "&:hover": { bgcolor: "text.secondary" },
                            } }
                            onClick={ ( e ) =>
                            {
                              e.stopPropagation(); // stop card click
                              router.push( `/cms/events/${ event._id }` );
                            } }
                          >
                            View Details
                          </Button>
                        </Box>
                      </Paper>
                    </motion.div>
                  ) ) }
                </Box>
                {/* Pagination Controls */ }
                <Box
                  sx={ {
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 4,
                  } }
                >
                  <Button
                    variant="outlined"
                    disabled={ page === 1 }
                    onClick={ handlePagePrev }
                  >
                    Previous
                  </Button>
                  <Typography
                    variant="body1"
                    sx={ { alignSelf: "center", userSelect: "none" } }
                  >
                    Page { page } of { pageCount }
                  </Typography>
                  <Button
                    variant="outlined"
                    disabled={ page === pageCount }
                    onClick={ handlePageNext }
                  >
                    Next
                  </Button>
                </Box>
              </>
            ) }
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;
