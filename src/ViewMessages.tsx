import { useEffect, useState } from "react";
import { Typography, Tooltip, IconButton, Button } from "@mui/material";
import { Delete } from "@mui/icons-material";
import LayoutDefault from "./LayoutDefault";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router";

const ViewMessages = (e: any) => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    {field: 'created_at', headerName: 'Time'},
    {field: 'username', headerName: 'Username'},
    {field: 'name', headerName: 'Name'},
    {field: 'email', headerName: 'Email'},
    {field: 'message', headerName: 'Message'},
  ];

  const getRows = function() {
    fetch('./Backend/messages.php', {
      method: 'GET',
    })
    .then((response) => {
      if (response.ok) return response.json();
      else navigate('/not-admin');
    })
    .then((json) => { if (json['okay']) setRows(json['rows']); });
  }

  const deleteRows = function() {
    fetch('./Backend/messages.php', {
      method: 'DELETE',
      body: JSON.stringify({"selected": selected})
    })
    .then((response) => {
      if (response.ok) return response.json();
      else navigate('/not-admin');
    })
    .then((json) => { if (json['okay']) getRows(); });
  }

  useEffect(getRows, []);

  return (
    <LayoutDefault>
    {/* Back Button */}
      <Button 
        variant="outlined" 
        color="secondary"         
        onClick={() => window.history.back()} 
        sx={{ marginBottom: 2 }}
        >
        Back
      </Button>
    <Typography variant="h3" sx={{textAlign: "center", mt: 10}}>Messages</Typography>
    <Tooltip title="Delete">
      <IconButton onClick={deleteRows}>
        <Delete />
      </IconButton>
    </Tooltip>
    <DataGrid
      columns={columns}
      rows={rows}
      onRowSelectionModelChange={(newSelected) => { setSelected(newSelected); }}
      rowSelectionModel={selected}
      checkboxSelection
      />
    </LayoutDefault>
  );
};

export default ViewMessages;
