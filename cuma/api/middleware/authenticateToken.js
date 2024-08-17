import jwt from 'jsonwebtoken';

/**
 * Authenticate the accessToken cookies to allow user access to protected route
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function authenticateToken(req, res, next) {
    // Get the token from the cookies
    const token = req.cookies.accessToken;

    // Check if the token exists
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach the decoded user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Access token has expired' });
        } else {
            return res.status(403).json({ message: 'Invalid access token' });
        }
    }
}

export default authenticateToken;
