const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv').config();

const hbs = require("express-handlebars");

const sequelize = require("./database/config");

const { StoreImages } = require("./models/StoreImages");

sequelize.sync({})
.then(() => {
    const app = express();
    let PORT = process.env.PORT || 3000;
    
    app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'main-layout', layoutsDir: __dirname + '/views/layouts/' }));
    app.set('view engine', 'hbs');
    app.set('views', './views');
    
    const fileStorageEngine = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './images');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now()+ '--' +file.originalname);
        }
    });

  
    
    const fileFilter = (req, file, cb) => {
        // Reject a file
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
            cb(null, true);
        }else{
            cb(new Error('File type not supported'));
        }
    };
    
    const upload = multer({
        storage: fileStorageEngine,
        limits: {
            fileSize: 1024 * 1024 * 5 // Accept files to 5mb only
        }, 
        fileFilter: fileFilter
    });
    
    app.get("/", (req, res) => {
        return res.render('index');
    });
    
    app.post('/single', upload.single('image'), async (req, res) => {
        try{
            console.log("Single File Upload: ", req.file);

            if(req.file == undefined || null){
                throw new Error("Sorry, you will need to upload file before you can submit a request!");
            }

            let storeImage = await StoreImages.create({
                images: req.file.path
            });

            if(!storeImage){
                throw new Error('Sorry, something went wrong while trying to upload the image!');
            }

            res.status = 200;
            res.render("index", {
                success: true,
                message: "Your image successfully stored!"
            });
        }catch(err){
            console.log("POST Single Error: ", err);

            res.status = 406;
            return res.render('index', {
                error: true,
                message: err.message
            })
        }
    });
    
    app.post('/multiple',  upload.array('images', 3), async(req, res, next) => {
        try{
            console.log("POST Multiple Files: ", req.files);

            if(req.files.length == 0){
                throw new Error("Sorry, you will need to upload files before you can submit a request!");
            }

            for(let i = 0; i < req.files.length; i++){
                let storeImage = await StoreImages.create({
                    images: req.files[i].path
                });
    
                if(!storeImage){
                    throw new Error('Sorry, something went wrong while trying to upload the image!');
                }
            }

            res.status = 200;
            res.render("index", {
                success: true,
                message: "Your images successfully stored!"
            });
        }catch(err){
            console.log("POST Multiple Error: ", err);

            res.status = 406;
            return res.render('index', {
                error: true,
                message: err.message
            })
        }
    });

    app.use(async (err, req, res, next) => {
        if(err){
            res.status = err.statusCode || err.status || 500;

            if(err.code == "LIMIT_UNEXPECTED_FILE"){
                return res.render('index', {
                    error: true,
                    message: "Sorry, the maximum number of allowed files to upload is 3!"
                });
            }else{
                return res.render('index', {
                    error: true,
                    message: err.message
                });
            }
           
        }
        await next();
    });

    app.listen(PORT, (err) => {
        if(err) console.log("Error Occured: ", err);
        console.log("Server is running on port: http://localhost:"+ PORT);
    });
}).catch((err) => {
    console.log("Sync error: ", err);
    throw new Error("Sorry, something went wrong on our side, please try again later!");
});