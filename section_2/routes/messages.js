/** Routes for messages of pg-relationships-demo. */

const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");

router.get('/:id', async (req, res, next) => {
    try {

        const results = await db.query(`SELECT m.id, m.msg, t.tag
            FROM messages AS m 
            LEFT JOIN messages_tags AS mt 
            ON m.id = mt.message_id 
            LEFT JOIN tags AS t 
            ON mt.tag_code = t.code
            WHERE m.id = $1`, [req.params.id])
        // res.send(results.rows)
        if (results.rows.length === 0) {
            throw new ExpressError(`Message not found with id ${req.params.id}`, 404)
        }
        const { id, msg } = results.rows[0];
        // we are getting back an array of tags, and we could make a loop and append that to an empty array but its easiest to just get the tags and map them to a new array 
        const tags = results.rows.map(r => r.tag);
        // now we can send back our own customized version where we just send id, msg and tags
        // return res.send(results.rows)
        // here is the short hand way to do it where we don't write the property and the name twice 
        return res.send({ id, msg, tags })

    } catch (e) {
        return next(e)
    }
})

router.patch('/:id', async (req, res, next) => {
    try {
        // const msgSelect = await db.query(`SELECT id,msg FROM messages WHERE id = $1`, [req.params.id]);
        // if (msgSelect.rows.length === 0) {
        //     throw new ExpressError('Message not found', 404)
        // }
        const results = await db.query(
            `UPDATE messages  SET msg = $1 WHERE id = $2 RETURNING id,user_id,msg`, [req.body.msg, req.params.id]
        )
        if (results.rows.length === 0) {
            throw new ExpressError('Message not found', 404)
        }
        return res.json(results.rows[0])
    } catch (e) {
        return next(e)
    }
})

module.exports = router;