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
            VALUES ('amzn', 'Amazon', 'Ecommerce')
            RETURNING code, name , description`);
    company = companyResult.rows[0];

    let invoiceResult = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES ('amzn', 999)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`);
    invoice = invoiceResult.rows[0];
});

/**this test should list of all the invoices from invoices table */
describe("GET /invoices", function () {
  it("Gets a list of invoices from invoices", async function () {
      const resp = await request(app).get(`/invoices`);

      expect(resp.body).toEqual({
          "invoices": [{
              id: expect.any(Number),
              comp_code: 'amzn'
          }]
      });
  });
});

// describe("DELETE /invoices/:id", function () {
//   it("Deletes existing invoice record in invoices", async function () {
//       const resp = await request(app)
//           .delete('/companies/amzn');

//       expect(resp.statusCode).toEqual(200);
//       expect(resp.body).toEqual({ status: "deleted" });
//   });
//   it("Throws error on invalid code", async function () {
//       const resp = await request(app).get(`/companies/aapl`);
//       expect(resp.statusCode).toEqual(404);
//       expect(resp.body).toEqual({
//           "error": {
//               "message": "Company not found",
//               "status": 404
//           }
//       });
//   });
// });