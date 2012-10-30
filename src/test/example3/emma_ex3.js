/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 8/29/12
 * Time: 5:23 PM
 * To change this template use File | Settings | File Templates.
 */

(function () {

  var Emma;

  if (window['Emma'] === undefined) {
    window.Emma = Emma = {};
  } else {
    Emma = window['Emma'];
  }

  // Public constructor function
  var Adapter = Emma.Adapter = function (_target) {

    var target = _target;

    // Make itemProperties private as we want to ensure people can only
    // add legitimate Property objects to list collection
    var itemProperties = [];

    var addProperty = function (property) {

      if (property.constructor != Property || property === undefined) {
        throw "property is not a Property object"
      }

      itemProperties.push(property);
      property.setAdapter(this);
      return this;
    };

    // Clone the properties so that way user cannot
    // mess with the internals of item properties
    var getProperties = function () {
      return itemProperties;
    }

    var getTarget = function () {
      return target;
    }

    var setTarget = function (_target) {
      target = _target;
      return this;
    }

    return {
      addProperty:addProperty,
      getProperties:getProperties,
      getTarget:getTarget,
      setTarget:setTarget
    }
  }

// Public constructor function
  var Property = Emma.Property = function (_id) {

    // if not called with new
    if (!(this instanceof Property)) {
      return new Property(_id);
    }

    this.adapter;
    this.id = _id;
    this.displayName;
  }

  // Setters provided for fluent pattern and
  // Getters just provided for consistency with Setters
  // but can be accessed directly as well.
  Property.prototype.getId = function () {
    return this.id;
  };

  Property.prototype.setAdapter = function (_adapter) {
    this.adapter = _adapter;
    return this;
  }

  Property.prototype.getValue = function () {
    return this.adapter.getTarget()[this.id]
  }

  Property.prototype.setValue = function (value) {
    this.adapter.getTarget()[this.id] = value;
  }

  Property.prototype.setDisplayName = function (_displayName) {
    this.displayName = _displayName;
    return this;
  }

  Property.prototype.getDisplayName = function () {
    return this.displayName;
  }

  // Use the module pattern for Resource allowing for Getter/Setter based access,
  // but in extended versions we'll remove the setContents function from the public API
  var Resource = Emma.Resource = function () {

    var contents = [];

    return {
      getContents:function () {
        return contents
      },
      setContents:function (_contents) {
        contents = _contents;
        return this;
      }
    }
  };

  // Widgets and the like
  var Widget = function (adapter, container, template) {

    this.adapter = adapter;
    this.container = container;
    this.template = template;
  }

  Widget.prototype.render = function () {
    throw "Function not supported without override"
  }

  // Have form inherit from a new Widget object
  var _Form = function (adapter, container, template) {

    // Create a new prototype function for our form
    function Form() {
      this.render();
    }

    Form.prototype = new Widget(adapter, container, template || $(JST['form']()));
    Form.prototype.constructor = Widget;
    Form.prototype.render = function () {

      var content = this.template;
      $(content).empty();
      $(content).append($(JST['formLegend']()));

      this.adapter.getProperties().forEach(function (property) {
        new Emma.TextInput(property).render(content);
      });

      $(content).append($(JST['formActions']()));

      $(content).unbind();
      $(content).submit(function () {
        var target = adapter.getTarget();
        for (var k in target) {
          console.log(k + " " + target[k]);
        }
        return false;
      });

      if (this.container !== undefined) {
        $(this.container).append(content);
      }
    }

    return new Form();
  }

  var CellEditor = function (property, template) {

    if (!(property instanceof Property))
      throw "property is not an instance of Property object"

    this.property = property;
    this.template = template;
  }

  CellEditor.prototype.render = function () {
    throw "Function not supported without override"
  }

  CellEditor.TEXT_INPUT = "TEXT_INPUT";
  CellEditor.CHECK_BOX = "CHECK_BOX";
  CellEditor.SELECT = "SELECT";
  CellEditor.SELECT_MULTIPLE = "SELECT_MULTIPLE";
  CellEditor.RADIO_INPUT = "RADIO_INPUT";
  CellEditor.TEXT_AREA = "TEXT_AREA";

  var _TextInput = function (property, template) {

    function TextInput() {
    }

    TextInput.prototype = new CellEditor(property, template || JST['inputText']);
    TextInput.prototype.constructor = CellEditor;
    TextInput.prototype.render = function (parent) {
      var self = this;
      var inputData = this.template(this.property);
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('input[type=text]').keyup(function () {
        self.property.setValue($(this).val());
      });

      return input;
    }

    return new TextInput();
  }


  Emma.Adapter = Adapter;
  Emma.CellEditor = CellEditor;
  Emma.Form = _Form;
  Emma.TextInput = _TextInput;
  Emma.Widget = Widget;

})();