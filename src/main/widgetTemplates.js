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


// Form Actions
window.JST['formActions'] = _.template(
  "<div class=\"form-actions\">" +
    "<button type=\"submit\" class=\"btn btn-primary\">Save changes</button>" +
    "<button type=\"button\" class=\"btn\">Cancel</button>" +
    "</div>"
);

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







