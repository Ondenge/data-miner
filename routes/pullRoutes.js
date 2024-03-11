const express = require('express');
const pullController = require('../controllers/pullController');

const router = express.Router();

router.post('/create', pullController.createPull);
router.get('/fetch/:pe/:ou/:dx', pullController.fetchData);
router.get('/list', pullController.listPulls);
router.get('/populate/:pullId', pullController.fetchPullById); // Define the route for fetching pull by ID
router.delete('/delete/:pullId', pullController.deletePull);
router.put('/update/:pullId', pullController.updatePull); // Change the route parameter to pullId

module.exports = router;
