import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Typography } from '@mui/material';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

const PullForm = () => {
    const [pullName, setPullName] = useState('');
    const [pe, setPe] = useState('');
    const [ou, setOu] = useState('');
    const [dx, setDx] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${backendUrl}/api/create`, { pullName, pe, ou, dx: dx.split(',') });
            alert('Pull created successfully!');
            setPullName('');
            setPe('');
            setOu('');
            setDx('');
        } catch (error) {
            console.error('Error creating pull:', error);
            alert('Failed to create pull. Please try again.');
        }
    };

    return (
        <Box>
            <div>
                <Typography variant="h4">Add Pull</Typography>
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
                        Create Pull
                    </Button>
                </form>
            </div>
        </Box>
    );
};

export default PullForm;
