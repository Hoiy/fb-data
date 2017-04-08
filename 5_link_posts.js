import { PromiseThrottleQueue } from './lib/fb-utils'
import phantom from 'phantom'
import cheerio from 'cheerio'
import htmlToText from 'html-to-text'
import posts from './data/good_eng_link_posts_link_100k.json'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'

let fetchLink = async (id, link) => {
    const instance = await phantom.create([
        //'--ignore-ssl-errors=yes',
        //'--load-images=no',
        //'--ssl-protocol=any',
        //'--web-security=no',
        '--cookies-file=/tmp/phantom/cookies.txt'
        //'--disk-cache=yes',
        //'--disk-cache-path=/tmp/phantom/disk-cache'
    ], {
        logLevel: 'error'
    });
    const page = await instance.createPage();
    /*
    await page.property('onResourceError', function(e) {
        console.log('onResourceError', JSON.stringify(e));
    })
    */
    /*
    await page.property('onResourceTimeout', function(e) {
        console.log('onResourceTimeout', e);
    })
    */
    /*
    await page.property('onError', function(e) {
        console.log('onError', e);
    })
    */


    //await page.setting()
    const status = await page.open(link);
    console.log('Status: ', status);

    const content = await page.property('content');
    const $ = cheerio.load(content)

    $('script').remove()
    $('style').remove()
    $('link').remove()
    $('meta').remove()
    $('img').remove()
    $('noscript').remove()

    let $content = $('body')
    let len = 0
    $('body *:not(:has(*))').each(function() {
        const $this = $(this)
        const l = computeTokenLength($this.text())
        if(l > len) {
            len = l
            $content = $this
        }
    });

    //console.log(len);
    //console.log($content.parent().html());

    let text = htmlToText.fromString($content.parent().html(), {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage: true
    });

    text = _.filter(text.split('\n'), v => v.trim().length > 0).join('\n');
    console.log(text);

    fs.writeFile(getPath(id),
        text,
        function(err) {
            if(err) {
                return console.log(err);
            }
        }
    );

    await instance.exit()
}

function getPath(id) {
    return path.join(process.cwd(), `./link_posts_corpus/${id}.txt`)
}

function computeTokenLength(text) {
    return _.filter(text.split(' '), v => v.trim().length > 0).length
}

(async function() {
    for (const post of posts) {
        if (fs.existsSync(getPath(post.id))) {
            continue;
        }
        console.log(post.id, post.link);
        await fetchLink(post.id, post.link)
    }
}())
