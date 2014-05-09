'use strict';

function timodel(resource, schema, db){
    return {
        createTable: function(){
            db.execute(createTableCommand(resource, schema));
        },

        find: function(pattern){
            var rows = db.execute('SELECT * FROM ' + resource);
            var data = this.rowsToCollection(rows);

            if(pattern){
                data = filterRows(data, pattern);
            }

            return data;
        },

        create: function(data){
            db.execute(createComand(data)).close();
            var createdElement = db.execute('SELECT * FROM '+resource+' WHERE id == last_insert_rowid()');
            return this.rowsToCollection(createdElement)[0];
        },

        update: function(data){
            db.execute(updateComand(data)).close();
            
            var updatedRow = db.execute('SELECT * FROM ' + resource + ' WHERE id == ' + data.id);
            return this.rowsToCollection(updatedRow)[0];
        },

        remove: function(id){
            db.execute('DELETE FROM ' + resource + ' WHERE id == ' + id).close();
        },

        rowsToCollection: function(result){
            var data = [];

            while (result.isValidRow()) {
                data.push(rowToData(result));
                result.next();
            }

            result.close();
            return data;
        }
    };

    function rowToData(result){
        var rowData = {};
        var numProperties = result.fieldCount();
        for(var propertyIndex = 0; propertyIndex < numProperties; propertyIndex++)
        {
            var propertyName = result.fieldName(propertyIndex);
            rowData[propertyName] = result.fieldByName(propertyName);
        }
        return rowData;
    }

    function createComand(data){
        var properties = Object.keys(data).join(', ');
            
        var values = [];
        Object.keys(data).forEach(function(property){
            values.push(data[property]);
        });
        values = values.join('", "');

        return 'INSERT INTO ' + resource + ' (' + properties + ') VALUES("' + values + '")';
    }

    function updateComand(data){
        var propertiesToUpdate = [];
        Object.keys(data).forEach(function(property){
            propertiesToUpdate.push(property + ' = "' + data[property] + '"');
        });

        return 'UPDATE ' + resource + ' SET ' + propertiesToUpdate.join(', ') + ' WHERE id == ' + data.id;
    }

    function createTableCommand(resource, schema){
        return 'CREATE TABLE IF NOT EXISTS ' + resource + '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' + schemaToSql(schema) + ')';
    }

    function schemaToSql(schema) {
        var sql = '';
        Object.keys(schema).forEach(function(property, index, keys){
            var type = schema[property];
            sql += property + ' ' + type;
            if(keys.indexOf(property) < keys.length -1){
                sql += ', ';
            }
        });

        return sql;
    }

    function filterRows(collection, pattern){
        var filteredCollection = [];
        collection.forEach(function(element){
            if(match(element, pattern)){
                filteredCollection.push(element);
            }
        });

        return filteredCollection;
    }

    function match(element, pattern){
        var matches = true;
        Object.keys(pattern).forEach(function(property){
            if(element[property] !== pattern[property]){
                matches = false;
            }
        });

        return matches;
    }
}