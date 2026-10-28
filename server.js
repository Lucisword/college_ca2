
const express=require('express')
const mongoose=require('mongoose')
require('dotenv').config()

const connectDB=require('./config/db')
const Book=require('./Book')

const app=express()
app.use(express.json())

const PORT=process.env.PORT || 8000


app.post('/api/books',async(req,res)=>{
    try{
        const {title,author,category}=req.body

        if(typeof title!=='string' || !title.trim()){
            return res.status(400).json({
                message:"Title???"
            })
        }

        const newbook=new Book({
            title:title.trim(),
            author:author,
            category:category
        })

        await newbook.save()

        res.status(201).json({
            message:"Book added",
            book:newbook
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})



app.get('/api/books',async(req,res)=>{
    try{
        const page=parseInt(req.query.page) || 1
        const limit=parseInt(req.query.limit) || 5

        if(page<1 || limit<1 ||
           !Number.isInteger(page) ||
           !Number.isInteger(limit)){
            return res.status(400).json({
                message:"Page & limit need to be positive"
            })
        }

        const skip=(page-1)*limit

        const books=await Book.find()
            .skip(skip)
            .limit(limit)

        const total=await Book.countDocuments()

        res.status(200).json({
            currentPage:page,
            totalRecords:total,
            totalPages:Math.ceil(total/limit),
            books:books
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})



app.patch('/api/books/:id',async(req,res)=>{
    try{
        const id=req.params.id
        const available=req.body.available

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                message:"IBook Id wrong"
            })
        }

        if(typeof available!=='boolean'){
            return res.status(400).json({
                message:"Availability true or false"
            })
        }

        const book=await Book.findById(id)

        if(!book){
            return res.status(404).json({
                message:"Book not found"
            })
        }

        book.available=available
        await book.save()

        res.status(200).json({
            message:"Bookgitpwd updated",
            book:book
        })
    }
    catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})



const startServer=async()=>{
    await connectDB()

    app.listen(PORT,()=>{
        console.log(`Server started at port ${PORT}`)
    })
}

startServer()
