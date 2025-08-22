const express = require("express");
const businessRouter = express.Router();
const pool = require("../lib/db");

businessRouter.get("/items/all", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, description, amount FROM items WHERE owner_id=$1",
            [req.session.userId]
        );

        res.send({
            success: true,
            items: result.rows,
        });
    } catch (e) {
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

businessRouter.post("/items/add", async (req, res) => {
    try {
        const { name, description, amount } = req.body;

        const result = await pool.query(
            "INSERT INTO items(name, description, amount, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, description, amount",
            [name, description, amount, req.session.userId]
        );

        res.send({
            success: true,
            item: result.rows[0],
        });
    } catch (e) {
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

businessRouter.post("/items/delete", async (req, res) => {
    try {
        const { id } = req.body;

        const result = await pool.query(
            "SELECT owner_id FROM items WHERE id=$1",
            [id]
        );

        if (result.rowCount == 0) {
            res.send({
                success: false,
                error: "ITEM_DOES_NOT_EXIST",
            });
            return;
        } else if (result.rows[0].owner_id != req.session.userId) {
            res.send({
                success: false,
                error: "NO_AUTHORITY",
            });
            return;
        }

        await pool.query("DELETE FROM items WHERE id=$1", [id]);

        res.send({
            success: true,
        });
    } catch (e) {
        console.log(e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

businessRouter.post("/items/mutate", async (req, res) => {
    try {
        const { id, name, description, amount } = req.body;

        const result = await pool.query(
            "SELECT owner_id FROM items WHERE id=$1",
            [id]
        );

        if (result.rowCount == 0) {
            res.send({
                success: false,
                error: "ITEM_DOES_NOT_EXIST",
            });
            return;
        } else if (result.rows[0].owner_id != req.session.userId) {
            res.send({
                success: false,
                error: "NO_AUTHORITY",
            });
            return;
        }

        await pool.query(
            "UPDATE items SET name=$1, description=$2, amount=$3 WHERE id=$4",
            [name, description, amount, id]
        );

        res.send({
            success: true,
        });
    } catch (e) {
        console.log(e);
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

module.exports = businessRouter;
