require("dotenv/config");
const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);

async function getTokenDetails(body, g_csrf_token){
    if(g_csrf_token!=body.g_csrf_token){
        return null;
    }
    const ticket = await client.verifyIdToken({
        idToken: body.credential,
        audience: env.Google_OAuth_Client_ID,
    });
    const payload = ticket.getPayload();

    const userData = {
        email:payload["email"],
        verified:payload["email_verified"],
        name:payload["name"],
        profile:payload["picture"]
    }
    return userData;
};

module.exports = getTokenDetails;
