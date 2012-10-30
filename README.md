# Overview
If you've worked on a project of any significant size you know managing complexity becomes increasing difficult as the project grows and Javascript based User Interfaces are no exception. Many UI framework provide overarching patterns like MVC of MVP that give developers the ability to separate concerns on the macrolevel but provide little direction or guidance around the complexities of developing and maintaining highly complex web application and asynchronous user interfaces at the component level. 

As a project grows the value of abstraction and reusability of a codebase increases. Reusability allows for rapid development of new features with confidence that they will function well because the abstract code has been tested extensively and is in use in other production features or products.

## The Data
A fundamental problem when building any user interface is getting data into the UI. If you wish to do this in any reusable manner you have to find a way to abstract this logic, so enter our first pattern the Adapter.

### The Adapter Pattern
The purpose of the adapter is to provide an abstract interface for accessing our data object.
```javascript
    // Public constructor function
    var Adapter = Emma.Adapter = function (_target) {

      var target = _target;

      var getTarget = function () {
        return target;
      }

      var setTarget = function (_target) {
        target = _target;
        return this;
      }

      return {
        getTarget:getTarget,
        setTarget:setTarget
      }
    }
```

So reviewing this code we have a constructor function for our adapter, it checks to make sure it was called with the new operator and if not it calls itself again with new. We have a private variable target and we have getter and setter methods for it. This is sometimes referred to as the instance privacy pattern and is not generally used in JavaScript for various reasons, without delving to deeply into that discussion, I'll just say that I'm using this pattern here because I consider this to be infrastructure code that will be used all over the place by application code and I want to keep a very strict API.

Well there's not much to our adapter at the moment, so let's make it a bit more useful by introducing our next pattern Properties.

### The Property Pattern

Property objects allow us to organize metadata associated with viewing the property of an object. Properties are retained in an adapter and the view will then be able to use this metadata to determine how to render an object in a view. Additionally our Property object retains a reference to it's parent adapter and has the getValue() and setValue() functions.

```javascript
  // Public constructor function
  var Property = Emma.Property = function (_id) {

      // if not called with new
      if (!(this instanceof Property)) {
        return new Property(_id);
      }

      this.adapter;
      this.id = _id;
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
```

### Adding Properties to the Adapter
Now we can go back and modify our adapter object to contain a map of Property objects.
```javascript
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

    var getProperties = function () {
      return itemProperties;
    }

    ...

    return {
          addProperty:addProperty,
          getProperties:getProperties,
          getTarget:getTarget,
          setTarget:setTarget
    }
  }
```
We've added the private instance variable itemProperties and two new methods, the helper method addProperty and the getProperties method. Take note that the addProperty method checks to verify that the property reference passed to the function is indeed a Property object, set's itself as the parent adapter and returns itself.

### The Resource Pattern

A Resource is a collection of data objects of a given type. If you're familiar with backbone.js then you're familiar with Collections. For the moment let us disregard how these data resources are acquired from the server and introduce a very simple implementation of the Resource pattern. 

```javascript
  // Public constructor function
  var Resource = function () {

    //if not called with new
    if (!(this instanceof Resource)) {
      return new Resource();
    }

    var contents = [];

    this.getContents = function () {
      return [];
    };

    this.setContents = function (_contents) {
      this.contents = _contents;
    }
  };
```

### A Simple Example - Using Adapters, Properties, and Resources

Consider the following example, you'll need to install node.js and the underscore module (npm install underscore). In our example we'll create a new Resource called userResource and set it's contents to a list of user objects, then we create a new Adapter called userAdapter and add a Property to it from the email attribute of users. Finally we get the contents from our userResource, adapt the objects and print out the value of it's properties.

```javascript
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
```

When we run example1.js we get the following output

```
Rays-Macbook-Pro:test rjenkins$ node example1.js 
rjenkins@aceevo.com
joe.smith@gmail.com
hunter@vegas.com
```

Now the interesting part about this code is not the initialization but the final 6 lines. This code can be abstracted
and reused with any type of objects. Let's abstract this code into a function called **displayResources** and add
some new data types to our example and review the results.

```javascript
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

// Display the content of a resource with a given adapter
var displayResources = function (resource, adapter) {
  // Retrieve contents of our Resource, adapt objects and print properties
  resource.getContents().forEach(function (data) {
    adapter.setTarget(data);
    adapter.getProperties().forEach(function (property) {
      console.log(property.getValue());
    });
  });
}

with (window.Emma) {

  // A Collection of user objects
  var userResource = new Resource().setContents([
    { first:"Ray", last:"Jenkins",
      username:"rjenkins", email:"rjenkins@aceevo.com" },
    { first:"Joe", last:"Smith",
      username:"jsmith", email:"joe.smith@gmail.com" },
    { first:"Hunter", last:"hthompson",
      username:"hthompson", email:"hunter@vegas.com" }
  ]);

  // A Collection of Computer resources
  var computerResource = new Resource().setContents([
    { manufacturer:"Apple", model:"Mac Book Pro", year:2012},
    { manufacturer:"Apple", model:"Mac Book", year:2010 },
    { manufacturer:"Dell", model:"Inspirion", year:2010 },
    { manufacturer:"HP", model:"Pavillion", year:2012 }
  ]);

  // An adapter for our users and add a property for the email attribute
  var userAdapter = new Adapter().addProperty(new Property("email"));

  // An adapter for our computer and add a property for the model and year attributes
  var computerAdapter = new Adapter()
    .addProperty(new Property("model"))
    .addProperty(new Property("year"));

  displayResources(userResource, userAdapter);
  displayResources(computerResource, computerAdapter);

}

```
Now when we run node example2.js we get the following output

```
Rays-Macbook-Pro:test rjenkins$ node example2.js 
rjenkins@aceevo.com
joe.smith@gmail.com
hunter@vegas.com
Mac Book Pro
2012
Mac Book
2010
Inspirion
2010
Pavillion
2012
```

## The View

So why have we gone through all the trouble of building these objects for abstracting access for our data? We've done
this so we can provide a common data access interface which with to build view components upon. Without a common data
access abstraction layer our widgets will vary widely in design or become bound to the specifics of our data and we'll
be back to struggling to find a way to abstract and reuse common pieces of code.

### Widget Patterns

A widget is a reusable element of a graphical user interface. Widgets can range from very simple element,
a input box for example to complex composite elements like column tree widgets, grids,
or forms embedded in tables. OK, so let's build some widgets to use our abstract data acess layers,
let's start by looking at something not so glamours forms and CRUD interfaces. Even though that might seem boring
they are a good candidate for learning how to build widgets because.

  * There is a wide variety of components we must support
  * CRUD is generally used widely throughout applications
  * Form widgets themselves are not too complex and are a good introduction
  * We must interact with resources, adapter, properties and other components.

I'm going to create a new file called widgetTemplate.js to hold our widget templates. We're also using underscore.js
templates in these example but you can use anything you like or write your own even. Here's what
widgetTemplates.js looks like to get started.

```javascript
/**
 * Created by JetBrains WebStorm.
 * User: rjenkins
 * Date: 9/29/12
 * Time: 10:09 PM
 * To change this template use File | Settings | File Templates.
 */
window.JST = {};

/**
 * Form Widget Templates
 */

// A form
window.JST['form'] = _.template(
  "<form class=\"form-horizontal\">" +
    "</form>"
);

window.JST['formLegend'] = _.template(
  "<legend>Legend</legend>"
);

// Text Input Field
window.JST['inputText'] = _.template(
  "<div class=\"control-group\">" +
  "<label class=\"control-label\"><%= getDisplayName() %></label>" +
  "<div class=\"controls\">" +
  "<input type=\"text\" name=\"<%= getId() %>\" value=\"<%= getValue() %>\"/>" +
  "</div>" +
  "</div>"

);

// Form Actions
window.JST['formActions'] = _.template(
  "<div class=\"form-actions\">" +
  "<button type=\"submit\" class=\"btn btn-primary\">Save changes</button>" +
  "<button type=\"button\" class=\"btn\">Cancel</button>" +
  "</div>"
);
```

Here we've created a few widgets one for a form, form legend, a text input and something called formActions which is a
div that has a submit and cancel button.

### Abstract Widget Pattern

Here's our abstract widget function. Our widget takes a property as a constructor arg and also holds a reference to a
template.

```javascript
  // Widgets and the like

  var Widget = function (_adapter) {

      if (_adapter.constructor != Adapter) {
        throw "adapter is not a Adapter object"
      }

      var adapter = _adapter;
      var template = "";

      this.getAdapter = function () {
        return adapter;
      }

      this.getTemplate = function () {
        return template;
      }

      this.setTemplate = function (_template) {
        template = _template;
      }
    };


   Widget.prototype.render = function () {
     //No-Op
   }
```

### Creating our first widget, a resuable Form.

Now that we've created an abstract Widget type, let's create our Form widget
and a constructor for our Form widget that uses the Widget function as it's prototype.

```javascript
var _Form = function (adapter, container) {
    Form.prototype = new Widget(adapter)
    return new Form(adapter, container);
  }

  var Form = function (adapter, container) {
    this.setTemplate($(JST['form']()));

    this.render = function () {

      var self = this;
      var content = this.getTemplate();
      $(content).empty();
      $(content).append($(JST['formLegend']()));

      this.getAdapter().getProperties().forEach(function (property) {
        new Emma.TextInput(property).render(content);
      });

      $(content).append($(JST['formActions']()));

      $(content).submit(function () {
        var adapter = self.getAdapter();
        var target = adapter.getTarget();
        for (var k in target) {
          console.log(k + " " + target[k]);
        }
        return false;
      });

      if (container !== undefined) {
        $(container).append(content)
      }

      return content;
    }

    this.render();
  }

  Emma.Widget = Widget;
  Emma.Form = _Form;

```

Our Form widget will take an adapter and a container as constructor arguments
and will hold a reference to the form template. Our form will also have a single function called render.
When Form is called it will call this.render().

### Rendering our Form.

Let's take a detailed look at the render method for our form widget. Some of these concepts will be repeated across
multiple widgets, so it's good to have an understanding of the basic rendering function of a widget..

#### Initial Form Rendering

1. First, we save a reference of this to self.
2. Then we retrieve our template, notice it was set when our form was created and a form element generated from our
call
to - this.setTemplate($(JST['form']()));
3. Finally empty out its current contents and append our Form legened.

```javascript
this.render = function () {

      var self = this;
      var content = this.getTemplate();
      $(content).empty();
      $(content).append($(JST['formLegend']()));
```

#### Adding our Input Elements and Actions

This is going to be a real simple form just Input text fields. Above we showed the HTML template for our text input but
we havene't created the element yet, we'll deal with that in a moment, but for now here's the logic for adding our
text inputs.

1. Get the adapter for this form, and retrieve it's list of properties. For each property create a new TextInput object
and pass it a reference to the property, then call render on the text input passing it the parent container element.
2. Finally append the formActions template to our Form content.

```javascript
this.getAdapter().getProperties().forEach(function (property) {
  new Emma.TextInput(property).render(content);
});

$(content).append($(JST['formActions']()));
```


#### Adding our Form to it's container.

* Lastly we'll check to see that our container element is not undefined and we'll add the this Form content to our
container.

```javascript

if (container !== undefined) {
  $(container).append(content)
}

return content;
```

### Abstract Cell Editor Pattern

Like widgets Cell Editors are reusable UI components, so technically that makes them widgets
as well but their specifically designed to take and modify input from users.
Let's create an abstract function for our Cell Editors, we could have them extend Widget, but there's
not that much value in that, so let's just look at our Cell Editor abstract class and constructors.

Like a widget a Cell editor has a template and a render function but it takes a reference
to a property object rather than an adapter.


```javascript

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

  CellEditor.prototype.render = function () {
    //No-Op
  }

```
### Modifying Property

We need to add some attributes to our property object to make it more useful for use
in widgets, we'll setart by adding a displayName field, and a boolean for visibleInForm.

```javascript
// Public constructor function
  var Property = function (_id) {

    //if not called with new
    if (!(this instanceof Property)) {
      return new Property();
    }

    var id = _id,
      adapter,
      displayName,
      visibleInForm = true,

      ...

    this.setDisplayName = function (_displayName) {
      displayName = _displayName;
      return this;
    }

    this.getDisplayName = function () {
      return displayName;
    }

    this.setVisibileInForm = function (_visibleInForm) {
      visibleInForm = _visibleInForm;
      return this;
    }

    this.isVisibleInForm = function () {
      return visibleInForm;
    }

    ...

  }
```


### Creating our TextInput Cell Editor

The TextInput will use the CellEditor for it's prototype and it's setup and rendering
is straight forward, we set our template and then in render we save a copy of this to self. Next
we call get template and pass it our property (as attributes of our property are accessed in our template)
and finally we append our input to the parent container element.

```javascript

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
```

#### Mutating our data via the Property

You'll notice in render we also attached a keyup function to our input let's take a look
at that more closely.

1. First we find the input element in our template and attach a keyup function.
2. On keyup we retrieve the property from the TextInput and call setValue on the
property passing it the current value on the input. Set value in turn uses it's
adapter reference to retrieve the underlying data target and set this fields
value

```javascript

      $(input).find('input[type=text]').keyup(function () {
        self.getProperty().setValue($(this).val());
      });

      // From Property

      this.setValue = function (value) {
        adapter.getTarget()[id] = value;
      }
```

### Using our Form widget

So let's look at an example of using our first widget. We're going to start with a piece of data first (of course),
this will be a user object, we'll create a new adapter for our user and add some properties and finally we'll
instantiate our form widget and pass it our User Adapter.

```
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css"
        rel="stylesheet">

  <style>
    body {
      padding-top: 100px;
    }

    #userFormWrapper form {
      margin: 0 auto;
    }

    .container {
      background-color: #F7F7F9;
      border-radius: 5px;
      padding: 0 0 20px 0;
      border: 1px solid #E1E1E8;
    }

    .form-actions {
      background: none;
      padding-left: 200px !important;
    }

    .form-actions .btn {
      margin-right: 4px;
    }

  </style>

  <script type="text/javascript" src="../lib/jquery.min.js"></script>
  <script src="../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="../main/emma.js"></script>
  <script type="text/javascript" src="../lib/underscore.js"></script>
  <script src="../main/widgetTemplates.js"></script>
  <script type="text/javascript">


    $(function () {
      with (Emma) {

        // Mock up some data
        var user = { first:"Ray", last:"Jenkins",
          username:"rjenkins", email:"rjenkins@aceevo.com" };

        // Create an adapter for user data
        var userAdapter = new Adapter()
                .addProperty(new Property("first").setDisplayName("First"))
                .addProperty(new Property("last").setDisplayName("Last"))
                .addProperty(new Property("username").setDisplayName("Username"))
                .addProperty(new Property("email").setDisplayName("Email"));

        // Set the target on out adapter
        userAdapter.setTarget(user);

        // Instantiate our form
        new Form(userAdapter, $("#userFormWrapper"));
      }
    });
  </script>
</head>
<body>
<div class="container">
  <div class="registrationWrapper">
    <div class="row">
      <div class="offset3">
        <h3>Herp a Derp Web Application</h3>

        <p class="lead">
          Edit you some data here, isn't this so exciting!
        </p>
      </div>
    </div>
    <div class="row">
      <div class="offset3 span8" id="userFormWrapper">
      </div>
    </div>
  </div>
</div>
</body>
</html>
```

And here's what it looks like when we view it in our browser.

![example3](https://raw.github.com/rjenkins/emma/master/img/example_3.png)

## Wiring up our Submit

Oops we forgot to wire up action for our submit button, for now lets just print out
the content of our data object when save if clicked

```javascript
var Form = function (adapter, container) {
    this.setTemplate($(JST['form']()));

    this.render = function () {

      ...

      $(content).submit(function () {
        var adapter = self.getAdapter();
        var target = adapter.getTarget();
        for (var k in target) {
          console.log(k + " " + target[k]);
        }
        return false;

      });

      ...

    this.render();
  }
```

Now let's modify our object, save and look at the console output.

![example3_save](https://raw.github.com/rjenkins/emma/master/img/example_3_save.png)

Ok well that's pretty cool, but what can we do to improve this further? Well we know that forms are rarely this
simple, we'll need to support various input types like selects, textareas and the like. Additionally we'll have some
fields that are disabled and various other attributes. Let's take a look at refactoring our implementation to support
a wide variety of form configurations.

## Implementing Cell Editors

Of course forms are never quite this simple so we'll need to implement a few more cell editors to
support the various input types used in forms. Additionally we'll need to update our Property object to support
these different types of cell editors and we'll also need to modify the way the form adds Cell Editors, right now
it's just making an InputText widget for every property.

First let's start by modifying our form rendering logic to retrieve the cell editor from each individual property.

```javascript
var Form = function (adapter, container) {

    ...

    this.render = function () {
      ...

      this.getAdapter().getProperties().forEach(function (property) {
        property.getCellEditor().render(content);
      });

      ...
    }
}
```

Now let's implement a set of Cell Editors for the html types.

1. Radio Input
2. CheckBoxes
3. Select
4. TextArea

```javascript
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
```

### Cell Editor Templates

We also need to create corresponding templates for our new Cell Editors.

```javascript

// Checkbox Field
window.JST['checkBox'] = _.template(
  "<div class=\"control-group\">" +
    "<label class=\"control-label\"><%= getDisplayName() %></label>" +
    "<div class=\"controls\">" +
    "<input type=\"checkbox\" name=\"<%= getId() %>\" value=\"<%= getValue() %>\"" +
    "<% if(getValue() === true) { print(' checked') }%>>" +
    "</div>" +
    "</div>"

);

window.JST['select'] =
  "<div class=\"control-group\">" +
    "<label class=\"control-label\"><%= getDisplayName() %></label>" +
    "<div class=\"controls\">" +
    "<select name=\"<%= getId() %>\"" +
    "<% if(getCellEditorType() === Emma.CellEditor.SELECT_MULTIPLE) { print(' multiple') } %>>" +
    "<% _.each(getOptions(), function(value, key) { %>" +
    "<option value=\"<%= key %>\"><%= value %></option>" +
    "<% }); %>" +
    "</div>" +
    "</div>";


window.JST['inputRadio'] =
  "<div class=\"control-group\">" +
    "<label class=\"control-label\"><%= getDisplayName() %></label>" +
    "<div class=\"controls\">" +
    "<% _.each(getOptions(), function(value, key) { %>" +
    "<input type=\"radio\" name=\"<%= getId() %>\" value=\"<%= key %>\"" +
    "<% if(getValue() === key) { print(' checked') }%>>" +
    "<div class=\"radioLabel\"><%= value %></div></input>" +
    "<% }); %>" +
    "</div>" +
    "</div>";


// Text Input Field
window.JST['textArea'] = _.template(
  "<div class=\"control-group\">" +
    "<label class=\"control-label\"><%= getDisplayName() %></label>" +
    "<div class=\"controls\">" +
    "<textarea name=\"<%= getId() %>\">" +
    "<%= getValue() %>" +
    "</textarea>" +
    "</div>" +
    "</div>"
);
```

### Adding CellEditor Support to Properties

Now that we've implemented several more cell editors we need to modify our Property object to support setting
CellEditor type and creating CellEditors. There are a couple ways to do this and generally in statically typed
languages we can look at the underlying type and use that as a hint to generate our editor,
i.e we'll create a input text for Strings and a input checkbox for Boolean. Even with that though we want to provide
our users the ability to override any default setting so for now let's introduce the concept of a cellEditorType in
our Property object and implement a getCellEditor method.

```javascript
// Public constructor function
  var Property = function (_id) {

    //if not called with new
    if (!(this instanceof Property)) {
      return new Property();
    }

    var id = _id,
      adapter,
      displayName,
      cellEditorType = CellEditor.TEXT_INPUT,
      options = {};

    ...

    this.setCellEditorType = function (_cellEditorType) {
          cellEditorType = _cellEditorType;
          return this;
    }

    this.getCellEditorType = function () {
      return cellEditorType;
    }

    this.getCellEditor = function () {
      if (cellEditorType === CellEditor.CHECK_BOX) {
        return new Emma.CheckBoxInput(this)
      } else if (cellEditorType === CellEditor.SELECT || cellEditorType === CellEditor.SELECT_MULTIPLE) {
        return new Emma.Select(this);
      } else if (cellEditorType === CellEditor.RADIO_INPUT) {
        return new Emma.RadioInput(this);
      } else if (cellEditorType === CellEditor.TEXT_AREA) {
        return new Emma.TextArea(this);
      } else {
        return new Emma.TextInput(this);
      }
    }

    this.setOptions = function (_options) {
      options = _options;
      return this;
    }

    this.getOptions = function () {
      return options;
    }

    ...
```

And let's define some constants for our CellEditor types.

```javascript

CellEditor.prototype.render = function () {
    //No-Op
}

CellEditor.TEXT_INPUT = "TEXT_INPUT";
CellEditor.CHECK_BOX = "CHECK_BOX";
CellEditor.SELECT = "SELECT";
CellEditor.SELECT_MULTIPLE = "SELECT_MULTIPLE";
CellEditor.RADIO_INPUT = "RADIO_INPUT";
CellEditor.TEXT_AREA = "TEXT_AREA";
```

### Example: A more advanced Form

Now we can create a much more realistic form, let's go back and modify our previous example adding attributes to our
user object and modify our Properties to use these new Cell Editors.

```javascript
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css"
        rel="stylesheet">

  <style>
    body {
      padding-top: 100px;
    }

    #userFormWrapper form {
      margin: 0 auto;
    }

    .container {
      background-color: #F7F7F9;
      border-radius: 5px;
      padding: 0 0 20px 0;
      border: 1px solid #E1E1E8;
    }

    .form-actions {
      background: none;
      padding-left: 200px !important;
    }

    .form-actions .btn {
      margin-right: 4px;
    }

    .radioLabel {
      display: inline-block;
      margin-top: 5px;
    }

    input[type="radio"] {
      margin: 2px 5px 3px 5px
    }


  </style>

  <script type="text/javascript" src="../lib/jquery.min.js"></script>
  <script src="../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="../main/emma.js"></script>
  <script type="text/javascript" src="../lib/underscore.js"></script>
  <script src="../main/widgetTemplates.js"></script>
  <script type="text/javascript">


    $(function () {
      with (Emma) {

        // Mock up some data
        var user = { first:"Ray", last:"Jenkins",
          username:"rjenkins", email:"rjenkins@aceevo.com", sex:"m", additionalInfo:"None", active:true, role:"admin"
        };

        // Create an adapter for user data
        var userAdapter = new Adapter()
                .addProperty(new Property("first").setDisplayName("First"))
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


        // Set the target on out adapter
        userAdapter.setTarget(user);

        // Instantiate our form
        new Form(userAdapter, $("#userFormWrapper"));
      }
    });
  </script>
</head>
<body>
<div class="container">
  <div class="registrationWrapper">
    <div class="row">
      <div class="offset3">
        <h3>Herp a Derp Web Application</h3>

        <p class="lead">
          Edit you some data here, isn't this so exciting!
        </p>
      </div>
    </div>
    <div class="row">
      <div class="offset3 span8" id="userFormWrapper">
      </div>
    </div>
  </div>
</div>
</body>
</html>
```

Here's how our new Form looks in our browser.

![example4](https://raw.github.com/rjenkins/emma/master/img/example_4.png)

Now let's inspect the output from our save action after we've modified our input.

![example4_save](https://raw.github.com/rjenkins/emma/master/img/example_4_save.png)

### Reviewing our latest example

So we've made much larger use of CellEditors and greatly expanded the functionality of our Form,
but there's still lots of room for improvement. Let's take a moment and look at how we're creating our adapter. Right
now we've got our logic for adapter creation hard-wired into the view itself, that's probably not a good idea. Let's
take a pass at fixing that.

### The Adapter Factory Pattern

The purpose of the Adapter Factory pattern is to decouple the logic of creating adapters from our view. The Adapter
Factory pattern is essentially an abstract factory and we provide implementations that can be passed to widgets in
our view.

```javascript
var AdapterFactory = function () {};

AdapterFactory.prototype.adapt = function (object) {
  throw "Function not supported without override"
}
```

Now we can refactor our Widget class to accept an AdapterFactory rather than an adapter. We'll also update our Form
widget to use the adapter factory and only call render if an object has been passed as input to our Form.

```javascript
// Widgets and the like

  var Widget = function (_adapterFactory) {

    if (_adapterFactory.constructor != AdapterFactory) {
      throw "adapterFactory is not a AdapterFactory object"
    }

    var adapterFactory = _adapterFactory;
    var template = "";

    this.getAdapterFactory = function () {
      return adapterFactory;
    }

    this.getTemplate = function () {
      return template;
    }

    this.setTemplate = function (_template) {
      template = _template;
    }
  };

  Widget.prototype.render = function () {
    //No-Op
  }

  ...

  var Form = function (adapterFactory, container, input) {
    this.setTemplate($(JST['form']()));

    this.render = function (input) {

      var self = this;
      var content = this.getTemplate();
      $(content).empty();
      $(content).append($(JST['formLegend']()));

      var adapter = adapterFactory.adapt(input);

      adapter.getProperties().forEach(function (property) {
        property.getCellEditor().render(content);
      });

      $(content).append($(JST['formActions']()));

      $(content).submit(function () {
        var target = adapter.getTarget();
        for (var k in target) {
          console.log(k + " " + target[k]);
        }
        return false;
      });

      if (container !== undefined) {
        $(container).append(content)
      }

      return content;
    }

    if (input !== undefined) {
      this.render(input);
    }
  }

  var _Form = function (adapterFactory, container, input) {
    Form.prototype = new Widget(adapterFactory)
    return new Form(adapterFactory, container, input);
  }
```

### Refactoring our example to use the Adapter Factory

Let's start to break our example up into something that more resembles an application and while we refactor it to use
an implementation of AdapterFactory. We're going to break the css out into a separate file and move all the
Javascript out of our HTML and put it into 2 files example5.main.js and example5.view.js

![example4_save](https://raw.github.com/rjenkins/emma/master/img/example_5_organize.png)

In **example5.main.js** we're going to start to stub out an actual application. We'll create a module or namespace
called MyApp and attach it to window, we'll also create a MyApp.model and create a proper User function to create a
User object with.

Finally we'll implement an AdapterFactory called UserAdapterFactory and implement our adapt function. Here we'll
check to see if the type of object that's being adapted is a User, if so we'll create a new UserAdapter,
set it's target to our User object and return the adapter.


```javascript
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
```

In **example5.view.js** we'll create a new User and instantiate our form, passing in the new UserAdapterFactory
object, our container and our user object.

```javascript
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
  new Emma.Form(new MyApp.UserAdapterFactory(), $("#userFormWrapper"), user);

});
```

Finally here's what our **example5.html** looks like with accompanied screenshot.

```html
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css"
        rel="stylesheet">
  <link href="./example5.css" rel="stylesheet" >

  <script type="text/javascript" src="../../lib/jquery.min.js"></script>
  <script src="../../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="../../main/emma.js"></script>
  <script type="text/javascript" src="../../lib/underscore.js"></script>
  <script src="../../main/widgetTemplates.js"></script>
  <script src="example5.main.js"></script>
  <script src="example5.view.js"></script>
</head>
<body>
<div class="container">
  <div class="registrationWrapper">
    <div class="row">
      <div class="offset3">
        <h3>Herp a Derp Web Application</h3>

        <p class="lead">
          Edit you some data here, isn't this so exciting!
        </p>
      </div>
    </div>
    <div class="row">
      <div class="offset3 span8" id="userFormWrapper">
      </div>
    </div>
  </div>
</div>
</body>
</html>
```
![example4](https://raw.github.com/rjenkins/emma/master/img/example_4.png)

### Using Adapter Factories

We can use Adapter Factories to view adapt many different types of objects and create different factories that return
different adapters for different circumstances. Let's add a new data type call Car to our examples and add some
buttons that allow us to switch between editing a User and a Car. Let's create a new example called example6 and
modify our main.js

We'll add a new model type called Car, change the name of this AdapterFactory to MyAppAdapterFactory and add a
statement to handle adapting Car objects

```javascript
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

  var Car = MyApp.model.Car = function (spec) {
    this.make = spec.make;
    this.model = spec.model;
    this.year = spec.year;
  }


  with (Emma) {
    var MyAppAdapterFactory = function () {

      this.adapt = function (object) {
        if (object instanceof User) {
          var userAdapter = new Adapter();

          ...

          userAdapter.setTarget(object);
          return userAdapter
        } else if (object instanceof Car) {
          var carAdapter = new Adapter();
          carAdapter.addProperty(new Property("make").setDisplayName("Make"))
            .addProperty(new Property("model").setDisplayName("Model"))
            .addProperty(new Property("year").setDisplayName("Year"));
          carAdapter.setTarget(object);
          return carAdapter;
        }
      }
    }


    MyApp.AdapterFactory = function () {
      MyAppAdapterFactory.prototype = new AdapterFactory();
      return new MyAppAdapterFactory();
    }
  }
});
```

Next we'll update our view to add create a new Car object and add click handlers to our Edit Car and Edit User buttons.

```javascript
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
```

Now we can click the button to toggle between the different data types and modify our Car object,
we can go back and forth each time we click the button the form re-renderings,
adapting the new datatype and redrawing itself, attaching all listeners as needed is ready for interaction.

![example6](https://raw.github.com/rjenkins/emma/master/img/example_6.png)

![example6_save](https://raw.github.com/rjenkins/emma/master/img/example_6_save.png)


### Tables, Lists, Trees and other Widgets

So far we've just looked at the Form widget and it's designed (right now) to only deal with looking at one element
so let's consider implementing some widgets that deal with lots of elements. For that we need to take a step back and
look at the Resource Pattern again.

#### The Resource Pattern

Earlier we introduced the Resource Pattern, the purpose of the Resource Pattern is to provide a collection of data
objects of a given type.

```javascript
// Public constructor function
  var Resource = function () {

    //if not called with new
    if (!(this instanceof Resource)) {
      return new Resource();
    }

    var contents = [];

    this.getContents = function () {
      return contents;
    };

    this.setContents = function (_contents) {
      contents = _contents;
      return this;
    }
  };
```

So it's pretty obvious that there is a relationship between resources and a List or Table widget and just like our
previous examples we need the ability to adapt this structure to our view, so we're going to introduce a new pattern
called am ItemProvider.

## The ItemProvider Pattern

The purpose of the ItemProvider pattern is to provide an adapter between Resources and Widgets. Like Adapters the
ItemProvider contain meta data needed by the widget for rendering and also retrain a reference to an underlying
resource. Like anything else there is a few ways we could implement this. One way would be to have a single
ItemProvider with lots of different responsibilities or we could break ItemProviders out into different functions
based off what they're providing for. We'll going to choose the later but you could always choose to consolidate this
functionality down to a smaller set of objects.

### Abstract Item Provider

Here's are basic implementation of the Abstract Item Provider.

```



















