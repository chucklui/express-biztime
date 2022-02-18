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
console.log(company);

afterEach(async function () {
    await db.query(`TRUNCATE invoices, companies CASCADE`);
});

/**this test should list all the company from companies table */
describe("GET /companies", function () {
    it("Gets a list of company from companies", async function () {
        const resp = await request(app).get(`/companies`);

        expect(resp.body).toEqual({
            "companies": [{
                code: 'amzn',
                name: 'Amazon'
            }]
        });
    });
});

describe("GET /companies/:code", function () {
    it("Gets a single company's info from companies", async function () {
        const resp = await request(app).get(`/companies/amzn`);

        expect(resp.body).toEqual({
            "company": {
                code: 'amzn',
                name: 'Amazon',
                description: 'Ecommerce',
                invoices: [expect.any(Number)]
            }
        });
    });

    it("Throws error on invalid code", async function () {
        const resp = await request(app).get(`/companies/aapl`);
        expect(resp.statusCode).toEqual(404);
    })
});

describe("POST /companies/", function () {
    it("Creates a new company record in companies", async function () {
        const resp = await request(app)
            .post('/companies')
            .send({
                code: 'apple',
                name: 'Apple',
                description: 'an apple'
            });

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            "company": {
                code: 'apple',
                name: 'Apple',
                description: 'an apple'
            }
        });
    })
});

describe("PUT /companies/:code", function () {
    it("Updates existing company record in companies", async function () {
        const resp = await request(app)
            .put('/companies/amzn')
            .send({
                name: 'Microsoft',
                description: 'Bill Gates'
            });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            "company": {
                code: 'amzn',
                name: 'Microsoft',
                description: 'Bill Gates'
            }
        });
    });
    it("Throws error on invalid code", async function () {
        const resp = await request(app).get(`/companies/aapl`);
        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            "error": {
                "message": "Company not found",
                "status": 404
            }
        });
    });
});

describe("DELETE /companies/:code", function () {
    it("Deletes existing company record in companies", async function () {
        const resp = await request(app)
            .delete('/companies/amzn');

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ status: "deleted" });
    });
    it("Throws error on invalid code", async function () {
        const resp = await request(app).get(`/companies/aapl`);
        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            "error": {
                "message": "Company not found",
                "status": 404
            }
        });
    });
});
