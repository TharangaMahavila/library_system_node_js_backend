import express = require('express');
export const router = express.Router();

router.get('/api/v1/teachers/*',(req, res) => {
    res.send('Get All teachers');
});
router.post('/api/v1/teachers/*',(req, res) => {

});
router.delete('/api/v1/teachers/*',(req, res) => {

});
router.put('/api/v1/teachers/*',(req, res) => {

});
