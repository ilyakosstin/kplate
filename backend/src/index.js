require("dotenv").config();

const express = require("express");
const cookieSession = require("cookie-session");
const cors = require("cors");

const pool = require("./lib/db");
const app = express();

const authRouter = require("./routes/auth");
const businessRouter = require("./routes/business");
const customerRouter = require("./routes/customer");
const { businessOnly } = require("./lib/auth");

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(
    cookieSession({
        name: "session",
        keys: [process.env.SECRET_KEY],
    })
);
app.use("/auth", authRouter);
app.use("/business", businessOnly, businessRouter);
app.use("/customer", customerRouter);

app.listen(process.env.PORT, () => {
    console.log("app is runnin");
});
