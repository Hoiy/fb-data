import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken, PromiseThrottleQueue } from './lib/fb-utils'
import token from './token.json'
import _ from 'lodash'
import { sprintf } from 'sprintf-js'
import BigQuery from '@google-cloud/bigquery'
import config from './config.json'
import moment from 'moment'

promisifyAll(FB)
FB.options({version: 'v2.8'})
const bigquery = BigQuery(config)
const dataset = bigquery.dataset('facebook')
const pages_table = dataset.table('pages')
const posts_table = dataset.table('posts')

let min_fan_count = process.argv[5] ? process.argv[5] : 200000
let seed = process.argv[4] ? process.argv[4] : '11784025953'
let page_pool = new Set([seed])

const reactions = ['NONE', 'HAHA', 'LOVE', 'WOW', 'SAD', 'ANGRY']
const reaction = reactions.indexOf('NONE')
const query = '%s?fields=id,name,description,about,fan_count,category,website,likes.limit(1000){fan_count},talking_about_count,posts.limit(100){name,shares,comments.limit(0).summary(total_count),likes.limit(0).summary(total_count),reactions.type(%s).limit(0).summary(total_count),caption,message,description,status_type,type,link,full_picture,picture,source,created_time,updated_time}'

const createPromiseUpsertPage = function(page) {
    return pages_table.insert(page)
        .then(() => {
            console.log('Inserted page: ', page.name)
        })
        .catch(err => console.log(err))
}

const createPromiseUpsertPosts = function(posts) {
    posts = posts.map(v => {
        const p = Object.assign(v, {
            share: _.get(v, 'shares.count', 0),
            comment: _.get(v, 'comments.summary.total_count', 0),
            like: _.get(v, 'likes.summary.total_count', 0),
            reaction: reaction == reactions.indexOf('NONE') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            love: reaction == reactions.indexOf('LOVE') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            haha: reaction == reactions.indexOf('HAHA') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            wow: reaction == reactions.indexOf('WOW') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            sad: reaction == reactions.indexOf('SAD') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            angry: reaction == reactions.indexOf('ANGRY') ? _.get(v, 'reactions.summary.total_count', 0) : null,
            created_time: moment(v.created_time).utc().format('YYYY-MM-DD HH:mm:ss'),
            updated_time: moment(v.updated_time).utc().format('YYYY-MM-DD HH:mm:ss'),
        })
        delete p.shares
        delete p.comments
        delete p.likes
        delete p.reactions
        return p
    })
    return posts_table.insert(posts)
    .then(() => {
        console.log(`Inserted ${posts.length} posts.`)
    })
    .catch(err => console.log(err.errors))
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
            const like_pages = _.get(res, 'likes.data', [])
            delete res.likes

            for( let page of like_pages ) {
                if(page.fan_count >= min_fan_count && !page_pool.has(page.id)) {
                    page_pool.add(page.id)
                    queue.push(page.id)
                }
            }

            const posts = _.get(res, 'posts.data', [])
            delete res.posts

            return [res, posts]
        })
        .then(([page, posts]) => {
            createPromiseUpsertPage(page)
            for(let post of posts) {
                post.page_id = page.id
            }
            createPromiseUpsertPosts(posts)
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
