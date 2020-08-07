import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import server from "./server"

const {DB_USER, DB_PASSWORD, DB_NAME, PORT} = process.env
const URI = `mongodb://${DB_USER}:${DB_PASSWORD}@test101-shard-00-00-qeqhq.mongodb.net:27017,test101-shard-00-01-qeqhq.mongodb.net:27017,test101-shard-00-02-qeqhq.mongodb.net:27017/${DB_NAME}?ssl=true&replicaSet=test101-shard-0&authSource=admin&retryWrites=true&w=majority`
const createServer = async () => {
  try {
    await mongoose.connect(URI,{ 
      useUnifiedTopology: true, useNewUrlParser:true 
      } 
    )
    const app = express()

    server.applyMiddleware({ app })
    app.listen({ port: PORT }, () =>
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    )
  } catch (error) {console.log(error)}
}

createServer()
