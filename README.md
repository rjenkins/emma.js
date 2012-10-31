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

So reviewing this code we module pattern function for our adapter and it takes an argument called _target. We save the
variable _target off into a private variable called target and we create getter and setter methods for it and expose
on the returned API.

Well there's not much to our adapter at the moment, so let's make it a bit more useful by introducing our next
pattern Properties.

### The Property Pattern

Property objects allow us to organize metadata associated with viewing the property of an object.
Properties are retained in an adapter and the view will then be able to use this metadata to determine how to render
an object in a view. Additionally our Property object retains a reference to it's parent adapter and
has the getValue() and setValue() functions.

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
Now we can go back and modify our adapter object to contain a collection of Property objects.
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
We've added the private instance variable itemProperties and two new methods, the helper method addProperty and the
getProperties method. Take note that the addProperty method checks to verify that the property reference
passed to the function is indeed a Property object, set's itself as the parent adapter and returns itself.

### The Resource Pattern

A Resource is a collection of data objects of a given type. If you're familiar with backbone.js then you're familiar
with Collections. For the moment let us disregard how these data resources are acquired from the server and introduce
a very simple implementation of the Resource pattern.

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

Consider the following example, you'll need to install node.js and the underscore module (npm install underscore).
In our example we'll create a new Resource called userResource and set it's contents to a list of user objects,
then we create a new Adapter called userAdapter and add a Property to it from the email attribute of users.
Finally we get the contents from our userResource, adapt the objects and print out the value of it's properties.

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
    var userAdapter = new Adapter(user).addProperty(new Property("email"));
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

// example2.js

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

Here's our abstract widget function. Our widget takes an adapter, container, and template as a constructor args.

```javascript
// Widgets and the like
var Widget = function (adapter, container, template) {

  this.adapter = adapter;
  this.container = container;
  this.template = template;
}
```

### Creating our first widget, a resuable Form.

Now that we've created an abstract Widget type, let's create our Form widget.

```javascript
var _Form = function (adapter, container, template) {

  // Create a new prototype function for our form
  function Form() {
    this.render();
  }

  Form.prototype = new Widget(adapter, container, $(JST['form']()));
  Form.prototype.constructor = Widget;
  Form.prototype.render = function () {

    var content = this.template;
    $(content).empty();
    $(content).append($(JST['formLegend']()));

    this.adapter.getProperties().forEach(function (property) {
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
```

Our Form widget will take an adapter, a container and an optional template as constructor arguments.
Our form will also have a single function called render. When a Form is create it will call this.render().

### Rendering our Form.

Let's take a detailed look at the render method for our form widget. Some of these concepts will be repeated across
multiple widgets, so it's good to have an understanding of the basic rendering function of a widget..

#### Initial Form Rendering

1. First we retrieve our template.
2. Empty out any existing contents.
2. Then we append our legend to our form.

```javascript
this.render = function () {

  var content = this.template;
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
  this.adapter.getProperties().forEach(function (property) {
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

Like Widgets, Cell Editors are reusable UI components, so technically that makes them widgets
as well but their specifically designed to take and modify input from html elements.
Let's create an constuctor function for our Cell Editors, we could have them extend Widget, but there's
not that much value in that so we're just going to create a new constructor.

A Cell Editor takes a property and an template as constructor functions. Like Widget it also has a render function but
throws an exception if it isn't overriden.

```javascript

  var CellEditor = function (property, template) {

    if (!(property instanceof Property))
      throw "property is not an instance of Property object"

    this.property = property;
    this.template = template;
  }

  CellEditor.prototype.render = function () {
    //No-Op
  }
```
### Modifying Property

We need to add some attributes to our property object to make it more useful for use
in widgets, we'll start by adding a displayName field.

```javascript
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

```

### Creating our TextInput Cell Editor

The TextInput has a constructor which accepts a property and an optional template. We create a new constructor function
called TextInput and set it's prototype to a new CellEditor, we then update it's prototype.constructor and override the
render function for our TextInput.

Render is straight forward, we save a copy of this to self. Next we call get template and pass it our property, as
attributes of our property are accessed in our template and finally we append our input to the parent container
element.

```javascript

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
        self.property.setValue($(this).val());
      });

      // From Property

      this.setValue = function (value) {
        adapter.getTarget()[id] = value;
      }
```

### Exposing our API

We'll need to expose some of these functions on our Emma object so let's do that now.

```javascript
  ...

  Emma.Adapter = Adapter;
  Emma.CellEditor = CellEditor;
  Emma.Form = _Form;
  Emma.TextInput = _TextInput;
  Emma.Widget = Widget;
```

### Our Current Library

Emma's still small enough to paste the contents of the library in here pretty easily,
so let's do that now for review before we start to use our Form widget.

**src/main/test/example3/emma_ex3.js**

```javascript
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
```

### Using our Form widget

So let's look at an example of using our first widget. We're going to start with a piece of data first (of course),
this will be a user object, we'll create a new adapter for our user and add some properties and finally we'll
instantiate our form widget and pass it our User Adapter.

**src/test/example3/example3.html**

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

  <script type="text/javascript" src="../../lib/jquery.min.js"></script>
  <script src="../../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="emma_ex3.js"></script>
  <script type="text/javascript" src="../../lib/underscore.js"></script>
  <script src="../../main/widgetTemplates.js"></script>
  <script type="text/javascript">


    $(function () {
      with (Emma) {

        // Mock up some data
        var user = { first:"Ray", last:"Jenkins",
          username:"rjenkins", email:"rjenkins@aceevo.com" };

        // Create an adapter for user data
        var userAdapter = new Adapter(user)
                .addProperty(new Property("first").setDisplayName("First"))
                .addProperty(new Property("last").setDisplayName("Last"))
                .addProperty(new Property("username").setDisplayName("Username"))
                .addProperty(new Property("email").setDisplayName("Email"));


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

Of course forms are never quite this simple so we'll need to implement a few more Cell Editors to
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

    this.adapter;
    this.id = _id;
    this.displayName;
    this.visibleInForm = true;
    this.visibleInTable = true;
    this.cellEditorType = CellEditor.TEXT_INPUT;
    this.options = {};
    ...

   Property.prototype.setCellEditorType = function (cellEditorType) {
      this.cellEditorType = cellEditorType;
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
    ...
```

And let's define some constants for our CellEditor types.

```javascript

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

**src/test/example4/example4.html**

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
      padding-bottom: 20px;
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

  <script type="text/javascript" src="../../lib/jquery.min.js"></script>
  <script src="../../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="emma_ex4.js"></script>
  <script type="text/javascript" src="../../lib/underscore.js"></script>
  <script src="../../main/widgetTemplates.js"></script>
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
but there's still lots of room for improvement. Let's take a moment and look at how we're creating our adapters. Right
now we've got our logic for adapter creation hard-wired into the view itself, that's probably not a good idea. Let's
take a pass at fixing that.

### The Adapter Factory Pattern

The purpose of the Adapter Factory pattern is to decouple the logic of creating adapters from our view. The Adapter
Factory pattern is essentially an abstract factory and we provide implementations that can be passed to widgets in
our view.

Once again there's several ways to implement our factory, the approach I've taken is to defined a zero argument
constructor that creates an adaptInternal hash for storing a reference to a type and function used for adapting that
type.

Then we've created an adapt function, it looks up the constructor type of our object in adapterInternal and if found
returns the result of calling that function, otherwise it calls the defaultAdapt function which creates a simple
adapter for our model object.

```javascript
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
```

Now we can refactor our Widget class to accept an AdapterFactory rather than an adapter. We'll also update our Form
widget to use the adapter factory and only call render if an object has been passed as input to our Form.

```javascript
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

  ...

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

       ...
  }

```

### Refactoring our example to use the Adapter Factory

Let's start to break our example up into something that more resembles an application and while we refactor it to use
an implementation of AdapterFactory. We're going to break the css out into a separate file and move all the
Javascript out of our HTML and put it into 2 files example5.main.js and example5.view.js

![example5_organize](https://raw.github.com/rjenkins/emma/master/img/example_5_organize.png)

In **example5.main.js** we're going to start to stub out an actual application. We'll create a module or namespace
called MyApp and attach it to window, we'll also create a MyApp.model and create a proper User function to create a
User object with.

Finally we'll implement an AdapterFactory called UserAdapterFactory and implement our adapt function. Here we'll
check to see if the type of object that's being adapted is a User, if so we'll create a new UserAdapter,
set it's target to our User object and return the adapter.

**src/test/example5/exampl5.main.js**

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
  new Emma.Form(new MyApp.AdapterFactory(), $("#userFormWrapper"), user);

});

```

Finally here's what our **example5.html** looks like with accompanied screenshot.

```
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css"
        rel="stylesheet">
  <link href="./example5.css" rel="stylesheet" >

  <script type="text/javascript" src="../../lib/jquery.min.js"></script>
  <script src="../../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="emma_ex5.js"></script>
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

We can use Adapter Factories to  adapt many different types of objects and create different factories that return
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

    MyApp.AdapterFactory = function () {
      var adapterFactory = new AdapterFactory();
      adapterFactory.adaptInternal[User] = function (object) {
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
      adapterFactory.adaptInternal[Car] = function (object) {
        var carAdapter = new Adapter();
        carAdapter.addProperty(new Property("make").setDisplayName("Make"))
          .addProperty(new Property("model").setDisplayName("Model"))
          .addProperty(new Property("year").setDisplayName("Year"));
        carAdapter.setTarget(object);
        return carAdapter;
      }

      return adapterFactory;
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

The purpose of the ItemProvider pattern adapt Resources to Widgets. Like Adapters the ItemProvider contain meta data
needed by the widget for rendering and also retrain a reference to an underlying resource. Like anything else there
is a few ways we could implement this. One way would be to have a single ItemProvider with lots of different
responsibilities or we could break ItemProviders out into different functions based off what they're providing for.
We'll going to choose the later but you could always choose to consolidate this functionality down to a smaller set
of objects.

### Abstract Item Provider

Here's a basic implementation of the Abstract Item Provider Pattern.

```javascript
  // Item Provider
  // An implementation of the ItemProvder pattern our constructor
  // wraps a resource and adds a getContents method to the ItemProvider
  // prototype for retrieving objects from resources.

  var ItemProvider = Emma.ItemProvider = function (resource) {
    this.resource = resource;
  }

  ItemProvider.prototype.getContents = function () {
    if (this.resource !== undefined) {
      return this.resource.contents;
    } else {
      return [];
    }
  }
```

### TableItemProvider

Now that we have a basic type prototype in place for ItemProviders let's implement a TableItemProvider. Let's keep
the implementation simple for now and implement the following in our provider.

1. Provide the ability to set a caption for our Table with a fluent builder setter
2. Add a helper method for adding columns to this table in the format of { key, displayName }

... and here's our implementation.

```javascript
    var _TableItemProvider = function (resource) {

    function TableItemProvider() {
      this.columns = [];
      this.caption = undefined;
    }

    TableItemProvider.prototype = new ItemProvider(resource);
    TableItemProvider.prototype.constructor = ItemProvider;
    TableItemProvider.prototype.getColumns = function () {
      return this.columns;
    }

    TableItemProvider.prototype.setCaption = function (caption) {
      this.caption = caption;
      return this;
    }

    TableItemProvider.prototype.getCaption = function () {
      return this.caption;
    }

    TableItemProvider.prototype.addColumn = function (key, displayName) {
      this.columns.push({key:key, displayName:displayName});
      return this;
    }

    return new TableItemProvider();

  }

  ...

  Emma.Table = _Table;
  Emma.TableItemProvider = _TableItemProvider;

```

### Implementing our Table Widget

Our Table widget is a bit bigger than our Form widget but it's not too complex, let's walk through the code real quick.

1. Check if our container is not a <table> tag, if not throw an exception
2. Check that we've been passed a valid TableItemProvider
3. Create a constructor function for our Table, if input !== undefined call render
4. A default set of templates if none provided by user as overrides
5. Set up our Widget prototype and override render.
6. Return a new Table

```javascript

  // Table - extends Widget, builds an html table.
  // adapterFactory - a reference to an adapter factory for rendering rows in table
  // container - must be a <table> tag
  // input - a reference to a TableItemProvider
  // template - an optional object with { tableCaption, tableHeader, tableRow } underscore templates.

  var _Table = function (adapterFactory, container, input, template) {

    if (container == undefined || $(container).is('table') === false)
      throw "container must be a table"

    if(!(input instanceof Emma.TableItemProvider) === false) {
      throw "input must be a TableItemProvider"
    }
    // Create a new prototype function for our form
    function Table() {
      if (this.input !== undefined) {
        this.render(this.input);
      }
    }

    var defaultTemplate = {
      tableCaption:JST['tableCaption'],
      tableHeader:JST['tableHeader'],
      tableRow:JST['tableRow']
    };

    Table.prototype = new Widget(adapterFactory, container, input, template || defaultTemplate);
    Table.prototype.constructor = Widget;
    Table.prototype.render = function (input) {

      var input = input || this.input;

      var content = this.container;
      $(content).empty();

      if (input.getCaption() !== undefined) {
        $(content).append(this.template.tableCaption(input));
      }

      $(content).append(this.template.tableHeader(input));

      var tableBody = $(JST['tableBody']);
      var rowValues = [];
      var self = this;

      input.getContents().forEach(function (object) {
        var adapter = self.adapterFactory.adapt(object);
        input.getColumns().forEach(function (column) {
          rowValues.push(adapter.getPropertyById(column.key).getValue());
        });

        $(tableBody).append(_.template(self.template.tableRow, { values:rowValues}))
          .find("tr").last().click(function () {
            console.log(adapter.getTarget());
          });

        rowValues = [];
      });

      $(content).append(tableBody);
    }

    return new Table();
  }
```

### A closer look at rendering our Table.

Let's just dig into render for a moment comments inline in the code

```javascript

Table.prototype.render = function (input) {

      // If we're not passed input by the user, use the input
      // passed in during construction.

      var input = input || this.input;

      // Retrieve and clear out our container
      var content = this.container;
      $(content).empty();

      // If the user set a caption add it to our HTML
      if (input.getCaption() !== undefined) {
        $(content).append(this.template.tableCaption(input));
      }

      // Set up table headers
      $(content).append(this.template.tableHeader(input));

      // Get our base tbody tag
      var tableBody = $(JST['tableBody']);
      var rowValues = [];
      var self = this;

      // Get the contents of our TableItemProvider, forEach item in the Provider (and wrapped resource)
      // adapt the object using our adapter factory. Now for each column defined in the TableItemProvider, retrieve
      // the associated property from the adapter, get it's value and add to rowValues
      input.getContents().forEach(function (object) {
        var adapter = self.adapterFactory.adapt(object);
        input.getColumns().forEach(function (column) {
          rowValues.push(adapter.getPropertyById(column.key).getValue());
        });

        // We've created a row, now use the tableRow template and rowValues to append this row to the tbody.
        // Also once we've appended the row let's add a click handler to print out the contents of our target to
        console.log when a row is clicked in the table.
        $(tableBody).append(_.template(self.template.tableRow, { values:rowValues}))
          .find("tr").last().click(function () {
            console.log(adapter.getTarget());
          });

        rowValues = [];
      });

      $(content).append(tableBody);
    }
```

### Table Templates and adding getPropertyById to Adapter.

In order to support tables we had to add some small templates and a new method to the Adapter.

```javascript
// Table Templates
window.JST['tableCaption'] = _.template(
  "<caption><%= caption %></caption>"
);

window.JST['tableHeader'] = _.template(
  "<thead<tr>" +
    "<% _.each(getColumns(), function(column) { %>" +
    "<th><%= column.displayName %></th>" +
    "<% }); %>" +
    "</tr></thead>"
);

window.JST['tableBody'] = "<tbody></tbody>"

window.JST['tableRow'] =
  "<tr>" +
    "<% _.each(values, function(value) { %>" +
    "<td>" +
    "<%= value %>" +
    "</td>" +
    "<% }); %>" +
    "</tr>";
```


```javascript
...

    var setTarget = function (_target) {
      target = _target;
      return this;
    }

    // Filter item properties by Id and return the first matching
    // property in the list of itemProperties
    var getPropertyById = function (id) {
      return _.filter(itemProperties, function (prop) {
        return prop.id === id;
      })[0];
    }
```
### Using our Table Widget.

So now we should be able to use our ItemProvider, TableItemProvider and Table pretty easily,
we've modified our HTML to support 2 table containers, our .main.js will stay the same and here is a new example7.view
.js to use the tables, finally attached is a screen shot with the console up showing output of click interaction
with the table.

**src/test/example7/example7.html**
```javascript
<!DOCTYPE html>
<html>
<head>
  <title></title>
  <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css"
        rel="stylesheet">
  <link href="./example7.css" rel="stylesheet" >

  <script type="text/javascript" src="../../lib/jquery.min.js"></script>
  <script src="../../lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="./emma_ex7.js"></script>
  <script type="text/javascript" src="../../lib/underscore.js"></script>
  <script src="../../main/widgetTemplates.js"></script>
  <script src="example7.main.js"></script>
  <script src="example7.view.js"></script>
</head>
<body>
<div class="container">
  <div class="tableWrapper">
    <div class="row">
      <table id="tableExample" class="table table-bordered table-hover table-striped"></table>
    </div>
    <div class="row">
      <table id="tableExample2" class="table table-bordered table-hover table-striped"></table>
    </div>
  </div>
</div>
</body>
</html>
```

**src/test/example7/example7.view.js**
```
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
      username:"jhendrix", email:"jhendrix@theexperience.com", sex:"m", additionalInfo:"None", active:false, role:"false"
    })]);

  var carResource = new Emma.Resource([new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year:1999}), new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year:1999}), new MyApp.model.Car({ make:"Nissan", model:"Pathfinder",
    year:1999})]);

  var tableItemProvider = new Emma.TableItemProvider(userResource)
    .setCaption("Users").addColumn("first", "First Name")
    .addColumn("last", "Last Name")
    .addColumn("email", "Email Address")
    .addColumn("role", "Role");

  var tableItemProviderCar = new Emma.TableItemProvider(carResource)
    .setCaption("Cars").addColumn("make", "Make")
    .addColumn("model", "Model")
    .addColumn("year", "Year");


  // Instantiate our form
  new Emma.Table(adapterFactory, $("#tableExample"), tableItemProvider);
  new Emma.Table(adapterFactory, $("#tableExample2"), tableItemProviderCar);
});
```

![example7](https://raw.github.com/rjenkins/emma/master/img/example_7.png)














