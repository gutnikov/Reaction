'use strict';

const helpers = require('./helpers'),
      Element = require('./element');

class ReactElement extends Element {
  constructor(props) {
    const domElement = null;

    super(domElement, props);

    this.state = undefined;

    this.context = undefined;
  }

  mount(parent, reference, context) {
    super.mount(parent, reference);

    this.context = context;

    this.children = helpers.guaranteeArray(this.render());

    const childParent = this,
          childReference = reference,
          childContext = this.getChildContext(context) || context;

    this.children.forEach(function(child) {
      child.mount(childParent, childReference, childContext);
    });

    this.componentDidMount(); 
  }

  remount() {
    const childParent = this,
          childReference = this.getChildReference(),
          childContext = this.getChildContext(this.context) || this.context;

    this.children.forEach(function(child) {
      child.unmount(childContext);
    });

    this.children = helpers.guaranteeArray(this.render());

    this.children.forEach(function(child) {
      child.mount(childParent, childReference, childContext);
    }.bind(this));
  }

  unmount(context) {
    this.context = context;

    this.componentWillUnmount();

    const childContext = this.getChildContext(context) || context;

    this.children.forEach(function(child) {
      child.unmount(childContext);
    });
    
    super.unmount();
  }

  forceUpdate() {
    this.remount();
  }

  setState(state) {
    this.state = state;

    this.remount();
  }

  spliceChildren(start, removeCount, addedChildren, context = this.context) {
    const firstChild = first(this.children),
          childContext = this.getChildContext(context) || context;

    firstChild.spliceChildren(start, removeCount, addedChildren, childContext);
  }

  addChild(child, context = this.context) {
    const firstChild = first(this.children),
          childContext = this.getChildContext(context) || context;

    firstChild.addChild(child, childContext);
  }

  removeChild(child, context = this.context) {
    const firstChild = first(this.children),
          childContext = this.getChildContext(context) || context;

    firstChild.removeChild(child, childContext);
  }

  setAttribute(name, value) {
    const firstChild = first(this.children);

    return firstChild.setAttribute(name, value);
  }

  getAttribute(name) {
    const firstChild = first(this.children);

    return firstChild.getAttribute(name);
  }

  clearAttribute(name) {
    const firstChild = first(this.children);

    firstChild.clearAttribute(name);
  }

  setClass(className) {
    const firstChild = first(this.children);

    firstChild.setClass(className);
  }

  addClass(className) {
    const firstChild = first(this.children);

    firstChild.addClass(className);
  }

  removeClass(className) {
    const firstChild = first(this.children);

    firstChild.removeClass(className);
  }

  toggleClass(className) {
    const firstChild = first(this.children);

    firstChild.toggleClass(className);
  }

  clearClasses() {
    const firstChild = first(this.children);

    firstChild.clearClasses();
  }

  getChildReference() {
    const parent = this.getParent(),
          child = this;

    return reference(parent, child);
  }
}

module.exports = ReactElement;

function reference(parent, child) {
  let reference = findReference(parent, child),
      parentDOMElement = parent.getDOMElement();

  while ((reference === null) && (parentDOMElement === null)) {
    child = parent;
    parent = parent.getParent();

    reference = findReference(parent, child);
    parentDOMElement = parent.getDOMElement();
  }

  return reference;
}

function findReference(parent, child) {
  const children = parent.getChildren(),
        remainingChildren = helpers.remaining(child, children);

  return remainingChildren.reduce(function(reference, remainingChild) {
    if (reference === null) {
      const remainingChildDOMElement = remainingChild.getDOMElement();

      if (remainingChildDOMElement !== null) {
        reference = remainingChild;
      } else {
        child = null;
        parent = remainingChild;

        reference = findReference(parent, child);
      }
    }

    return reference;
  }, null);
}

function first(array) { return array[0]; }

