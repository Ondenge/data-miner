import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography } from '@mui/material';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

const UpdatePullForm = ({ pullId }) => {
  const [pullName, setPullName] = useState('');
  const [pe, setPe] = useState('');
  const [ou, setOu] = useState('');
  const [dx, setDx] = useState('');

  useEffect(() => {
    const fetchPullData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/populate/${pullId}`);
        const pullData = response.data;

        // Set initial values for the form fields
        setPullName(pullData.pull_name);
        setPe(pullData.pe);
        setOu(pullData.ou);
        setDx(pullData.dx ? pullData.dx.join(', ') : '');
      } catch (error) {
        console.error('Error fetching pull data:', error);
      }
    };

    fetchPullData();
  }, [pullId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`${backendUrl}/api/update/${pullId}`, { pullName, pe, ou, dx: dx.split(',') });
      alert('Pull updated successfully!');
    } catch (error) {
      console.error('Error updating pull:', error);
      alert('Failed to update pull. Please try again.');
    }
  };

  return (
    <div>
      <Typography variant="h4">Update Pull</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Pull Name"
          value={pullName}
          onChange={(e) => setPullName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="PE"
          value={pe}
          onChange={(e) => setPe(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="OU"
          value={ou}
          onChange={(e) => setOu(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="DX (comma-separated)"
          value={dx}
          onChange={(e) => setDx(e.target.value)}
          fullWidth
          margin="normal"
          required
          multiline
        />
        <Button type="submit" variant="contained" color="primary">
          Update Pull
        </Button>
      </form>
    </div>
  );
};

export default UpdatePullForm;
