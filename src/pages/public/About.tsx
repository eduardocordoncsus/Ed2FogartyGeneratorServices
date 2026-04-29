import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Box, Grid, Stack, Typography, CircularProgress } from "@mui/material";
import logo from "../../assets/stockphoto.jpg";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

function About() {
  const [text, setText] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/pagecontent/about`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setText(data.content);
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Navbar />

      <Box sx={{ px: { xs: 3, md: 10 }, py: { xs: 6, md: 12 } }}>
        <Grid
          container
          spacing={{ xs: 4, md: 8 }}
          alignItems="center"
          justifyContent="center"
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src={logo}
              alt="Generator service"
              sx={{
                width: "100%",
                maxHeight: 460,
                objectFit: "cover",
                borderRadius: 2,
                boxShadow: 3,
                display: "block",
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3} maxWidth={560}>
              <Typography variant="h4" fontWeight={700}>
                Introduction
              </Typography>

              <Typography variant="h6" color="text.secondary" lineHeight={1.7}>
                {text}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Footer />
    </>
  );
}

export default About;
