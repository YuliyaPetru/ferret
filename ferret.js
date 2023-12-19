require('dotenv').config();
const { FaunaClient } = require('./Faunadoo');
const client = new FaunaClient(process.env.FAUNA_SECRET);
class Schema {
    constructor(schemaObj) {
        this.schema = schemaObj;
    }

    getSchema() {
        return this.schema;
    }
};

const ferret = {
    Schema,

    model: (modelName, schemaObj, collectionName) => {
        client.query(`Collection.create({name: '${collectionName}'})`)
        .catch(err => {
            // console.error('Error initializing collection:', err);
            console.error('This collection already exists, you are good to go.');
        });

        return new Model(modelName, schemaObj, collectionName);
    }
};

class Model {
    collectionName;
    schema;
  
    constructor(name, schemaObj) {
        this.collectionName = name;
        this.schema = schemaObj;
    }

    //find all users or find user by specific query
    async find(queryObj) {
        if (typeof queryObj === 'object' && Object.keys(queryObj).length > 0) {
            const key = Object.keys(queryObj)[0];
            const value = queryObj[key];
            const schemaType = this.schema.schema[key];
    
            let query;
    
            if (schemaType === Number) {
                query = `
                    let collection = Collection('${this.collectionName}')
                    collection.where(.${key} == ${value})
                `;
            } else {
                query = `
                    let collection = Collection('${this.collectionName}')
                    collection.where(.${key} == '${value}')
                `;
            }
    
            const result = await client.query(query);
            return result;
        } else {
            const result = await client.query(
                `
                    let collection = Collection('${this.collectionName}')
                    collection.all()
                `
            );
            return result;
        }
    }    

    //add one new user
    async create(data) {
        const objectToCreate = {};
    
        Object.keys(data).forEach(key => {
            if (this.schema.schema.hasOwnProperty(key)) {
                objectToCreate[key] = data[key];
            }
        });
    
        const result = await client.query(
            `
                let collection = Collection('${this.collectionName}')
                collection.create(${JSON.stringify(objectToCreate)})
            `
        );
    
        return result;
    }

    //find by id
    async findById(id) {
        const result = await client.query(
            `
                let collection = Collection('${this.collectionName}')
                collection.byId('${id}')
            `
        );
        return result;
    }

    //update by id
    async findByIdAndUpdate(id, data) {
        const objectToUpdate = {};
    
        Object.keys(data).forEach(key => {
            if (this.schema.schema.hasOwnProperty(key)) {
                objectToUpdate[key] = data[key];
            }
        });
    
        const result = await client.query(
            `
                let collection = Collection('${this.collectionName}')
                let toUpdate = collection.byId('${id}')
                toUpdate.update(${JSON.stringify(objectToUpdate)})
            `
        );
    
        return result;
    }    

    //delete by id
    async findByIdAndDelete(id) {
        const result = await client.query(
            `
                let collection = Collection('${this.collectionName}')
                let toDelete = collection.byId('${id}')
                toDelete.delete()
            `
        );
        return ("User has been deleted", result);
    }
}

module.exports = {
    ferret,
    Schema,
    Model
}