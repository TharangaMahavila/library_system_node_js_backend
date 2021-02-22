import express = require('express');
import crypto = require('crypto');
import bodyParser = require('body-parser');
const {staffSchema,resetPasswordSchema} = require('../validate/staffValidate');
import security = require('../filter/securityFilter');
import {pool} from "./connection-pool";

export const router = express.Router();
router.use(bodyParser.json());

router.get('/api/v1/staffs',security.authenticateToken,(req, res) => {
    pool.getConnection((err, connection) => {
        if (err){
            res.status(500).send('Cannot establish the database connection');
        }else {
            connection.query('SELECT nic,name,contact,street_no,first_lane,second_lane,city,gender,salary_no,active FROM staff',(err,result)=>{
                if (err){
                    res.status(500).send('Failed to read the Staff members data.');
                }else {
                    res.json(result);
                }
            });
            connection.release();
        }
    });
});
router.get('/api/v1/staffs/:staffId',security.authenticateToken,(req, res) => {
    pool.getConnection((err, connection) => {
        if (err){
            res.status(500).send('Cannot establish the database connection');
        }else {
            connection.query('SELECT nic,name,contact,street_no,first_lane,second_lane,city,gender,salary_no,active FROM staff WHERE nic=?',[req.params.staffId],
                (err, result) => {
                    if(err){
                        res.status(500).send('Failed to read the Staff members data.');
                    }else {
                        if(result.length>0){
                            res.json(result[0]);
                        }else {
                            res.status(404).json('No Staff Member Found...!')
                        }
                    }
                });
            connection.release();
        }
    });
});
router.post('/api/v1/staffs',security.authenticateToken,async (req, res) => {
    try {
        var result = await staffSchema.validateAsync(req.body);
    }catch (error){
        if(error.isJoi === true)
            res.status(422).json({'Invalid staff member details':error});
        return;
    }
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).send('Cannot establish the database connection');
        } else {
            var body = req.body;
            connection.query('INSERT INTO staff (' +
                'nic,' +
                'name,' +
                'contact,' +
                'street_no,' +
                'first_lane,' +
                'second_lane,' +
                'city,' +
                'gender,' +
                'salary_no,' +
                'password,' +
                'active) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                [
                    body.nic,
                    body.name,
                    body.contact,
                    body.street_no,
                    body.first_lane,
                    body.second_lane,
                    body.city,
                    body.gender,
                    body.salary_no,
                    '617c437600fd562ec1a38b241fba6bd658a5fe0ac79e655545bf10bb88ab2c29',
                    'YES'
                ],(err, results) => {
                    if(err){
                        if(err.code === 'ER_DUP_ENTRY'){
                            res.status(400).json('Staff member already saved..!');
                        }else{
                            res.status(500).json('Failed to insert the staff member data');
                        }
                    }else {
                        res.status(201).json(req.body);
                    }
                });
            connection.release();
        }
    });
});
router.delete('/api/v1/staffs/:staffId',security.authenticateToken,(req, res) => {
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).json('Cannot establish the database connection..!');
        }else {
            connection.query('SELECT * FROM staff WHERE nic=?',[req.params.staffId],(err, result) => {
                if (err){
                    res.status(500).json('Cannot identify the staff member');
                }else {
                    if(result.length>0){
                        connection.query('DELETE FROM staff WHERE nic=?',[req.params.staffId],(err, result) => {
                            if(err){
                                res.status(500).json('Cannot delete the staff member');
                            } else {
                                res.status(201).json('Successfully deleted the staff member');
                            }
                        });
                    }else {
                        res.status(404).json('No staff member exist.');
                    }
                }
            })
            connection.release();
        }
    });
});
router.put('/api/v1/staffs/:staffId',security.authenticateToken,async (req, res) => {
    try {
        var result = await staffSchema.validateAsync(req.body);
    }catch (error){
        if(error.isJoi === true)
            res.status(422).json({'Invalid staff member details':error});
        return;
    }
    if(req.params.staffId !== req.body.nic){
        res.status(400).json('Cannot process the request becase of the diffrent staff member id');
        return;
    }
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).send('Cannot establish the database connection');
        } else {
            var body = req.body;
            connection.query('SELECT * FROM staff WHERE nic=?',[req.params.staffId],(err, result) => {
                if(err){
                    res.status(500).json('Cannot identify the staff member');
                } else {
                    if(result.length>0){
                        connection.query('UPDATE staff SET name=?,contact=?,' +
                            'street_no=?,first_lane=?,second_lane=?,city=?,gender=?,salary_no=?,active=? WHERE nic=?',
                            [
                                body.name,
                                body.contact,
                                body.street_no,
                                body.first_lane,
                                body.second_lane,
                                body.city,
                                body.gender,
                                body.salary_no,
                                body.active,
                                body.nic,
                            ],(err, results) => {
                                if(err){
                                    res.status(500).json('Failed to update the staff member data');
                                }else {
                                    res.status(201).json(req.body);
                                }
                            });
                    }else {
                        res.status(404).json('No staff member exist.')
                    }
                }
            });
            connection.release();
        }
    });
});
router.put('/api/v1/staffs/password/:staffId',security.authenticateToken,async (req, res) => {
    try {
        var result = await resetPasswordSchema.validateAsync(req.body);
    }catch (error){
        if(error.isJoi === true)
            res.status(422).json({'Invalid password reset details':error});
        return;
    }
    if(req.params.staffId !== req.body.nic){
        res.status(400).json('Cannot process the request becase of the diffrent staff member id');
        return;
    }
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).json('Cannot establish the database connection')
        }else {
            connection.query('SELECT password FROM staff WHERE nic=?',[req.params.staffId], (err, results) => {
                if(err){
                    res.status(500).json('Cannot identify the staff member');
                }else {
                    if(results.length>0){
                        const hash = crypto.createHmac('sha256',req.body.password)
                            .update('This Application is belonging to MR.K.P.T.Mahavila')
                            .digest('hex');
                        if(hash !== results[0].password){
                            res.status(403).json('Sorry, Unauthorized access.');
                            return;
                        }
                        const newHash = crypto.createHmac('sha256',req.body.newPassword)
                            .update('This Application is belonging to MR.K.P.T.Mahavila')
                            .digest('hex');
                        connection.query('UPDATE staff SET password=? WHERE nic=?',[newHash,req.params.staffId],
                            (err, results) => {
                                if(err){
                                    res.status(500).json('Cannot identify the staff member');
                                }else {
                                    res.status(201).json('Successfully reset the password');
                                }
                            });
                    }else {
                        res.status(404).json('No staff member exist.');
                    }
                }
            });
            connection.release();
        }
    });
});
