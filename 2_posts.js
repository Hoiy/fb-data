import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken, PromiseThrottleQueue } from './lib/fb-utils'
import token from './token.json'
import _ from 'lodash'
import { sprintf } from 'sprintf-js'
import BigQuery from '@google-cloud/bigquery'
import config from './config.json'
import moment from 'moment'
import pages from './en_pages.json'

promisifyAll(FB)
FB.options({version: 'v2.8'})
const bigquery = BigQuery(config)
const dataset = bigquery.dataset('en_facebook')
const posts_table = dataset.table('posts')

const reactions = ['NONE', 'HAHA', 'LOVE', 'WOW', 'SAD', 'ANGRY']
const reaction = reactions.indexOf('NONE')
const query = '%s/posts?limit=100&fields=name,shares,comments.limit(0).summary(total_count),likes.limit(0).summary(total_count),reactions.type(%s).limit(0).summary(total_count),caption,message,description,status_type,type,link,full_picture,picture,source,created_time,updated_time'

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
    .catch(err => console.log('Error inserting posts!', err))
}

const createPromiseFBQuery = function(params) {
    console.log(new Date, params.facebook_id, params.query)
    return FB.napiAsync(params.query)
        .catch(err => {
            queue.push({
                facebook_id: params.facebook_id,
                query: params.query
            })
            return Promise.reject(err)
        })
        .then(res => {
            let next = _.get(res, 'paging.next', null)
            next = next ? next.replace('https://graph.facebook.com/v2.8/', '') : null
            let posts = _.get(res, 'data', [])
            return [next, posts]
        })
        .then(([next, posts]) => {
            for(let post of posts) {
                post.page_id = params.facebook_id
            }
            createPromiseUpsertPosts(posts)
            queue.push({
                facebook_id: params.facebook_id,
                query: next
            })
        })
        .catch(err => {
            console.log('Error on FB Query!', err)
        })
}

const queue = new PromiseThrottleQueue(createPromiseFBQuery, 125, 60000)

getAccessToken(token)
.then(accessToken => {
    FB.setAccessToken(accessToken)
    let facebook_id = pages.pop()
    queue.push({
        facebook_id,
        query: sprintf(query, facebook_id, reactions[reaction])
    })
    return queue.start()
})
.catch(err => {
    console.log('Error in main loop!', err)
})
