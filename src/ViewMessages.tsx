import React, { useState, useEffect } from "react";
import {
  Typography,
  Tooltip,
  IconButton,
  Button,
  Container,
  Paper,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  VisibilityOff as VisibilityOffIcon,
  GetApp as DownloadIcon
} from "@mui/icons-material";
import LayoutDefault from "./LayoutDefault";
import { useNavigate } from "react-router";
import { useAuth } from "./components/AuthContext";

const ViewMessages = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setSnackbar({
        open: true,
        message: 'Admin access required. Redirecting...',
        severity: 'error'
      });
      setTimeout(() => navigate('/not-admin'), 2000);
    } else if (!authLoading && isAuthenticated && isAdmin) {
      getRows();
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const getRows = function() {
    setLoading(true);
    setError(null);
    
    // Using the actual implementation
    fetch('./Backend/messages.php', {
      method: 'GET',
      credentials: 'include' // Include cookies for authentication
    })
    .then((response) => {
      if (response.ok) return response.json();
      else navigate('/not-admin');
    })
    .then((json) => { 
      if (json['okay']) setRows(json['rows']); 
      setLoading(false);
    })
    .catch(error => {
      setError("Failed to load messages");
      setLoading(false);
    });
  };

  const deleteRows = function() {
    setLoading(true);
    
    // Using the actual implementation
    fetch('./Backend/messages.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"selected": selected}),
      credentials: 'include' // Include cookies for authentication
    })
    .then((response) => {
      if (response.ok) return response.json();
      else navigate('/not-admin');
    })
    .then((json) => { 
      if (json['okay']) {
        getRows();
        setSuccessMessage(`Successfully deleted ${selected.length} message(s)`);
        setSnackbar({
          open: true,
          message: `Successfully deleted ${selected.length} message(s)`,
          severity: "success"
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      setOpenDeleteDialog(false);
      setSelected([]);
    })
    .catch(error => {
      setError("Failed to delete messages");
      setLoading(false);
      setOpenDeleteDialog(false);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = () => {
    if (selected.length > 0) {
      setOpenDeleteDialog(true);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleRefresh = () => {
    getRows();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on search
  };

  // Function to mark a message as read
  const markMessageAsRead = async (messageId) => {
    try {
      // Using the existing messages.php endpoint with a POST request
      const response = await fetch('./Backend/messages.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          message_id: messageId
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.okay) {
          // Update the UI to reflect the read status
          setRows(rows.map(row => 
            row.id === messageId ? { ...row, is_read: 1 } : row
          ));
          
          setSnackbar({
            open: true,
            message: "Message marked as read",
            severity: "success"
          });
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error marking message as read:", error);
      setSnackbar({
        open: true,
        message: "Failed to mark message as read",
        severity: "error"
      });
      return false;
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowDetailView(true);
    
    // Mark message as read when viewing it
    if (message && !message.is_read) {
      markMessageAsRead(message.id);
    }
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedMessage(null);
  };

  const handleExport = () => {
    // Get selected messages
    const selectedData = rows.filter(row => selected.includes(row.id));
    if (selectedData.length === 0) return;
    
    // Create CSV content
    const headers = ['Date', 'Username', 'Name', 'Email', 'Message'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(row => [
        formatDate(row.created_at),
        `"${row.username}"`,
        `"${row.name}"`,
        `"${row.email}"`,
        `"${row.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'messages.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({
      open: true,
      message: `Exported ${selectedData.length} message(s) to CSV`,
      severity: "success"
    });
  };

  const handleToggleUnreadFilter = () => {
    setFilterUnread(!filterUnread);
    setPage(0); // Reset to first page when toggling filter
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Sort and filter rows
  const filteredRows = rows
    // First, sort by created_at in descending order (newest first)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    // Then apply filters
    .filter(row => {
      // Apply unread filter if active
      if (filterUnread && row.is_read) {
        return false;
      }
      
      // Then apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          row.username.toLowerCase().includes(query) ||
          row.name.toLowerCase().includes(query) ||
          row.email.toLowerCase().includes(query) ||
          row.message.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

  // Apply pagination
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (authLoading || loading) {
    return (
      <LayoutDefault>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </LayoutDefault>
    );
  }

  if (error) {
    return (
      <LayoutDefault>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </Container>
      </LayoutDefault>
    );
  }

  // Detail view for a selected message
  if (showDetailView && selectedMessage) {
    return (
      <LayoutDefault>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
              sx={{ mb: 3 }}
            >
              Back to Messages
            </Button>
            
            <Typography variant="h4" gutterBottom>
              Message Details
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedMessage.created_at)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Username
                    </Typography>
                    <Typography variant="body1">
                      {selectedMessage.username}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedMessage.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedMessage.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Message
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedMessage.message}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<VisibilityIcon />}
                onClick={() => markMessageAsRead(selectedMessage.id)}
                disabled={selectedMessage.is_read === 1}
              >
                {selectedMessage.is_read === 1 ? "Already Read" : "Mark as Read"}
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setSelected([selectedMessage.id]);
                  setOpenDeleteDialog(true);
                }}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Container>
        
        {/* Delete Confirmation Dialog - include it here so it appears in front of detail view */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the selected message? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={deleteRows} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </LayoutDefault>
    );
  }

  return (
    <LayoutDefault>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              User Messages
            </Typography>
            
            <Box>
              <Button 
                variant="outlined" 
                color="secondary"         
                onClick={() => navigate('/admin-console')}
                startIcon={<ArrowBackIcon />}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Tooltip title="Refresh messages">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={filterUnread ? "Show all messages" : "Show only unread messages"}>
                <IconButton 
                  onClick={handleToggleUnreadFilter}
                  color={filterUnread ? "primary" : "default"}
                >
                  {filterUnread ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              placeholder="Search messages..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ width: 300 }}
            />
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={selected.length === 0}
                onClick={handleExport}
                sx={{ mr: 1 }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={selected.length === 0}
                onClick={handleOpenDeleteDialog}
              >
                Delete
              </Button>
            </Box>
          </Box>
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                      checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="textSecondary">
                        No messages found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => {
                    const isItemSelected = isSelected(row.id);
                    
                    return (
                      <TableRow
                        hover
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ 
                          bgcolor: row.is_read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(25, 118, 210, 0.15)',
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleClick(row.id);
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(row.created_at)}</TableCell>
                        <TableCell>{row.username}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.message}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewMessage(row)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selected.length} selected message(s)? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={deleteRows} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LayoutDefault>
  );
};

export default ViewMessages;