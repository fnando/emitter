# Emitter: a simple event emitter for Node.js and browser

## Usage

Create new emitter

``` javascript
  var emitter = Emitter.create();
```

### emitter.emit 

Trigger the specified event. Any additional parameters
will be passed to the callback.

``` javascript
  emitter.emit("ready");
  emitter.emit("ready", arg1, arg2, argN);
```
    
### emitter.on

Attach a new event handler.

``` javascript
  emitter.on("ready", callback);
  emitter.on("ready", callback, this);
``` 
    
### emitter.off

Detach a specific event handler.  If no `callback` is 
provided, then all event handlers will be removed.

``` javascript
  emitter.off("ready", callback);
  emitter.off("ready");
```

### emitter.listeners

Return a copy of all listeners for a given `event` name. 
If `event` doesn't exist, then an empty array will be 
returned instead.

``` javascript
  emitter.listeners();
```

### emiiter.once

Attach a new event handler that will be executed only once.


``` javascript
  emitter.once(callback);
  emitter.once(callback, this);
```

    
## Running tests

Install `jasmine-node` with `npm install jasmine-node -g` and
run tests with `jasmine-node emitter.spec.js`.
