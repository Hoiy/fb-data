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

export function PromiseThrottleQueue(fn, delay = 1000, timeout = 5000) {
    this.delay = delay
    this.timeout = timeout
    this.fn = fn
    this.queue = []
}

PromiseThrottleQueue.prototype.push = function(args) {
    return this.queue.push(args)
}

PromiseThrottleQueue.prototype.start = function() {
    return new Promise(resolve => {
        let idle_time = 0
        let count = 0
        let loop = setInterval(() => {
            if(idle_time >= this.timeout) {
                console.log('Done.')
                clearInterval(loop)
                return resolve()
            }
            if(this.queue.length > 0) {
                const args = this.queue.shift()
                console.log(new Date(), this.queue.length, ++count, 'Executing...')
                this.fn(args)
                idle_time = 0
            } else {
                idle_time += this.delay
            }
        }, this.delay)
    })
}
