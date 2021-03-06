# Wrapper components

In this example, we'll build a simplistic React app showing a list of colors to see how one could integrate **Baobab** with React by using wrapper components.

### Summary

* [Creating the app's state](#creating-the-apps-state)
* [Rooting our top-level component](#rooting-our-top-level-component)
* [Branching our list](#branching-our-list)
* [Actions](#actions)
* [Dynamically set the list's path using props](#dynamically-set-the-lists-path-using-props)
* [Accessing the tree and cursors](#accessing-the-tree-and-cursors)

### Creating the app's state

Let's create a **Baobab** tree to store our colors' list:

*state.js*

```js
var Baobab = require('baobab');

module.exports = new Baobab({
  colors: ['yellow', 'blue', 'orange']
});
```

### Rooting our top-level component

Now that the tree is created, we should bind our React app to it by "rooting" our top-level component.

Under the hood, this component will simply propagate the tree to its descendants using React's context so that "branched" component may subscribe to updates of parts of the tree afterwards.

*main.jsx*

```jsx
var React = require('react'),
    Root = require('baobab-react/wrappers').Root,
    tree = require('./state.js'),

    // We will write this component later
    List = require('./list.jsx');

// Wrapping our list within the Root component
var group = (
  <Root tree={tree}>
    <List />
  </Root>
);

// Rendering the app
React.render(group, document.querySelector('#mount'));
```

### Branching our list

Now that we have "rooted" our top-level `App` component, let's create the component displaying our colors' list and branch it to the tree's data.

*list.jsx*

```jsx
var React = require('react'),
    Branch = require('baobab-react/wrappers').Branch;

// We need to wrap our bound component with a Branch
var ListWrapper = React.createClass({
  render: function() {
    return (

      // Mapping the paths we want to get from the tree through the `cursors` key
      // Associated data will be bound to the children's props
      <Branch cursors={{colors: ['colors']}}>
        <List />
      </Branch>
    );
  }
});

var List = React.createClass({
  render() {

    // Our colors are now available through the component's props
    var colors = this.props.colors;

    function renderItem(color) {
      return <li key={color}>{color}</li>;
    }

    return <ul>{colors.map(renderItem)}</ul>;
  }
});

module.exports = ListWrapper;
```

Our app would now render something of the kind:

```html
<div>
  <ul>
    <li>yellow</li>
    <li>blue</li>
    <li>orange</li>
  </ul>
</div>
```

But let's add a color to the list:

```js
tree.push('colors', 'purple');
```

And the list component will automatically update and to render the following:

```html
<div>
  <ul>
    <li>yellow</li>
    <li>blue</li>
    <li>orange</li>
    <li>purple</li>
  </ul>
</div>
```

Now you just need to add an action layer on top of that so that app's state can be updated and you've got yourself an atomic Flux!

### Actions

Here is what we are trying to achieve:

```
                                 ┌────────────────────┐
                   ┌──────────── │    Central State   │ ◀───────────┐
                   │             │    (Baobab tree)   │             │
                   │             └────────────────────┘             │
                Renders                                          Updates
                   │                                                │
                   │                                                │
                   ▼                                                │
        ┌────────────────────┐                           ┌────────────────────┐
        │        View        │                           │       Actions      │
        │ (React Components) │  ────────Triggers───────▶ │     (Functions)    │
        └────────────────────┘                           └────────────────────┘
```

For the time being we only have a central state stored by a Baobab tree and a view layer composed of React components.

What remains to be added is a way for the user to trigger actions and update the central state.

To do so `baobab-react` proposes to create simple functions as actions:

*actions.js*

```js
exports.addColor = function(tree, color) {
  tree.push('colors', color);
};
```

Now let's add a simple button so that a user may add colors:

*list.jsx*

```jsx
var React = require('react'),
    Branch = require('baobab-react/wrappers').Branch,
    actions = require('./actions.js');

var ListWrapper = React.createClass({
  render: function() {
    return (

      // Mapping actions along with cursors
      <Branch cursors={{colors: ['colors']}}
              actions={{add: actions.addColor}}>
        <List />
      </Branch>
    );
  }
});

var List = React.createClass({
  getInitialState: function() {
    return {inputColor: null};
  }

  // Controlling the input's value
  updateInput(e) {
    this.setState({inputColor: e.target.value});
  },

  // Adding a color on click
  handleClick() {

    // You can access the actions through `props.actions`
    this.props.actions.add(this.state.inputColor);

    // Resetting the input
    this.setState({inputColor: null});
  }

  render() {
    var colors = this.props.colors;

    function renderItem(color) {
      return <li key={color}>{color}</li>;
    }

    return (
      <div>
        <ul>{colors.map(renderItem)}</ul>
        <input type="text"
               value={this.state.inputColor}
               onUpdate={this.updateInput} />
        <button type="button" onClick={this.handleClick}>Add</button>
      </div>
    );
  }
});

module.exports = ListWrapper;
```

### Dynamically set the list's path using props

Sometimes, you might find yourself needing cursors paths changing along with your component's props.

For instance, given the following state:

*state.js*

```js
var Baobab = require('baobab');

module.exports = new Baobab({
  colors: ['yellow', 'blue', 'orange'],
  alternativeColors: ['purple', 'orange', 'black']
});
```

You might want to have a list rendering either one of the colors' lists.

Fortunately, you can do so by passing a function taking both props and context of the components and returning a valid mapping:

*list.jsx*

```jsx
var React = require('react'),
    Branch = require('baobab-react/wrappers').Branch;

var ListWrapper = React.createClass({
  render: function() {
    return (

      // Using a function so that your cursors' path can use the component's props etc.
      function defineCursors(props, context) {
        return {
          colors: [props.alternative ? 'alternativeColors', 'colors']
        };
      }

      <Branch cursors={defineCursors}>
        <List />
      </Branch>
    );
  }
});

var List = React.createClass({
  render() {
    var colors = this.props.colors;

    function renderItem(color) {
      return <li key={color}>{color}</li>;
    }

    return <ul>{colors.map(renderItem)}</ul>;
  }
});

module.exports = ListWrapper;
```

### Accessing the tree and cursors

For convenience, and if you want a quicker way to update your tree, you can always access this one through the context or even access the cursors used by the branched component under the hood:

```js
var React = require('react'),
    Branch = require('baobab-react/wrappers').Branch,
    PropTypes = require('baobab-react/prop-types');

var ListWrapper = React.createClass({
  render: function() {
    return (
      <Branch cursors={{colors: ['colors']}}>
        <List />
      </Branch>
    );
  }
});

var List = React.createClass({

  // To access the tree and cursors through context,
  // React obliges you to define `contextTypes`
  contextTypes: {
    tree: PropTypes.baobab,
    cursors: PropTypes.cursors
  },

  render: function() {

    // Accessing the tree
    this.context.tree.get();

    // Using the underlying cursors
    this.context.cursors.colors.get();
  }
});

module.exports = ListWrapper;
```
