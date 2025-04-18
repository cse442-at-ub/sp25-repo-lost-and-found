import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography,
  Tooltip,
  Fade,
  Paper,
} from "@mui/material";

const API_URL = "./Backend/adminClaim.php";
const APPROVAL_URL = "./Backend/setClaimApproved.php";
const IMAGE_BASE_URL = "./Backend/";

function AdminClaim() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const pendingClaims = data.filter((claim) => claim.approved === null);
        setClaims(pendingClaims);
      })
      .catch((error) => console.error("Error fetching claims:", error));
  }, []);

  const handleApproval = (id, approved) => {
    fetch(APPROVAL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setClaims((prevClaims) =>
            prevClaims.filter((claim) => claim.claim_id !== id)
          );
        } else {
          alert("Failed to update claim.");
        }
      })
      .catch((error) => console.error("Error updating claim:", error));
  };

  return (
    <LayoutDefault>
      {claims.length === 0 ? (
        <Typography variant="h6" sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
          🎉 All caught up! No pending claims to review.
        </Typography>
      ) : (
        <Box sx={{ p: 3, maxWidth: "1000px", mx: "auto" }}>
          <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
            Pending Claims
          </Typography>

          {claims.map((claim) => (
            <Fade in key={claim.claim_id}>
              <Card
                elevation={6}
                sx={{
                  mb: 5,
                  p: 2,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  background: "#fafafa",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: "100%", sm: 220 },
                    height: 220,
                    borderRadius: 3,
                    objectFit: "cover",
                    backgroundColor: "#f0f0f0",
                  }}
                  src={
                    claim.image
                      ? `${IMAGE_BASE_URL}${encodeURI(claim.image)}`
                      : `${IMAGE_BASE_URL}default-item.png`
                  }
                  alt="Item Image"
                />

                <Box sx={{ flex: 1 }}>
                  <CardContent sx={{ pb: 0 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {claim.item_name || "Unnamed Item"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Found by <strong>{claim.first_name} {claim.last_name}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {claim.description || `Found at ${claim.location_found || "Unknown location"}`}
                    </Typography>
                  </CardContent>

                  <Divider sx={{ my: 1 }} />

                  <Box px={2} pb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      Claimant Info
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff" }}>
                      <Typography variant="body2"><strong>Name:</strong> {claim.first_name || "N/A"} {claim.last_name || ""}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {claim.email || "N/A"}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {claim.phone || "N/A"}</Typography>
                      <Typography variant="body2"><strong>Ownership Proof:</strong> {claim.proof_of_ownership || "N/A"}</Typography>
                      <Typography variant="body2"><strong>Additional Details:</strong> {claim.additional_details || "N/A"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Requested At:</strong> {new Date(claim.created_at).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Box>

                  <Stack direction="row" spacing={2} px={2} pt={2}>
                    <Tooltip title="Approve claim" arrow>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApproval(claim.claim_id, 1)}
                        sx={{ minWidth: 120, borderRadius: 2 }}
                      >
                        Approve
                      </Button>
                    </Tooltip>

                    <Tooltip title="Deny claim" arrow>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleApproval(claim.claim_id, 0)}
                        sx={{ minWidth: 120, borderRadius: 2 }}
                      >
                        Deny
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
              </Card>
            </Fade>
          ))}
        </Box>
      )}
    </LayoutDefault>
  );
}

export default AdminClaim;
