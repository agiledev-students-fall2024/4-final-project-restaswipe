const app = require("./app");
require("dotenv").config();

const port = process.env.PORT ?? 8000;

// call a function to start listening to the port
const listener = app.listen(port, function () {
  console.log(`Server running on port: ${port}`)
})

// a function to stop listening to the port
const close = () => {
  listener.close()
}

// export the close function
module.exports = {
  close: close,
}