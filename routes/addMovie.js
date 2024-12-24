require("dotenv").config();
const express = require("express");
const router = express.Router();
const Movie=require("../models/movie")

router.post("/fetch-movie", async (req, res) => {
  let search_term = req.body.searchTerm;

  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${search_term}&include_adult=false&language=en-US&page=1`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: process.env.TMDB_AUTH_KEY,
      },
    };
    const responseData=await fetch(url,options)
    const result=await responseData.json()
   
    res.render("addMovieList", { movieList: result.results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
});

router.get("/addMovie/:movieId",async(req,res)=>{
    const movieId=req.params.movieId;
    // res.json(movieId)
    try {
        const url=`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`
        const options={
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: process.env.TMDB_AUTH_KEY,
            },
        } 
        const responseData=await fetch(url,options)
        const movieDetails=await responseData.json()
        const watchProvidersUrl=`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`
        const watchProvidersResponse=await fetch(watchProvidersUrl,options)
        const watchProvidersResult=await watchProvidersResponse.json()
        const watchProviders=Object.keys(watchProvidersResult.results).filter((country)=>country==="IN").map((country)=>{
            const countryData=watchProvidersResult.results[country]
            return{
                country,
                providerName:countryData.flatrate?countryData.flatrate[0]?.provider_name:countryData.buy[0]?.provider_name
            }
        })
        movieDetails.watchProviders=watchProviders
        const genreIds=movieDetails.genres.map(genre=>genre.id);
        const genreNames=movieDetails.genres.map(genre=>genre.name)
        movieDetails.genreIds=genreIds;
        movieDetails.genreNames=genreNames;
        movieDetails.production_companies=movieDetails.production_companies.map(company=>company.name)
        movieDetails.watchProviders=movieDetails.watchProviders.map(provider=>provider.provider_name)
       res.render("addMovie",{movieDetails})
    } catch (error) {
        console.log(error);
    res.status(500).json({ error: "Failed to fetch movie details" });
        
    }

})
router.post("/add-movie-details",async(req,res)=>{
    try {
        const movieDetails=req.body
    const genreIds=movieDetails.genreIds.split(",").map(id=>Number(id));
   
    const existingMovie=await Movie.findOne({movieID:movieDetails.id})
    if(existingMovie){
        console.log(`movie with movieId ${movieDetails.id} already exists skipping`)
        return res.status(400).json({error:`movie with movieId ${movieDetails.id} already exists skipping`})
    }
    const newMovie=new Movie({
        movieID:movieDetails.id,
        backdropPath:"https://image.tmdb.org/t/p/original"+movieDetails.backdrop_path,
        budget:Number(movieDetails.budget),
        genreIds:genreIds,
        genres:movieDetails.genres,
        originalTitle:movieDetails.original_title,
        overview:movieDetails.overview,
        ratings:Number(movieDetails.ratings),
        popularity:Number(movieDetails.popularity),
        posterPath:"https://image.tmdb.org/t/p/original"+movieDetails.poster_path,
        productionCompanies:movieDetails.production_companies,
        releaseDate:movieDetails.release_date,
        revenue:Number(movieDetails.revenue),
        runtime:Number(movieDetails.runtime),
        status:movieDetails.status,
        title:movieDetails.title,
        watchProviders:movieDetails.watchProviders,
        logos:"https://image.tmdb.org/t/p/original"+movieDetails.logos,
        downloadLink:movieDetails.downloadLink,
        })
        const saveMovie=await newMovie.save();
        res.render("addMovie",{successMessage:"Movie details submited successfully"})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit movie details" });
    }
    
})
module.exports = router;
