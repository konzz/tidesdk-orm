'use strict';

describe('model', function(){
    var dbaccess;
    var usersModel;
    beforeEach(function(){
        dbaccess = Ti.Database.open('tests');
        dbaccess.execute("DROP TABLE IF EXISTS users");
        usersModel = timodel('users', {name: 'TEXT', surname: 'TEXT', age: 'INTEGER'}, dbaccess);
        usersModel.createTable();
    });

    describe('createTable', function(){
        it('should create the resource table if not exists with the provided schema', function(){

            var result = dbaccess.execute("SELECT * FROM sqlite_master WHERE type='table' AND name='users';");
            expect(result.fieldByName('name')).toBe('users');

            result = dbaccess.execute('PRAGMA table_info(users)');
            var schema = usersModel.rowsToCollection(result);
            expect(schema[0].name).toBe('id');
            expect(schema[0].type).toBe('INTEGER');
            expect(schema[1].name).toBe('name');
            expect(schema[1].type).toBe('TEXT');
            expect(schema[2].name).toBe('surname');
            expect(schema[2].type).toBe('TEXT');
            expect(schema[3].name).toBe('age');
            expect(schema[3].type).toBe('INTEGER');
        });
    });

    describe('find', function(){

        beforeEach(function(){
            dbaccess.execute("INSERT INTO Users (name, surname, age) VALUES('John', 'Snow', 22)");
            dbaccess.execute("INSERT INTO Users (name, surname, age) VALUES('Arya', 'Stark', 12)");
            dbaccess.execute("INSERT INTO Users (name, surname, age) VALUES('Sansa', 'Stark', 16)");
        });

        it('should get all the resources', function(){
            var users = usersModel.find();

            expect(users.length).toBe(3);
            expect(users[0].id).toBe(1);
            expect(users[0].name).toBe('John');
            expect(users[0].surname).toBe('Snow');
            expect(users[0].age).toBe(22);
        });

        it('should search by the given properties', function(){
            var users = usersModel.find({id: 2});
            expect(users).toEqual([{id: 2, name: 'Arya', surname: 'Stark', age: 12}]);

            users = usersModel.find({surname: 'Stark'});
            expect(users).toEqual([
                {id: 2, name: 'Arya', surname: 'Stark', age: 12},
                {id: 3, name: 'Sansa', surname: 'Stark', age: 16}
            ]);
        });

        it('should return an empty array if no matches', function(){
            var users = usersModel.find({id: 234});
            expect(users).toEqual([]);
        });
    });

    describe('create', function(){
        it('should create the resource and return it', function(){
            var user = usersModel.create({name: 'The Hound', age: 34});
            expect(user).toEqual({id: 1, name: 'The Hound', surname: '', age: 34});
        });
    });

    describe('update', function(){
        it('should update the element and return it', function(){
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('John Snow', 22)");
            
            //GOT spoiler! Next time read the books!
            var newJohnSnow = {id: 1, name: 'Lord coamandant', surname: 'of the nightwatch', age:23};
            var updatedJohnSnow = usersModel.update(newJohnSnow);
            var findedJohnSnow = usersModel.find({id: 1});

            expect(updatedJohnSnow).toEqual(newJohnSnow);
            expect(findedJohnSnow).toEqual([newJohnSnow]);
        });
    });

    describe('remove', function(){
        it('should delete the element from the table', function(){
            
            dbaccess.execute("INSERT INTO Users (name, age) VALUES('John', 22)");
            expect(usersModel.find({id:1}).length).toBe(1);
            
            usersModel.remove(1);
            expect(usersModel.find({id:1}).length).toBe(0);
        });
    });

});