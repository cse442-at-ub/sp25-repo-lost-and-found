import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";

const API_URL =
  "./Backend/adminClaim.php";
const APPROVAL_URL =
  "./Backend/setClaimApproved.php";
const IMAGE_BASE_URL =
  "./Backend/";

function AdminClaim() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        // Filter claims where 'approved' is NULL
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
        console.log("Response:", data);
        if (data.success) {
          // Remove the claim from UI after approval/denial
          setClaims((prevClaims) => prevClaims.filter((claim) => claim.claim_id !== id));
        } else {
          alert("Failed to update claim.");
        }
      })
      .catch((error) => console.error("Error updating claim:", error));
  };

  return (
    <LayoutDefault>
      {claims.length == 0 && 
        <Typography variant="body">There are no claims to be reviewed</Typography>
      }
      <Grid container spacing={3} style={{ padding: 20 }}>
        {claims.map((claim) => (
          <React.Fragment key={claim.id}>
            {/* Item Card */}
            <Grid item xs={12} md={6} alignSelf={"center"}>
              <Card>
                <CardMedia
                  component="img"
                  src={
                    claim.image
                      ? `${IMAGE_BASE_URL}${encodeURI(claim.image)}`
                      : `${IMAGE_BASE_URL}default-item.png`
                  }
                  alt="Item Image"
                  style={{ width: "100%", height: "auto" }}
                />
                <CardContent>
                  <Typography variant="h6">
                    {claim.item_name || "Unknown Item"}
                  </Typography>
                  <Typography variant="body2">
                    Found by {claim.first_name} {claim.last_name}
                  </Typography>
                  <Typography variant="body2">
                    {claim.description || `Found at ${claim.location_found || "Unknown location"}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Claimant Card */}
            <Grid item xs={12} md={6} alignSelf={"center"}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Claim</Typography>
                  <Typography variant="body2">
                    Name: {claim.first_name} {claim.last_name}
                  </Typography>
                  <Typography variant="body2">
                    Email: {claim.email || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {claim.phone || "N/A"}
                  </Typography>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      marginRight: 10,
                      marginTop: 10,
                    }}
                    onClick={() => handleApproval(claim.claim_id, 1)}
                  >
                    APPROVE
                  </Button>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      marginTop: 10,
                    }}
                    onClick={() => handleApproval(claim.claim_id, 0)}
                  >
                    DENY
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </LayoutDefault>
  );
}

export default AdminClaim;