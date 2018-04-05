const express = require('express');

const authMiddleware = require('../middlewares/auth');

const Project = require("../models/Project");

const Task = require('../models/Task');





const router  = express.Router();

router.use(authMiddleware);


// Route to get all projects in database.
router.get('/', async (req, res) => {
    res.send({ ok: true, user: req.userId });
});


// Route to get just one project in database.
router.get('/:projectId', async (req, res) => {
    res.send({ user: req.userId });    
});



module.exports = app => app.use('/projects', router);

