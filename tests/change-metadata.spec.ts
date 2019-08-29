import "reflect-metadata"

import Chai from "chai";
import { Connection, createConnection, Repository } from "typeorm";
import { Car } from "../src/entities/Car";

describe("comment immutability after column meta change", () => {
    let carRepository: Repository<Car>
    let connection: Connection;

    before(async () => {
        connection = await createConnection("test");
        carRepository = connection.getRepository(Car);

        await carRepository.save(carRepository.create({
            model: "Nissan GT-R"
        }));
    });

    after(async () => {
        await carRepository.delete({});
        await connection.close();
    });

    it("should comment not empty", async () => {
        const entityFieldDescription: { column_name: string, description: string }[]
            = await connection.query("SELECT c.column_name, pgd.description FROM pg_catalog.pg_statio_all_tables AS st "
                + "INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid=st.relid) "
                + "RIGHT OUTER JOIN information_schema.columns c ON (pgd.objsubid=c.ordinal_position AND c.table_schema=st.schemaname AND c.table_name=st.relname) "
                + "WHERE table_schema = $1 and table_name = $2;", ["public", connection.getMetadata(Car).tableName]);

        const carColumns = connection.getMetadata(Car).columns;

        Chai.assert.isArray(entityFieldDescription);
        Chai.assert.isAbove(entityFieldDescription.length, 0);
        Chai.assert.equal(carColumns[1].comment, entityFieldDescription.find(it => it.column_name === carColumns[1].databaseName)!.description)
    });

    it("should comment not empty after change column meta", async() => {
        const entityFieldDescription: { column_name: string, description: string }[]
            = await connection.query("SELECT c.column_name, pgd.description FROM pg_catalog.pg_statio_all_tables AS st "
                + "INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid=st.relid) "
                + "RIGHT OUTER JOIN information_schema.columns c ON (pgd.objsubid=c.ordinal_position AND c.table_schema=st.schemaname AND c.table_name=st.relname) "
                + "WHERE table_schema = $1 and table_name = $2;", ["public", connection.getMetadata(Car).tableName]);

        const carColumns = connection.getMetadata(Car).columns;

        Chai.assert.isAbove(Number(carColumns[1].length), 20)
        Chai.assert.isArray(entityFieldDescription);
        Chai.assert.isAbove(entityFieldDescription.length, 0);
        Chai.assert.equal(carColumns[1].comment, entityFieldDescription.find(it => it.column_name === carColumns[1].databaseName)!.description)
    });
});