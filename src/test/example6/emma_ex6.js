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
    this.visibleInForm = true;
    this.visibleInTable = true;
    this.cellEditorType = CellEditor.TEXT_INPUT;
    this.options = {};
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
    return this.adapter.getTarget()[this.id];
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

  Property.prototype.setVisibileInForm = function (_visibleInForm) {
    this.visibleInForm = _visibleInForm;
    return this;
  }

  Property.prototype.isVisibleInForm = function () {
    return this.visibleInForm;
  }

  Property.prototype.setVisibleInTable = function (_visibleInTable) {
    this.visibleInTable = _visibleInTable;
    return this;
  }

  Property.prototype.getVisibleInTable = function () {
    return this.visibleInTable;
  }

  Property.prototype.setCellEditorType = function (_cellEditorType) {
    this.cellEditorType = _cellEditorType;
    return this;
  }

  Property.prototype.getCellEditorType = function () {
    return this.cellEditorType;
  }

  Property.prototype.getCellEditor = function () {
    if (this.cellEditorType === CellEditor.CHECK_BOX) {
      return new Emma.CheckBoxInput(this, JST['checkBox']);
    } else if (this.cellEditorType === CellEditor.SELECT || this.cellEditorType === CellEditor.SELECT_MULTIPLE) {
      return new Emma.Select(this, JST['select']);
    } else if (this.cellEditorType === CellEditor.RADIO_INPUT) {
      return new Emma.RadioInput(this, JST['inputRadio']);
    } else if (this.cellEditorType === CellEditor.TEXT_AREA) {
      return new Emma.TextArea(this, JST['textArea']);
    } else {
      return new Emma.TextInput(this, JST['inputText']);
    }
  }

  Property.prototype.setOptions = function (_options) {
    this.options = _options;
    return this;
  }

  Property.prototype.getOptions = function () {
    return this.options;
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

//  var RestResource = function (_uri, _loadOnCreate) {
//
//    var uri = _uri,
//      loadOnCreate = _loadOnCreate === false ? false : true;
//
//    if (loadOnCreate) {
//      this.load()
//    }
//
//
//    this.load = function () {
//      if (uri === undefined) {
//        throw "Cannot load undefined URI";
//      }
//
//      $.ajax(uri, function (data) {
//        this.setContents(data);
//      });
//    }
//  };

  var ItemProvider = function (resource) {

    this.getContents = function () {
      if (resource != undefined) {
        return resource.getContents();
      } else {
        return [];
      }
    }
  };

  var AdapterFactory = function () {
    this.adaptInternal = {};
  };

  AdapterFactory.prototype.add = function (objectConstructor, adapterContructor) {
    this.adaptInternal[objectConstructor] = adapterContructor;
  }

  AdapterFactory.prototype.adapt = function (object) {
    var adaptFunction = this.adaptInternal[object.constructor]
    if (adaptFunction !== undefined) {
      return adaptFunction(object);
    } else {
      return this.defaultAdapt(object);
    }
  }

  AdapterFactory.prototype.defaultAdapt = function (object) {
    var defaultAdapter = Adapter();
    _.each(object, function (key) {
      defaultAdapter.addProperty(new Property(key));
    })
  };

  // Widgets and the like
  var Widget = function (adapterFactory, container, input, template) {

    if (adapterFactory.constructor != AdapterFactory) {
      throw "adapterFactory is not a AdapterFactory object"
    }

    this.adapterFactory = adapterFactory;
    this.template = template;
    this.container = container;
    this.input = input;
  }

  Widget.prototype.render = function () {
    throw "Function not supported without override"
  }

  // Have form inherit from a new Widget object
  var _Form = function (adapterFactory, container, input, template) {

    // Create a new prototype function for our form
    function Form() {
      if (this.input !== undefined) {
        this.render(this.input);
      }
    }

    Form.prototype = new Widget(adapterFactory, container, input, $(JST['form']()));
    Form.prototype.constructor = Widget;
    Form.prototype.render = function (input) {

      var input = input || this.input;

      var content = this.template;
      $(content).empty();
      $(content).append($(JST['formLegend']()));

      var adapter = this.adapterFactory.adapt(input);

      adapter.getProperties().forEach(function (property) {
        property.getCellEditor().render(content);
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
    //No-Op
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

    TextInput.prototype = new CellEditor(property, template);
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

  var _RadioInput = function (property, template) {

    function RadioInput() {
    }

    RadioInput.prototype = new CellEditor(property, template);
    RadioInput.prototype.constructor = CellEditor;
    RadioInput.prototype.render = function (parent) {

      var self = this;
      var inputData = _.template(this.template, this.property);
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('input[type=radio]').change(function () {
        if ($(this).attr("checked") === "checked") {
          self.property.setValue($(this).val());
        }
      });

      return input;
    }

    return new RadioInput();
  }

  var _CheckBoxInput = function (property, template) {

    function CheckBoxInput() {
    }

    CheckBoxInput.prototype = new CellEditor(property, template);
    CheckBoxInput.prototype.constructor = CellEditor;
    CheckBoxInput.prototype.render = function (parent) {
      var self = this;
      var inputData = this.template(this.property);
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('input[type=checkbox]').click(function () {
        if ($(this).attr("checked") === "checked") {
          self.property.setValue(true);
        } else {
          self.property.setValue(false);
        }
      });
      return input;
    }

    return new CheckBoxInput();
  }


  var _Select = function (property, template) {

    function Select() {
    }

    Select.prototype = new CellEditor(property, template);
    Select.prototype.constructor = CellEditor;
    Select.prototype.render = function (parent) {

      var self = this;

      // For Selects we have to do at runtime and can't precompile
      var inputData = _.template(template, this.property);
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('select').change(function () {
        self.property.setValue($(this).val());
      });
      return input;
    }

    return new Select();
  }


  var _TextArea = function (property, template) {
    function TextArea() {
    }

    TextArea.prototype = new CellEditor(property, template);
    TextArea.prototype.constructor = CellEditor;
    TextArea.prototype.render = function (parent) {

      var self = this;
      var inputData = this.template(this.property);
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('textarea').keyup(function () {
        self.property.setValue($(this).val());
      });

      return input;
    }

    return new TextArea();
  }

  Emma.AdapterFactory = AdapterFactory;
  Emma.Widget = Widget;
  Emma.CellEditor = CellEditor;

  Emma.Form = _Form;
  Emma.TextInput = _TextInput;
  Emma.TextArea = _TextArea;
  Emma.RadioInput = _RadioInput;
  Emma.CheckBoxInput = _CheckBoxInput;
  Emma.Select = _Select;

})();