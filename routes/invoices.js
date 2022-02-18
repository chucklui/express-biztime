"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const router = new express.Router();

/**queries all records from invoices table:
 {invoices: [{id, comp_code}, ...]} */
router.get('/', async function (req, res) {
    const result = await db.query(
        `SELECT id, comp_code 
          FROM invoices
          ORDER BY id`);

    const invoices = result.rows;

    return res.json({ invoices });
});

/**query a single record from invoice table and 
 return invoice or 404
 {invoice: {id, amt, paid, add_date, paid_date, 
            company: {code, name, description}} */
router.get('/:id', async function (req, res) {
    const id = parseInt(req.params.id);
    const invoiceResult = await db.query(
        `SELECT id, amt, paid, add_date, paid_date
            FROM invoices
            WHERE id=$1`,
        [id]);

    const invoice = invoiceResult.rows[0];
    if (!invoice) throw new NotFoundError(`Not Found: invoice ${id}!`);

    const companyResult = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code=$1`,
        [invoice.comp_code]);

    const company = companyResult.rows[0];
    invoice.company = company;

    return res.json({ invoice });
});

/**takes in {comp_code, amt} and 
 create a record in the invoices table and returns 
 {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.post('/', async function (req, res) {
    const comp_code = req.body.comp_code;
    const amt = req.body.amt;
    const invoiceResult = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]);

    const invoice = invoiceResult.rows[0];

    return res.status(201).json({ invoice });
});

/**accepts {amt} and update a record from invoices table based on id in params
 returns invoice or 404
 {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put('/:id', async function (req, res) {
    const id = parseInt(req.params.id);
    const amt = req.body.amt;

    const invoiceResult = await db.query(
        `UPDATE invoices
            SET amt=$1
            WHERE id=$2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, id]);

    const invoice = invoiceResult.rows[0];
    if (!invoice) throw new NotFoundError(`Not Found: invoice ${id}!`);

    return res.json({ invoice });
});

/** accepts id from params and deletes matching invoice from invoices table
 * returns {status: "deleted"} or 404
 */

router.delete("/:id", async function (req, res) {
    const id = parseInt(req.params.id);
    const invoiceResult = await db.query(
        `DELETE FROM invoices
            WHERE id=$1
            RETURNING id`,
        [id]
    );
    const invoice = invoiceResult.rows[0];
    if (!invoice) throw new NotFoundError(`Not Found: invoice ${id}!`);

    return res.json({ status: "deleted" });
});


module.exports = router;