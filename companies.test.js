"use strict";

const request = require("supertest");
const app = require("./app");
const db = require("./db");

let company;
//[{}]

let invoice;
//[{}]

beforeEach(async function () {
  let companyResult = await db.query(
    `INSERT INTO companies (code, name, description)
       VALUES ('Amzn', 'Amazon', 'Ecommerce')
       RETURNING code, name , description`);
  company = companyResult.rows[0];

  let invoiceResult = await db.query(
    `INSERT INTO invoices (comp_code, amt)
        VALUES ('Amzn', 999)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`);
  invoice = invoiceResult.rows[0];
});
console.log(company);

afterEach(async function () {
  await db.query(`TRUNCATE invoices, companies CASCADE`);
});

/**this test should list all the company from companies table */
describe("GET /companies", function () {
  it("Gets a list of company", async function () {
    const resp = await request(app).get(`/companies`);
    expect(resp.body).toEqual({"companies": [{
      code: 'Amzn',
      name: 'Amazon'
    }]});
  });
});
