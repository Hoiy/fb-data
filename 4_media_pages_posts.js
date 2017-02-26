import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken, PromiseThrottleQueue } from './lib/fb-utils'
import models from './models'
import token from './token.json'
import { sprintf } from 'sprintf-js'
import _ from 'lodash'

promisifyAll(FB)
FB.options({version: 'v2.8'})

const query = '%s?fields=posts.limit(100){name,shares,comments.limit(0).summary(total_count),likes.limit(0).summary(total_count),reactions.type(%s).limit(0).summary(total_count),caption,message,description,status_type,type,link,full_picture,picture,source,created_time,updated_time}'
const reactions = ['HAHA', 'LOVE', 'WOW', 'SAD', 'ANGRY']
const reaction = reactions.indexOf('HAHA')

const findPages = models.Page.findAll({
    where: {
        language: {
            $eq: 'english'
        },
        $or: [
            {category: {$eq: 'Media'}},
            {category: {$eq: 'Media/News Company'}},
            {category: {$eq: 'News/Media Website'}},
            {category: {$eq: 'Broadcasting & Media Production Company'}},
            {category: {$eq: 'Newspaper'}},
            {category: {$eq: 'Newsagent / Newsstand'}},
            {category: {$eq: 'Media/News Company'}},
        ]
    }
})
.then(pages => {
    console.log(pages.length)
    for(let page of pages) {
        queue.push(page)
    }
})

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

const fetchPagePromise = function(page) {
    const q = sprintf(query, page.facebook_id, reactions[reaction])
    return FB.napiAsync(q)
        .catch(err => {
            console.log('Failed to make FB API call: ', q, err)
        })
        .then(res => {
            console.log(new Date(), sprintf('Made FB API call on Page %s', page.name))
            return res
        })
        .then(upsertPosts(page.id))
}

const queue = new PromiseThrottleQueue(fetchPagePromise, 1000)

Promise.all([findPages, getAccessToken(token)])
    .then((values)=>{
        FB.setAccessToken(values[1])
        queue.start()
    })
