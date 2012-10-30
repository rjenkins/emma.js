/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 9/29/12
 * Time: 11:18 AM
 * To change this template use File | Settings | File Templates.
 */

// example1.js

window = {};

var _ = require('underscore');
require('../main/emma.js');
require('console');


with (window.Emma) {

  // Create a new collection of user objects and add to the userResource.
  var userResource = new Resource().setContents([
    { first:"Ray", last:"Jenkins",
      username:"rjenkins", email:"rjenkins@aceevo.com" },
    { first:"Joe", last:"Smith",
      username:"jsmith", email:"joe.smith@gmail.com" },
    { first:"Hunter", last:"hthompson",
      username:"hthompson", email:"hunter@vegas.com" }
  ]);

  // Create an adapter for our users and add a property for the email attribute

  // Retrieve contents of our Resource, adapt user objects and print properties
  userResource.getContents().forEach(function (user) {
    var userAdapter = new Adapter(user);
    userAdapter.addProperty(new Property("email"));
    userAdapter.getProperties().forEach(function (property) {
      console.log(property.getValue());
    });
  });
}
