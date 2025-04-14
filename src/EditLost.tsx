import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

function EditLost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', location: '', description: '' });

  useEffect(() => {
    fetch(`./Backend/getLostById.php?id=${id}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('./Backend/updateLost.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) navigate('/dashboard');
        else alert('Update failed');
      });
  };

  return (
    <Container>
      <Typography variant="h4">Edit Lost Item</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
        <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth required />
        <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={4} />
        <Button variant="contained" type="submit">Save Changes</Button>
      </Box>
    </Container>
  );
}

export default EditLost;
