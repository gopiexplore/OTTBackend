const express = require("express");
const router = express.Router();
const isLoggedIn = require("./isLoggedIn");
const Movie = require("../models/movie");

router.post("/update-watched-time/:movieId", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    const movieId = req.params.movieId;
    const watchedTime = req.body.watchedTime;

    const movieToUpdate = user.watchedMovies.find((item) =>
      item.movie.equals(movieId)
    );
    if (movieToUpdate) {
      movieToUpdate.watchedTime = watchedTime;
      const movieDetails = await Movie.findById(movieId);
      if (movieDetails) {
        movieToUpdate.uploadTime = Date.now();
      }
    } else {
      const movieDetails = await Movie.findById(movieId);
      if (movieDetails) {
        user.watchedMovies.push({
          movie: movieId,
          watchedTime: watchedTime,
          uploadTime: Date.now(),
        });
      }
    }

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/remove-watched-movie/:movieId",isLoggedIn,async(req,res)=>{
    try {
        const user=req.user;
        const movieIdToRemove=req.params.movieId;
        const movieIndexToRemove=user.watchedMovies.findIndex(item=>item.movie.equals(movieIdToRemove))
        if(movieIndexToRemove !==-1){
            user.watchedMovies.splice(movieIndexToRemove,1)
            await user.save()
            res.json({success:true,message:"Movie removed from watched list successfully"})
        }else{
            res.status(404).json({success:false,message:"Movie not found in watched list"})
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });

    }
})
router.post("/remove-all-watched-movies",isLoggedIn,async(req,res)=>{
    try {
        const user=req.user;
        //clear the watched Movies array
        user.watchedMovies=[]
        await user.save();
        res.json({success:true,message:"All Watched movies removed successfully"})
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });

    }
})
router.get("/watched-time/:movieId",isLoggedIn,async(req,res)=>{
    try {
        const user=req.user;
        const movieId=req.params.movieId;
        //find the movie in the users watchedmovies and retrieve the watched time
        const movieWatchedTime=user.watchedMovies.find(item=>item.movie.equals(movieId))
        if(movieWatchedTime){
            res.json({success:true,watchedTime:movieWatchedTime.watchedTime})

        }else{
            res.json({success:true,watchedTime:0});
        }
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
router.get("/watched-movies",isLoggedIn,async(req,res)=>{
    try {
        const user=req.user;
        const watchedMovies=await Promise.all(user.watchedMovies.map(async({movie,watchedTime,uploadTime})=>{
            const movieDetails=await Movie.findById(movie)
            return {
                movie:movieDetails,
                watchedTime,
                uploadTime,
            }
        }))
        watchedMovies.sort((a,b)=>b.uploadTime-a.uploadTime)
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });

    }

})
module.exports = router;
