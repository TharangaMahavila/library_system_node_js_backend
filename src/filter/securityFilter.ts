import jwt = require('jsonwebtoken');
import crypto = require('crypto');
import config = require('../../config/default');

export function authenticateToken(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json('No valid authentication credentials.') // if there isn't any token

    const hash = crypto.createHmac('sha256',config.secret)
        .update('This Application is belonging to MR.K.P.T.Mahavila')
        .digest('hex');

    jwt.verify(token, hash as string, (err: any, user: any) => {
        if (err) return res.status(403).json('Unauthorized access');
        req.user = user;
        next() // pass the execution off to whatever request the client intended
    })
}
