const express=require("express")
const router=express.Router()
const isLoggedIn=require("../routes/isLoggedIn");
const { route } = require("./updateMovie");
const Movie =require("../models/movie")
router.post("/add-to-mylist/:movieId",isLoggedIn,async(req,res)=>{
    try {
        let user=req.user;
        console.log(user)
        console.log(req.params.movieId,"1234")
        user.myList.push(req.params.movieId)
        await user.save()
        res.json({success:true,user})
    } catch (error) {
        res.status(500).json({success:false,error:error.message})
    }
})
router.post("/remove-from-mylist/:movieId",isLoggedIn,async(req,res)=>{
    try {
        const user=req.user;
        user.myList=user.myList.filter(movieId=>movieId!=req.params.movieId)
        await user.save()
        res.json({success:true,user})
    } catch (error) {
        res.status(500).json({success:false,error:error.message})

    }
})
router.get("/mylist",isLoggedIn,async(req,res)=>{
    try {
        const user=req.user;
        const moviesInMyList=await Movie.find({_id:{$in:user.myList}})
        res.json({success:true,moviesInMyList})
    } catch (error) {
        res.status(500).json({success:false,error:error.message})

    }
})
module.exports=router;