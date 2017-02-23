import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
promisifyAll(FB)

export function getAccessToken(token) {
    return FB.napiAsync('oauth/access_token', {
        client_id: token.appID,
        client_secret: token.appSecret,
        grant_type: 'client_credentials'
    })
    .then(res => {
        return res.access_token
    })
    .catch(err => {
        console.log('Error getting access token', err)
    })
}
