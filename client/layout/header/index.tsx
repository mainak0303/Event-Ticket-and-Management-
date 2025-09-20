import React, { useEffect, useState } from "react";
import { AppBar, Box, Toolbar, IconButton, Typography, Container, Avatar, Menu, MenuItem, InputBase, Button, useTheme, useMediaQuery, SwipeableDrawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import BookmarksOutlinedIcon from "@mui/icons-material/BookmarksOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import ProfileDrawer from "@/pages/user/profile";
import { useUserStore } from "@/utils/store/store";

interface ResponsiveHeaderProps
{
  searchText: string;
  setSearchText: ( text: string ) => void;
  onSearchSubmit: ( query: string ) => void;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ( {
  searchText,
  setSearchText,
  onSearchSubmit,
} ) =>
{
  const theme = useTheme();
  const isMdUp = useMediaQuery( theme.breakpoints.up( "md" ) );
  const router = useRouter();

  const [ mounted, setMounted ] = useState( false );
  const [ anchorElUser, setAnchorElUser ] = useState<null | HTMLElement>( null );
  const [ profileDrawerOpen, setProfileDrawerOpen ] = useState( false );
  const [ mobileNavOpen, setMobileNavOpen ] = useState( false );
  const [ loading, setLoading ] = useState( false );

  const { token, logout, user } = useUserStore();
  const isLoggedIn = Boolean( token );



  useEffect( () =>
  {
    setMounted( true );
  }, [] );

  const handleOpenUserMenu = ( event: any ) => setAnchorElUser( event.currentTarget );
  const handleCloseUserMenu = () => setAnchorElUser( null );

  const handleLogout = () =>
  {
    setLoading( true );
    setProfileDrawerOpen( false );
    setMobileNavOpen( false );
    setTimeout( () =>
    {
      logout();
      toast.success( "Logged out successfully" );
      setLoading( false );
      router.push( "/user/login" );
    }, 1500 );
  };

  const handleSearchChange = ( e: any ) => setSearchText( e.target.value );

  const handleSearchKeyPress = ( e: any ) =>
  {
    if ( e.key === "Enter" ) onSearchSubmit( searchText.trim() );
  };

  const toggleMobileNav = ( open: boolean ) => ( event: React.SyntheticEvent ) =>
  {
    if (
      event &&
      event.type === "keydown" &&
      ( ( event as React.KeyboardEvent ).key === "Tab" ||
        ( event as React.KeyboardEvent ).key === "Shift" )
    )
      return;
    setMobileNavOpen( open );
  };

  const handleAvatarClick = ( event: any ) =>
  {
    if ( isMdUp )
    {
      if ( isLoggedIn ) setProfileDrawerOpen( true );
      else handleOpenUserMenu( event );
    } else
    {
      setMobileNavOpen( true );
    }
  };

  // Mobile drawer links logic
  const mobileMenu = (
    <Box sx={ { width: 380, pt: 2 } }>
      <Box sx={ { display: "flex", alignItems: "center", px: 3, mb: 2, gap: 2 } }>
        <Avatar
          sx={ {
            bgcolor: "#bdaeef",
            color: "#4b3e74",
            width: 70,
            height: 70,
            fontWeight: "bold",
            fontSize: 36,
          } }
        >
          { mounted && isLoggedIn && token ? token.charAt( 0 ).toUpperCase() : "G" }
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#222">
            {/* Assuming user name from token or state */ }
            { mounted && isLoggedIn ? user?.name || "User" : "Guest" }
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={ 500 }>
            { mounted && isLoggedIn ? user?.email || "" : "Welcome!" }
          </Typography>
          { isLoggedIn && (
            <Button
              variant="outlined"
              sx={ {
                mt: 2,
                borderColor: "#7e6020",
                color: "#7e6020",
                fontWeight: "bold",
                textTransform: "none",
              } }
              onClick={ () =>
              {
                setMobileNavOpen( false );
                router.push( "/user/update-password" );
              } }
              fullWidth
              size="small"
            >
              Update Password
            </Button>
          ) }
        </Box>
      </Box>
      <Divider />
      <List>
        { !isLoggedIn && (
          <ListItemButton
            onClick={ () =>
            {
              setMobileNavOpen( false );
              router.push( "/user/login" );
            } }
          >
            <ListItemIcon>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItemButton>
        ) }
        { isLoggedIn && (
          <>
            <ListItemButton
              onClick={ () =>
              {
                setMobileNavOpen( false );
                router.push( "/user/bookings" );
              } }
            >
              <ListItemIcon>
                <BookmarksOutlinedIcon sx={ { color: "#7e6020" } } />
              </ListItemIcon>
              <ListItemText primary="View all bookings" />
            </ListItemButton>
            <ListItemButton
              onClick={ () =>
              {
                setMobileNavOpen( false );
                router.push( "/terms" );
              } }
            >
              <ListItemIcon>
                <DescriptionOutlinedIcon sx={ { color: "#7e6020" } } />
              </ListItemIcon>
              <ListItemText primary="Terms & Conditions" />
            </ListItemButton>
            <ListItemButton
              onClick={ () =>
              {
                setMobileNavOpen( false );
                router.push( "/privacy" );
              } }
            >
              <ListItemIcon>
                <PrivacyTipOutlinedIcon sx={ { color: "#7e6020" } } />
              </ListItemIcon>
              <ListItemText primary="Privacy Policy" />
            </ListItemButton>
            <Divider />
            <ListItemButton onClick={ handleLogout }>
              <ListItemIcon>
                <LogoutIcon sx={ { color: "#7e6020" } } />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        ) }
      </List>
    </Box>
  );


  return (
    <>
      { loading && <span /> }
      <AppBar
        position="static"
        sx={ {
          bgcolor: "#fff",
          color: "#222",
          borderBottom: "1px solid #efede",
          boxShadow: "none",
          overflowX: "hidden",
        } }
      >
        <Container maxWidth={ false } disableGutters sx={ { px: 2 } }>
          <Toolbar
            sx={ {
              width: "100%",
              minHeight: { xs: 56, sm: 64 },
              px: 0,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "nowrap",
            } }
          >
            {/* Logo */ }
            <Box
              sx={ {
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                minWidth: 100,
                cursor: "pointer",
              } }
              onClick={ () => router.push( "/" ) }
            >
              <Typography
                variant="subtitle2"
                fontWeight={ 700 }
                sx={ {
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#7e6020",
                  fontSize: 18,
                  lineHeight: 1,
                  mr: 0.5,
                  userSelect: "none",
                  "&:hover": { color: "#bfa758" },
                } }
              >
                EveNTy
              </Typography>
              <Typography
                variant="caption"
                sx={ {
                  color: "#bfa758",
                  fontWeight: 700,
                  letterSpacing: 1,
                  mt: 0.5,
                  userSelect: "none",
                  display: { xs: "none", md: "block" },
                } }
              >
                by EveNTy Team
              </Typography>
            </Box>

            {/* ✅ Search Bar - Only on homepage */ }
            { router.pathname === "/" && (
              <Box
                component="form"
                onSubmit={ ( e ) =>
                {
                  e.preventDefault();
                  onSearchSubmit( searchText.trim() );
                } }
                sx={ {
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#fff",
                  borderRadius: 3,
                  padding: "2px 8px",
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: 500,
                  flexGrow: { xs: 1, sm: 0 },
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                } }
              >
                <SearchIcon sx={ { color: "#966818" } } />
                <InputBase
                  value={ searchText }
                  onChange={ handleSearchChange }
                  onKeyPress={ handleSearchKeyPress }
                  placeholder="Search events, movies, restaurants"
                  inputProps={ { "aria-label": "search" } }
                  sx={ {
                    ml: 1,
                    flexGrow: 1,
                    fontSize: 16,
                  } }
                />
                <Button
                  type="submit"
                  variant="text"
                  sx={ {
                    color: "#966818",
                    fontWeight: 600,
                    ml: 1,
                    textTransform: "uppercase",
                  } }
                >
                  Search
                </Button>
              </Box>
            ) }

            {/* Avatar / Mobile Menu */ }
            <Box sx={ { ml: 2, minWidth: 44 } }>
              <Button
                onClick={ () => router.push( "/cms/blogs" ) }
                color="inherit"
                sx={ {
                  fontWeight: 600,
                  textTransform: "none",
                  ml: 2,
                  display: { xs: "none", md: "inline-flex" }, // visible on medium+ screens
                } }
              >
                Blogs
              </Button>

              <IconButton
                size="large"
                color="inherit"
                onClick={ handleAvatarClick }
                aria-label="User account"
              >
                <Avatar
                  sx={ {
                    bgcolor: mounted && isLoggedIn ? "#a88922" : "#b0b0b0",
                    color: mounted && isLoggedIn ? "#f2eda9" : "#666",
                    width: 38,
                    height: 38,
                    fontWeight: 700,
                    border: "1px solid",
                    borderColor: mounted && isLoggedIn ? "#e7dda9" : "#ccc",
                  } }
                >
                  { mounted && isLoggedIn && token
                    ? token.charAt( 0 ).toUpperCase()
                    : "G" }
                </Avatar>
              </IconButton>
              {/* Desktop dropdown for not-logged-in */ }
              { isMdUp && (
                <Menu
                  anchorEl={ anchorElUser }
                  open={ Boolean( anchorElUser ) }
                  onClose={ handleCloseUserMenu }
                  anchorOrigin={ { vertical: "bottom", horizontal: "right" } }
                  transformOrigin={ { vertical: "top", horizontal: "right" } }
                  PaperProps={ { sx: { minWidth: 120 } } }
                >
                  { !mounted && <MenuItem disabled>Loading...</MenuItem> }
                  { mounted && !isLoggedIn && (
                    <MenuItem
                      onClick={ () =>
                      {
                        handleCloseUserMenu();
                        router.push( "/user/login" );
                      } }
                    >
                      Login
                    </MenuItem>
                  ) }
                  { mounted && isLoggedIn && (
                    <>
                      <MenuItem onClick={ () => setProfileDrawerOpen( true ) }>
                        Profile
                      </MenuItem>
                      <MenuItem onClick={ handleLogout }>Logout</MenuItem>
                    </>
                  ) }
                </Menu>
              ) }
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {/* Desktop profile drawer */ }
      { isMdUp && mounted && isLoggedIn && (
        <ProfileDrawer
          open={ profileDrawerOpen }
          onClose={ () => setProfileDrawerOpen( false ) }
        />
      ) }
      {/* Mobile drawer */ }
      { !isMdUp && (
        <SwipeableDrawer
          anchor="right"
          open={ mobileNavOpen }
          onClose={ toggleMobileNav( false ) }
          onOpen={ toggleMobileNav( true ) }
        >
          { mobileMenu }
        </SwipeableDrawer>
      ) }
    </>
  );
};

export default ResponsiveHeader;
