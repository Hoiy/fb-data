var promisifyAll = require('es6-promisify-all')
var FB = promisifyAll(require('fb'))
//var FB = require('fb')
var access_token = require('./lib/access-token')
var token = require('./token.json')

console.log(token)

access_token.get(token)
.then((accessToken) => {
    FB.setAccessToken(accessToken)
    return FB.napiAsync('disney')
        .then(res => {
            console.log(res);
            return res
        })
})
.catch((err) => {
    console.log(err)
})

/*
module.exports.handler = function(event, context, callback) {
    app_token.acquire((err, res) => {
        if (err) {
            context.done(err, null);
            return;
        }

        FB.setAccessToken(res);
        FB.napi(`/${event.pageId}/posts?fields=name,shares`, function(err, res) {
            context.done(err, res);
        });
    });
};
*/
