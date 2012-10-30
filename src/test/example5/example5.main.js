/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 10/29/12
 * Time: 9:32 AM
 * To change this template use File | Settings | File Templates.
 */

$(function () {

  window.MyApp = {};
  window.MyApp.model = {};

  var User = MyApp.model.User = function (spec) {
    this.first = spec.first;
    this.last = spec.last;
    this.username = spec.username;
    this.email = spec.email;
    this.sex = spec.sex;
    this.additionalInfo = spec.additionalInfo;
    this.active = spec.active;
    this.role = spec.role;
  }


  with (Emma) {
    var UserAdapterFactory = function () {

      this.adapt = function (object) {
        if (object instanceof User) {
          var userAdapter = new Adapter();
          userAdapter.addProperty(new Property("first").setDisplayName("First"))
            .addProperty(new Property("last").setDisplayName("Last"))
            .addProperty(new Property("username").setDisplayName("Username"))
            .addProperty(new Property("email").setDisplayName("Email"))

            .addProperty(new Property("sex").setDisplayName("Sex")
            .setOptions({
              m:"Male",
              f:"Female"
            }).setCellEditorType(CellEditor.RADIO_INPUT))

            .addProperty(new Property("additionalInfo").setDisplayName("More Info").setCellEditorType(CellEditor
            .TEXT_AREA))

            .addProperty(new Property("role").setDisplayName("Role")
            .setOptions({
              admin:"Administrator",
              user:"User"
            }).setCellEditorType(CellEditor.SELECT))

            .addProperty(new Property("active").setDisplayName("Active").setCellEditorType(CellEditor.CHECK_BOX));

          userAdapter.setTarget(object);
          return userAdapter
        }
      }
    }


    MyApp.UserAdapterFactory = function () {
      UserAdapterFactory.prototype = new AdapterFactory();
      return new UserAdapterFactory();
    }
  }
});