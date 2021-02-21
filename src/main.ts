import {router} from './api/main-dispatcher';
import express = require('express');
const app = express();
app.use(router);

app.listen(5050,()=>console.log('Server has been started...!'));

