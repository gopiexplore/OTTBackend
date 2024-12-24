const express=require("express")
const router=express.Router();

const passsport=require("passport");
const User = require("../models/User");
router.post("/register",async(req,res)=>{
    try {
        const isAdmin=req.body.isAdmin==true;
        const user=await User.register(new User({username:req.body.username,isAdmin}),req.body.password)
        passsport.authenticate("local")(req,res,()=>{
            res.json({success:true,user})
        })
    } catch (error) {
        res.status(500).json({success:false,error:error.message})
    }

})

router.post("/login",(req,res,next)=>{
    passsport.authenticate("local",(err,user,info)=>{
        if(err){
            return res.status(500).json({success:false,error:err.message})
        }
        if(!user){
            return res.json({success:false,message:"Authenticaiton failed"})
        }
        req.logIn(user,(loginErr)=>{
            if(loginErr){
                return res.status(500).json({success:false,error:loginErr.message})
            }
            return res.json({success:true,user})
        })
    })(req,res,next)

})
router.get("/check-auth",(req,res)=>{
    if(req.isAuthenticated()){
        res.json({authenticated:true,user:req.user});

    }
    else{
        res.json({authenticated:false,user:null})
    }
})
router.get('/logout',(req,res)=>{
    req.logout(err=>{
        if(err){
            return res.status(500).json({success:false,error:err.message});
        }
        res.json({success:true,})
    })
})

router.get("/admin/register",(req,res)=>{
    res.render("adminRegister")
})
router.post("/admin/register", async (req, res) => {
    try {
        const secretCode = req.body.secretCode;
        console.log(req.body);
        if (secretCode !== "abcd1234") {
            return res.render("adminRegister", { errorMessage: "Invalid secret code" });
        }

        const isAdmin = true;
        const user = await User.register(new User({ username: req.body.username, isAdmin }), req.body.password);

        passsport.authenticate('local')(req, res, () => {
    
            res.redirect('/admin/login'); // Respond with a redirect only
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/admin/login",(req,res)=>{
    res.render("adminLogin")
})
router.post("/admin/login",async(req,res,next)=>{
    passsport.authenticate("local",(err,user,info)=>{

        if(err){
            return res.status(500).json({success:false,error:err.message})
        }
        if(!user){
            return res.render("adminLogin",{errorMessage:"Authentication failed"})
        }
        if(!user.isAdmin){
            return res.render("adminLogin",{errorMessage:"You are not an admin"})
        }
        req.logIn(user,(loginErr)=>{
            if(loginErr){
                return res.status(500).json({success:false,error:loginErr.message});
            }
            console.log("Login Suceessful")
            res.redirect('/')
        })
    })(req,res,next);
})

router.get("/admin/logout",(req,res)=>{
    req.logOut(err=>{
        if(err){
            return res.status(500).json({success:false,error:err.message})
        }
        res.redirect('/admin/login')
    })
})

module.exports=router;