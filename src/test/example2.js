/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 9/29/12
 * Time: 11:18 AM
 * To change this template use File | Settings | File Templates.
 */

// example2.js

window = {};

var _ = require('underscore');
require('../main/emma.js');
require('console');

// Display the content of a resource with a given adapter
var displayResources = function (resource, adapter) {
  // Retrieve contents of our Resource, adapt objects and print properties
  resource.getContents().forEach(function (data) {
    adapter.setTarget(data);
    adapter.getProperties().forEach(function (property) {
      console.log(property.getValue());
    });
  });
}

with (window.Emma) {

  // A Collection of user objects
  var userResource = new Resource().setContents([
    { first:"Ray", last:"Jenkins",
      username:"rjenkins", email:"rjenkins@aceevo.com" },
    { first:"Joe", last:"Smith",
      username:"jsmith", email:"joe.smith@gmail.com" },
    { first:"Hunter", last:"hthompson",
      username:"hthompson", email:"hunter@vegas.com" }
  ]);

  // A Collection of Computer resources
  var computerResource = new Resource().setContents([
    { manufacturer:"Apple", model:"Mac Book Pro", year:2012},
    { manufacturer:"Apple", model:"Mac Book", year:2010 },
    { manufacturer:"Dell", model:"Inspirion", year:2010 },
    { manufacturer:"HP", model:"Pavillion", year:2012 }
  ]);

  // An adapter for our users and add a property for the email attribute
  var userAdapter = new Adapter().addProperty(new Property("email"));

  // An adapter for our computer and add a property for the model and year attributes
  var computerAdapter = new Adapter()
    .addProperty(new Property("model"))
    .addProperty(new Property("year"));

  displayResources(userResource, userAdapter);
  displayResources(computerResource, computerAdapter);

}

