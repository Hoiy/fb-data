import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import { getAccessToken } from './lib/fb-utils'
import token from './token.json'
promisifyAll(FB)

getAccessToken(token)
.then(accessToken => {
    FB.setAccessToken(accessToken)
    return FB.napiAsync('disney?fields=about,category,likes,engagement,fan_count,description,name,website')
        .then(res => {
            console.log(res)
            return res
        })
})
.catch((err) => {
    console.log(err)
})
