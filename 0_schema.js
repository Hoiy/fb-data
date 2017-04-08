import promisifyAll from 'es6-promisify-all'
import FB from 'fb'
import BigQuery from '@google-cloud/bigquery'
import config from './config.json'
import bsg from 'bigquery-schema-generator'

promisifyAll(FB)
FB.options({version: 'v2.8'})
const bigquery = BigQuery(config)
const dataset = bigquery.dataset('en_facebook')
//const pages_table = dataset.table('pages')
//const posts_table = dataset.table('posts')
/*
let schema = bsg({ name: 'Auli\'i Cravalho as Moana | Untold',
  message: 'Lights, camera, splashin\'! Hear how Auli\'i Cravalho made waves as Moana. 🌊',
  status_type: 'added_video',
  type: 'video',
  link: 'https://www.facebook.com/Disney/videos/10154423106105954/',
  full_picture: 'https://scontent.xx.fbcdn.net/v/t15.0-10/s720x720/17199474_10154423111340954_2308950645685616640_n.jpg?oh=d981f5ec3aaa1288856ebe4e699514ad&oe=593103BD',
  picture: 'https://scontent.xx.fbcdn.net/v/t15.0-10/s130x130/17199474_10154423111340954_2308950645685616640_n.jpg?oh=64502a62b1c40634ac8a8f96ad7b88d0&oe=596D8E4F',
  source: 'https://video.xx.fbcdn.net/v/t42.1790-2/17181276_108864669645545_5934261230897201152_n.mp4?efg=eyJybHIiOjM2MywicmxhIjo1MTIsInZlbmNvZGVfdGFnIjoic3ZlX3NkIn0%3D&rl=363&vabr=202&oh=567edaf58326bfd4ea491471607a29e8&oe=58C364B1',
  created_time: '2017-03-09T15:00:00+0000',
  updated_time: '2017-03-09T16:06:15+0000',
  id: '11784025953_10154423106105954',
  page_id: '11784025953',
  share: 47,
  comment: 15,
  like: 572,
  reaction: 659,
  love: null,
  haha: null,
  wow: null,
  sad: null,
  angry: null })
  console.log(schema);
*/

/*
const pages_opt = {
    schema: [
        {
            name: 'name',
            type: 'STRING',
            mode: 'NULLABLE'
        },
        {
            name: 'description',
            type: 'STRING',
            mode: 'NULLABLE'
        },
        {
            name: 'about',
            type: 'STRING',
            mode: 'NULLABLE'
        },
        {
            name: 'fan_count',
            type: 'INTEGER',
            mode: 'NULLABLE'
        },
        {
            name: 'category',
            type: 'STRING',
            mode: 'NULLABLE'
        },
        {
            name: 'website',
            type: 'STRING',
            mode: 'NULLABLE'
        },
        {
            name: 'talking_about_count',
            type: 'INTEGER',
            mode: 'NULLABLE'
        },
        {
            name: 'id',
            type: 'INTEGER',
            mode: 'NULLABLE'
        }
    ]
}

dataset.table('pages').delete()
.then(() =>
dataset.createTable('pages', pages_opt)
    .then((results) => {
        const table = results[0]
        console.log(`Table ${table.id} created.`)
        return table
    })
    .catch(err => {
        console.log(err)
    })
)
*/


/*
const posts_opt = {
    schema: [ { name: 'name', type: 'STRING', mode: 'NULLABLE' },
  { name: 'caption', type: 'STRING', mode: 'NULLABLE' },
  { name: 'message', type: 'STRING', mode: 'NULLABLE' },
  { name: 'description', type: 'STRING', mode: 'NULLABLE' },
  { name: 'status_type', type: 'STRING', mode: 'NULLABLE' },
  { name: 'type', type: 'STRING', mode: 'NULLABLE' },
  { name: 'link', type: 'STRING', mode: 'NULLABLE' },
  { name: 'full_picture', type: 'STRING', mode: 'NULLABLE' },
  { name: 'picture', type: 'STRING', mode: 'NULLABLE' },
  { name: 'source', type: 'STRING', mode: 'NULLABLE' },
  { name: 'created_time', type: 'TIMESTAMP', mode: 'NULLABLE' },
  { name: 'updated_time', type: 'DATETIME', mode: 'NULLABLE' },
  { name: 'id', type: 'STRING', mode: 'NULLABLE' },
  { name: 'page_id', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'share', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'comment', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'like', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'reaction', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'love', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'haha', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'wow', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'sad', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'angry', type: 'INTEGER', mode: 'NULLABLE' } ]
}

dataset.table('posts').delete().then(() =>
dataset.createTable('posts', posts_opt)
    .then((results) => {
        const table = results[0]
        console.log(`Table ${table.id} created.`)
        return table
    })
    .catch(err => {
        console.log(err)
    })
)
*/

const posts_corpus_opt = {
    schema: [ { name: 'id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'corpus', type: 'STRING', mode: 'NULLABLE' }]
}

dataset.table('posts_corpus').delete().then(() =>
dataset.createTable('posts_corpus', posts_corpus_opt)
    .then((results) => {
        const table = results[0]
        console.log(`Table ${table.id} created.`)
        return table
    })
    .catch(err => {
        console.log(err)
    })
)
