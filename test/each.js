var Emitter = require('emitter');
var domify = require('domify');
var assert = require('assert');

var reactive = require('../');

describe('each', function(){
  it('empty should not fail', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');
    var view = reactive(el);
    assert.equal(el.children.length, 0);
  })

  it('predefined array should work', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');

    var model = {
      todos: ['milk', 'cereal', 'apples']
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 3);
    assert.equal(el.children[0].textContent, 'milk');
    assert.equal(el.children[1].textContent, 'cereal');
    assert.equal(el.children[2].textContent, 'apples');
  })

  it('setting property should work', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');

    var model = {
      todos: ['candy']
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 1);
    assert.equal(el.children[0].textContent, 'candy');

    view.set('todos', ['milk', 'cereal', 'apples']);

    assert.equal(el.children.length, 3);
    assert.equal(el.children[0].textContent, 'milk');
    assert.equal(el.children[1].textContent, 'cereal');
    assert.equal(el.children[2].textContent, 'apples');
  })

  it('should not set after destroy', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');

    var model = { todos: ['candy'] };
    var view = reactive(el, model);

    assert.equal(el.children.length, 1);
    assert.equal(el.children[0].textContent, 'candy');

    view.destroy();
    assert.equal(el.parentNode, undefined);

    // this should have no effect on the children anymore
    view.set('todos', ['milk', 'cereal']);
    assert.equal(el.children.length, 1);
  })

  it('accessing properties', function(){
    var el = domify('<ul><li each="todos">{name}</li></ul>');

    var model = {
      todos: [
        { name: 'milk' },
        { name: 'cereal' },
        { name: 'apples' }
      ]
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 3);
    assert.equal(el.children[0].textContent, 'milk');
    assert.equal(el.children[1].textContent, 'cereal');
    assert.equal(el.children[2].textContent, 'apples');
  })

  it('accessing view functions', function () {
    var el = domify('<ul><li each="todos"><span data-text="name | uppercase"></span></li></ul>');

    var model = {
      todos: [
        { name: 'milk' },
        { name: 'cereal' },
        { name: 'apples' }
      ]
    };

    var view = {
      uppercase: function (str) {
        if (str) return str.toUpperCase();
      }
    };

    var r = reactive(el, model, view);

    assert.equal(el.children.length, 3);
    assert.equal(el.children[0].textContent, 'MILK');
    assert.equal(el.children[1].textContent, 'CEREAL');
    assert.equal(el.children[2].textContent, 'APPLES');
  });

  it('calls event handlers in the context of child model', function (done) {
    var el = domify('<ul><li each="todos"><a href="#" on-click="clicked">click</a></li></ul>');

    var model = {
      todos: [
        { name: 'milk' },
        { name: 'cereal' },
        { name: 'apples' }
      ]
    };

    var view = {
      clicked: function (e, ctx) {
        assert.equal(ctx.model.name, 'milk');
        done();
      }
    };

    var r = reactive(el, model, view);

    el.firstChild.firstChild.click();
  });

  it('Array#push', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');

    var model = {
      todos: []
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 0);

    model.todos.push('milk');
    assert.equal(el.children[0].textContent, 'milk');

    model.todos.push('cereal');
    assert.equal(el.children[1].textContent, 'cereal');
  })

  it('Array#unshift', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');

    var model = {
      todos: []
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 0);

    model.todos.unshift('milk');
    assert.equal(el.children[0].textContent, 'milk');

    model.todos.unshift('cereal');
    assert.equal(el.children[0].textContent, 'cereal');

    model.todos.push('apples');
    assert.equal(el.children[2].textContent, 'apples');
  })

  it('Array#splice', function(){
    var el = domify('<ul><li each="todos">{this}</li></ul>');

    var model = {
      todos: []
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 0);

    // splice in two new items
    model.todos.splice(0, 0, 'milk', 'eggs');
    assert.equal(el.children.length, 2);
    assert.equal(el.children[0].textContent, 'milk');
    assert.equal(el.children[1].textContent, 'eggs');
    assert.deepEqual(model.todos, ['milk', 'eggs']);

    // replace milk with apples
    model.todos.splice(0, 1, 'apples');
    assert.equal(el.children.length, 2);
    assert.equal(el.children[0].textContent, 'apples');
    assert.equal(el.children[1].textContent, 'eggs');
    assert.deepEqual(model.todos, ['apples', 'eggs']);

    // splice milk back in to start
    model.todos.splice(0, 0, 'milk');
    assert.equal(el.children.length, 3);
    assert.equal(el.children[0].textContent, 'milk');
    assert.equal(el.children[1].textContent, 'apples');
    assert.equal(el.children[2].textContent, 'eggs');
    assert.deepEqual(model.todos, ['milk', 'apples', 'eggs']);
  })

  // test that items are put into the proper place in the dom
  it('multiple arrays', function(){
    var el = domify('<ul><li each="todos">{this}</li><li each="tonots">{this}</li></ul>');

    var model = {
      todos: [],
      tonots: []
    };

    var view = reactive(el, model);

    assert.equal(el.children.length, 0);

    model.tonots.push('milk');
    assert.equal(el.children[0].textContent, 'milk');

    model.todos.push('apples');
    assert.equal(el.children[0].textContent, 'apples');
    assert.equal(el.children[1].textContent, 'milk');

    model.tonots.push('cereal');
    assert.equal(el.children[2].textContent, 'cereal');
  })

})
