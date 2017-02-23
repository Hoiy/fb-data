import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken } from './lib/fb-utils'
import models from './models'
import token from './token.json'
promisifyAll(FB)

console.log(process.argv)

FB.options({version: 'v2.8'})

let min_fan_count = process.argv[5] ? process.argv[5] : 1000000
let seed = process.argv[4] ? process.argv[4] : '11784025953'
let page_pool = new Set([seed])

const upsertPage = function(response) {
    const res = Object.assign({}, response)
    res.page_id = res.id
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
    return FB.napiAsync( id + '?fields=id,name,description,about,fan_count,category,website,likes.limit(1000){fan_count},engagement,talking_about_count')
        .then(upsertPage)
        .then(res => {
            res.likes.data.map(v => {
                if(v.fan_count >= min_fan_count && !page_pool.has(v.id)) {
                    page_pool.add(v.id)
                    fetchPage(v.id)
                }
            })
        })
}

getAccessToken(token)
.then(accessToken => {
    FB.setAccessToken(accessToken)
    return fetchPage(seed)
})
.catch(err => {
    console.log(err)
})
