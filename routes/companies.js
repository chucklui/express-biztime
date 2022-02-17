"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const router = new express.Router();

/** Queries all records in companies table,
 *  returns list of companies
 * {companies: [{code, name}, ...]}
 */

router.get('/', async function (req, res, next) {
    const result = await db.query(
        `SELECT code, name 
            FROM companies
            ORDER BY code`);
    const companies = result.rows;
    return res.json({ companies });
});

/** Queries single company with code pk in companies table,
 *  returns record or 404 
 * {company: {code, name, description}}
 */

router.get('/:code', async function (req, res, next) {
    const code = req.params.code;
    const result = await db.query(
        `SELECT code, name, description
            FROM companies 
            WHERE code = $1`,
        [code]);

    if (result.rows.length === 0) {
        throw new NotFoundError("Company not found");
    }
    const company = result.rows[0];
    return res.json({ company });
});

/** Creates new record in companies table with { name, description }
 * returns {company: {code, name, description}}
 */
router.post('/', async function (req, res, next) {
    const { code, name, description } = req.body;
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
        [code, name, description]
    );
    const company = result.rows[0];
    return res.status(201).json({ company });
});

/** Updates existing record in companies table with { name, description }
 * returns updated record or 404
 * {company: {code, name, description}}
 */

router.put("/:code", async function (req, res, next) {
    const { name, description } = req.body;

    const result = await db.query(
        `UPDATE companies
            SET name=$1,
                description=$2
            WHERE code=$3
            RETURNING code, name, description`,
        [name, description, req.params.code]);

    if (result.rows.length === 0) {
        throw new NotFoundError("Company not found");
    };
    const company = result.rows[0];
    return res.json({ company });
});

/** Deletes record with code pk in companies table,
 * returns {status: "deleted"} or 404
 */

router.delete("/:code", async function (req, res, next) {
    const result = await db.query(
        `DELETE FROM companies 
            WHERE code=$1
            RETURNING code`,
        [req.params.code]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError("Company not found");
    };
    return res.json({ status: "deleted" });
})




module.exports = router;