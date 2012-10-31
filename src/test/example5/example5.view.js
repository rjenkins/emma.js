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

  // Instantiate our form
  new Emma.Form(new MyApp.AdapterFactory(), $("#userFormWrapper"), user);

});
