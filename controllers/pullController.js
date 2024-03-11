const axios = require('axios');
const mysql = require('mysql2/promise');
const config = require('../config/config');

// Create MySQL connection pool
const pool = mysql.createPool(config.database);

async function createPull(req, res) {
    try {
        const { pullName, pe, ou, dx } = req.body;

        // Check if required parameters are present
        if (!pullName || !pe || !ou || !dx) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const [pullResult] = await connection.query('INSERT INTO data_pulls (pull_name, pe, ou) VALUES (?, ?, ?)', [pullName, pe, ou]);
        const pullId = pullResult.insertId;

        for (const dxElement of dx) {
            await connection.query('INSERT INTO dx_elements (pull_id, dx) VALUES (?, ?)', [pullId, dxElement]);
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ message: 'Pull created successfully' });
    } catch (error) {
        console.error('Error creating pull:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const sanitizeColumnName = (columnName) => {
    return columnName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
};

async function saveDataToTable(pullName, response) {
    try {
        const metaData = response.metaData;
        const dimensions = metaData.dimensions;
        const dxDimensions = dimensions.dx;

        const rows = response.rows;

        const monthYear = dimensions.pe[0];

        // Extract simplified column names from metadata items
        const dxNamesSet = new Set(); // Use Set to keep track of unique column names
        const dxNames = dxDimensions.map(dx => {
            const dxName = metaData.items[dx].name;
            // Simplify the column name
            const columnName = dxName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
            dxNamesSet.add(columnName); // Add to Set to ensure uniqueness
            return columnName;
        });

        // Create or update table with pull name
        const tableName = pullName.replace(/[^a-zA-Z0-9]/g, '_');
        const connection = await mysql.createConnection(config.database);
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                country VARCHAR(255),
                county VARCHAR(255),
                subcounty VARCHAR(255),
                ward VARCHAR(255),
                organisationunitname VARCHAR(255),
                organisationunituid VARCHAR(255),
                organisationunitdescription VARCHAR(255),
                organisationunitcode VARCHAR(255),
                monthyear VARCHAR(255),
                ${[...dxNamesSet].map(dxName => `\`${dxName}\` INT(10)`).join(',\n')}
            )
        `;
        await connection.query(createTableQuery);

        for (const row of rows) {
            // Extract values from the row array using array indices as keys
            const values = [
                `"${row[0]}"`, // country
                `"${row[1]}"`, // county
                `"${row[2]}"`, // subcounty
                `"${row[3]}"`, // ward
                `"${row[4]}"`, // organisationunitname
                `"${row[5]}"`, // organisationunituid
                `"${row[6]}"`, // organisationunitdescription
                `"${row[7]}"`, // organisationunitcode
                `${monthYear}`, // monthyear
                ...row.slice(9).map(value => `"${value}"`) // wrap each value in double quotes
            ].join(', '); // join with comma and space
            // Insert query with proper column names
            const insertQuery = `INSERT INTO ${tableName} (country, county, subcounty, ward, organisationunitname, organisationunituid, organisationunitdescription, organisationunitcode, monthyear, ${[...dxNamesSet].join(', ')}) VALUES (${values})`;
            await connection.query(insertQuery);
        }

        await connection.end();

        console.log(`Data saved to table ${tableName} successfully.`);
    } catch (error) {
        console.error('Error saving data to table:', error);
    }
}


async function fetchData(req, res) {
    try {
        const pe = req.params.pe;

        // Fetch dimensions from the database based on the given pe
        const [pulls] = await pool.query('SELECT * FROM data_pulls WHERE pe = ?', [pe]);
        const dxElements = await Promise.all(pulls.map(async (pull) => {
            const [dxRows] = await pool.query('SELECT dx FROM dx_elements WHERE pull_id = ?', [pull.id]);
            return dxRows.map((row) => row.dx);
        }));

        // Construct dimension parameters for dx, pe, and ou
        const ouLevel = 'LEVEL-SI2dg6FMFr9;';
        const dxDimensions = dxElements.flat().join(';');
        const peDimension = pe;
        const ouDimension = pulls.map((pull) => pull.ou).join(';');

        // Construct the final API URL
        const apiUrl = `${process.env.API_BASE_URL}/api/analytics.json?dimension=dx:${dxDimensions}&dimension=pe:${peDimension}&dimension=ou:${ouLevel}${ouDimension}&displayProperty=NAME&showHierarchy=true&tableLayout=true&columns=dx;pe&rows=ou&hideEmptyRows=true&paging=false`;

        // Make the request to the API
        const response = await axios.get(apiUrl, {
            auth: {
                username: process.env.API_USERNAME,
                password: process.env.API_PASSWORD
            }
        });

        // Save the response data to the table
        await saveDataToTable(pulls[0].pull_name, response.data);

        // Send the response back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function listPulls(req, res) {
    try {
        const connection = await pool.getConnection();
        const [pulls] = await connection.query('SELECT * FROM data_pulls');
        connection.release();
        res.json(pulls);
    } catch (error) {
        console.error('Error fetching pulls:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updatePull(req, res) {
    try {
        const { pullId } = req.params;
        const { pullName, pe, ou, dx } = req.body;

        if (!pullId || !pullName || !pe || !ou || !dx) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update the data_pulls table
        await connection.query('UPDATE data_pulls SET pull_name = ?, pe = ?, ou = ? WHERE id = ?', [pullName, pe, ou, pullId]);

        // Delete existing dx elements for the pull
        await connection.query('DELETE FROM dx_elements WHERE pull_id = ?', [pullId]);

        // Insert updated dx elements
        for (const dxElement of dx) {
            await connection.query('INSERT INTO dx_elements (pull_id, dx) VALUES (?, ?)', [pullId, dxElement]);
        }

        await connection.commit();
        connection.release();

        res.status(200).json({ message: 'Pull updated successfully' });
    } catch (error) {
        console.error('Error updating pull:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function deletePull(req, res) {
    try {
        const pullId = req.params.pullId;
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        await connection.query('DELETE FROM dx_elements WHERE pull_id = ?', [pullId]);
        await connection.query('DELETE FROM data_pulls WHERE id = ?', [pullId]);
        await connection.commit();
        connection.release();
        res.status(204).send(); // No content sent back on successful deletion
    } catch (error) {
        console.error('Error deleting pull:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function fetchPullById(req, res) {
    try {
        const pullId = req.params.pullId;
        const connection = await pool.getConnection();
        const [pull] = await connection.query('SELECT * FROM data_pulls WHERE id = ?', [pullId]);
        connection.release();

        if (pull.length === 0) {
            return res.status(404).json({ error: 'Pull not found' });
        }

        res.json(pull[0]);
    } catch (error) {
        console.error('Error fetching pull by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createPull,
    fetchData,
    listPulls,
    updatePull,
    deletePull,
    fetchPullById
};
