import app from "./app.js";

const PORT = process.env.PORT || 5000;

//Testing if server is listening to client requests
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});