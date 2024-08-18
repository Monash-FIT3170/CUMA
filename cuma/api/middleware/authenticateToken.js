import jwt from 'jsonwebtoken';

/**
 * Authenticate the accessToken cookie to allow user access to protected routes.
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
        console.error('Error authenticating token: Access token is missing');
        return res.redirect('/login?error=missing-token');
    }

    try {
        // Verify the token
        const decodedAccessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach the decoded user information to the request object
        req.user = decodedAccessToken;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors
        if (error.name === 'TokenExpiredError') {
            console.error('Error authenticating token: Access token has expired');
            return res.redirect('/login?error=token-expired');
        } else {
            console.error('Error authenticating token: Invalid access token');
            return res.redirect('/login?error=invalid-token');
        }
    }
}

export default authenticateToken;
