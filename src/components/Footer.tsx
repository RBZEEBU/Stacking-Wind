"use client";

import * as React from "react";
import { Trans } from "@lingui/macro";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import TwitterIcon from "@mui/icons-material/X";
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TelegramIcon from '@mui/icons-material/Telegram';

import { Grid, Theme } from "@mui/material";

function Copyright() {
  return (
    <Typography mt={1} color="text.primary" sx={{ opacity: "50%" }}>
      <Trans>
        Copyright ©{" "}
        <Link href="#" color="text.primary">
          Zeebu&nbsp;
        </Link>
        {new Date().getFullYear()}
      </Trans>
    </Typography>
  );
}

export default function Footer() {
  const getIconStyles = (theme: Theme) => ({
    color: theme.palette.mode === "dark" ? "white" : "black",
  });

  return (
    <Grid
      container
      spacing={2}
      sx={{
        justifyContent: "space-between",
        pt: { xs: 4, sm: 8 },
        pb: "50px",
        width: "100%",
        borderColor: "divider",
      }}
    >
      <Grid item>
        <Link color="text.primary" href="https://www.zeebu.com/privacy-policy" target="_blank">
          <Trans>Privacy Policy</Trans>
        </Link>
        <Typography display="inline" sx={{ mx: 0.5, opacity: 0.5 }}>
          &nbsp;•&nbsp;
        </Typography>
        <Link color="text.primary" href="https://www.zeebu.com/terms-conditions" target="_blank">
          <Trans>Terms of Service</Trans>
        </Link>
        <Copyright />
      </Grid>
      <Grid item>
        <Stack direction="row" justifyContent="left" spacing={1} useFlexGap>
          <IconButton
            color="inherit"
            href="https://twitter.com/zeebuofficial"
            aria-label="Twitter"
            sx={{ alignSelf: "center" }}
            target="_blank"
          >
            <TwitterIcon sx={getIconStyles} />
          </IconButton>

          <IconButton
            color="inherit"
            href="https://www.instagram.com/zeebu.official/"
            aria-label="Instagram"
            sx={{ alignSelf: "center" }}
            target="_blank"
          >
            <InstagramIcon sx={getIconStyles} />
          </IconButton>
          
          <IconButton
            color="inherit"
            href="https://www.linkedin.com/company/zeebuofficial/"
            aria-label="LinkedIn"
            sx={{ alignSelf: "center" }}
            target="_blank"
          >
            <LinkedInIcon sx={getIconStyles} />
          </IconButton>

          <IconButton
            color="inherit"
            href="https://t.me/+QdDCbYC_HsRhMjg0"
            aria-label="Telegram"
            sx={{ alignSelf: "center" }}
            target="_blank"
          >
            <TelegramIcon sx={getIconStyles} />
          </IconButton>






          
          
        </Stack>
      </Grid>
    </Grid>
  );
}
