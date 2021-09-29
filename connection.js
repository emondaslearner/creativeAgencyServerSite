const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()


//connection
const url =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9pksi.mongodb.net/creativeAgency?retryWrites=true&w=majority`

mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true })


//Schema
const connectStr = mongoose.Schema({
    name:String,
    email:String,
    sms:String,
    date:{
        type:Date,
        default:Date.now
    },
}) 

const orderStr = mongoose.Schema({
    name:String,
    email:String,
    projectName:String,
    details:String,
    price:Number,
    status:String,
    userEmail:String,
    img:{
        img: Buffer,
        contentType: String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const reviewStr = mongoose.Schema({
    name:String,
    email:String,
    description:String,
    status:{
        type:String,
        default:'Unapproved'
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const addAdminStr = mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    password:String,
    status:String,
    date:{
        type:Date,
        default:Date.now
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }] 
})

//create jwt token
addAdminStr.methods.createTokens = async function(){
    const token =await jwt.sign({_id:this._id},'iamemoniamlearnningwebdevelopmentandmern')
    this.tokens = this.tokens.concat({token:token})
    this.save()
    return token;
}


//models
const connectModel = new mongoose.model('connect',connectStr)

const orderModel = new mongoose.model('order',orderStr)

const reviewModel = new mongoose.model('review',reviewStr)

const addAdminModel = new mongoose.model('admin',addAdminStr);





//exports
module.exports.connectModel = connectModel;
module.exports.orderModel = orderModel;
module.exports.reviewModel = reviewModel;
module.exports.addAdminModel = addAdminModel;