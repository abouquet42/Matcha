let fs = require('fs')
let faker = require('faker/locale/fr')
const fetch = require('node-fetch')
let date = require('date-and-time')
let matchaSQL
let mysql = require('mysql')
let sql = mysql.createConnection({
  host     : 'localhost',
  user     : 'root42',
  password : 'root42',
  database : 'matcha',
  multipleStatements: true
})
module.exports = (callback) => {
  sql.connect(function (err) {
    if (err) {
      sql = mysql.createConnection({
        host     : 'localhost',
        user     : 'root42',
        password : 'root42',
        multipleStatements: true
      })
      sql.connect(function (err) {
        if (err) throw err
      })
      matchaSQL = fs.readFileSync('./config/matcha.sql', 'UTF-8')
      sql.query(matchaSQL, function (err, response) {
        if (!err) {
          sql = mysql.createConnection({
            host     : 'localhost',
            user     : 'root42',
            password : 'root42',
            database : 'matcha',
            multipleStatements: true
          })
          sql.connect()
          var i = 0
          sql.query('SELECT * FROM users', function (error, results, fields) {
            if (error) throw error
            i = results.length
            while (i < 500 ) {
              testFeed()
              i++
              sql.query('SELECT * FROM users', function (error, res, fields) {
                if (error) throw error
                // i = res.length
              })
              if (i === 499) callback(sql)
            }
          })
        } else throw err
      })
    } else callback(sql)
  })
  function testFeed () {
    function getRandomIntInclusive (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    const genres = ['Man', 'Woman']
    const orientation = ['bi', 'hétéro', 'homo']

    var initFeed = (User) => {
      sql.query('INSERT INTO users (login,genre,first_name,last_name,created_at,mail,password,birthdate,phone,bio,token,profimg) VALUES (?,?,?,?,?,?,?,?,?,?,"VERIF",?)', [User.login, User.genre, User.fName, User.lName, User.createdAt, User.mail, User.pwd, User.birthdate, User.phone, User.bio, User.profimg], function (error, rows) {
        if (error) throw (error)
        sql.query('INSERT INTO profil_user (uid,popu,location,orientation, comp, complete) VALUES ((SELECT id FROM users WHERE `login` = ?),?,?,?,?,?)', [User.login, User.popu, User.location, User.or, User.comp, User.complete], function (error, rows) {
          if (error) throw (error)
          sql.query('INSERT INTO param_search (uid,ageMin,ageMax,popu,location,tags) VALUES ((SELECT id FROM users WHERE `login` = ?), 18, ?, ?, 1, "[]")', [User.login, User.ageMax, 0], function (error, rows) {
            if (error) throw (error)
            sql.query('INSERT INTO notifs (uid,liked,visit,message,matched,matchNot) VALUES ((SELECT id FROM users WHERE `login` = ?),0,0,0,0,0)', [User.login], function (error, rows) {
              if (error) throw (error)
            })
          })
        })
      })
    }
    var place = async () => {
      function getRandomInRange (from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1
      }
      var lat = getRandomInRange(48.814397, 48.915256, 6)
      var ln = getRandomInRange(2.246462, 2.253410, 6)
      const response = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + ln + '&key=AIzaSyCKb5nHXbxWF6uj_Ehm-P65YZ95KqH8Tuw')
      const body = await response.json()
      if (response.status !== 200) throw Error(body.message)
      const User = {
        login: faker.lorem.word() + faker.random.number(),
        genre: genres[getRandomIntInclusive(0, 1)],
        fName: faker.name.firstName(),
        lName: faker.name.lastName(),
        createdAt: date.format(faker.date.recent(), 'YYYY-MM-DD HH:mm:ss'),
        mail: faker.internet.email(),
        pwd: '869027f4a0e15006e431c22b00c5d8497d943eada1c87a49ac24f8481315f67531cc59f18b57935eb7a259594f5c3cec142b275dc6d3d54e0f409a83ae59dbb5',
        birthdate: date.format(faker.date.past(82, 2000), 'YYYY-MM-DD'),
        phone: faker.phone.phoneNumber(),
        bio: faker.hacker.phrase(),
        profimg: '',
        popu: getRandomIntInclusive(0, 100),
        location: 'ChIJeyhfAKxv5kcR9PfqEJSVHHw',
        or: orientation[getRandomIntInclusive(0, 2)],
        ageMax: getRandomIntInclusive(18, 100),
        comp: 100,
        complete: "{'prof':0,'img':0,'loca':0,'orien':0}"
      }
      let i = 0
      while (i === 0) {
        User.profimg = faker.image.avatar()
        let resp = await fetch(User.profimg)
        if (resp.status === 200) i = 1
        else i = 0
      }
      if (body.results[0]) {
        if (body.results[0].place_id.length <= 30) User.location = body.results[0].place_id
        else User.location = 'ChIJeyhfAKxv5kcR9PfqEJSVHHw'
      }
      initFeed(User)
    }
    place()
  }
}
