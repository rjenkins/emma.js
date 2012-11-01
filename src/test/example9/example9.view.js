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

  var adapterFactory = new MyApp.AdapterFactory();

  var userResource = new Emma.Resource([
    new MyApp.model.User({ first:"Ray", last:"Jenkins",
      username:"rjenkins", email:"rjenkins@aceevo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
    }),
    new MyApp.model.User({ first:"Bob", last:"Smith",
      username:"smith", email:"bsmith@foo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
    }),
    new MyApp.model.User({ first:"Jason", last:"Lee",
      username:"jlee", email:"jlee@stereo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
    }),
    new MyApp.model.User({ first:"Jimi", last:"Hendrix",
      username:"jhendrix", email:"jhendrix@theexperience.com", sex:"m", additionalInfo:"None", active:false, role:"user"
    })]);

  var carResource = new Emma.Resource([new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year:1999}), new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year:1999}), new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year:1999})]);

  var tableItemProvider = new Emma.TableItemProvider(userResource)
    .setCaption("Users").addColumn("first", "First Name")
    .addColumn("last", "Last Name")
    .addColumn("email", "Email Address")
    .addColumn("role", "Role")
    .setEditable(true);


  var tableItemProviderCar = new Emma.TableItemProvider(carResource)
    .setCaption("Cars").addColumn("make", "Make")
    .addColumn("model", "Model")
    .addColumn("year", "Year")
    .setEditable(true);


  // Instantiate our form
  new Emma.Table(adapterFactory, $("#tableExample"), tableItemProvider);
  new Emma.Table(adapterFactory, $("#tableExample2"), tableItemProviderCar);


});
