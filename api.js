// import axios from "axios"

// const cityEndpoint = (city) => 'http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.WEATHER_API_KEY}'

// const getWeather = async (city) => {

//     let apiResponse = await axios.get(cityEndpoint(city))

//     return {...apiResponse.data, 'source' : 'API'}
// }
// const city = 'Oakland'
// let weather = await getWeather(city)
// console.log(weather)

const axios = require('axios');
const Redis = require('ioredis');

const redis = new Redis({
    'Port': 6379,
    'host': '127.0.0.1'
})
const cityEndpoint = (city) => `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=ef4198d3f5f0f69646ec4c234f82ef22`

const getWeather = async (city) => {

    //check if we have a cached value of the city weather we want
    let cachedEntry = await redis.get(`weather:${city}`)

    // if we have a cache hit
    if (cachedEntry) {
        cachedEntry = JSON.parse(cachedEntry)
        // return that entry
        return {...cachedEntry, 'source' : 'cache'}
    }

    // we must have a cache miss

    // otherwise call api for response

    // calling api for response
    let apiResponse = await axios.get(cityEndpoint(city))
    // on redis-cli, check how many time left using `TTL weather:Mahébourg`
    redis.set(`weather:${city}`, JSON.stringify(apiResponse.data), 'EX', 3600)
    return {...apiResponse.data, 'source' : 'API'}
}

const main = async () => {

    const city = 'Mahébourg'
    //const city = 'Triolet'
    const t0 = new Date().getTime()
    let weather = await getWeather(city)
    const t1 = new Date().getTime()
    weather.apiResponse = `${t1-t0}ms`
    console.log(weather)
    process.exit()
}

main();
