require('dotenv').config();
const { FaunaClient } = require('./Faunadoo');
const client = new FaunaClient(process.env.FAUNA_SECRET);

const ferret = {
    Schema: (schemaObj) => {
        return schemaObj;
    },
    
    model: (modelName, userSchema, collectionName) => {
        client.query(
            `Collection('${collectionName}')`
        )
        .then(exists => {
            if (!exists) {
                console.log("collection name", collectionName);
                return client.query(`Collection.create('${collectionName}')`)
            }
        })
        .catch(err => {
            console.error('Error initializing collection:', err);
        });

        return new Model(modelName);
    }
};

class Model {
    collectionName;
  
    constructor(name) {
      this.collectionName = name
    }

    //find all users or find user by specific query
    async find(queryObj) {
        if (typeof queryObj === 'object' && Object.keys(queryObj).length > 0) {
            console.log('queryObj', queryObj);
            for (const key in queryObj) {
                if (queryObj.hasOwnProperty(key)) {
                    const value = queryObj[key];
                    if(key == 'age') {
                        const result = await client.query(
                            `
                                let collection = Collection('${this.collectionName}')
                                collection.where(.${key} == ${value})
                            `
                        )
                        return result;   
                    } else {
                        const result = await client.query(
                            `
                                let collection = Collection('${this.collectionName}')
                                collection.where(.${key} == '${value}')
                            `
                        )
                        return result;                        
                    }

                }
            }
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
        console.log('received data', data);
        const result = await client.query(
            `
                let collection = Collection('${this.collectionName}')
                collection.create({'name': '${data.name}', 'email': '${data.email}', 'age': ${data.age}, 'occupation': '${data.occupation}'})
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
        const result = await client.query(
            `
                let collection = Collection('${this.collectionName}')
                let toUpdate = collection.byId('${id}')
                toUpdate.update({name: '${data.name}', email: '${data.email}', age: ${data.age}, occupation: '${data.occupation}'})
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
    Model
}