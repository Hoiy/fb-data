import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken, PromiseThrottleQueue } from './lib/fb-utils'
import models from './models'
import token from './token.json'
import _ from 'lodash'
import { sprintf } from 'sprintf-js'

promisifyAll(FB)
FB.options({version: 'v2.8'})

console.log(process.argv)

let min_fan_count = process.argv[5] ? process.argv[5] : 200000
let seed = process.argv[4] ? process.argv[4] : '11784025953'
let page_pool = new Set([seed])

const reactions = ['HAHA', 'LOVE', 'WOW', 'SAD', 'ANGRY']
const reaction = reactions.indexOf('LOVE')
const query = '%s?fields=id,name,description,about,fan_count,category,website,likes.limit(1000){fan_count},engagement,talking_about_count,posts.limit(100){name,shares,comments.limit(0).summary(total_count),likes.limit(0).summary(total_count),reactions.type(%s).limit(0).summary(total_count),caption,message,description,status_type,type,link,full_picture,picture,source,created_time,updated_time}'

const createPromiseUpsertPage = function(response) {
    const page = Object.assign({}, response)
    page.facebook_id = page.id
    delete page.id

    return models.Page.upsert(page)
        .then(() => {
            //console.log(sprintf('Upserted Page %s', page.name));
            return models.Page.findOne({
                where: {
                    facebook_id: {
                        $eq: page.facebook_id
                    }
                }
            })
            .then(p => {
                response.page_id = p.id
                return response
            })
        })
}

const createPromiseUpsertPosts = function(response) {
    let posts = _.get(response, 'posts.data', [])
    posts = posts.map((v) => {
        const p = Object.assign({}, v, {
            page_id: response.page_id,
            facebook_id: v.id,
            share: _.get(v, 'shares.count', 0),
            comment: _.get(v, 'comments.summary.total_count', 0),
            like: _.get(v, 'likes.summary.total_count', 0),
            love: reaction == reactions.indexOf('LOVE') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            //haha: reaction == reactions.indexOf('HAHA') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            //wow: reaction == reactions.indexOf('WOW') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            //sad: reaction == reactions.indexOf('SAD') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            //angry: reaction == reactions.indexOf('ANGRY') ? _.get(v, 'reactions.summary.total_count', 0) : null
        })
        delete p.id
        return p
    })
    return models.Post.bulkCreate(posts, {
        updateOnDuplicate: [
            'name',
            'share',
            'comment',
            'like',
            'love',
            'haha',
            'wow',
            'sad',
            'angry',
            'caption',
            'message',
            'description',
            'status_type',
            'type',
            'link',
            'full_picture',
            'picture',
            'source'
        ]
    })
    .then(() => [
        console.log(sprintf('Upserted %d posts from %s', posts.length, response.name))
    ])
}

const createPromiseFBQuery = function(facebook_id) {
    console.log(new Date(), facebook_id)
    return FB.napiAsync(sprintf(query, facebook_id, reactions[reaction]) )
        .catch(err => {
            queue.push(facebook_id)
            return Promise.reject(err)
        })
}

const createPromiseProcessPage = function(facebook_id) {
    return createPromiseFBQuery(facebook_id)
        .then(res => {
            // queue liked page
            let like_pages = _.get(res, 'likes.data', [])
            for( let page of like_pages ) {
                if(page.fan_count >= min_fan_count && !page_pool.has(page.id)) {
                    page_pool.add(page.id)
                    queue.push(page.id)
                }
            }
            return res
        })
        .then(res => {
            return createPromiseUpsertPage(res)
        })
        .then(res => {
            return createPromiseUpsertPosts(res)
        })
        .catch(err => {
            console.log(err)
        })
}

const queue = new PromiseThrottleQueue(createPromiseProcessPage, 125, 60000)

getAccessToken(token)
.then(accessToken => {
    FB.setAccessToken(accessToken)
    queue.push(seed)
    return queue.start()
})
.catch(err => {
    console.log(err)
})
