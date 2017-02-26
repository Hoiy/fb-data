import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken, PromiseThrottleQueue } from './lib/fb-utils'
import models from './models'
import token from './token.json'
import { sprintf } from 'sprintf-js'
import _ from 'lodash'
import LanguageDetect from 'languagedetect'

promisifyAll(FB)
FB.options({version: 'v2.8'})

const lngDetector = new LanguageDetect()

let updateOnePostPromise = function(post) {
    post.language = _.get(lngDetector.detect(post.description, 1), '[0][0]',
        _.get(lngDetector.detect(post.about, 1), '[0][0]',
        _.get(lngDetector.detect(post.name, 1), '[0][0]', 'unknown'
    )))
    return post.save().then(() => {
        console.log('Updated', post.id, post.language)
    })
}

const queue = new PromiseThrottleQueue(updateOnePostPromise, 10)

models.Page.findAll({
    where: {
        language: {
            $eq: null
        }
    }
})
.then(posts => {
    for(let post of posts) {
        queue.push(post)
    }
})

queue.start()

/*
let stepPromise = new Promise((resolve, reject) => {
    updateOneRowPromise().then(success => {
        if(success)
            return stepPromise
        return resolve(false)
    })
    .catch(err => {
        return reject(err)
    })
})

Promise.resolve(stepPromise)
*/
