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
      return this.target;
    }

    var setTarget = function (target) {
      this.target = target;
      return this;
    }

    return {
      addProperty:addProperty,
      getProperties:getProperties,
      getTarget:getTarget,
      setTarget:setTarget
    }
  }

//  Emma.extend = function (object, parent) {
//    var F = function () {
//    };
//    F.prototype = new parent();
//    for (var index in object)
//      F.prototype[index] = object[index];
//    return F;
//  }


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
    var t = this.adapter.getTarget();
    return t[this.id]
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
      return new Emma.CheckBoxInput(this)
    } else if (this.cellEditorType === CellEditor.SELECT || this.cellEditorType === CellEditor.SELECT_MULTIPLE) {
      return new Emma.Select(this);
    } else if (this.cellEditorType === CellEditor.RADIO_INPUT) {
      return new Emma.RadioInput(this);
    } else if (this.cellEditorType === CellEditor.TEXT_AREA) {
      return new Emma.TextArea(this);
    } else {
      return new Emma.TextInput(this);
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

  var CellEditor = function (_property) {

    var property = _property;
    var template = "";

    if (_property.constructor != Property) {
      throw "property is not a Property object"
    }

    this.getProperty = function () {
      return property;
    }

    this.getTemplate = function () {
      return template;
    }

    this.setTemplate = function (_template) {
      template = _template;
    }
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

  CellEditor.prototype.render = function () {
    //No-Op
  }

  CellEditor.TEXT_INPUT = "TEXT_INPUT";
  CellEditor.CHECK_BOX = "CHECK_BOX";
  CellEditor.SELECT = "SELECT";
  CellEditor.SELECT_MULTIPLE = "SELECT_MULTIPLE";
  CellEditor.RADIO_INPUT = "RADIO_INPUT";
  CellEditor.TEXT_AREA = "TEXT_AREA";

  var TextInput = function () {
    this.setTemplate(JST['inputText']);

    this.render = function (parent) {
      var self = this;
      var inputData = this.getTemplate()(this.getProperty());
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('input[type=text]').keyup(function () {
        self.getProperty().setValue($(this).val());
      });


      return input;
    }
  }

  var _TextInput = function (property) {
    TextInput.prototype = new CellEditor(property);
    return new TextInput();
  }

  var RadioInput = function () {

    this.render = function (parent) {
      var self = this;

      var inputData = _.template(JST['inputRadio'], this.getProperty());
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('input[type=radio]').change(function () {
        if ($(this).attr("checked") === "checked") {
          self.getProperty().setValue($(this).val());
        }
      });

      return input;
    }
  }

  var _RadioInput = function (property) {
    RadioInput.prototype = new CellEditor(property);
    return new RadioInput();
  }

  var CheckBoxInput = function () {
    this.setTemplate(JST['checkBox']);

    this.render = function (parent) {
      var self = this;
      var inputData = this.getTemplate()(this.getProperty());
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('input[type=checkbox]').click(function () {
        if ($(this).attr("checked") === "checked") {
          self.getProperty().setValue(true);
        } else {
          self.getProperty().setValue(false);
        }
      });
      return input;
    }
  }

  var _CheckBoxInput = function (property) {
    CheckBoxInput.prototype = new CellEditor(property);
    return new CheckBoxInput();
  }

  var Select = function () {

    this.render = function (parent) {
      var self = this;

      // For Selects we have to do at runtime and can't precompile
      var inputData = _.template(JST['select'], this.getProperty());
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('select').change(function () {
        self.getProperty().setValue($(this).val());
      });
      return input;
    }
  }

  var _Select = function (property) {
    Select.prototype = new CellEditor(property);
    return new Select();
  }

  var TextArea = function () {
    this.setTemplate(JST['textArea']);

    this.render = function (parent) {

      var self = this;
      var inputData = this.getTemplate()(this.getProperty());
      var input = $(inputData);
      $(parent).append(input);

      $(input).find('textarea').keyup(function () {
        self.getProperty().setValue($(this).val());
      });

      return input;
    }
  }

  var _TextArea = function (property) {
    TextArea.prototype = new CellEditor(property);
    return new TextArea();
  }


  Emma.AdapterFactory = AdapterFactory;
  Emma.Form = _Form;
  Emma.Widget = Widget;
  Emma.CellEditor = CellEditor;
  Emma.TextInput = _TextInput;
  Emma.TextArea = _TextArea;
  Emma.RadioInput = _RadioInput;
  Emma.CheckBoxInput = _CheckBoxInput;
  Emma.Select = _Select;

}
  )
  ();