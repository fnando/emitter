/*jshint maxparams:6 */
/*global exports */

// A simple event emitter that I've using in both
// Node.js and browser.
//
;(function(emitter){
  "use strict";

  // Bind the callback to the specified context.
  //
  var bind = function(emitter, event, callback, context, once) {
    var _callback = function() {
      if (once) {
        emitter.off(event, callback);
      }

      return callback.apply(context, arguments);
    };

    // Store the original callback, so we can remove it
    // later with Emitter#off method.
    _callback.callback = callback;

    return _callback;
  };

  // Convert arguments into array.
  //
  var toArray = function(args) {
    return args.length === 1 ? [args[0]] : Array.apply(null, args);
  };

  function _emitter() {
    // Hold all callbacks.
    //
    var listeners = {};

    // Initialize the Emitter object.
    //
    function Emitter() {}

    // Attach a new event handler.
    //
    //     var emitter = Emitter.create();
    //     emitter.on("ready", callback);
    //     emitter.on("ready", callback, this);
    //
    Emitter.prototype.on = function(event, callback, context, once) {
      if (!listeners[event]) {
        listeners[event] = [];
      }

      listeners[event].push(bind(this, event, callback, context, once));

      return this;
    };

    // Detach a specific event handler. If no `callback` is
    // provided, then all event handlers will be removed.
    //
    //     emitter.off("ready", callback);
    //     emitter.off("ready");
    //
    Emitter.prototype.off = function(event, callback) {
      var result = []
        , index = 0
        , count
        , _listeners
      ;

      // No callback has been provided, so remove all
      // of them.
      if (!callback) {
        return delete(listeners[event]);
      }

      // Retrieve listeners for this event.
      _listeners = this.listeners(event);
      count = _listeners.length;

      for (; index < count; index++) {
        if (callback === _listeners[index].callback) {
          continue;
        }

        result.push(_listeners[index]);
      }

      if (result.length === 0) {
        return delete(listeners[event]);
      } else {
        listeners[event] = result;
      }
    };

    // Return a copy of all listeners for a given
    // `event` name. If `event` doesn't exist, then an empty
    // array will be returned instead.
    //
    //     emitter.listeners();
    //
    Emitter.prototype.listeners = function(event) {
      return (listeners[event] || []).slice(0);
    };

    // Attach a new event handler that will be executed only once.
    //
    //     emitter.once("ready", callback);
    //     emitter.once("ready", callback, this);
    //
    Emitter.prototype.once = function(event, callback, context) {
      this.on(event, callback, context, true);
    };

    // Trigger the specified event. Any additional parameters
    // will be passed to the callback.
    //
    //     emitter.emit("ready");
    //     emitter.emit("ready", arg1, arg2, argN);
    //
    Emitter.prototype.emit = function() {
      var args = toArray(arguments)
        , event = args.shift()
        , listeners = this.listeners(event)
        , callback
      ;

      while (listeners.length) {
        callback = listeners.shift();
        callback.apply(undefined, args);
      }
    };

    return new Emitter();
  }

  // Expose only the Emitter instance builder.
  emitter.create = _emitter;

  // Mix public interface into target object. This will bind functions to it.
  emitter.extend = function(target, attribute) {
    var emitter = this.create();
    target[attribute || "_emitter"] = emitter;

    target.on = emitter.on.bind(emitter);
    target.off = emitter.off.bind(emitter);
    target.once = emitter.once.bind(emitter);
    target.emit = emitter.emit.bind(emitter);
    target.listeners = emitter.listeners.bind(emitter);
  };
})(typeof(exports) === "undefined" ? this.Emitter = {} : exports);
