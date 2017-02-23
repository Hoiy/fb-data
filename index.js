import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken } from './lib/fb-utils'
import models from './models'
import token from './token.json'
promisifyAll(FB)

getAccessToken(token)
.then(accessToken => {
    FB.setAccessToken(accessToken)
    return FB.napiAsync('disney?fields=id,name,description,about,category,website,fan_count,talking_about_count,likes')
        .then(res => {
            console.log(res)
            return res
        })
})
.then(res => {
    res.page_id = res.id
    delete res.id
    return models.sequelize.sync()
        .then(() => {
            models.Page.create(res)
            return res
        })
})
.then(res => {
    console.log(res.likes)
})
.catch(err => {
    console.log(err)
})
