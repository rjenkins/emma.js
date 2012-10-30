/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 10/29/12
 * Time: 8:58 AM
 * To change this template use File | Settings | File Templates.
 */


$(function () {

  var user = new MyApp.model.User({ first:"Ray", last:"Jenkins",
    username:"rjenkins", email:"rjenkins@aceevo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
  });

  var car = new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year: 1999});

  // Instantiate our form
  var form = new Emma.Form(new MyApp.AdapterFactory(), $("#userFormWrapper"), user);

  $("#editUser").click(function() {
    form.render(user);
  });

  $("#editCar").click(function() {
    form.render(car);
  });


});
