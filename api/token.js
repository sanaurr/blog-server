const jwt = require('jsonwebtoken');
const secretKey = 'my@secret_k#y';

function generateToken(payload, deadline) {
    

    const options = {
        expiresIn: deadline,
    };


    const token = jwt.sign(payload, secretKey, options);

    return token;
}
exports.generateToken = generateToken;


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log(req.headers);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
};
exports.verifyToken = verifyToken