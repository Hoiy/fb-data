import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken } from './lib/fb-utils'
import models from './models'
import token from './token.json'
import { sprintf } from 'sprintf-js'
import _ from 'lodash'

promisifyAll(FB)
FB.options({version: 'v2.8'})

console.log(process.argv)

const reactions = ['HAHA', 'LOVE', 'WOW', 'SAD', 'ANGRY']
const reaction = reactions.indexOf('WOW')
const query = '%s?fields=posts.limit(100){name,shares,comments.limit(0).summary(total_count),likes.limit(0).summary(total_count),reactions.type(%s).limit(0).summary(total_count),caption,message,description,status_type,type,link,full_picture,picture,source,created_time,updated_time}'

const getPagesId = models.sequelize.query('SELECT id, facebook_id FROM Pages', { type: models.sequelize.QueryTypes.SELECT })

const batch = 25

const upsertPosts = pageId => {
    return response => {
        let post_count = 0
        let chain = models.sequelize.sync()
        for (let post of _.get(response, 'posts.data', [])) {
            const p = Object.assign({}, post, {
                page_id: pageId,
                facebook_id: post.id,
                name: post.name,
                share: _.get(post, 'shares.count', 0),
                comment: _.get(post, 'comments.summary.total_count', 0),
                like: post.likes.summary.total_count,
                love: reaction == reactions.indexOf('LOVE') ? post.reactions.summary.total_count : null,
                haha: reaction == reactions.indexOf('HAHA') ? post.reactions.summary.total_count : null,
                wow: reaction == reactions.indexOf('WOW') ? post.reactions.summary.total_count : null,
                sad: reaction == reactions.indexOf('SAD') ? post.reactions.summary.total_count : null,
                angry: reaction == reactions.indexOf('ANGRY') ? post.reactions.summary.total_count : null,
            })
            delete p.id
            chain = chain.then(() => {
                return models.Post.upsert(p)
                    .then(() => {
                        post_count ++
                    })
                    .catch(err => {
                        console.log('Failed to upsert post:\n', err)
                    })
            })
        }
        return chain.then(() => {
            console.log(new Date(), sprintf('Inserted %d posts for Page %s', post_count, pageId))
        })
        .catch(err => {
            console.log(err)
        })
    }
}

const fetchPagePosts = function(pageId, facebookId) {
    const q = sprintf(query, facebookId, reactions[reaction])
    return FB.napiAsync(q)
        .catch(err => {
            console.log('Failed to make FB API call: ', q, err)
        })
        .then(res => {
            console.log(new Date(), sprintf('Made FB API call on Page %s', facebookId))
            return res
        })
        .then(upsertPosts(pageId))
}

Promise.all([getPagesId, getAccessToken(token)])
.then(values=>{
    FB.setAccessToken(values[1])
    return values[0]
})
.then(pageIds => {
    let batch_pageIds = _.chunk(pageIds, batch)
    let promise = Promise.resolve()
    for (let b of batch_pageIds) {
        promise = promise.then(() => Promise.all(_.map(b, (v) => fetchPagePosts(v.id, v.facebook_id))))
    }
    return promise
})
.catch(err => {
    console.log(err)
})
