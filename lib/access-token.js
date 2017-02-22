var promisifyAll = require('es6-promisify-all')
var FB = promisifyAll(require('fb'))

module.exports.get = (token) => {
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
