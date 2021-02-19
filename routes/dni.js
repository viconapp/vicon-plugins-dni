const express = require('express');
const DniService = require('../services/dni');
const multer = require('multer');
const path = require('path');
//UPLOAD IMAGE
const imagePath = path.join(__dirname, '../images/');
//UPLOAD IMAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagePath);
    },
    filename: (req, file, cb) => {
        cb(null, 'identification.jpg');
    },
});
const upload = multer({ storage });

function dniAPI(app) {
    const router = express.Router();
    app.use('/api/dni', router);
    const dniService = new DniService();
    router.post('/', upload.single('identification'), async (req, res, next) => {
        // eslint-disable-next-line no-console
        console.log(req.body);
        const { type } = req.body;
        try {
            const visitorDataFromID = await dniService.getData({ type });
            res.status(200).json({
                visit: visitorDataFromID,
                message: 'user information',
            });
        } catch (error) {
            next(error);
        }
    });
}

module.exports = dniAPI;
