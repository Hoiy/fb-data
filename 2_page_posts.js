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
const query = '%s?fields=posts.limit(100){name,shares,comments.limit(0).summary(total_count),likes.limit(0).summary(total_count),reactions.type(%s).limit(0).summary(total_count),caption,message,description,status_type,type,link,full_picture,picture,source,created_time,updated_time}'

const getPagesId = models.sequelize.query('SELECT id, facebook_id FROM Pages LIMIT 3', { type: models.sequelize.QueryTypes.SELECT })

const upsertPosts = pageId => {
    return response => {
        let post_count = 0
        let chain = models.sequelize.sync()
        for (let post of response.posts.data) {
            const p = Object.assign({}, post, {
                page_id: pageId,
                facebook_id: post.id,
                name: post.name,
                share: _.get(post, 'shares.count', 0),
                comment: post.comments.summary.total_count,
                like: post.likes.summary.total_count,
                love: null,
                haha: post.reactions.summary.total_count,
                wow: null,
                sad: null,
                angry: null,
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
    return () => {
        const q = sprintf(query, facebookId, reactions[0])
        return FB.napiAsync(q)
            .then(res => {
                console.log(new Date(), 'Made FB API call on Page %s', pageId)
                return res
            })
            .then(upsertPosts(pageId))
            .catch(err => {
                console.log('Failed to make FB API call: ', q, err)
            })
    }
}

Promise.all([getPagesId, getAccessToken(token)])
.then(values=>{
    FB.setAccessToken(values[1])
    return values[0]
})
.then(pageIds => {
    let fetchAllPages = Promise.resolve()
    for (let { id, facebook_id } of pageIds.values()) {
        fetchAllPages = fetchAllPages.then(fetchPagePosts(id, facebook_id))
    }
    return fetchAllPages
})
.catch(err => {
    console.log(err)
})
