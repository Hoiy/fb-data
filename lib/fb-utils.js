import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
promisifyAll(FB)

export function getAccessToken(appToken) {
    return FB.napiAsync('oauth/access_token', {
        client_id: appToken.appID,
        client_secret: appToken.appSecret,
        grant_type: 'client_credentials'
    })
    .then(res => {
        return res.access_token
    })
    .catch(err => {
        console.log('Error getting access token', err)
    })
}

export function setAccessToken(FB, appToken) {
    getAccessToken(appToken).then(accessToken => {
        FB.setAccessToken(accessToken)
    })
}
