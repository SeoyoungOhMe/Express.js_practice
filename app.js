const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
const pg = require('pg')  // import pg from 'pg' 와 동일 (ES6 모듈 -> CommonJS 모듈 사용)
var session = require('express-session')

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "unidago",
    password: "1234",
    port: 5432,
})
  
db.connect()

app.set('view engine', 'ejs')
app.set('views', './views') // 화면 상에 보여지는 걸 어디서 가져올지 지정

app.use(bodyParser.urlencoded({ extended: false })) // bodyparser 사용을 위함

app.use(express.static(__dirname + '/public')) // 정적 파일 제공

app.use(session({ secret: 'osy', cookie: { maxAge: 60000 }, resave : true, saveUninitialized : true }))

app.use((req, res, next) => {

    res.locals.user_id="";
    res.locals.name="";

    if(req.session.member){
        res.locals.user_id = req.session.member.user_id
        res.locals.name = req.session.member.name
    }

    next()
})

// 라우팅 
app.get('/', (req, res) => {

    console.log(req.session.member);

    res.render('index')  // ./views/index.ejs
})

app.get('/profile', (req, res) => {
    res.render('profile')
})

app.get('/map', (req, res) => {
    res.render('map')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

app.post('/contactProc', (req, res) => {
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const memo = req.body.memo;

    var sql = `insert into contact(name,phone,email,memo,regdate) values( $1, $2, $3, $4, NOW() )`

    var values = [name, phone, email, memo];

    db.query(sql, values, function (err, result){
        if(err) throw err;
        console.log("자료 1개를 삽입했습니다.");
        res.send("<script> alert('문의사항이 등록되었습니다.'); location.href='/'; </script>")
    })

})

app.get('/contactList', (req, res) => {

    var sql = `select * from contact order by idx desc `

    db.query(sql, function (err, results, fields){
        if(err) throw err;
        console.log(results);
        res.render('contactList', {lists:results.rows})
    })
    
})

app.get('/contactDelete', (req, res) => {
    var idx = req.query.idx
    var sql = `delete from contact where idx='${idx}' `

    db.query(sql, function (err, result){
        if(err) throw err;
        res.send("<script> alert('삭제돠었습니다.'); location.href='/contactList'; </script>")
    })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/loginProc', (req, res) => {
    const user_id = req.body.user_id;
    const pw = req.body.pw;

    var sql = `SELECT * FROM member WHERE user_id=$1 AND pw=$2`

    var values = [user_id, pw];

    db.query(sql, values, function (err, result){
        if(err) throw err;

        if(result.rows.length == 0){
            res.send("<script> alert('존재하지 않는 아이디입니다.'); location.href='/login'; </script>")
        } else{
            console.log(result.rows)

            req.session.member = result.rows[0]
            res.send("<script> alert('로그인 되었습니다.'); location.href='/'; </script>")

            // res.send(result.rows)
        }
        
    })

})

app.get('/logout', (req, res) => {

    req.session.member = null
    res.send("<script> alert('로그아웃 되었습니다.'); location.href='/'; </script>")
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})