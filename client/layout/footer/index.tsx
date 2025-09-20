import React from "react";
import { Box, Stack, Typography, Link, IconButton } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";

const Footer: React.FC = () => (
  <Box component="footer" sx={ { bgcolor: "#18181A", color: "#fff", px: { xs: 2, md: 8 }, py: 5 } }>
    {/* Logo and QR + Social Row */ }
    <Stack direction={ { xs: "column", md: "row" } } alignItems="center" justifyContent="space-between" spacing={ 4 }>
      <Stack spacing={ 2 }>
        <Typography variant="h5" fontWeight="bold" letterSpacing={ 1 }>
          EveNTiFy <span style={ { fontWeight: 200 } }>by Mainak</span>
        </Typography>
        <Stack direction="row" spacing={ 4 } mt={ 1 }>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Terms & Conditions
          </Link>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Privacy Policy
          </Link>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Contact Us
          </Link>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            List your events
          </Link>
        </Stack>
      </Stack>
      {/* QR and Social */ }
      <Stack direction="row" spacing={ 6 } alignItems="center">
        <Stack direction="row" spacing={ 1 }>
          <IconButton color="inherit" href="#" size="large">
            <InstagramIcon />
          </IconButton>
          <IconButton color="inherit" href="#" size="large">
            <FacebookIcon />
          </IconButton>
          <IconButton color="inherit" href="#" size="large">
            <XIcon /> {/* Use Twitter/X icon */ }
          </IconButton>
          <IconButton color="inherit" href="#" size="large">
            <YouTubeIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>

    {/* Legal Notice */ }
    <Typography variant="body2" color="gray" textAlign="center" mt={ 6 }>
      By accessing this page, you confirm that you have read, understood, and agreed to our{ " " }
      <Link color="inherit" underline="hover" href="#">
        Terms of Service
      </Link>
      ,{ " " }
      <Link color="inherit" underline="hover" href="#">
        Cookie Policy
      </Link>
      ,{ " " }
      <Link color="inherit" underline="hover" href="#">
        Privacy Policy
      </Link>{ " " }
      and Content Guidelines. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
