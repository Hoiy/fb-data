import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken } from './lib/fb-utils'
import models from './models'
import token from './token.json'
import _ from 'lodash'

promisifyAll(FB)
FB.options({version: 'v2.8'})

console.log(process.argv)

let min_fan_count = process.argv[5] ? process.argv[5] : 200000
let seed = process.argv[4] ? process.argv[4] : '11784025953'
let page_pool = new Set([seed])

const upsertPage = function(response) {
    const res = Object.assign({}, response)
    res.facebook_id = res.id
    delete res.id
    return models.sequelize.sync()
        .then(() => {
            return models.Page.upsert(res)
                .catch(err => {
                    console.log('Failed to upsert page:\n', err)
                })
        })
        .then(() => {
            return response
        })
}

const fetchPage = function(id) {
    console.log(new Date(), id)
    return FB.napiAsync( id + '?fields=id,name,description,about,fan_count,category,website,likes.limit(1000){fan_count},engagement,talking_about_count')
        .catch(err => {
            console.log('FB napiAsync Failed ', id, err)
            if(_.get(err, 'error.code', null) === 'ENOTFOUND') {
                console.log('Trying again ', id)
                queue.push(id)
            }
        })
        .then(upsertPage)
        .then(res => {
            let likes = _.get(res, 'likes.data', [])
            likes.map(v => {
                if(v.fan_count >= min_fan_count && !page_pool.has(v.id)) {
                    page_pool.add(v.id)
                    queue.push(v.id)
                }
            })
        })
}

let queue = {
    push: function(args) { this.queue.push(args) },
    queue: [],
    start: function(delay, timeout, fn) {
        return new Promise(resolve=>{
            let idle_time = 0
            let count = 0
            let loop = setInterval(() => {
                if(idle_time >= timeout) {
                    console.log('bai')
                    clearInterval(loop)
                    return resolve()
                }
                if(this.queue.length > 0) {
                    const args = this.queue.shift()
                    console.log(new Date(), this.queue.length, ++count, 'Executing...', args)
                    fn(args)
                    idle_time = 0
                } else {
                    idle_time += delay
                }
            }, delay)
        })
    }
}

queue.start(20, 10000, fetchPage).then(() => {
    console.log('done')
})

getAccessToken(token)
.then(accessToken => {
    FB.setAccessToken(accessToken)
    return fetchPage(seed)
})
.catch(err => {
    console.log(err)
})
