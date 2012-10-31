/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 10/31/12
 * Time: 5:24 AM
 * To change this template use File | Settings | File Templates.
 */
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

  var adapterFactory = new MyApp.AdapterFactory();
  var userResource = new Emma.Resource([user]);
  var tableItemProvider = new Emma.TableItemProvider(userResource, adapterFactory)
    .setCaption("Users").addColumn("first", "First Name")
    .addColumn("last", "Last Name")
    .addColumn("email", "Email Address")
    .addColumn("role", "Role");

  // Instantiate our form
  new Emma.Table(adapterFactory, $("#tableExample"), tableItemProvider);

});
