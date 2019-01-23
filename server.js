/* eslint react/prop-types: 0 */
let sql = null
require('./config/sql')((sqql) => {
  sql = sqql
})
const express = require('express')
const bodyParser = require('body-parser')
const ent = require('ent')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const each = require('foreach')
const fs = require('fs')
const path = require('path')
const fileUpload = require('express-fileupload')
let date = require('date-and-time')
const fetch = require('node-fetch')
let faker = require('faker/locale/fr')
let DateDiff = require('date-diff')
let https = require('https')
const app = express()
const serverPort = process.env.PORT || 5000
let options = {
  key: fs.readFileSync('./file.pem'),
  cert: fs.readFileSync('./file.crt')
}
let server = https.createServer(options, app)
server.listen(serverPort, function () {
  console.log('server up and running at %s port', serverPort)
})
// let server = app.listen(port, () => { console.log('Listening on port ' + port) })
let io = require('socket.io')(server, {pingTimeout: 5000, pingInterval: 10000, transports: ['polling']})
let retour
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(fileUpload())
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use(bodyParser.json({limit: '10Mb'}))
  .use(bodyParser.urlencoded({ extended: false }))
let tabC = []
let online = {}
let updateComplete = null
io.on('connection', (socket) => {
  socket.on('disconnect', () => console.log('Client disconnected'))
  socket.on('error', (error) => {
    throw error
  })
  socket.on('disconnect', (disc) => {
    console.log(disc)
  })
  socket.removeAllListeners()
  socket.on('/jepars', (data) => {
    online[data] = false
    let dateDeco = new Date()
    sql.query('UPDATE users SET discoDate = ? WHERE login = ?', [dateDeco, data], (error, fields) => {
      if (error) throw error
    })
    ping()
  })
  socket.on('openMess', (data) => {
    io.emit('openDropMess/' + data)
  })
  updateComplete = (login) => {
    io.emit('updateComplete/' + login, login)
  }
  let ping = (e) => {
    sql.query("SELECT * FROM users WHERE `token` = 'VERIF'", (error, results, fields) => {
      if (error) throw error
      for (let i = 0; i < results.length; i++) {
        if (!online[results[i].login.toString()]) {
          online[results[i].login.toString()] = false
        }
      }
      for (let i = 0; i < results.length; i++) {
        const current = results[i].login.toString()
        let id = results[i].id
        sql.query('SELECT * FROM matchs WHERE idMe = ? AND state = 2', [id], (error, results2, fields) => {
          if (error) throw error
          else if (results2.length > 0) {
            let thisOnline = {}
            for (let j = 0; j < results2.length; j++) {
              let uid = results2[j].uid
              let room = results2[j].room
              sql.query('SELECT * FROM users WHERE id = ?', [uid], (error, results3, fields) => {
                if (error) throw error
                else if (results3.length > 0) {
                  let uLogin = results3[0].login.toString()
                  thisOnline[uLogin] = {}
                  thisOnline[uLogin]['state'] = online[uLogin]
                  thisOnline[uLogin]['room'] = room
                  sql.query("SELECT * FROM conversations WHERE emitter = ? AND room = ? AND state = '0'", [uid, room], (er, res4, fields) => {
                    thisOnline[uLogin]['badge'] = res4.length
                    if (j === results2.length - 1) {
                      io.emit('SendState/' + current, thisOnline)
                    }
                  })
                }
              })
            }
          }
        })
      }
    })
  }
  let notif = (e) => {
    if (online[e.login_user] === true) {
      each(tabC, function (value, key, object) {
        if (tabC[key]['idTab'] === parseInt(e.id_user, 10)) {
          sql.query('SELECT liked, visit, message, matched, matchNot FROM notifs WHERE uid = ?', [e.id_user], (error, results, fields) => {
            if (error) throw error
            let notifNew = results[0].liked + results[0].visit + results[0].message + results[0].matched + results[0].matchNot
            if (tabC[key]['notifs'] < notifNew) {
              if (tabC[key]['notifsLiked'] < results[0].liked) {
                results[1] = 'You have a new like!'
                tabC[key]['notifsLiked'] = results[0].liked
              } else tabC[key]['notifsLiked'] = results[0].liked
              if (tabC[key]['notifsVisit'] < results[0].visit) {
                results[1] = 'You received a new visit!'
                tabC[key]['notifsVisit'] = results[0].visit
              } else tabC[key]['notifsVisit'] = results[0].visit
              if (tabC[key]['notifsMatched'] < results[0].matched) {
                results[1] = 'You have a new match !'
                tabC[key]['notifsMatched'] = results[0].matched
              } else tabC[key]['notifsMatched'] = results[0].matchNot
              if (tabC[key]['notifsMatchNot'] < results[0].matchNot) {
                results[1] = "A user doesn't like you anymore!"
                tabC[key]['notifsMatchNot'] = results[0].matchNot
              } else tabC[key]['notifsMatchNot'] = results[0].matchNot
              tabC[key]['notifs'] = notifNew
              let notifs = tabC[key]['notifs']
              io.emit('SendNotifs/' + e.login_user, { results, notifs })
            } else notifs = notifNew
          })
        }
      })
    }
  }
  // Gere toutes les connexion a socket
  socket.on('setState/online', (data) => {
    checkCompletion(data)
    io.emit('imOnline', data)
    online[data] = true
    ping()
  })

  // socker.on gere quelle connexion on utilise (comme un .post)
  socket.on('conv', (room) => {
    // .join permet de mettre une personne dans une room particuliere
    socket.join(room)
  })
  socket.on('ReadMessage', (data) => {
    let login = data['name']
    let logMe = data['login']
    if (data['uid']) {
    } else {
      sql.query('SELECT id FROM users WHERE login = ?', [login], (err, res, fields) => {
        if (err) throw err
        else {
          let id = data['id']
          let uid = res[0].id
          sql.query("SELECT * FROM conversations WHERE state = '0' AND room = ?", [id, uid], (err, result) => {
            if (err) throw err
            sql.query('UPDATE conversations SET state = 1 WHERE room = ? AND emitter = ?', [id, uid], (err, res) => {
              if (err) throw err
              else {
                let nbLines = result.length
                sql.query('UPDATE notifs SET message = IF(message > 0, message - ?, message) WHERE uid = (SELECT id FROM users WHERE login = ?)', [nbLines, logMe], (err) => {
                  if (err) throw err
                })
                ping()
              }
            })
          })
        }
      })
    }
  })

  socket.on('SendNewNotif', data => {
    notif(data)
  })
  socket.on('SEND_MESSAGE', (data) => {
    let message = ent.encode(data.mess)
    let room = ent.encode(data.room)
    let emitter = ent.encode(data.login)
    sql.query('SELECT * FROM users WHERE login = ?', [emitter], (error, results, fields) => {
      if (error) throw error
      else {
        let id = results[0].id
        sql.query("INSERT INTO conversations (room, emitter, message, state) VALUES (?, ?, ?, '0')", [room, id, message], (error) => {
          if (error) throw error
          else {
            let state = '0'
            message = ent.decode(message)
            io.to(room).emit('RECEIVE_MESSAGE', {room, message, emitter, state})
            sql.query('SELECT uid FROM conversations, matchs WHERE conversations.room = matchs.room AND emitter = idMe AND conversations.room = ? AND idMe = ?', [room, id], (error, results) => {
              if (error) throw error
              let idUser = results[0].uid
              sql.query('UPDATE notifs SET message = message + 1 WHERE uid = ?', [idUser], (err, result) => {
                if (err) throw err
              })
            })
          }
        })
      }
    })
  })
})

/* Fonctions pour recuperer la distance entre 2 utilisateurs */
let calcDist = async (mLoc, uLoc) => {
  if (mLoc && uLoc) {
    const response = await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:' + mLoc + '&destinations=place_id:' + uLoc + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
    const body = await response.json()
    if (response.status !== 200) throw Error(body.message)
    return body
  } else return '?'
}
let createData = async (val1, val2) => {
  if (val1 && val2) {
    let dist = await calcDist(val1, val2)
    let distances = dist === '?' ? '?' : dist.rows[0].elements[0].distance.text.split(' ')[1] === 'm' ? '1' : dist.rows[0].elements[0].distance.text.split(' ')[0]
    let res = await new Promise((resolve, reject) => {
      Promise.resolve(distances).then((completed) => resolve(completed))
    })
    return res
  }
}
/* Recuperation de l'orientation, du genre */
let searchOr = (genre, or) => {
  if (or === 'hétéro') {
    if (genre === 'Man') return (' AND genre = "Woman" AND (orientation = "bi" OR orientation = "hétéro")')
    else return (' AND genre = "Man" AND (orientation = "bi" OR orientation = "hétéro")')
  } else if (or === 'homo') {
    if (genre === 'Man') return (' AND genre = "Man" AND (orientation = "bi" OR orientation = "homo")')
    else return (' AND genre = "Woman" AND (orientation = "bi" OR orientation = "homo")')
  } else if (or === 'bi') {
    if (genre === 'Man') return (' AND ((genre="Woman" AND (orientation = "bi" OR orientation = "hétéro") OR (genre="Man" AND (orientation = "bi" OR orientation = "homo"))))')
    else return (' AND ((genre="Man" AND (orientation = "bi" OR orientation = "hétéro") OR (genre="Woman" AND (orientation = "bi" OR orientation = "homo"))))')
  }
}

app.use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .get('/activation/:token', function (req, res) {
    let token = req.params.token
    let sqlreq = 'SELECT * FROM users WHERE `token` = ?'
    sql.query(sqlreq, [token], function (error, results, fields) {
      if (error) throw error
      if (results.length === 1) {
        sql.query('UPDATE users SET token = ? WHERE id = ?', ['VERIF', results[0].id], function (error, rows) {
          if (error) throw error
          res.send('VERIF')
          res.end()
        })
      } else res.end()
    })
  })
  .post('/create_user', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let pwdHash = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
    let login = ent.encode(req.body.login)
    let fname = ent.encode(req.body.fname)
    let lname = ent.encode(req.body.lname)
    let email = ent.encode(req.body.email)
    let birthdate = '2000-01-01'
    let date = new Date()
    let token = crypto.randomBytes(16).toString('hex')
    let sqlreq = 'SELECT * FROM users WHERE `login` = ? OR `mail` = ?'
    sql.query(sqlreq, [login, email], function (error, results, fields) {
      if (error) throw error
      if (results.length === 0) {
        sql.query('INSERT INTO users (login,genre, first_name,last_name,created_at,mail,password, birthdate, bio, token) VALUES (?,?,?,?,?,?,?,?,?,?)', [login, '1', fname, lname, date, email, pwdHash, birthdate, '', token], function (error, rows) {
          if (error) throw (error)
          sql.query('INSERT INTO profil_user (uid, popu) VALUES ((SELECT id FROM users WHERE `login` = ?), 0)', [login], function (error, rows) {
            if (error) throw (error)
            sql.query('INSERT INTO param_search (uid, ageMin, ageMax, popu, location, tags) VALUES ((SELECT id FROM users WHERE `login` = ?), 18, 30, 0, 1, "[]")', [login], function (error, rows) {
              if (error) throw (error)
              sql.query('INSERT INTO notifs (uid,liked,visit,message,matched,matchNot) VALUES ((SELECT id FROM users WHERE `login` = ?),0,0,0,0,0)', [login], function (error, rows) {
                if (error) throw (error)
              })
            })
            let transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'matcha42aboullon@gmail.com',
                pass: 'Matcha42!'
              }
            })
            let mail = {
              from: 'matchamail@gmail.com',
              to: email,
              subject: 'Confirmation de votre inscription',
              html: 'Hello ' + fname + ',<br><br>Welcome on matcha, to validate your inscription, please click on the link below.<br>' +
              'https://localhost:3000/activation/' + token + '<br><br>' +
              '------------------------------------------------------------<br><br>' +
              'This is an automatic mail, please do not answer!'
            }
            transporter.sendMail(mail, function (error, response) {
              if (error) {
                res.send('Error on sending mail! Please try again')
                res.end()
                sql.query('DELETE FROM `users` WHERE `login` = ?', [login], function (error, rows) {
                  if (error) throw (error)
                })
                sql.query('DELETE FROM `profil_user` WHERE `uid` = (SELECT id FROM users WHERE `login` = ?)', [login], function (error, rows) {
                  if (error) throw (error)
                })
                sql.query('DELETE FROM `param_search` WHERE `uid` = (SELECT id FROM users WHERE `login` = ?)', [login], function (error, rows) {
                  if (error) throw (error)
                })
                sql.query('DELETE FROM `notifs` WHERE `uid` = (SELECT id FROM users WHERE `login` = ?)', [login], function (error, rows) {
                  if (error) throw (error)
                })
                throw (error)
              } else {
                res.send('Account created! You will receive a confirmation mail')
                res.end()
              }
              transporter.close()
            })
          })
        })
      } else {
        res.send("Can't create account, login or email already used!")
        res.end()
      }
    })
  })
  .post('/user/connect', (req, res) => {
    retour = 'Pb'
    if (!req.body) return res.sendStatus(400)
    let pwdHash = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
    let login = ent.encode(req.body.login)
    let sqlreq = 'SELECT * FROM users WHERE `login` = ? AND `password` = ?'
    sql.query(sqlreq, [login, pwdHash], (error, results, fields) => {
      if (error) throw error
      if (results.length !== 0 && results[0].login && results[0].token === 'VERIF') {
        if (results[0].admin < 10) {
          retour = results[0]
        } else {
          retour = 'Reported'
        }
      }
      res.send(retour)
      res.end()
    })
  })
  .post('/user/connect/google', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let data = req.body.data
    let gId = data.googleId
    let login = faker.lorem.word() + faker.random.number()
    let pwdHash = crypto.randomBytes(16).toString('hex')
    let fname = data.profileObj.givenName
    let lname = data.profileObj.familyName
    let email = data.profileObj.email
    let profimg = data.profileObj.imageUrl
    let date = new Date()
    let birthdate = '2000-01-01'
    let token = 'VERIF'
    let retour = 'Reported'
    sql.query('SELECT * FROM users WHERE googleId = ? OR mail = ?', [gId, email], (err, result) => {
      if (err) throw err
      else if (result.length === 0) {
        sql.query('INSERT INTO users (login,genre, first_name,last_name,created_at,mail,password, birthdate, bio, token, profimg, googleId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [login, '1', fname, lname, date, email, pwdHash, birthdate, '', token, profimg, gId], (err, results) => {
          if (err) throw err
          else {
            sql.query('SELECT id FROM users WHERE googleId = ?', [gId], (err, result) => {
              if (err) throw err
              let uid = result[0].id
              sql.query('INSERT INTO image_user (uid, name) VALUES (?,?); SELECT id FROM image_user WHERE uid = ? AND name = ?', [uid, profimg, uid, profimg], (err, result) => {
                if (err) throw err
                else {
                  let imgId = result[1][0].id
                  sql.query('UPDATE users SET profimg = ? WHERE id = ?', [imgId, uid], (err, result) => {
                    if (err) throw err
                  })
                }
              })
            })
            sql.query('INSERT INTO profil_user (uid, popu) VALUES ((SELECT id FROM users WHERE `login` = ?), 0)', [login], function (error, rows) {
              if (error) throw (error)
              sql.query('INSERT INTO param_search (uid, ageMin, ageMax, popu, location, tags) VALUES ((SELECT id FROM users WHERE `login` = ?), 18, 30, 0, 1, "[]")', [login], function (error, rows) {
                if (error) throw (error)
                sql.query('INSERT INTO notifs (uid,liked,visit,message,matched,matchNot) VALUES ((SELECT id FROM users WHERE `login` = ?),0,0,0,0,0)', [login], function (error, rows) {
                  if (error) throw (error)
                })
              })
            })
            sql.query('SELECT * FROM users WHERE googleId = ? OR mail = ?', [gId, email], (err, result) => {
              if (err) throw err
              if (result[0].mail === email && result[0].googleId === gId) {
                res.send(result[0])
                res.end()
              }
            })
          }
        })
      } else if (result[0].mail === email && result[0].googleId === gId) {
        if (result[0].admin < 10) retour = result[0]
        else retour = 'Reported'
        res.send(retour)
        res.end()
      }
    })
  })
  .post('/user/connect/facebook', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let data = req.body.data
    let fId = data.userID
    let login = faker.lorem.word() + faker.random.number()
    let pwdHash = crypto.randomBytes(16).toString('hex')
    let fname = data.name.split(' ')[0]
    let lname = data.name.split(' ')[1]
    let email = data.email
    let profimg = data.picture.data.url
    let birthdate = '2000-01-01'
    let date = new Date()
    let token = 'VERIF'
    let retour = 'Reported'
    sql.query('SELECT * FROM users WHERE googleId = ? OR mail = ?', [fId, email], (err, result) => {
      if (err) throw err
      else if (result.length === 0) {
        sql.query('INSERT INTO users (login,genre, first_name,last_name,created_at,mail,password, birthdate, bio, token, profimg, googleId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [login, '1', fname, lname, date, email, pwdHash, birthdate, '', token, profimg, fId], (err, results) => {
          if (err) throw err
          else {
            sql.query('SELECT id FROM users WHERE googleId = ?', [fId], (err, result) => {
              if (err) throw err
              let uid = result[0].id
              sql.query('INSERT INTO image_user (uid, name) VALUES (?,?); SELECT id FROM image_user WHERE uid = ? AND name = ?', [uid, profimg, uid, profimg], (err, result) => {
                if (err) throw err
                else {
                  let imgId = result[1][0].id
                  sql.query('UPDATE users SET profimg = ? WHERE id = ?', [imgId, uid], (err, result) => {
                    if (err) throw err
                  })
                }
              })
            })
            sql.query('INSERT INTO profil_user (uid, popu) VALUES ((SELECT id FROM users WHERE `login` = ?), 0)', [login], function (error, rows) {
              if (error) throw (error)
              sql.query('INSERT INTO param_search (uid, ageMin, ageMax, popu, location, tags) VALUES ((SELECT id FROM users WHERE `login` = ?), 18, 30, 0, 1, "[]")', [login], function (error, rows) {
                if (error) throw (error)
                sql.query('INSERT INTO notifs (uid,liked,visit,message,matched,matchNot) VALUES ((SELECT id FROM users WHERE `login` = ?),0,0,0,0,0)', [login], function (error, rows) {
                  if (error) throw (error)
                })
              })
            })
            sql.query('SELECT * FROM users WHERE googleId = ? OR mail = ?', [fId, email], (err, result) => {
              if (err) throw err
              if (result[0].mail === email && result[0].googleId === fId) {
                res.send(result[0])
                res.end()
              }
            })

          }
        })
      } else if (result[0].mail === email && result[0].googleId === fId) {
        if (result[0].admin < 10) retour = result[0]
        else retour = 'Reported'
        res.send(retour)
        res.end()
      }
    })
  })
  .post('/forgot', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    let email = ent.encode(req.body.mail)
    let token = crypto.randomBytes(16).toString('hex')
    let sqlreq = 'SELECT * FROM users WHERE `login` = ? AND `mail` = ?'
    sql.query(sqlreq, [login, email], function (error, results, fields) {
      if (error) throw error
      if (results.length === 1) {
        sql.query('UPDATE users SET token = ? WHERE id= ?', [token, results[0].id], function (error, rows) {
          if (error) throw error
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'matcha42aboullon@gmail.com',
              pass: 'Matcha42!'
            }
          })
          let mail = {
            from: 'matcha42aboullon@gmail.com',
            to: email,
            subject: 'You forgot your password!',
            html: 'Hello ' + login + ',<br><br>Please, click on the link behind to configure a new password.<br>' +
            'https://localhost:3000/forgot/' + token + '<br><br>' +
            '------------------------------------------------------------<br><br>' +
            'This is an automatic mail, please do not answer!'
          }
          transporter.sendMail(mail, function (error, response) {
            if (error) {
              res.send("Error on sending mail! Please try again")
              res.end()
            } else {
              res.send('A mail has been sent with instructions to set a new password')
              res.end()
            }
            transporter.close()
          })
          sql.query('INSERT INTO profil_user (uid,popu) VALUES((SELECT id FROM users WHERE login = ?),0)', [login], function (error, rows) {
            if (error) {
              throw error
            }
          })
        })
      } else {
        res.send("Can't send mail, login and mail don't match !")
        res.end()
      }
    })
  })
  .post('/searchUsers', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let psearch = req.body
    let location = psearch.dist
    let idMe = req.body.idMe
    let now = new Date()
    let dateMax = date.format(date.addYears(now, -psearch.ageMin - 1), 'YYYY-DD-MM')
    let dateMin = date.format(date.addYears(now, -psearch.ageMax - 1), 'YYYY-DD-MM')
    let sqlreq2 = 'SELECT * FROM users, profil_user WHERE birthdate >= ? AND birthdate <= ? AND popu >= ? AND users.id = uid AND users.id <> ? AND comp = 100'
    let tags = []
    sql.query('SELECT genre, orientation FROM users, profil_user WHERE users.id = ? AND uid = users.id AND comp = 100', [idMe], function (error, results, fields) {
      if (error) throw error
      let genre = results[0].genre
      let or = results[0].orientation
      let sqlGeOr = searchOr(genre, or)
      sql.query('SELECT tags FROM users, profil_user WHERE users.id = ? AND uid = users.id AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100', [idMe, idMe], function (error, results, fields) {
        if (error) throw error
        let tagsId = results[0].tags
        let i = 0
        // if (tagsId.length !== 0) {
        if (tagsId !== null) {
          let splitTagsId = tagsId.substring(1).split('#')
          let sqlreq = 'SELECT uid, tags FROM profil_user, users WHERE `tags` IS NOT NULL AND uid <> ? AND birthdate >= ? AND birthdate <= ? AND popu >= ? AND users.id = profil_user.uid AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100'
          sqlreq = sqlreq + sqlGeOr
          sql.query(sqlreq, [idMe, dateMin, dateMax, psearch.popu, idMe], function (error, results, fields) {
            if (error) throw error
            if (results.length === 0) {
            } else {
              let strSql = ' AND (users.id = '
              let tTagsBdd = []
              each(results, function (value, key, object) {
                let id = object[key]['uid']
                let flag = 'notOK'
                tTagsBdd.push(object[key]['tags'])
                if (tTagsBdd.length > 1) tTagsBdd.shift()
                each(tTagsBdd, function (value, key, object) {
                  let line = object[key].substring(1)
                  let splitLine = line.split('#')
                  each(splitLine, function (value, key, object) {
                    let tagBdd = object[key]
                    each(splitTagsId, function (value, key, object) {
                      if (tagBdd === object[key] && flag === 'notOK') {
                        flag = 'OK'
                        if (strSql === ' AND (users.id = ') strSql = strSql + id
                        else strSql = strSql + ' OR users.id = ' + id
                      }
                    })
                  })
                })
              })
              strSql = strSql + ')'
              if (strSql !== ' AND (users.id = )') sqlreq2 = sqlreq2 + strSql
            }
            i++
            if (i === 2) fRequest(sqlreq2, sqlGeOr)
          })
        } else {
          i++
          if (i === 2) fRequest(sqlreq2, sqlGeOr)
        }
        if (psearch.tags.length !== 0) {
          each(psearch.tags, function (value, key, object) {
            tags.push(object[key]['text'].substring(1))
            let sqlQuery = 'INSERT IGNORE INTO tags (`idTag`, `text`) VALUES (?, ?)'
            sql.query(sqlQuery, [object[key]['text'].substring(1), object[key]['text'].substring(1)], function (error, results, fields) {
              if (error) throw error
            })
          })
          let sqlreq = 'SELECT uid, tags FROM profil_user, users WHERE `tags` IS NOT NULL AND uid <> ? AND birthdate >= ? AND birthdate <= ? AND popu >= ? AND users.id = profil_user.uid AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100'
          sqlreq = sqlreq + sqlGeOr
          sql.query(sqlreq, [idMe, dateMin, dateMax, psearch.popu, idMe], function (error, results, fields) {
            if (error) throw error
            if (results.length === 0) {
            } else {
              let strSql = ' AND (users.id = '
              let tTagsBdd = []
              each(results, function (value, key, object) {
                let id = object[key]['uid']
                let flag = 'notOK'
                tTagsBdd.push(object[key]['tags'])
                if (tTagsBdd.length > 1) tTagsBdd.shift()
                each(tTagsBdd, function (value, key, object) {
                  let line = object[key].substring(1)
                  let splitLine = line.split('#')
                  each(splitLine, function (value, key, object) {
                    let tagBdd = object[key]
                    each(tags, function (value, key, object) {
                      if (tagBdd === object[key] && flag === 'notOK') {
                        flag = 'OK'
                        if (strSql === ' AND (users.id = ') strSql = strSql + id
                        else strSql = strSql + ' OR users.id = ' + id
                      }
                    })
                  })
                })
              })
              strSql = strSql + ')'
              if (strSql !== ' AND (users.id = )') sqlreq2 = sqlreq2 + strSql
            }
            i++
            if (i === 2) fRequest(sqlreq2, sqlGeOr)
          })
        } else {
          i++
          if (i === 2) fRequest(sqlreq2, sqlGeOr)
        }
      })
    })
    function fRequest (sqlReq, sqlGeOr) {
      /* Mise a jour des parametres de recherche de l'utilisateur */
      let sqlupdate = 'UPDATE param_search SET ageMin = ?, ageMax = ?, popu = ?, location = ?, tags = ? WHERE uid = ?'
      let tagsLine
      if (psearch.tags.length === 0) tagsLine = '[]'
      else {
        tagsLine = '['
        each(psearch.tags, function (value, key, object) {
          if (tagsLine !== '[') tagsLine = tagsLine + ','
          tagsLine = tagsLine + '{ "id": "' + object[key].id + '", "text": "' + object[key].text + '" }'
        })
        tagsLine = tagsLine + ']'
      }
      sql.query(sqlupdate, [psearch.ageMin, psearch.ageMax, Math.floor(psearch.popu / 20), psearch.dist, tagsLine, idMe], function (error, results, fields) {
        if (error) throw error
      })
      /* Recuperation de la liste de suggestion des tags */
      let allTags = ''
      sql.query('SELECT text FROM tags', function (error, results, fields) {
        if (error) throw error
        allTags = '['
        each(results, function (value, key, object) {
          if (allTags !== '[') allTags = allTags + ','
          allTags = allTags + '{ "id": "' + object[key].text + '", "text": "' + object[key].text + '" }'
        })
        allTags = allTags + ']'
      })
      /* Recuperation des matchs pour eviter de les réafficher */
      let sqlReqNoMatchs = sqlReq + sqlGeOr
      sqlReq = sqlReq + sqlGeOr
      let sqlMatchs = ' AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?)'
      /* Ajout du filtre */
      let sqlReqAll = sqlReq + sqlMatchs
      if (psearch.filter && psearch.filter !== 'locaAsc' && psearch.filter !== 'locaDesc') sqlReqAll = sqlReq + psearch.filter
      /* Recuperation des resultats correspondants aux criteres de la recherche */
      sql.query(sqlReqAll, [dateMin, dateMax, psearch.popu, idMe, idMe], function (error, results, fields) {
        if (error) throw error
        if (results.length === 0) {
          res.send('Empty')
          res.end()
        } else {
          /* Sauvegarde des criteres de recherche pour le post(/searchUsersBis) */
          let pop = psearch.popu
          let fil
          if (psearch.filter) fil = psearch.filter
          else fil = ''
          each(tabC, function (value, key, object) {
            if (tabC[key]['idTab'] === parseInt(idMe, 10)) {
              tabC[key]['dateMin'] = dateMin
              tabC[key]['dateMax'] = dateMax
              tabC[key]['popu'] = pop
              tabC[key]['sql'] = sqlReqNoMatchs
              tabC[key]['loc'] = location
              tabC[key]['sug'] = ''
              tabC[key]['filter'] = fil
            }
          })
          let datas = results
          let i = 0
          /* Recuperation de l'image pour pouvoir bien l'afficher */
          each(results, function (value, key, object) {
            sql.query('SELECT location FROM profil_user WHERE uid = ?', [idMe], function (error, resLoca, fields) {
              if (error) throw error
              let dist = createData(value.location, resLoca[0].location).then(dist => {
                datas[key]['dist'] = dist
                let img = value.profimg
                let id = value.uid
                let imgName = 'null'
                let tabFinal = []
                if (img.substr(0, 4) === 'http') {
                  results[key].profimg = img
                  datas[key] = results[key]
                  i = i + 1
                  each(datas, function (value, key, object) {
                    if (datas[key]['dist'] <= location) tabFinal.push(datas[key])
                    if (i === results.length && key === datas.length - 1) {
                      if (psearch.filter === 'locaAsc') tabFinal.sort(function (a, b) { return a.dist - b.dist })
                      else if (psearch.filter === 'locaDesc') tabFinal.sort(function (a, b) { return b.dist - a.dist })
                      if (tabFinal.length > 10) {
                        while (tabFinal.length > 10) {
                          tabFinal.pop()
                          if (tabFinal.length === 10) {
                            res.send(tabFinal.concat(allTags))
                            res.end()
                          }
                        }
                      } else {
                        tabFinal = tabFinal.concat(allTags)
                        if (tabFinal.length === 1) res.send('Empty')
                        else res.send(tabFinal)
                        res.end()
                      }
                    }
                  })
                } else {
                  sql.query('SELECT name FROM image_user WHERE id = ?', [img], function (error, resu, fields) {
                    if (error) throw error
                    if (resu.length !== 0) imgName = resu[0].name
                    fs.readFile('./images/users/' + id + '/' + imgName, 'base64', (err, result) => {
                      if (err) {
                        img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                        results[key].profimg = 'data:image/png;base64,' + img
                        datas[key] = results[key]
                        i = i + 1
                      } else {
                        img = result
                        results[key].profimg = 'data:image/png;base64,' + img
                        datas[key] = results[key]
                        i = i + 1
                      }
                      each(datas, function (value, key, object) {
                        if (datas[key]['dist'] <= location) tabFinal.push(datas[key])
                        if (i === results.length && key === datas.length - 1) {
                          if (psearch.filter === 'locaAsc') tabFinal.sort(function (a, b) { return a.dist - b.dist })
                          else if (psearch.filter === 'locaDesc') tabFinal.sort(function (a, b) { return b.dist - a.dist })
                          if (tabFinal.length === 0) res.send('Empty')
                          else {
                            if (tabFinal.length > 10) {
                              while (tabFinal.length > 10) {
                                tabFinal.pop()
                                if (tabFinal.length === 10) {
                                  res.send(tabFinal.concat(allTags))
                                  res.end()
                                }
                              }
                            } else {
                              tabFinal = tabFinal.concat(allTags)
                              res.send(tabFinal)
                              res.end()
                            }
                          }
                        }
                      })
                    })
                  })
                }
              })
            })
          })
        }
      })
    }
  })
  .post('/searchUsersBis', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let idMe = req.body.idMe
    each(tabC, function (value, key, object) {
      if (tabC[key]['idTab'] === parseInt(idMe, 10)) fRequest(tabC[key]['sql'], tabC[key], key)
    })
    function fRequest (sqlReq, prop, k) {
      let location = tabC[k]['loc']
      let sqlMatchs = ' AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?)'
      sqlReq = sqlReq + sqlMatchs
      if (tabC[k]['fil'] && tabC[k]['fil'] !== 'locaAsc' && tabC[k]['fil'] !== 'locaDesc') sqlReq = sqlReq + tabC[k]['fil']
      let sqlParams = []
      if (prop['sug'] === 'sug') {
        sqlParams.push(prop['popu'] - 20)
        sqlParams.push(prop['popu'] + 20)
        sqlParams.push(idMe)
        sqlParams.push(idMe)
      } else {
        sqlParams.push(prop['dateMin'])
        sqlParams.push(prop['dateMax'])
        sqlParams.push(prop['popu'])
        sqlParams.push(idMe)
        sqlParams.push(idMe)
      }
      sql.query(sqlReq, sqlParams, function (error, results, fields) {
        if (error) throw error
        if (results.length === 0) {
          res.send('Empty')
          res.end()
        } else {
          let datas = results
          let i = 0
          each(results, function (value, key, object) {
            sql.query('SELECT location FROM profil_user WHERE uid = ?', [idMe], function (error, resLoca, fields) {
              if (error) throw error
              let dist = createData(value.location, resLoca[0].location).then(dist => {
                datas[key]['dist'] = dist
                let img = value.profimg
                let id = value.uid
                let imgName = 'null'
                let tabFinal = []
                if (img.substr(0, 4) === 'http') {
                  results[key].profimg = img
                  datas[key] = results[key]
                  i = i + 1
                  each(datas, function (value, key, object) {
                    if (datas[key]['dist'] <= location) tabFinal.push(datas[key])
                    if (i === results.length && key === datas.length - 1) {
                      if (tabC[k]['fil'] === 'locaAsc') tabFinal.sort(function (a, b) { return a.dist - b.dist })
                      else if (tabC[k]['fil'] === 'locaDesc') tabFinal.sort(function (a, b) { return b.dist - a.dist })
                      if (tabFinal.length === 0) res.send('Empty')
                      else {
                        if (tabFinal.length > 10) {
                          while (tabFinal.length > 10) {
                            tabFinal.pop()
                            if (tabFinal.length === 10) {
                              res.send(tabFinal)
                              res.end()
                            }
                          }
                        } else {
                          res.send(tabFinal)
                          res.end()
                        }
                      }
                    }
                  })
                } else {
                  sql.query('SELECT name FROM image_user WHERE id = ?', [img], function (error, resu, fields) {
                    if (error) throw error
                    if (resu.length !== 0) imgName = resu[0].name
                    fs.readFile('./images/users/' + id + '/' + imgName, 'base64', (err, result) => {
                      if (err) {
                        img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                        results[key].profimg = 'data:image/png;base64,' + img
                        datas[key] = results[key]
                        i = i + 1
                      } else {
                        img = result
                        results[key].profimg = 'data:image/png;base64,' + img
                        datas[key] = results[key]
                        i = i + 1
                      }
                      each(datas, function (value, key, object) {
                        if (datas[key]['dist'] <= location) tabFinal.push(datas[key])
                        if (i === results.length && key === datas.length - 1) {
                          if (tabC[k]['fil'] === 'locaAsc') tabFinal.sort(function (a, b) { return a.dist - b.dist })
                          else if (tabC[k]['fil'] === 'locaDesc') tabFinal.sort(function (a, b) { return b.dist - a.dist })
                          if (tabFinal.length === 0) res.send('Empty')
                          else {
                            if (tabFinal.length > 10) {
                              while (tabFinal.length > 10) {
                                tabFinal.pop()
                                if (tabFinal.length === 10) {
                                  res.send(tabFinal)
                                  res.end()
                                }
                              }
                            } else {
                              res.send(tabFinal)
                              res.end()
                            }
                          }
                        }
                      })
                    })
                  })
                }
              })
            })
          })
        }
      })
    }
  })
  .post('/initNotif', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    if (req.body.init === true) {
      if (tabC.length === 0) {
        tabC = []
        sql.query('SELECT id FROM users', function (error, results, fields) {
          if (error) throw error
          each(results, function (value, key, object) {
            let idTab = value['id']
            let tab = { idTab, dateMin: '', dateMax: '', popu: 0, sql: '', loc: '', sug: 'sug', filter: '', notifs: 0, notifsLiked: 0, notifsVisit: 0, notifsMes: 0, notifsMatched: 0, notifsMatchNot: 0 }
            tabC.push(tab)
          })
          res.send(true)
          res.end()
        })
      } else {
        sql.query('SELECT id FROM users', function (error, results, fields) {
          if (error) throw error
          each(results, function (value, key, object) {
            let idTab = value['id']
            let tab = { idTab, dateMin: '', dateMax: '', popu: 0, sql: '', loc: '', sug: 'sug', filter: '', notifs: 0, notifsLiked: 0, notifsVisit: 0, notifsMes: 0, notifsMatched: 0, notifsMatchNot: 0 }
            let found = tabC.find(function (element) {
              return element.idTab === idTab
            })
            if (!found) {
              tabC.push(tab)
            }
          })
          res.send(true)
          res.end()
        })
      }
    } else {
      res.end()
    }
  })
  .post('/matchSug', (req, res) => {
    if (tabC.length === 0) {
      tabC = []
      sql.query('SELECT id FROM users', function (error, results, fields) {
        if (error) throw error
        each(results, function (value, key, object) {
          let idTab = value['id']
          let tab = { idTab, dateMin: '', dateMax: '', popu: 0, sql: '', loc: '', sug: 'sug', filter: '', notifs: 0, notifsLiked: 0, notifsVisit: 0, notifsMes: 0, notifsMatched: 0, notifsMatchNot: 0 }
          tabC.push(tab)
        })
      })
    }
    if (!req.body) return res.sendStatus(400)
    let psearch = req.body
    let location = 10
    let sqlreq2 = 'SELECT * FROM users, profil_user WHERE popu >= ? AND popu <= ? AND users.id = uid AND users.id <> ? AND comp = 100'
    let tags = []
    let idMe = req.body.idMe
    sql.query('SELECT genre, orientation, popu FROM users, profil_user WHERE users.id = ? AND uid = users.id AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100', [idMe, idMe], function (error, results, fields) {
      if (error) throw error
      if (results.length !== 0) {
        let genre = results[0].genre
        let popu = results[0].popu
        let or = results[0].orientation
        let sqlGeOr = searchOr(genre, or)
        sql.query('SELECT tags FROM users, profil_user WHERE users.id = ? AND uid = users.id AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100', [idMe, idMe], function (error, results, fields) {
          if (error) throw error
          let tagsId = results[0].tags
          let i = 0
          if (tagsId !== null) {
            let splitTagsId = tagsId.substring(1).split('#')
            let sqlreq = 'SELECT uid, tags FROM profil_user, users WHERE `tags` IS NOT NULL AND uid <> ? AND popu >= ? AND popu <= ? AND users.id = profil_user.uid AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100'
            sqlreq = sqlreq + sqlGeOr
            sql.query(sqlreq, [idMe, popu - 20, popu + 20, idMe], function (error, results, fields) {
              if (error) throw error
              if (results.length === 0) {
              } else {
                let strSql = ' AND (users.id = '
                let tTagsBdd = []
                each(results, function (value, key, object) {
                  let id = object[key]['uid']
                  let flag = 'notOK'
                  tTagsBdd.push(object[key]['tags'])
                  if (tTagsBdd.length > 1) tTagsBdd.shift()
                  each(tTagsBdd, function (value, key, object) {
                    let line = object[key].substring(1)
                    let splitLine = line.split('#')
                    each(splitLine, function (value, key, object) {
                      let tagBdd = object[key]
                      each(splitTagsId, function (value, key, object) {
                        if (tagBdd === object[key] && flag === 'notOK') {
                          flag = 'OK'
                          if (strSql === ' AND (users.id = ') strSql = strSql + id
                          else strSql = strSql + ' OR users.id = ' + id
                        }
                      })
                    })
                  })
                })
                strSql = strSql + ')'
                if (strSql !== ' AND (users.id = )') sqlreq2 = sqlreq2 + strSql
              }
              i++
              if (i === 2) fRequest(sqlreq2, sqlGeOr, popu)
            })
          } else {
            i++
            if (i === 2) fRequest(sqlreq2, sqlGeOr, popu)
          }
          if (psearch.tags.length !== 0) {
            let sqlreq = 'SELECT uid, tags FROM profil_user, users WHERE `tags` IS NOT NULL AND uid <> ? AND popu >= ? AND popu <= ? AND users.id = profil_user.uid AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?) AND comp = 100'
            sqlreq = sqlreq + sqlGeOr
            sql.query(sqlreq, [idMe, popu - 20, popu + 20, idMe], function (error, results, fields) {
              if (error) throw error
              if (results.length === 0) {
              } else {
                let strSql = ' AND (users.id = '
                let tTagsBdd = []
                each(results, function (value, key, object) {
                  let id = object[key]['uid']
                  let flag = 'notOK'
                  tTagsBdd.push(object[key]['tags'])
                  if (tTagsBdd.length > 1) tTagsBdd.shift()
                  each(tTagsBdd, function (value, key, object) {
                    let line = object[key].substring(1)
                    let splitLine = line.split('#')
                    each(splitLine, function (value, key, object) {
                      let tagBdd = object[key]
                      each(tags, function (value, key, object) {
                        if (tagBdd === object[key] && flag === 'notOK') {
                          flag = 'OK'
                          if (strSql === ' AND (users.id = ') strSql = strSql + id
                          else strSql = strSql + ' OR users.id = ' + id
                        }
                      })
                    })
                  })
                })
                strSql = strSql + ')'
                if (strSql !== ' AND (users.id = )') sqlreq2 = sqlreq2 + strSql
              }
              i++
              if (i === 2) fRequest(sqlreq2, sqlGeOr, popu)
            })
          } else {
            i++
            if (i === 2) fRequest(sqlreq2, sqlGeOr, popu)
          }
        })
      }
    })
    function fRequest (sqlReq, sqlGeOr, popu) {
      /* Recuperation de la liste de suggestion des tags */
      let sqlTags = 'SELECT text FROM tags'
      let allTags = ''
      sql.query(sqlTags, function (error, results, fields) {
        if (error) throw error
        allTags = '['
        each(results, function (value, key, object) {
          if (allTags !== '[') allTags = allTags + ','
          allTags = allTags + '{ "id": "' + object[key].text + '", "text": "' + object[key].text + '" }'
        })
        allTags = allTags + ']'
      })
      /* Recuperation des matchs pour eviter de les réafficher */
      let sqlReqNoMatchs = sqlReq + sqlGeOr
      sqlReq = sqlReq + sqlGeOr
      let sqlMatchs = ' AND uid NOT IN(SELECT `uid` FROM `matchs` WHERE idMe = ?)'
      sqlReq = sqlReq + sqlMatchs
      /* Ajout du filtre */
      let sqlReqAll = sqlReq
      if (psearch.filter && psearch.filter !== 'locaAsc' && psearch.filter !== 'locaDesc') sqlReqAll = sqlReq + psearch.filter
      /* Recuperation des resultats correspondants aux criteres de la recherche */
      sql.query(sqlReqAll, [popu - 20, popu + 20, idMe, idMe], function (error, results, fields) {
        if (error) throw error
        if (results.length === 0) {
          res.send('Empty')
          res.end()
        } else {
          /* Sauvegarde des criteres de recherche pour le post(/searchUsersBis) */
          let fil
          if (psearch.filter) fil = psearch.filter
          else fil = ''
          each(tabC, function (value, key, object) {
            if (tabC[key]['idTab'] === parseInt(idMe, 10)) {
              tabC[key]['popu'] = popu
              tabC[key]['sql'] = sqlReqNoMatchs
              tabC[key]['loc'] = location
              tabC[key]['sug'] = 'sug'
              tabC[key]['filter'] = fil
            }
          })
          let datas = results
          let i = 0
          /* Recuperation de l'image pour pouvoir bien l'afficher */
          each(results, function (value, key, object) {
            sql.query('SELECT location FROM profil_user WHERE uid = ?', [idMe], function (error, resLoca, fields) {
              if (error) throw error
              let dist = createData(value.location, resLoca[0].location).then(dist => {
                datas[key]['dist'] = dist
                let img = value.profimg
                let id = value.uid
                let imgName = 'null'
                let tabFinal = []
                if (img.substr(0, 4) === 'http') {
                  results[key].profimg = img
                  datas[key] = results[key]
                  i = i + 1
                  each(datas, function (value, key, object) {
                    if (datas[key]['dist'] <= location) tabFinal.push(datas[key])
                    if (i === results.length && key === datas.length - 1) {
                      if (psearch.filter === 'locaAsc') tabFinal.sort(function (a, b) { return a.dist - b.dist })
                      else if (psearch.filter === 'locaDesc') tabFinal.sort(function (a, b) { return b.dist - a.dist })
                      if (tabFinal.length > 10) {
                        while (tabFinal.length > 10) {
                          tabFinal.pop()
                          if (tabFinal.length === 10) {
                            res.send(tabFinal.concat(allTags))
                            res.end()
                          }
                        }
                      } else {
                        tabFinal = tabFinal.concat(allTags)
                        if (tabFinal.length === 1) res.send('Empty')
                        else res.send(tabFinal)
                        res.end()
                      }
                    }
                  })
                } else {
                  sql.query('SELECT name FROM image_user WHERE id = ?', [img], function (error, resu, fields) {
                    if (error) throw error
                    if (resu.length !== 0) imgName = resu[0].name
                    fs.readFile('./images/users/' + id + '/' + imgName, 'base64', (err, result) => {
                      if (err) {
                        img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                        results[key].profimg = 'data:image/png;base64,' + img
                        datas[key] = results[key]
                        i = i + 1
                      } else {
                        img = result
                        results[key].profimg = 'data:image/png;base64,' + img
                        datas[key] = results[key]
                        i = i + 1
                      }
                      each(datas, function (value, key, object) {
                        if (datas[key]['dist'] <= location) tabFinal.push(datas[key])
                        if (i === results.length && key === datas.length - 1) {
                          if (psearch.filter === 'locaAsc') tabFinal.sort(function (a, b) { return a.dist - b.dist })
                          else if (psearch.filter === 'locaDesc') tabFinal.sort(function (a, b) { return b.dist - a.dist })
                          if (tabFinal.length === 0) res.send('Empty')
                          else {
                            if (tabFinal.length > 10) {
                              while (tabFinal.length > 10) {
                                tabFinal.pop()
                                if (tabFinal.length === 10) {
                                  res.send(tabFinal.concat(allTags))
                                  res.end()
                                }
                              }
                            } else {
                              tabFinal = tabFinal.concat(allTags)
                              res.send(tabFinal)
                              res.end()
                            }
                          }
                        }
                      })
                    })
                  })
                }
              })
            })
          })
        }
      })
    }
  })
  .post('/loadParamSearch', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let idMe = req.body.idMe
    let sqlreq = 'SELECT * FROM param_search WHERE uid = ?'
    sql.query(sqlreq, [idMe], function (error, results, fields) {
      if (error) throw error
      res.send(results)
      res.end()
    })
  })
  .post('/loadTagsSug', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let idMe = req.body.idMe
    let allTagsSug = ''
    let tab = []
    sql.query('SELECT text FROM tags', function (error, results, fields) {
      if (error) throw error
      allTagsSug = '['
      each(results, function (value, key, object) {
        if (allTagsSug !== '[') allTagsSug = allTagsSug + ','
        allTagsSug = allTagsSug + '{ "id": "' + object[key].text + '", "text": "' + object[key].text + '" }'
      })
      allTagsSug = allTagsSug + ']'
      tab[0] = allTagsSug
      let allTags = ''
      sql.query('SELECT tags FROM users, profil_user WHERE users.id = ? AND uid = users.id', [idMe], function (error, results, fields) {
        if (error) throw error
        let tagsId = results[0].tags
        if (tagsId !== null && tagsId !== '') {
          let splitTagsId = tagsId.substring(1).split('#')
          allTags = '['
          each(splitTagsId, function (value, key, object) {
            if (allTags !== '[') allTags = allTags + ','
            allTags = allTags + '{ "id": "' + object[key] + '", "text": "#' + object[key] + '" }'
          })
          allTags = allTags + ']'
          tab[1] = allTags
        }
        res.send(tab)
        res.end()
      })
    })
  })
  .post('/Like', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let start = Date.now()
    let uid = req.body.id_user
    let idMe = req.body.idMe
    let date = new Date()
    let state = ''
    sql.query('SELECT state FROM matchs WHERE idMe = ? AND uid = ?', [idMe, uid], function (error, results, fields) {
      if (error) throw error
      if (!results[0]) {
        sql.query('INSERT INTO matchs (idMe, uid, state, date) VALUES (?, ?, 1, ?)', [idMe, uid, date], function (error, results, fields) {
          if (error) throw error
          sql.query('UPDATE profil_user SET popu = IF(popu < 100, popu + 5, popu) WHERE uid = ?', [uid], (err, restmp) => {
            if (err) throw err
          })
          let now = Date.now() - start
          while (now < 1000) {
            now = Date.now() - start
          }
          sql.query('SELECT * FROM matchs WHERE (idMe = ? AND uid = ? AND state = 1)', [uid, idMe], function (error, results, fields) {
            if (error) throw error
            if (results.length === 1) {
              state = 'match'
              let room = crypto.randomBytes(32).toString('hex')
              sql.query('UPDATE matchs SET state = 2, room = ?, date = ? WHERE (idMe = ? AND uid = ? AND state = 1) OR (idMe = ? AND uid = ? AND state = 1)', [room, date, uid, idMe, idMe, uid], function (error, results, fields) {
                if (error) throw error
                else {
                  sql.query('UPDATE profil_user SET popu = IF(popu < 100, popu + 5, popu) WHERE uid = ? OR uid = ?', [uid, idMe], (err, restmp) => {
                    if (err) throw err
                  })
                }
              })
              sql.query('UPDATE notifs SET matched = matched + 1 WHERE (uid = ?)', [uid], function (error, results, fields) {
                if (error) throw error
              })
            } else {
              state = 'Like'
              sql.query('UPDATE notifs SET liked = liked + 1 WHERE (uid = ?)', [uid], function (error, results, fields) {
                if (error) throw error
              })
            }
            res.send(state)
            res.end()
          })
        })
      } else {
        res.send('Already like')
        res.end()
      }
    })
  })
  .post('/Dislike', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let idMe = req.body.idMe
    let uid = req.body.id_user
    sql.query('SELECT state FROM matchs WHERE idMe = ? AND uid = ?', [idMe, uid], function (error, results, fields) {
      if (error) throw error
      if (!results[0]) {
        sql.query('INSERT INTO matchs (`idMe`, `uid`, `state`) VALUES (?, ?, -1)', [idMe, uid], function (error, results, fields) {
          if (error) throw error
          sql.query('UPDATE profil_user SET popu = IF(popu > 0, popu - 2, popu) WHERE uid = ? OR uid = ?', [uid, idMe], (err, restmp) => {
            if (err) throw err
          })
          res.send('Dislike')
          res.end()
        })
      } else {
        res.send('Already dislike')
        res.end()
      }
    })
  })
  .get('/forgot/:token', (req, res) => {
    let token = ent.encode(req.params.token)
    let sqlreq = 'SELECT * FROM users WHERE `token` = ?'
    sql.query(sqlreq, [token], (error, results, fields) => {
      if (error) throw error
      if (results.length === 1) res.send(token)
      else res.send(false)
      res.end()
    })
  })
  .get('/forgot/res/:token&:pwd&:cpwd', (req, res) => {
    let token = ent.encode(req.params.token)
    let pwd = crypto.createHash('whirlpool').update(req.params.pwd).digest('hex')
    let cpwd = crypto.createHash('whirlpool').update(req.params.cpwd).digest('hex')
    if (pwd !== cpwd) {
      res.send('Passwords are not the same !')
      res.end()
    } else {
      let sqlreq = 'SELECT * FROM users WHERE `token` = ?'
      sql.query(sqlreq, [token], (error, results, fields) => {
        if (error) throw error
        if (results[0].id) {
          sqlreq = "UPDATE users SET password = ?, token = 'VERIF' WHERE id = ?"
          sql.query(sqlreq, [pwd, results[0].id], (error, results, fields) => {
            if (error) throw error
            else {
              res.send('Password has been updated !')
              res.end()
            }
          })
        } else {
          res.end()
        }
      })
    }
  })
  .post('/GetSocialState', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    sql.query('SELECT googleId FROM users WHERE login = ?', [login], (err, result) => {
      if (err) throw err
      else {
        let gId = result[0].googleId
        res.send(gId)
        res.end()
      }
    })
  })
  .post('/getAll', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    sql.query('SELECT * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error) {
        res.send(error)
        res.end()
      } else {
        let img = results[0].profimg
        results[0].bio = ent.decode(results[0].bio)
        results[0].login = ent.decode(results[0].login)
        results[0].first_name = ent.decode(results[0].first_name)
        results[0].last_name = ent.decode(results[0].last_name)
        results[0].mail = ent.decode(results[0].mail)
        if (results[0].activity) results[0].activity = ent.decode(results[0].activity)
        let id = results[0].id
        if (img.substring(0, 4) === 'http') {
          results[0].profimg = img
          res.send(results)
          res.end()
        } else {
          sql.query('SELECT * FROM image_user WHERE id = ? AND uid = ?', [img, id], (error, resu, fields) => {
            if (error || resu.length === 0) {
              img = fs.readFileSync('./images/users/defaultm.png', 'base64')
              results[0].profimg = 'data:image/png;base64,' + img
              res.send(results)
              res.end()
            } else {
              img = resu[0].name
              if (img.substr(0, 4) === 'http') {
                results[0].profimg = img
                res.send(results)
                res.end()
              } else {
                fs.readFile('./images/users/' + id + '/' + img, 'base64', (err, result) => {
                  if (err) {
                    img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                  } else img = result
                  results[0].profimg = 'data:image/png;base64,' + img
                  res.send(results)
                  res.end()
                })
              }
            }
          })
        }
      }
    })
  })
  .post('/getCurrentProf', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    sql.query('SELECT * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error) {
        res.send(error)
        res.end()
      } else {
        let img = results[0].profimg
        res.send(img)
        res.end()
      }
    })
  })
  .post('/getAll/info', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let id = req.body.id
    sql.query('SELECT * FROM profil_user WHERE uid = ?', [id], (error, results, fields) => {
      if (error) {
        res.send(error)
        res.end()
      } else {
        res.send(results[0])
        res.end()
      }
    })
  })
  .post('/getAll/likes', (req, res) => {
    if (!req.body.login) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    sql.query('SELECT id FROM users WHERE login = ?', [login], (err, result) => {
      if (err) throw err
      else {
        if (result.length === 0) {
          res.send(null)
          res.end()
        } else {
          let id = result[0].id
          sql.query("SELECT * FROM matchs WHERE uid = ? AND state = '1' ORDER BY date DESC", [id], (err, resl) => {
            if (err) throw err
            else {
              let all = {}
              if (resl.length > 0) {
                for (let i = 0; i < resl.length; i++) {
                  const element = resl[i]
                  sql.query('SELECT login FROM users WHERE id = ?', [element.idMe], (err, restmp) => {
                    if (err) throw err
                    else if (restmp.length > 0) {
                      all[restmp[0].login] = date.format(element.date, 'MMMM DD YYYY')
                    }
                    if (i === resl.length - 1) {
                      res.send(all)
                      res.end()
                    }
                  })
                }
              } else {
                res.send(false)
                res.end()
              }
            }
          })
        }
      }
    })
  })
  .post('/getAll/visits', (req, res) => {
    if (!req.body.login) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    sql.query('SELECT id FROM users WHERE login = ?', [login], (err, result) => {
      if (err) throw err
      else {
        if (result.length === 0) {
          res.send(null)
          res.end()
        } else {
          let id = result[0].id
          sql.query('SELECT * FROM profil_visit WHERE visited = ?', [id], (err, results) => {
            if (err) throw err
            else if (results.length > 0) {
              let all = {}
              for (let i = 0; i < results.length; i++) {
                const element = results[i]
                sql.query('SELECT login FROM users WHERE id = ?', [element.visitor], (err, restmp) => {
                  if (err) throw err
                  let now = date.format(element.last, 'MMMM DD YYYY')
                  all[restmp[0].login] = {number: element.number, last: now}
                  if (i === results.length - 1) {
                    res.send(all)
                    res.end()
                  }
                })
              }
            } else {
              res.send(false)
              res.end()
            }
          })
        }
      }
    })
  })
  .post('/getAll/matches', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let id = req.body.id
    let all = {}
    sql.query('SELECT * FROM matchs WHERE idMe = ? AND state = 2', [id], (error, results, fields) => {
      if (error) throw error
      else {
        if (results.length === 0) {
          res.send(null)
          res.end()
        } else {
          for (let i = 0; i < results.length; i++) {
            let thisId = results[i].uid
            sql.query('SELECT popu,location FROM profil_user WHERE uid = ?', [thisId], (error, profRes) => {
              if (error) throw error
              else {
                let popu = profRes[0].popu
                let loc = profRes[0].location
                sql.query('SELECT * FROM users WHERE id = ?', [thisId], (error, allRes) => {
                  if (error) throw error
                  else {
                    let date = new Date()
                    let diff = new DateDiff(date, results[i]['date'])
                    let diffAge = new DateDiff(date, allRes[0].birthdate)
                    all[i] = {}
                    all[i]['popu'] = popu
                    // all[i]['loc'] = loc
                    all[i]['id'] = thisId
                    all[i]['login'] = allRes[0].login
                    all[i]['first_name'] = allRes[0].first_name
                    all[i]['age'] = Math.floor(diffAge.years())
                    all[i]['bio'] = allRes[0].bio
                    all[i]['date'] = Math.floor(diff.days())
                    let img = allRes[0].profimg
                    // if (img !== 'defaultm.png') {
                    sql.query('SELECT * FROM image_user WHERE uid = ?', [thisId], (error, imgRes) => {
                      if (error) throw error
                      else {
                        if (img === 'defaultm.png') {
                          let def = fs.readFileSync('./images/users/defaultm.png', 'base64')
                          def = 'data:image/png;base64,' + def
                          all[i]['profimg'] = def
                        }
                        if (img.substring(0, 4) === 'http')
                          all[i]['profimg'] = img
                        all[i]['img'] = {}
                        sql.query('SELECT location FROM profil_user WHERE uid = ?', [id], (err, myRes) => {
                          if (err) throw err
                          else {
                            let myLoca = myRes[0].location
                            createData(myLoca, loc).then(dist => {
                              all[i]['dist'] = dist
                              if (imgRes.length > 0) {
                                for (let j = 0; j < imgRes.length; j++) {
                                  let name = imgRes[j].name
                                  let thisimg = null
                                  if (name.substring(0, 4) === 'http') {
                                    thisimg = name
                                  } else {
                                    thisimg = fs.readFileSync('./images/users/' + thisId + '/' + name, 'base64')
                                    thisimg = 'data:image/png;base64,' + thisimg
                                  }
                                  if (imgRes[j].id.toString() !== img.toString()) {
                                    all[i]['img'][j] = thisimg
                                  } else {
                                    all[i]['profimg'] = thisimg
                                  }
                                  if (i === results.length - 1) {
                                    res.send(all)
                                    res.end()
                                  }
                                }
                              } else {
                                if (i === results.length - 1) {
                                  res.send(all)
                                  res.end()
                                }
                              }
                            })
                          }
                        })
                      }
                    })
                    // }
                  }
                })
              }
            })
          }
        }
      }
    })
  })
  .post('/getAll/notif', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let login = ent.encode(req.body.login)
      sql.query('SELECT users.id, comp, complete FROM users, profil_user WHERE login = ? AND profil_user.uid = users.id', [login], (err, results) => {
        if (err) throw err
        else {
          if (results[0]) {
            let uid = results[0].id
            sql.query('SELECT * FROM notifs WHERE uid = ?', [uid], (err, result) => {
              if (err) throw err
              else if (result.length > 0) {
                result[0]['comp'] = results[0].comp
                result[0]['complete'] = JSON.parse(results[0].complete)
                res.send(result[0])
                res.end()
              } else {
                res.send(false)
                res.end()
              }
            })
          }
        }
      })
    }
  })
  .post('/getAll/users', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let login = ent.encode(req.body.login)
      sql.query('SELECT users.*, orientation FROM users, profil_user WHERE login = ? AND profil_user.uid = users.id AND comp = 100', [login], (err, result) => {
        if (err) throw err
        else if (result.length > 0) {
          let uid = result[0].id
          let orien = result[0].orientation
          let genre = result[0].genre
          let genreSc = null
          if (orien === 'hétéro') {
            if (genre === 'Man') {
              genreSc = "SELECT * FROM users, profil_user WHERE users.id != ? AND users.id = profil_user.uid AND (profil_user.orientation = 'hétéro' OR profil_user.orientation = 'bi') AND users.genre = 'Woman'"
            } else if (genre === 'Woman') {
              genreSc = "SELECT * FROM users, profil_user WHERE users.id != ? AND users.id = profil_user.uid AND (profil_user.orientation = 'hétéro' OR profil_user.orientation = 'bi') AND users.genre = 'Man'"
            }
          } else if (orien === 'bi') {
            if (genre === 'Man') {
              genreSc = "SELECT * FROM users, profil_user WHERE users.id != ? AND users.id = profil_user.uid AND ((users.genre = 'Woman' AND (profil_user.orientation = 'hétéro' OR profil_user.orientation = 'bi')) OR (users.genre = 'Man' AND (profil_user.orientation = 'homo' OR profil_user.orientation = 'bi')))"
            } else if (genre === 'Woman') {
              genreSc = "SELECT * FROM users, profil_user WHERE users.id != ? AND users.id = profil_user.uid AND ((users.genre = 'Man' AND (profil_user.orientation = 'hétéro' OR profil_user.orientation = 'bi')) OR (users.genre = 'Woman' AND (profil_user.orientation = 'homo' OR profil_user.orientation = 'bi')))"
            }
          } else if (orien === 'homo') {
            if (genre === 'Man') {
              genreSc = "SELECT * FROM users, profil_user WHERE users.id != ? AND users.id = profil_user.uid AND (users.genre = 'Man' AND (profil_user.orientation = 'homo' OR profil_user.orientation = 'bi'))"
            } else if (genre === 'Woman') {
              genreSc = "SELECT * FROM users, profil_user WHERE users.id != ? AND users.id = profil_user.uid AND (users.genre = 'Woman' AND (profil_user.orientation = 'homo' OR profil_user.orientation = 'bi'))"
            }
          }
          genreSc += ' ORDER BY RAND()'
          sql.query('SELECT * FROM matchs WHERE idMe = ?', [uid], (err, result) => {
            if (err) throw err
            else {
              let allMatch = []
              for (let j = 0; j <= result.length; j++) {
                if (j < result.length) {
                  allMatch.push(result[j].uid)
                }
                if (j === result.length - 1 || (j === 0 && result.length === 0)) {
                  sql.query(genreSc, [uid], (err, results) => {
                    if (err) throw err
                    else {
                      let allRes = []
                      for (let i = 0; i < results.length; i++) {
                        if (!(allMatch.includes(results[i].id))) {
                          if (!(results[i].profimg.substr(0, 4) === 'http')) {
                            if (results[i].profimg === 'defaultm.png') {
                              let img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                              img = 'data:image/png;base64,' + img
                              results[i].profimg = img
                              allRes.push(results[i])
                              if (i === results.length - 1) {
                                res.send(allRes)
                                res.end()
                              }
                            } else {
                              sql.query('SELECT name FROM image_user WHERE id = ? AND uid = ?', [results[i].profimg, results[i].id], (err, imgres) => {
                                if (err) throw err
                                if (imgres.length > 0) {
                                  let name = imgres[0].name
                                  let img = null
                                  if (name.substr(0, 4) === 'http') {
                                    img = name
                                  } else {
                                    img = fs.readFileSync('./images/users/' + results[i].id + '/' + name, 'base64')
                                    img = 'data:image/png;base64,' + img
                                  }
                                  results[i].profimg = img
                                  allRes.push(results[i])
                                } else {
                                  let img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                                  img = 'data:image/png;base64,' + img
                                  results[i].profimg = img
                                  allRes.push(results[i])
                                }
                                if (i === results.length - 1) {
                                  res.send(allRes)
                                  res.end()
                                }
                              })
                            }
                          } else {
                            allRes.push(results[i])
                            if (i === results.length - 1) {
                              res.send(allRes)
                              res.end()
                            }
                          }
                        } else if (i === results.length - 1) {
                          res.send(allRes)
                          res.end()
                        }
                      }
                    }
                  })
                }
              }
            }
          })
        } else {
          res.send(false)
          res.end()
        }
      })
    }
  })
  .post('/getImgs', (req, res) => {
    let start = Date.now()
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    sql.query('SELECT * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error) {
        throw error
      } else {
        let id = results[0].id
        sql.query('SELECT * FROM image_user WHERE uid = ?', [id], (error, results, fields) => {
          if (error) {
            throw error
          } else {
            if (results.length > 0) {
              let ret = {}
              let img = null
              let len = results.length
              ret['len'] = len
              for (let i = 0; i < results.length; i++) {
                ret[i] = {}
                if (results[i].name.substr(0, 4) === 'http') {
                  img = results[i].name
                } else {
                  img = fs.readFileSync('./images/users/' + id + '/' + results[i].name, 'base64')
                  img = 'data:image/png;base64,' + img
                }
                ret[i]['data'] = img
                ret[i]['id'] = results[i].id
              }
              let now = Date.now() - start
              while (now < 1000) {
                now = Date.now() - start
              }
              res.send(ret)
              res.end()
            } else {
              let now = Date.now() - start
              while (now < 1000) {
                now = Date.now() - start
              }
              res.send('no')
              res.end()
            }
          }
        })
      }
    })
  })
  .post('/get/Conversation', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let conv = ent.encode(req.body.conv)
    sql.query('SELECT * FROM conversations WHERE room = ? ORDER BY id', [conv], (error, results, fields) => {
      if (error) throw error
      if (results.length === 0) {
        res.send(null)
        res.end()
      }
      for (let i = 0; i < results.length; i++) {
        sql.query('SELECT login FROM users WHERE id = ?', [results[i]['emitter']], (error, result, field) => {
          if (error) throw error
          results[i]['emitter'] = result[0]['login']
          results[i]['message'] = ent.decode(results[i]['message'])
          if (i === results.length - 1) {
            res.send(results)
            res.end()
          }
        })
      }
    })
  })
  .post('/check/pwd', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
    sql.query('SELECT * FROM users WHERE login = ? AND password = ?', [login, pwd], (error, results, fields) => {
      if (error || results.length === 0) {
        res.send(false)
      } else {
        res.send(true)
      }
      res.end()
    })
  })
  .post('/update/info', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let id = req.body.id
    let login = ent.encode(req.body.login)
    let genre = ent.encode(req.body.genre)
    let first_name = ent.encode(req.body.first_name)
    let last_name = ent.encode(req.body.last_name)
    let mail = ent.encode(req.body.mail)
    let birthdate = ent.encode(req.body.birthdate)
    let phone = ent.encode(req.body.phone)
    let activity = ent.encode(req.body.activity)
    let bio = ent.encode(req.body.bio)
    let sqlreq = 'UPDATE users SET login = ?, genre = ?, first_name = ?, last_name = ?, mail = ?, birthdate = ?, phone = ?, activity = ?, bio = ? WHERE id = ?'
    sql.query(sqlreq, [login, genre, first_name, last_name, mail, birthdate, phone, activity, bio, id], (error, results, fields) => {
      if (error) throw error
      checkCompletion(login)
      res.end()
    })
  })
  .post('/update/tags', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let id = req.body.id
    let tags = req.body.tags
    let tagsAll = ''
    if (tags.length !== 0) {
      each(tags, function (value, key, object) {
        tagsAll = tagsAll.concat(object[key]['text'])
        let sqlQuery = 'INSERT IGNORE INTO tags (`idTag`, `text`) VALUES (?, ?)'
        sql.query(sqlQuery, [object[key]['text'].substring(1), object[key]['text'].substring(1)], function (error, results, fields) {
          if (error) throw error
        })
      })
    }
    sql.query('UPDATE profil_user SET tags = ? WHERE id = ?', [tagsAll, id], (error, results, fields) => {
      if (error) throw error
      res.end()
    })
  })
  .post('/delete/user', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let id = req.body.id
    sql.query('DELETE FROM users WHERE id = ?', [id], (error, results, fields) => {
      if (error) throw error
      else res.send(true)
      res.end()
    })
  })
  .post('/delete/img', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let pid = ent.encode(req.body.id)
    let login = ent.encode(req.body.login)
    sql.query('SELECT id, profimg FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (results.length !== 0 && !error) {
        let id = results[0].id
        let profimg = results[0].profimg
        sql.query('SELECT * FROM image_user WHERE uid = ? AND id = ?', [id, pid], (error, results, fields) => {
          if (error || results.length === 0) {
            res.send('Error')
            res.end()
          } else {
            let name = results[0].name
            sql.query('DELETE FROM image_user WHERE uid = ? AND id = ?', [id, pid], (error) => {
              if (error) {
                res.send('Error')
                res.end()
              } else {
                if (profimg === pid) {
                  sql.query("UPDATE users SET profimg = 'defaultm.png' WHERE id = ?", [id], (err) => {
                    if (err) throw err
                    checkCompletion(login)
                    fs.unlinkSync('./images/users/' + id + '/' + name)
                    res.send('good')
                    res.end()
                  })
                } else {
                  checkCompletion(login)
                  fs.unlinkSync('./images/users/' + id + '/' + name)
                  res.send('good')
                  res.end()
                }
              }
            })
          }
        })
      } else {
        res.send('Error')
        res.end()
      }
    })
  })
  .post('/new/password', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let login = ent.encode(req.body.login)
    let pwdchange = crypto.createHash('whirlpool').update(req.body.pwdchange).digest('hex')
    let newpass = ent.encode(req.body.newpass)
    let newpassverif = ent.encode(req.body.newpassverif)
    if (newpass === newpassverif && newpass.length !== 0) {
      sql.query('SELECT * FROM users WHERE login = ? AND password = ?', [login, pwdchange], (error, results, fields) => {
        if (error || results.length === 0) {
          res.send('An error occured, please try again !')
          res.end()
        } else {
          let id = results[0].id
          newpass = crypto.createHash('whirlpool').update(newpass).digest('hex')
          sql.query('UPDATE users SET password = ? WHERE id = ?', [newpass, id], (error, results, fields) => {
            if (error) {
              res.send('An error occured, please try again !')
              res.end()
              throw error
            } else res.send('Password has been changed !')
            res.end()
          })
        }
      })
    } else {
      res.send('An error occured, please try again !')
      res.end()
    }
  })
  .post('/upload/prof', (req, res) => {
    let login = ent.encode(req.body.login)
    let img = req.files.file
    sql.query('SELECT * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error) {
        throw error
      } else {
        let id = results[0].id
        if (!fs.existsSync('./Images/users/' + id)) {
          fs.mkdirSync('./Images/users/' + id)
        }
        sql.query('SELECT * FROM image_user WHERE uid = ?', [id], (error, results, fields) => {
          if (error) {
            throw error
          } else {
            if (results.length < 5) {
              let name = crypto.randomBytes(16).toString('hex') + '.png'
              fs.writeFile('./images/users/' + id + '/' + name, img.data, 'base64', (err) => {
                if (err) throw err
                else {
                  sql.query('INSERT INTO image_user(uid, name) VALUES(?, ?)', [id, name], (error) => {
                    if (error) throw error
                    res.end()
                  })
                }
              })
            } else {
              res.send('no')
              res.end()
            }
          }
        })
      }
    })
  })
  .post('/update/img', (req, res, next) => {
    if (!req.body) return res.sendStatus(400)
    let data = req.body.dataURL
    let login = ent.encode(req.body.login)
    data = data.split(',')
    let ext = data[0].indexOf('image')
    if (ext !== -1) {
      sql.query('select * FROM users WHERE login = ?', [login], (error, results, fields) => {
        if (error || results.length === 0) {
          res.send('An error occured, please try again !')
          res.end()
          throw error
        } else {
          let img = data[1]
          let id = results[0].id
          let name = crypto.randomBytes(16).toString('hex') + '.png'
          if (!fs.existsSync('./Images/users/' + id)) {
            fs.mkdirSync('./Images/users/' + id)
          }
          fs.writeFile('./Images/users/' + id + '/' + name, img, 'base64', (err) => {
            if (err) throw err
            else {
              sql.query('INSERT INTO image_user(uid, name) VALUES(?, ?); SELECT * FROM image_user WHERE name = ?', [id, name, name], (error, results, fields) => {
                if (error) throw error
                else {
                  let imgid = results[1][0].id
                  sql.query('UPDATE users SET profimg = ? WHERE id = ?', [imgid, id], (error, results, fields) => {
                    if (error) {
                      res.send('An error occured, please try again !')
                      res.end()
                      throw error
                    } else {
                      checkCompletion(login)
                      res.send(imgid.toString())
                      res.end()
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
  .post('/update/profImg', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let id = ent.encode(req.body.id)
    let login = ent.encode(req.body.login)
    sql.query('SELECT * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error || results.length === 0) {
        res.send('An error occured, please try again !')
        res.end()
        throw error
      } else {
        let uid = results[0].id
        sql.query('SELECT * FROM image_user WHERE id = ? AND uid = ?', [id, uid], (error, results, fields) => {
          if (error || results.length === 0) {
            res.send('An error occured, please try again !')
            res.end()
            throw error
          } else {
            let img = results[0].name
            sql.query('UPDATE users SET profImg = ? WHERE id = ?', [id, uid], (error, results, fields) => {
              if (error) {
                res.send('An error occured, please try again !')
                res.end()
                throw error
              } else {
                fs.readFile('./images/users/' + uid + '/' + img, 'base64', (err, result) => {
                  if (err) {
                    img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                  } else img = result
                  let ret = {}
                  ret['data'] = 'data:image/png;base64,' + img
                  ret['id'] = id
                  checkCompletion(login)
                  res.send(ret)
                  res.end()
                })
              }
            })
          }
        })
      }
    })
  })
  .post('/update/location', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let place = null
    if (req.body.place) place = ent.encode(req.body.place)
    let login = ent.encode(req.body.login)
    sql.query('select * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error || results.length === 0) {
        res.send('An error occured, please try again !')
        res.end()
        throw error
      } else {
        let id = results[0].id
        sql.query('UPDATE profil_user SET location = ? WHERE uid = ?', [place, id], (error, results, fields) => {
          if (error) {
            res.send('An error occured, please try again !')
            res.end()
            throw error
          } else {
            checkCompletion(login)
            res.send('good')
            res.end()
          }
        })
      }
    })
    // res.end()
  })
  .post('/update/orient', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let orient = req.body.orient
    let login = ent.encode(req.body.login)
    sql.query('select * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error || results.length === 0) {
        res.send('An error occured, please try again !')
        res.end()
        throw error
      } else {
        let id = results[0].id
        sql.query('UPDATE profil_user SET orientation = ? WHERE uid = ?', [orient, id], (error, results, fields) => {
          if (error) {
            res.send('An error occured, please try again !')
            res.end()
            throw error
          } else {
            checkCompletion(login)
            res.send('good')
            res.end()
          }
        })
      }
    })
  })
  .post('/update/gender', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    let orient = req.body.genre
    let login = ent.encode(req.body.login)
    sql.query('select * FROM users WHERE login = ?', [login], (error, results, fields) => {
      if (error || results.length === 0) {
        res.send('An error occured, please try again !')
        res.end()
        throw error
      } else {
        let id = results[0].id
        sql.query('UPDATE users SET genre = ? WHERE id = ?', [orient, id], (error, results, fields) => {
          if (error) {
            res.send('An error occured, please try again !')
            res.end()
            throw error
          } else {
            checkCompletion(login)
            res.send('good')
            res.end()
          }
        })
      }
    })
  })
  .post('/unMatch', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let elem = req.body.element
      let login = ent.encode(req.body.login)
      sql.query('SELECT id, login FROM users WHERE login = ?', [login], (err, result) => {
        if (err) throw err
        else {
          let id = result[0].id
          let loginUser = result[0].login
          sql.query('UPDATE matchs SET state = -2 WHERE idMe = ? AND uid = ?', [id, elem], (err, result) => {
            if (err) throw err
            sql.query('UPDATE matchs SET state = -2 WHERE idMe = ? AND uid = ?', [elem, id], (err, result) => {
              if (err) throw err
              else {
                sql.query('UPDATE profil_user SET popu = IF(popu > 0, popu - 8, popu) WHERE uid = ?', [elem], (err, restmp) => {
                  if (err) throw err
                })
                sql.query('UPDATE profil_user SET popu = IF(popu > 0, popu - 3, popu) WHERE uid = ?', [id], (err, restmp) => {
                  if (err) throw err
                })
                sql.query('UPDATE notifs SET matchNot = matchNot + 1 WHERE uid = ?', [elem], (err, result) => {
                  if (err) throw err
                  else {
                    res.send(loginUser)
                    res.end()
                  }
                })
              }
            })
          })
        }
      })
    }
  })
  .post('/Check/User', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let visitor = ent.encode(req.body.visitor)
      let dateVisit = new Date()
      let user = ent.encode(req.body.user)
      sql.query('SELECT * FROM users, profil_user WHERE users.login = ? AND users.id = uid', [user], (err, result, field) => {
        if (err) throw err
        else {
          if (result.length > 0) {
            sql.query('SELECT users.id AS id, location FROM users, profil_user WHERE login = ? AND uid = users.id', [visitor], (err, results) => {
              if (err) throw err
              else if (results.length > 0) {
                let idVisitor = results[0].id
                let locationVisitor = results[0].location
                sql.query('SELECT * FROM profil_visit WHERE visited = ? AND visitor = ?', [result[0].id, idVisitor], (err, ress) => {
                  if (err) throw err
                  let available = false
                  if (ress.length > 0) {
                    let last = ress[0].last
                    let diff = new DateDiff(dateVisit, last)
                    let now = diff.hours()
                    if (now >= 24) {
                      available = true
                    }
                    if (available === true) {
                      sql.query('UPDATE profil_visit SET number = number + 1, last = ? WHERE visited = ? AND visitor = ?', [dateVisit, result[0].id, idVisitor], (err, restmp) => {
                        if (err) throw err
                        else {
                          sql.query('UPDATE profil_user SET popu = IF(popu < 100, popu + 2, popu) WHERE uid = ?', [result[0].id], (err, restmp) => {
                            if (err) throw err
                            sql.query('UPDATE notifs SET visit = visit + 1 WHERE (uid = ?)', [result[0].id], function (error, results, fields) {
                              if (error) throw error
                            })
                          })
                        }
                      })
                    }
                  } else {
                    sql.query('INSERT INTO profil_visit (visited, visitor, number, last) VALUES (?, ?, 1, ?)', [result[0].id, idVisitor, dateVisit], (err, resss) => {
                      if (err) throw err
                      else {
                        sql.query('UPDATE profil_user SET popu = IF(popu < 100, popu + 1, popu) WHERE uid = ?', [result[0].id], (err, restmp) => {
                          if (err) throw err
                          sql.query('UPDATE notifs SET visit = visit + 1 WHERE (uid = ?)', [result[0].id], function (error, results, fields) {
                            if (error) throw error
                          })
                        })
                      }
                    })
                  }
                  result[0]['LikedOrNot'] = 'Nothing'
                  sql.query('SELECT * FROM matchs WHERE idMe = ? AND uid = ? AND (state = 2 OR state = 1)', [result[0].id, idVisitor], (err, res) => {
                    if (err) throw err
                    if (res.length === 1) {
                      sql.query('SELECT * FROM matchs WHERE idMe = ? AND uid = ?', [idVisitor, result[0].id], (err, res) => {
                        if (err) throw err
                        if (res.length === 1 && res[0].state === 2) result[0]['LikedOrNot'] = 'matched'
                        else if (res.length === 1 && res[0].state === -1) result[0]['LikedOrNot'] = 'AlreadyDislike'
                        else result[0]['LikedOrNot'] = 'liked'
                      })
                    } else {
                      sql.query('SELECT * FROM matchs WHERE idMe = ? AND uid = ?', [idVisitor, result[0].id], (err, res) => {
                        if (err) throw err
                        if (res.length === 1 && res[0].state === 1) result[0]['LikedOrNot'] = 'AlreadyLike'
                        else if (res.length === 1 && res[0].state === -1) result[0]['LikedOrNot'] = 'AlreadyDislike'
                        else if (res.length === 1 && res[0].state === -2) result[0]['LikedOrNot'] = 'block'
                        else if (res.length === 1 && res[0].state === -3) result[0]['LikedOrNot'] = 'Reported'
                      })
                    }
                  })
                  result[0]['status'] = online[user]
                  result[0].login = ent.decode(result[0].login)
                  result[0].first_name = ent.decode(result[0].first_name)
                  result[0].last_name = ent.decode(result[0].last_name)
                  result[0].mail = ent.decode(result[0].mail)
                  if (result[0].activity) result[0].activity = ent.decode(result[0].activity)
                  result[0].bio = ent.decode(result[0].bio)
                  if (result[0].discoDate) result[0]['dateDeco'] = date.format(result[0].discoDate, 'MMMM DD YYYY at H') + ' h'
                  else result[0]['dateDeco'] = 'Never connected'
                  result[0].birthdate = date.format(result[0].birthdate, 'MMMM DD YYYY')
                  let img = result[0].profimg
                  let imgName = 'null'
                  let id = result[0].id
                  let allTags = ''
                  sql.query('SELECT tags, location FROM users, profil_user WHERE users.id = ? AND uid = users.id', [id], function (error, results, fields) {
                    if (error) throw error
                    if (results.length !== 0) {
                      let tagsId = results[0].tags
                      if (tagsId !== null && tagsId !== '') {
                        let splitTagsId = tagsId.substring(1).split('#')
                        allTags = '['
                        each(splitTagsId, function (value, key, object) {
                          if (allTags !== '[') allTags = allTags + ','
                          allTags = allTags + '{ "id": "' + object[key] + '", "text": "#' + object[key] + '" }'
                        })
                        allTags = allTags + ']'
                        result[0].tags = allTags
                      }
                    } else result[0].tags = '[]'
                    if (img.substr(0, 4) !== 'http') {
                      sql.query('SELECT name FROM image_user WHERE id = ?', [img], function (error, resu, fields) {
                        if (error) throw error
                        if (resu.length !== 0) imgName = resu[0].name
                        if (imgName.substr(0, 4) === 'http') {
                          result[0].profimg = imgName
                          let dist = createData(locationVisitor, result[0].location).then(dist => {
                            result[0]['dist'] = dist
                            res.send(result[0])
                            res.end()
                          })
                        } else {
                          fs.readFile('./images/users/' + id + '/' + imgName, 'base64', (err, resul) => {
                            if (err) {
                              img = fs.readFileSync('./images/users/defaultm.png', 'base64')
                              result[0].profimg = 'data:image/png;base64,' + img
                            } else {
                              img = resul
                              result[0].profimg = 'data:image/png;base64,' + img
                            }
                            let dist = createData(locationVisitor, result[0].location).then(dist => {
                              result[0]['dist'] = dist
                              res.send(result[0])
                              res.end()
                            })
                          })
                        }
                      })
                    } else {
                      result[0].profimg = img
                      let dist = createData(locationVisitor, result[0].location).then(dist => {
                        result[0]['dist'] = dist
                        res.send(result[0])
                        res.end()
                      })
                    }
                  })
                })
              } else {
                res.send(false)
                res.end()
              }
            })
          } else {
            res.send(false)
            res.end()
          }
        }
      })
    }
  })
  .post('/Delete/notif', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let notif = ent.encode(req.body.name)
      let login = ent.encode(req.body.login)
      sql.query('SELECT id FROM users where login = ?', [login], (err, result) => {
        if (err) throw err
        else {
          let id = result[0].id
          let sqlReq = 'UPDATE notifs SET ' + notif + " = '0' WHERE uid = ?"
          sql.query(sqlReq, [id], (err, result) => {
            if (err) throw err
            else {
              res.send('ok')
              res.end()
            }
          })
        }
      })
      // sqlReq = 'UPDATE notifs'
    }
  })
  .post('/gen/pictures', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let all = []
      for (let i = 0; i < 181; i++) {
        let cur = faker.image.avatar()
        fetch(cur).then(result => {
          if (result.status === 200) {
            all.push(cur)
          } else i--
          if (all.length === 180) {
            res.send(all)
            res.end()
          }
        }).catch(e => { return null })
      }
    }
  })
  .post('/report', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let elem = req.body.element
      let login = ent.encode(req.body.login)
      sql.query('SELECT id, login FROM users WHERE login = ?', [login], (err, result) => {
        if (err) throw err
        else {
          let id = result[0].id
          let loginUser = result[0].login
          sql.query('UPDATE matchs SET state = -3 WHERE idMe = ? AND uid = ?', [id, elem], (err, result) => {
            if (err) throw err
            sql.query('UPDATE matchs SET state = -3 WHERE idMe = ? AND uid = ?', [elem, id], (err, result) => {
              if (err) throw err
              else {
                sql.query('UPDATE profil_user SET popu = IF(popu > 0, popu - 10, popu) WHERE uid = ?', [elem], (err, restmp) => {
                  if (err) throw err
                })
                sql.query('UPDATE users SET admin = admin + 1 WHERE id = ?', [elem], (err, restmp) => {
                  if (err) throw err
                })
                sql.query('UPDATE notifs SET matchNot = matchNot + 1 WHERE uid = ?', [elem], (err, result) => {
                  if (err) throw err
                  else {
                    res.send(loginUser)
                    res.end()
                  }
                })
              }
            })
          })
        }
      })
    }
  })
  .post('/Check/email', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let mail = ent.encode(req.body.mail)
      sql.query('SELECT * FROM users WHERE mail = ?', [mail], (err, result) => {
        if (err) throw err
        else {
          if (result.length === 0) {
            res.send('ok')
            res.end()
          } else {
            res.send('no')
            res.end()
          }
        }
      })
    }
  })
  .post('/Check/login', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let login = ent.encode(req.body.login)
      let cur = null
      if (req.body.current) {
        cur = ent.encode(req.body.current)
      }
      sql.query('SELECT * FROM users WHERE login = ?', [login], (err, result) => {
        if (err) throw err
        else {
          if (result.length === 0 || (result.length > 0 && result[0].login === cur)) {
            res.send('ok')
            res.end()
          } else {
            res.send('no')
            res.end()
          }
        }
      })
    }
  })
  .post('/Check/UserConnect', (req, res) => {
    if (!req.body) return res.sendStatus(400)
    else {
      let login = ent.encode(req.body.login)
      sql.query('SELECT * FROM users WHERE login = ?', [login], (err, result) => {
        if (err) throw err
        else {
          if (result.length > 0) {
            res.send(true)
            res.end()
          } else {
            res.send(false)
            res.end()
          }
        }
      })
    }
  })
let checkCompletion = (login) => {
  sql.query('SELECT users.id, login, genre, first_name, last_name, mail, birthdate, phone, bio, profimg, location, orientation FROM users, profil_user WHERE users.login = ? AND profil_user.uid = users.id', [login], (err, result) => {
    if (err) throw err
    if (result.length > 0) {
      let nul = 0
      let i = 0
      let prof = 0
      let img = 0
      let loca = 0
      let orien = 0
      let results = result[0]
      Object.keys(results).map((val) => {
        i++
        const element = results[val]
        if (!element || (element.length === 0 && val !== 'id')) {
          nul += 1
          if (val === 'location') {
            loca = 1
          } else if (val === 'orientation') {
            orien = 1
          } else if (val !== 'profimg') {
            prof = 1
          }
        }
        if (element === 'id') i -= 1
        if (i === Object.keys(results).length) {
          if (result[0].profimg === 'defaultm.png') {
            nul += 1
            img = 1
          }
          let complete = {prof, img, loca, orien}
          complete = JSON.stringify(complete)
          let comp = Math.floor(100 - ((100 * nul) / i))
          sql.query('UPDATE profil_user SET comp = ? WHERE uid = ?', [comp, results['id']], (err) => {
            if (err) throw err
          })
          sql.query('UPDATE profil_user SET complete = ? WHERE uid = ?', [complete, results['id']], (err) => {
            if (err) throw err
            updateComplete(login)
          })
        }
      })
    }
  })
}
