const mongoose= require("mongoose");
async function connectDB(){
    await mongoose.connect("mongodb+srv://himanshi:NmHqGLrfFbJqx6nJ@twisted-thread.44x3vpf.mongodb.net/web-project")

    console.log("Connected to DB")
}

module.exports= connectDB