//import functionality in node js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const connection = require('./connection')
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const app = express()


//middleware of express
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(fileUpload());
app.use(express.static('orderImages'))
app.use(cookieParser())


//add message in database
app.post('/connect', async (req, res) => {
    try {
        const allData = req.body;
        const data = await new connection.connectModel(allData)
        data.save()
        res.send(data)
    } catch (err) {
        res.send(err)
    }
})


app.delete('/connect',async(req,res) => {
    try{
        const deletes = await connection.connectModel({ _id: req.body.id })
        const deleteData = await deletes.deleteOne()
        res.send(deleteData)
    }catch(err){
        res.send(err)
    }
})
app.get('/connect',async(req,res) => {
    try{
        const data = await connection.connectModel.find();
        res.send(data)
    }catch(err){
        res.send(err)
    }
})


//add orders in database
app.post('/placeOrder',async (req, res) => {
    try{
        const file = req.files.myFile;
        const name = req.body.name;
        const email = req.body.email;
        const projectName = req.body.projectName;
        const details = req.body.details;
        const price = req.body.price;
        const userEmail = req.body.userEmail;
        const filePath = `${__dirname}/orderImages/${file.name}`
        file.mv(filePath,async (err) => {
            if (err) {
                res.send(err)
            }

            const image = fs.readFileSync(filePath)
            const enImg = image.toString('base64')
            const img = {
                contentType: file.mimetype,
                img: Buffer.from(enImg, 'base64')
            }
            const status = 'pending';
            const orderData = { name, email, projectName, details, price, userEmail, status, img }
            const orderSave = await connection.orderModel(orderData)
            orderSave.save()
                .then(result => {
                    fs.remove(filePath, err => {
                        res.send(err)
                    })
                    res.send(result)
                })
        })
    }catch(err){
        res.send(err)
    }
})


//get order data from database
app.get('/placeOrder', async (req, res) => {
    try {
        const get = await connection.orderModel.find();
        res.send(get)
    } catch (err) {
        res.send(err)
    }
})

//delete order from database
app.delete('/placeOrder', async (req, res) => {
    try {
        const deletes = connection.orderModel({ _id: req.body.id })
        const data = await deletes.deleteOne()
        res.send(data)
    }catch(err){
        res.send(err)
    }
})

//update order from database 

app.patch('/placeOrder',async (req,res) => {
    try{
        const update =await connection.orderModel.updateOne({_id:req.body.id},{status:req.body.value})
        res.send(update)
    }catch(err){
        res.send(err)
    }
})

//add review in database
app.post('/review',async(req,res) => {
    try{
        const reviewData = connection.reviewModel(req.body)
        const data = await reviewData.save()
        res.send(data)
    }catch(err){
        res.send(err)
    }
})

app.get('/review',async(req,res) => {
    const reviewData =await connection.reviewModel.find()
    res.send(reviewData)
})

app.patch('/review',async(req,res) => {
    try{
        const updateReview =await connection.reviewModel.updateOne({_id:req.body.id},{status:req.body.newStatus})
        res.send(updateReview)
    }catch(err){
        res.send(err)
    }
})

app.delete('/review',async(req,res) => {
    try{
        const deletes = await connection.reviewModel({ _id: req.body.id })
        const deleteData = await deletes.deleteOne()
        res.send(deleteData)
    }catch(err){
        res.send(err)
    }
})

//add admin

app.post('/addAdmin',async(req,res) => {
    try{
        const hashPassword =await bcrypt.hash(req.body.password,10)
        const adminOb = {email:req.body.email,password:hashPassword,status:'admin'}
        const saveData = connection.addAdminModel(adminOb)
        const data =await saveData.save()
        res.send(data)
    }catch(err){
        res.send(err)
    }
})

//login admin
app.post('/adminLogin',async(req,res) => {
    try{
        const findData = await connection.addAdminModel.findOne({email:req.body.email})
        const checkPass = await bcrypt.compare(req.body.password,findData.password)

        if(checkPass == true){
            const token = await findData.createTokens('login')
            res.send({information:'success',token})
        }else{
            res.send({information:'error'})
        }
    }catch(err){
        res.send({information:'error'})
    }
})
 


app.listen(process.env.PORT || 8000)