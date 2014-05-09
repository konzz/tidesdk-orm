'use strict';

describe('model', function(){
    var dbaccess;
    var usersModel;
    beforeEach(function(){
        dbaccess = Ti.Database.open('tests');
        dbaccess.execute("DROP TABLE IF EXISTS users");
        usersModel = timodel('users', {name: 'TEXT', age: 'INTEGER'}, dbaccess);
        usersModel.createTable();
    });

    describe('createTable', function(){
        it('should create the resource table if not exists with the provided schema', function(){

            var usersModel = timodel('users', {name: 'TEXT', age: 'INTEGER'}, dbaccess);
            usersModel.createTable();
            var result = dbaccess.execute("SELECT * FROM sqlite_master WHERE type='table' AND name='users';");
            expect(result.fieldByName('name')).toBe('users');

            result = dbaccess.execute('PRAGMA table_info(users)');
            var schema = usersModel.rowsToCollection(result);
            expect(schema[0].name).toBe('id');
            expect(schema[0].type).toBe('INTEGER');
            expect(schema[1].name).toBe('name');
            expect(schema[1].type).toBe('TEXT');
            expect(schema[2].name).toBe('age');
            expect(schema[2].type).toBe('INTEGER');
        });
    });

    describe('find', function(){

        beforeEach(function(){
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('John Snow', 22)");
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('Arya Stark', 12)");
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('Sansa Stark', 16)");
        });

        it('should get all the resources', function(){
            var users = usersModel.find();

            expect(users.length).toBe(3);
            expect(users[0].id).toBe(1);
            expect(users[0].name).toBe('John Snow');
            expect(users[0].age).toBe(22);
        });

        it('should search by the given properties', function(){
            var users = usersModel.find({id: 2});
            expect(users).toEqual([{id: 2, name: 'Arya Stark', age: 12}]);
        });

        it('should return an empty array if no matches', function(){
            var users = usersModel.find({id: 234});
            expect(users).toEqual([]);
        });
    });

    describe('create', function(){
        it('should create the resource and return it', function(){
            var user = usersModel.create({name: 'The Hound', age: 34});
            expect(user).toEqual({id: 1, name: 'The Hound', age: 34});
        });
    });

    describe('update', function(){
        it('should update the element and return it', function(){
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('John Snow', 22)");
            
            var johnSnow = {id: 1, name: 'Lord coamandant', age:23};
            var updatedJohnSnow = usersModel.update(johnSnow);
            var findedJohnSnow = usersModel.find({id: 1});

            expect(updatedJohnSnow).toEqual({id: 1, name: 'Lord coamandant', age:23});
            expect(findedJohnSnow).toEqual([{id: 1, name: 'Lord coamandant', age:23}]);
        });
    });

    describe('remove', function(){
        it('should delete the element from the table', function(){
            
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('John Snow', 22)");
            expect(usersModel.find({id:1}).length).toBe(1);
            
            usersModel.remove(1);
            expect(usersModel.find({id:1}).length).toBe(0);
        });
    });

});