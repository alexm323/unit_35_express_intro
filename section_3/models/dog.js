const db = require("../db");
const ExpressError = require('../expressError.js')

class Dog {
    constructor(id, name, age) {
        this.id = id;
        this.name = name;
        this.age = age;
    }
    static async getAll() {
        const results = await db.query(`SELECT id,name,age FROM dogs`)
        // console.log(results.rows)
        // this will be in the same order as the query, and we are mapping a new array of dogs from the results.rows
        const dogs = results.rows.map(row => new Dog(row.id, row.name, row.age));
        // console.log(dogs)
        return dogs
    }

    static async getById(id) {
        const results = await db.query(`SELECT id,name,age FROM dogs WHERE id = $1`, [id])
        const dog = results.rows[0]
        if (!dog) {
            throw new ExpressError('Dog not found', 404)
        }
        return new Dog(dog.id, dog.name, dog.age)
    }
    static async create(newName, newAge) {
        const results = await db.query(`INSERT INTO dogs (name,age) VALUES($1,$2) RETURNING id,name,age`, [newName, newAge])
        const { id, name, age } = results.rows[0];
        // this is still the same order as we defined in our constructor 
        return new Dog(id, name, age);
    }

    async remove() {
        await db.query(`DELETE FROM dogs WHERE id=$1 `, [this.id])
    }

    async save() {
        const results = await db.query(`UPDATE dogs SET name = $1, age=$2 WHERE id = $3`, [this.name, this.age, this.id]);
    }
    speak() {
        console.log(`${this.name} says WOOF!!!`)
    }
}

module.exports = Dog;