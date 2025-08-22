const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../lib/db");

authRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password, is_business } = req.body;

        const coords = is_business ? req.body.coords : [0, 0];
        const address = is_business ? req.body.address : "none";

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, address, coord_0, coord_1, password_hash, is_business) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [
                name,
                email,
                address,
                coords[0],
                coords[1],
                password_hash,
                is_business,
            ]
        );

        const userId = result.rows[0].id;
        req.session.userId = userId;

        res.send({
            success: true,
        });
    } catch (ex) {
        if (
            ex.constraint == "users_email_key" &&
            ex.routine == "_bt_check_unique"
        ) {
            res.send("email error!");
            return;
        }

        console.log(ex);
        res.send("unknown error!");
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT id, password_hash FROM users WHERE email=$1",
            [email]
        );

        if (result.rowCount == 0) {
            return res.send({
                error: "INVALID_CREDENTIALS",
            });
        }

        const { id, password_hash: passwordHash } = result.rows[0];

        if ((await bcrypt.compare(password, passwordHash)) === false) {
            return res.send({
                error: "INVALID_CREDENTIALS",
            });
        }

        req.session.userId = id;

        res.send({
            success: true,
        });
    } catch (ex) {
        console.log(ex);
        res.send("unknown error!");
    }
});

authRouter.get("/logout", (req, res) => {
    if (req.session.userId === undefined) {
        res.send({
            error: "You are not logged in any account",
            success: false,
        });
    }
    req.session.userId = undefined;
    res.send({
        success: true,
    });
});

authRouter.get("/me", (req, res) => {
    res.send({
        userId: req.session.userId ?? null,
    });
});

module.exports = authRouter;
