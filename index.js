const express = require("express");
const cors = require("cors");
const moment = require("moment");
const morgan = require("morgan");
const config = require("./config.json");
const mysql = require("mysql");
const AWS = require("aws-sdk");
// ------------------------------
const app = express();

app.use(express.json({ extended: false }))
app.use(cors());

app.use(morgan('dev'));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

let pool = mysql.createPool({
    host: config.dbhost,
    user: config.dbuser,
    password: config.dbpassword
});

const s3 = new AWS.S3({
    accessKeyId: config.s3AccessKeyId,
    secretAccessKey: config.s3SecretAccessKey,
    region: "ap-south-1",
});

// ------------------------------

app.get("/testGet", (req, res) => {
    res.json({ code: 200, message: "API works" });
});

app.get('/get-Users-select', (req, res) => {
    promSqlRunner(`SELECT * FROM Cards_DB.Users;`).then(result => {
        res.send(promGetResJson(200, 'Users List', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Query', err)));
});

app.get('/get-Users-select-where/:User_Email', (req, res) => {
    let query = `SELECT * FROM Cards_DB.Users WHERE User_Email='${req.params.User_Email}';`;
    console.log(query)
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Users List', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Query', err)));
});

app.post('/post-Users-insert', (req, res) => {
    let query = `INSERT INTO Cards_DB.Users SET
    User_Id='${req.body.User_Id}',
    User_FirstName='${req.body.User_FirstName}',
    User_LastName='${req.body.User_LastName}',
    User_Phone='${req.body.User_Phone}',
    User_Email='${req.body.User_Email}',
    User_Access=JSON_ARRAY(),
    User_TimeStamp=NOW();`;
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Users Inserted', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Inserting User', err)));
});

app.delete('/delete-Users-delete/:User_Id', (req, res) => {
    let query = `DELETE FROM Cards_DB.Users WHERE User_Id='${req.params.User_Id}';`;
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Users Deleted', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Deleting User', err)));
});

app.get('/get-Cards-select', (req, res) => {
    let query = `SELECT * FROM Cards_DB.Cards;`;
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Cards in DB', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Deleting User', err)));
});

app.get('/get-Cards-select-where/:Card_UserId', (req, res) => {
    let query = `SELECT * FROM Cards_DB.Cards WHERE Card_UserId='${req.params.Card_UserId}';`;
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Cards Uploaded by User', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Deleting User', err)));
});

app.post('/get-Cards-insert', (req, res) => {
    let query = `INSERT INTO Cards_DB.Cards SET
    Card_Id='${req.body.Card_Id}',
    Card_UserId='${req.body.Card_UserId}',
    Card_Image='${req.body.Card_Image}',
    Card_Title='${req.body.Card_Title}',
    Card_PersonName='${req.body.Card_PersonName}',
    Card_BusinessTitle='${req.body.Card_BusinessTitle}',
    Card_Contact=${req.body.Card_Contact},
    Card_Email=${req.body.Card_Email},
    Card_Website=${req.body.Card_Website},
    Card_Address='${req.body.Card_Address}',
    Card_MetaData='${JSON.stringify(req.body.Card_MetaData).split("'").join("")}',
    Card_Timestamp=NOW();`;
    console.log(query);
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Card Inserted', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Inserting Card', err)));
});

app.delete('/delete-Cards-delete/:Card_Id', (req, res) => {
    let query = `DELETE FROM Cards_DB.Cards WHERE Card_Id='${req.params.Card_Id}'`;
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Card Deleted', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Deleting Card', err)));
});

app.get('/get-Cards-select-like', (req, res) => {
    let query = `SELECT * FROM Cards_DB.Cards WHERE LOWER(Card_MetaData) LIKE '%${req.query.searchQuery.toLowerCase()}%';`
    promSqlRunner(query).then(result => {
        res.send(promGetResJson(200, 'Card Deleted', result));
    }).catch(err => res.send(promGetResJson(400, 'Error Running Deleting Card', err)));
})

// Universal File Url Get function
app.get("/getFiles3Link", function (req, res) {
    const signedUrlExpireSeconds = 60 * 24 * 60;
    const url = s3.getSignedUrl("getObject", {
        Bucket: req.query.folder,
        Key: req.query.fileKey,
    });
    res.send({ fileUrl: url });
});

app.get('/checkExistanceAndGetS3Link', (req, res) => {
    const params = {
        Bucket: req.query.folder,
        Key: req.query.fileKey,
    };
    s3.headObject(params, function (err, metadata) {
        if (err && err.name === 'NotFound') {
            // Handle no object on cloud here
            res.status(404).send(promGetResJson(404, 'File Not Found', err));
        } else if (err) {
            // Handle other errors here....
            res.status(400).send(promGetResJson(400, 'An Error Occured', err));
        } else {
            const url = s3.getSignedUrl('getObject', params);
            res.status(200).send(promGetResJson(200, 'File Found', url));
            // Do stuff with signedUrl
        }
    });
})


// Universal File Url uploader function
app.get("/getFileUploadLink", function (req, res) {

    var images = ['.png', '.jpg', '.jpeg']
    var ctype;
    if (images.indexOf(req.query.ext) != -1)
        ctype = 'image/' + req.query.ext
    else if (req.query.ext == 'pdf')
        ctype = 'application/pdf'

    console.log(ctype)

    const signedUrlExpireSeconds = 60 * 24 * 60;
    const url = s3.getSignedUrl("putObject", {
        Bucket: req.query.folder,
        Key: req.query.fileKey,
        Expires: signedUrlExpireSeconds,
        ContentType: ctype
    });
    res.send({ fileUrl: url });
});


// ------------------------------

/**
 * Use this function to run SQL queries
 * @param {*} queryStr Sql Query to run
 * @returns Promise
 */
const promSqlRunner = function (queryStr) {

    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) reject(err);
            connection.query(queryStr, function (error, results, fields) {
                connection.release();
                if (error) reject(error);
                else resolve(results)
            });
        });
    });
}
/**
 *
 * @param {number} code Code to take action accordingly [200/400/404]
 * @param {string} msg Msg to put in return object
 * @param {*} result Misc
 * @returns JSON object in format - {success: bool, meta: *, message: string}
 */
const promGetResJson = function (code, msg, result = null) {
    if (code == 200)
        return { success: true, meta: result, message: msg };
    else if (code == 400 || code == 404)
        return { success: false, meta: result, message: msg };
}

app.listen(3001, () => {
    console.log("server running on 3001");
});

module.exports = app;
