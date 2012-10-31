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

  var user1 = new MyApp.model.User({ first:"Bob", last:"Smith",
    username:"smith", email:"bsmith@foo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
  });

  var user2 = new MyApp.model.User({ first:"Jason", last:"Lee",
    username:"jlee", email:"jlee@stereo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
  });

  var user3 = new MyApp.model.User({ first:"Jimi", last:"Hendrix",
    username:"jhendrix", email:"jhendrix@theexperience.com", sex:"m", additionalInfo:"None", active:false, role:"false"
  });

  var car = new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year: 1999});

  var car1 = new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year: 1999});

  var car2 = new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year: 1999});



  var adapterFactory = new MyApp.AdapterFactory();

  var userResource = new Emma.Resource([user,user1, user2, user3]);
  var carResource = new Emma.Resource([car, car1, car2]);

  var tableItemProvider = new Emma.TableItemProvider(userResource, adapterFactory)
    .setCaption("Users").addColumn("first", "First Name")
    .addColumn("last", "Last Name")
    .addColumn("email", "Email Address")
    .addColumn("role", "Role");

  var tableItemProviderCar = new Emma.TableItemProvider(carResource, adapterFactory)
    .setCaption("Cars").addColumn("make", "Make")
    .addColumn("model", "Model")
    .addColumn("year", "Year")



  // Instantiate our form
  new Emma.Table(adapterFactory, $("#tableExample"), tableItemProvider);
  new Emma.Table(adapterFactory, $("#tableExample2"), tableItemProviderCar);


});
