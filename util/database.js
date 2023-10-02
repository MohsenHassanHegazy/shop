const mongodb =require('mongodb');
const mongoClient =mongodb.MongoClient;
let _db;

const mongoConnect=callback =>{mongoClient.connect
    ('mongodb+srv://mohsen:DZFZpuN88Gmkbdj@cluster0test.mc0rmsv.mongodb.net/?retryWrites=true&w=majority')
    .then(client=>  {
        console.log('www');
        _db=client.db();
        callback(client);
 })
    .catch(err=>{
        console.log(err);
        throw err;
     })
    ;
};
const getdb=()=>{
    if(_db){
        return _db;
     }

     throw 'no dat333333333a base';
 }
 exports.mongoConnect=mongoConnect;
 exports.getdb=getdb;


