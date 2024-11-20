import app from "./app.js";

const port = process.env.PORT ?? 8000

const listener = app.listen(port, function () {
  console.log(`Server running on port: ${port}`)
})

const close = () => {
  listener.close()
}

export { close }
