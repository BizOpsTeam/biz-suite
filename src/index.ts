import app from "./app"
import dotenv from "dotenv"

//load Env variables
dotenv.config()

const port = process.env.PORT || 3000
console.log("port Number: ", port)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
