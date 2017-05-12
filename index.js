const Strategy = require('passport-http').DigestStrategy
const passport = require('passport')
const express = require('express')
const app = express()
const ytdl = require('ytdl-core')
const db = require('./users.js');

const port = 7070

function logger(req, res, next) {
    console.log(`${req.ip} - - [${Date()}] "${req.method} ${req.originalUrl}" - "${req.get('User-Agent')}"`)
    next()
}

app.use(logger)

passport.use(new Strategy({ qop: 'auth' },
    function (username, cb) {
        db.findByUsername(username, function (err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false); }
            return cb(null, user, user.password);
        })
    }
))
// ==============================================
// ==============================================
app.get('/', passport.authenticate('digest', { session: false }), (req, res) => {
    res.sendFile('/page/index.html', { root: __dirname })
})
// ==============================================
app.get('/info', passport.authenticate('digest', { session: false }), (req, res) => {
    ytdl.getInfo(req.query.videoid).then(data => {
        res.setHeader('Content-Type', 'application/json')
        res.send({
            'title': data.title,
            'thumbnail': data.iurlmaxres,
            'length_seconds': data.length_seconds
        })
    })
})
// ==============================================
app.get('/download', passport.authenticate('digest', { session: false }), (req, res) => {
    // let m = ytdl(req.query.videoid, { quality: 'highest', filter: 'audioonly' })
    // res.charset = 'utf-8'
    if (req.query.title === undefined) return res.send('....')
    console.log(req.query.title)
    res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent(req.query.title) + ".webm")
    ytdl(req.query.videoid, { quality: 'highest', filter: 'audioonly' }).pipe(res)
    // let obj = ytdl(req.query.videoid, { quality: 'highest', filter: 'audioonly' })
    // // res.send(obj)
    // // obj.pipe(res)
    // let re = empty;
    // obj.on('data', function (data) {
    //     // res.write(data);
    //     re += data
    // })

    // obj.on('end', function () {
    //     res.send(re)
    //     res.end()
    // })
})
// ==============================================
/*
app.get('/download-info', (req, res) => {
        //res.sendFile('/page/index.html', { root : __dirname })
    ytdl.getInfo('https://www.youtube.com/watch?v=Cbc754jcjnE').then(data => {
        res.setHeader('Content-Type', 'application/json')
        // let m = ytdl.filterFormats(data.formats, 'audioonly')
        let link = ytdl.chooseFormat(data.formats, {filter: 'audioonly'})
        res.send(link.url)
    })
})
*/
// ==============================================
// ==============================================
// ==============================================
app.listen(port, () => {
    console.log('Listening on port ', port)
})
// ==============================================
