tidesdk-orm
===========

A JS ORM for TideSDK

To run the tests you need to create a TideSDK app and run them inside with a Jasmine HTML spec runner.

Basic usage:
------------

###### Creating the model

```javascript
var dbaccess = Ti.Database.open('test');
var usersSchema = {name: 'TEXT', surname: 'TEXT', age: 'INTEGER'}
var usersModel = timodel('users', usersSchema, dbaccess);

```
###### Creating the table (only creates if not exists)
```javascript
usersModel.createTable();
```
###### Creating elements
```javascript
//creates and returns the element
var john = usersModel.create({name: 'John', surname: 'sanders', age: 23});
john.id // 1;
```
###### Updating elements
```javascript
john.age = 24;

john = usersModel.update(john);
john.age //24;
```
###### Finding elements
```javascript
usersModel.create({name: 'John', surname: 'Smith', age: 23});
usersModel.create({name: 'Marta', surname: 'Smith', age: 24});
usersModel.create({name: 'Louis', surname: 'Peti', age: 26});

var users = usersModel.find({surname: 'Smith'});
users // [{id: 1, name: 'John', surname: 'Smith', age: 23}, {id: 2, name: 'Marta', surname: 'Smith', age: 24}];
/// If you dont pass a filter, it returns all the elements.
```
###### Deleting elements
```javascript
usersModel.remove(2); // deletes the element with id = 2
```
