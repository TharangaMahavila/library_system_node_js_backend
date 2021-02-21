import {router as studentDispatcher} from './student-dispatcher';
import {router as teacherDispatcher} from './staff-dispatcher';
import express = require('express');

export const router = express.Router();

router.use(studentDispatcher);
router.use(teacherDispatcher);
