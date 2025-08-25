const express = require("express");
const customerRouter = express.Router();
const pool = require("../lib/db");

customerRouter.get("/sellers", async (req, res) => {
    try {
        const itemsResult = await pool.query("SELECT * FROM items");
        const usersResult = await pool.query(
            "SELECT id, name, address, coord_0, coord_1 FROM users WHERE is_business=true"
        );

        const sellers = {};

        usersResult.rows.forEach((user) => {
            sellers[user.id] = {
                id: user.id,
                name: user.name,
                address: user.address,
                coords: [user.coord_0, user.coord_1],
                items: [],
            };
        });

        itemsResult.rows.forEach((item) => {
            if (sellers[item.owner_id] === undefined) return;

            sellers[item.owner_id].items.push(item);
        });

        res.send({
            success: true,
            sellers: Object.values(sellers),
        });
    } catch (e) {
        res.send({
            success: false,
            error: "UNKNOWN_ERROR",
        });
    }
});

module.exports = customerRouter;
