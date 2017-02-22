import FB from 'fb'

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
