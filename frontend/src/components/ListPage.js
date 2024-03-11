import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PullForm from './PullForm';
import UpdatePullForm from './UpdatePullForm';
import {
    Button,
    Container,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Popover,
    Typography,
    Box,
    LinearProgress, // Import LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

const ListPage = () => {
    const [pulls, setPulls] = useState([]);
    const [showCreatePullForm, setShowCreatePullForm] = useState(false);
    const [selectedPullId, setSelectedPullId] = useState(null);
    const [fetchingData, setFetchingData] = useState(false); // State for tracking data fetching

    useEffect(() => {
        const fetchPulls = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/list`);
                setPulls(response.data);
            } catch (error) {
                console.error('Error fetching pulls:', error);
            }
        };

        fetchPulls();
    }, []);

    const handleDeletePull = async (pullId) => {
        try {
            await axios.delete(`${backendUrl}/api/delete/${pullId}`);
            setPulls(pulls.filter((pull) => pull.id !== pullId));
        } catch (error) {
            console.error('Error deleting pull:', error);
        }
    };

    const handleAddPull = () => {
        setShowCreatePullForm(true);
    };

    const handleCloseCreatePullForm = () => {
        setShowCreatePullForm(false);
    };

    const handleUpdatePull = (pullId) => {
        setSelectedPullId(pullId);
    };

    const handleCloseUpdatePullForm = () => {
        setSelectedPullId(null);
    };

    const handleFetchData = async (pe, ou, dx) => {
        try {
            setFetchingData(true); // Start fetching, set fetchingData to true
            const response = await axios.get(`${backendUrl}/api/fetch/${pe}/${ou}/${dx}`);
            // Handle the fetched data here
            console.log(response.data);
            setFetchingData(false); // Fetching complete, set fetchingData to false
        } catch (error) {
            console.error('Error fetching data:', error);
            setFetchingData(false); // Fetching failed, set fetchingData to false
        }
    };    

    return (
        <Container>
            <Typography variant="h4">Data Stream List</Typography>
            <Button variant="contained" color="primary" onClick={handleAddPull}>
                Add Pull
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Pull Name</TableCell>
                        <TableCell>PE (Period)</TableCell>
                        <TableCell>OU (Organisation Unit Name)</TableCell>
                        <TableCell>DX (Data Elements)</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pulls.map((pull) => (
                        <TableRow key={pull.id}>
                            <TableCell>{pull.pull_name}</TableCell>
                            <TableCell>{pull.pe}</TableCell>
                            <TableCell>{pull.ou}</TableCell>
                            <TableCell>{pull.dx ? pull.dx.join(', ') : 'N/A'}</TableCell>
                            <TableCell>
                                <IconButton onClick={() => handleDeletePull(pull.id)}>
                                    <DeleteIcon />
                                </IconButton>
                                <Popover
                                    open={selectedPullId === pull.id}
                                    onClose={handleCloseUpdatePullForm}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <Box p={2}>
                                        <UpdatePullForm pullId={pull.id} />
                                    </Box>
                                </Popover>
                                <IconButton onClick={() => handleUpdatePull(pull.id)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleFetchData(pull.pe)}>
                                    <SyncIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Popover
                open={showCreatePullForm}
                onClose={handleCloseCreatePullForm}
                anchorOrigin={{ vertical: 'center', horizontal: 'center' }} // Position at the center of the page
                transformOrigin={{ vertical: 'center', horizontal: 'center' }} // Position at the center of the page
            >
                <Box p={2}>
                    <PullForm onClose={handleCloseCreatePullForm} />
                </Box>
            </Popover>
            {fetchingData && <LinearProgress />} {/* Display progress bar when fetchingData is true */}
        </Container>
    );
};

export default ListPage;
