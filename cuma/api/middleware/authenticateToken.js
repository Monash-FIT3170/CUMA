import jwt from 'jsonwebtoken';

const serverPath = "http://localhost:" + (process.env.PORT || 3000)
const isProduction = process.env.NODE_ENV === 'production';
const ACCESS_TOKEN_AGE = 5 * 1000
const authBackendPath = "/api/authentication"

/**
 * Authenticate the accessToken cookie to allow user access to protected routes.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
async function authenticateToken(req, res, next) {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    try {
        // Check if the token exists
        if (!accessToken) {
            throw Error('Access token is missing');
        };

        // Verify the token
        const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Attach the decoded user information to the request object
        req.user = decodedAccessToken;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors
        if (error.name === 'TokenExpiredError') {
            console.error('Error authenticating token: Access token has expired');
        } else {
            console.error('Error authenticating token: ', error);
        };

        if (!refreshToken) {
            console.error('Error authenticating token: Refresh token is missing');
            return res.redirect('/login?error=missing-refresh-token');
        }

        try {
            const url = new URL(serverPath + authBackendPath + "/refresh-token");
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error("Error refreshing token:", response.message);
                return res.redirect('/login?error=failed-refresh-token');
            }

            if (!result.accessToken) {
                console.error("Error refreshing token:", response.message);
                return res.redirect('/login?error=failed-refresh-access-token');
            }

            createAccessTokenCookie(res, result.accessToken)
            next();

        } catch(error) {
            console.error("Error refreshing token:", error);
            return res.redirect('/login?error=failed-refresh-token');
        };
    };
};

// create and add cookies
function createAccessTokenCookie(res, cookieToken) {
     // Set cookies
    res.cookie('accessToken', cookieToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: ACCESS_TOKEN_AGE
    });
}

export default authenticateToken;
