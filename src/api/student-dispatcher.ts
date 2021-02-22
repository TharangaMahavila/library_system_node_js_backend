import express = require('express');
import crypto = require('crypto');
import bodyParser = require('body-parser');
const {studentSchema,resetPasswordSchema} = require('../validate/studentValidate');
import {pool} from "./connection-pool";

export const router = express.Router();
router.use(bodyParser.json());

router.get('/api/v1/students',(req, res) => {
    pool.getConnection((err, connection) => {
           if (err){
               res.status(500).send('Cannot establish the database connection');
           }else {
               connection.query('SELECT * FROM student',(err,result)=>{
                   if (err){
                       res.status(500).send('Failed to read the Student data.');
                   }else {
                       res.json(result);
                   }
               });
               connection.release();
           }
    });
});
router.get('/api/v1/students/:studentId',(req, res) => {
    pool.getConnection((err, connection) => {
        if (err){
            res.status(500).send('Cannot establish the database connection');
        }else {
            connection.query('SELECT * FROM student WHERE reg_name=?',[req.params.studentId],
                (err, result) => {
                if(err){
                    res.status(500).send('Failed to read the Student data.');
                }else {
                    if(result.length>0){
                        res.json(result[0]);
                    }else {
                        res.status(404).json('No Student Found...!')
                    }
                }
            });
            connection.release();
        }
    });
});
router.post('/api/v1/students',async (req, res) => {
    try {
        var result = await studentSchema.validateAsync(req.body);
    }catch (error){
        if(error.isJoi === true)
            res.status(422).json({'Invalid student details':error});
            return;
    }
    pool.getConnection((err, connection) => {
       if(err){
           res.status(500).send('Cannot establish the database connection');
           return;
       } else {
           var body = req.body;
           connection.beginTransaction(err => {
               if(err){
                   connection.rollback(err => {
                       connection.release();
                   });
               }else{
                   connection.query('INSERT INTO student (' +
                       'reg_name,' +
                       'initials,' +
                       'first_name,' +
                       'last_name,' +
                       'guardian_name,' +
                       'street_no,' +
                       'first_lane,' +
                       'second_lane,' +
                       'city,' +
                       'gender,' +
                       'contact,' +
                       'password,' +
                       'active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                       [
                           body.reg_name,
                           body.initials,
                           body.first_name,
                           body.last_name,
                           body.guardian_name,
                           body.street_no,
                           body.first_lane,
                           body.second_lane,
                           body.city,
                           body.gender,
                           body.contact,
                           '617c437600fd562ec1a38b241fba6bd658a5fe0ac79e655545bf10bb88ab2c29',
                           'YES'
                       ],(err, results) => {
                           if(err){
                               if(err.code === 'ER_DUP_ENTRY'){
                                   res.status(400).json('Student already saved..!');
                                   connection.rollback(err => {
                                       connection.release();
                                   });
                                   return;
                               }else{
                                   res.status(500).json('Failed to insert the student data');
                                   connection.rollback(err => {
                                       connection.release();
                                   });
                                   return;;
                               }
                           }else {
                               connection.query('INSERT INTO student_update VALUES (?,?,?,?)',[
                                   body.reg_name,
                                   body.grade,
                                   body.section,
                                   body.year
                               ],(err, results) => {
                                   if (err){
                                       res.status(500).json('Failed to insert the student data');
                                       connection.rollback(err => {
                                           connection.release();
                                       });
                                       return;
                                   }else {
                                       connection.commit(err => {
                                           if(err){
                                               connection.rollback(err => {
                                                   connection.release();
                                               });
                                           }else {
                                               connection.release();
                                               res.status(201).json(req.body);
                                           }
                                       });
                                   }
                               });
                           }
                       });
               }
           });
       }
    });
});
router.delete('/api/v1/students/:studentId',(req, res) => {
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).json('Cannot establish the database connection..!');
        }else {
            connection.query('SELECT * FROM student WHERE reg_name=?',[req.params.studentId],(err, result) => {
                if (err){
                    res.status(500).json('Cannot identify the student');
                }else {
                    if(result.length>0){
                        connection.query('DELETE FROM student WHERE reg_name=?',[req.params.studentId],(err, result) => {
                            if(err){
                                res.status(500).json('Cannot delete the student');
                            } else {
                                res.status(201).json('Successfully deleted the student');
                            }
                        });
                    }else {
                        res.status(404).json('No student exist.');
                    }
                }
            })
            connection.release();
        }
    });
});
router.put('/api/v1/students/:studentId',async (req, res) => {
    try {
        var result = await studentSchema.validateAsync(req.body);
    }catch (error){
        if(error.isJoi === true)
            res.status(422).json({'Invalid student details':error});
        return;
    }
    if(req.params.studentId !== req.body.reg_name){
        res.status(400).json('Cannot process the request becase of the diffrent student id');
        return;
    }
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).send('Cannot establish the database connection');
        } else {
            var body = req.body;
            connection.query('SELECT * FROM student WHERE reg_name=?',[req.params.studentId],(err, result) => {
               if(err){
                   res.status(500).json('Cannot identify the student');
               } else {
                   if(result.length>0){
                       connection.query('UPDATE student SET initials=?,first_name=?,last_name=?,guardian_name=?,' +
                           'street_no=?,first_lane=?,second_lane=?,city=?,gender=?,contact=?,active=? WHERE reg_name=?',
                           [
                               body.initials,
                               body.first_name,
                               body.last_name,
                               body.guardian_name,
                               body.street_no,
                               body.first_lane,
                               body.second_lane,
                               body.city,
                               body.gender,
                               body.contact,
                               body.active,
                               body.reg_name,
                           ],(err, results) => {
                               if(err){
                                   res.status(500).json('Failed to update the student data');
                               }else {
                                   res.status(201).json(req.body);
                               }
                           });
                   }else {
                       res.status(404).json('No student exist.')
                   }
               }
            });
            connection.release();
        }
    });
});
router.put('/api/v1/students/password/:studentId',async (req, res) => {
    try {
        var result = await resetPasswordSchema.validateAsync(req.body);
    }catch (error){
        if(error.isJoi === true)
            res.status(422).json({'Invalid password reset details':error});
        return;
    }
    if(req.params.studentId !== req.body.reg_name){
        res.status(400).json('Cannot process the request becase of the diffrent student id');
        return;
    }
    pool.getConnection((err, connection) => {
        if(err){
            res.status(500).json('Cannot establish the database connection')
        }else {
            connection.query('SELECT password FROM student WHERE reg_name=?',[req.params.studentId], (err, results) => {
                if(err){
                    res.status(500).json('Cannot identify the student');
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
                        connection.query('UPDATE student SET password=? WHERE reg_name=?',[newHash,req.params.studentId],
                            (err, results) => {
                                if(err){
                                    res.status(500).json('Cannot identify the student');
                                }else {
                                    res.status(201).json('Successfully reset the password');
                                }
                            });
                    }else {
                        res.status(404).json('No student exist.');
                    }
                }
            });
            connection.release();
        }
    });
});
