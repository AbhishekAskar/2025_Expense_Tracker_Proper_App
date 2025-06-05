const jwt = require('jsonwebtoken');
const SECRET_KEY = "mellow234@*%Yellow";

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("🔐 Auth Header:", authHeader); // ✅ Add this

    if (!authHeader) {
        console.log("❌ No token found in header");
        return res.status(403).send('No token provided');
    }

    const token = authHeader.split(' ')[1];
    console.log("🔐 Extracted Token:", token); // ✅ Add this

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("✅ Token decoded:", decoded); // ✅ Add this
        req.user = { userId: decoded.userId };
        next();
    } catch (err) {
        console.log("❌ Invalid Token", err.message); // ✅ Add this
        return res.status(401).send('Invalid token');
    }
};

module.exports = authenticate;
