import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Box, Button, Container, TextField, Typography, Alert } from "@mui/material";
import LayoutDefault from "./LayoutDefault";

function deleteandeditbyID() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    last_seen_location: '',
    description: '',
    phone_number: '',
    email_address: '',
    first_name: '',
    last_name: '',
    file_path: null
  });
  const [selectedImageName, setSelectedImageName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`./Backend/get${type === 'found' ? 'Found' : 'Lost'}ById.php?id=${id}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, [id, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm(prev => ({ ...prev, file_path: file }));
    setSelectedImageName(file ? file.name : '');
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const formData = new FormData();
    formData.append('id', id);
    formData.append('type', type);
    formData.append('action', 'edit');
    formData.append('name', form.name);
    formData.append('last_seen_location', form.last_seen_location);
    formData.append('description', form.description);
    formData.append('phone_number', form.phone_number);
    formData.append('email_address', form.email_address);
    formData.append('first_name', form.first_name);
    formData.append('last_name', form.last_name);
    if (form.file_path) formData.append('file_path', form.file_path);

    fetch('./Backend/deleteandeditbyID.php', {
      method: 'POST',
      body: formData
    })
        .then(res => res.json())
        .then(data => {
        if (data.success && data.redirect) {
            navigate(data.redirect);
        } else if (data.success) {
            navigate('/user-dashboard');
        } else {
            setErrorMessage(data.error || 'Update failed.');
        }
        })
    
      .catch(() => setErrorMessage('Something went wrong.'));
  };

  return (
    <LayoutDefault>
      <Container>
        <Typography variant="h4">Edit {type} Item</Typography>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box component="form" onSubmit={handleEdit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
          <TextField label="Last Seen Location" name="last_seen_location" value={form.last_seen_location} onChange={handleChange} fullWidth required />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={4} />
          <TextField label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} fullWidth />
          <TextField label="Email Address" name="email_address" value={form.email_address} onChange={handleChange} fullWidth />
          <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth />
          <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth />
          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {selectedImageName && <Typography variant="body2">Selected: {selectedImageName}</Typography>}
          <Button variant="contained" type="submit">Save Changes</Button>
        </Box>
      </Container>
    </LayoutDefault>
  );
}

export default deleteandeditbyID;
