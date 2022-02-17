"use strict";

const express = require("express");
const { route } = require("../app");
const db = require("../db");
const { NotFoundError } = require("./expressError");
const router = new express.Router();

route.get('/', async function (req, res, next) {
  const result = await db.query(`SELECT code, name FROM companies`);
  const companies = result.rows;
  return res.json({ companies });
});

route.get('/:code', async function (req, res, next) {
  const code = req.params.code;
  const result = await db.query(
    `SELECT code, name, code 
    FROM companies 
    WHERE code = $1`,
    [code]);
  const company = result.rows[0];
  return res.json({ company });
});

route.post('/', async function(req, res, next){
  const {code, name, description} = req.body;
  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description]
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});




module.exports = router;