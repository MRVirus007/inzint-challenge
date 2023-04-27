const express = require("express");
const app = express();
const cors = require("cors");
// routes
const uploadRoute = require("./routes/upload");

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: '*',
        optionsSuccessStatus: 200,
    })
);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "server is up and running"
    });
});

app.use("/api/upload-video", uploadRoute);

// page not found error handling
app.use("*", (req, res, next) => {
    const error = {
        status: 404,
        message: "Api endpoint does not found",
    };
    next(error);
});

// global error handling
app.use((err, req, res, next) => {
    console.log(err);
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    const data = err.data || null;
    res.status(status).json({
        type: "error",
        message,
        data,
    });
});

app.listen(5000, () => console.log(`Server listening on port 5000`));