const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
const pg = require('pg')  // import pg from 'pg' 와 동일 (ES6 모듈 -> CommonJS 모듈 사용)

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

// 라우팅 
app.get('/', (req, res) => {
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

    var sql = `insert into contact(name, phone, email, memo, regdate) values('${name}', '${phone}', '${email}', '${memo}', now() )`

    db.query(sql, function (err, result){
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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})