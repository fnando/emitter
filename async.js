// async utils for everyday usage
// ==============================
//
// I'm using this in both client-side and Node.js.
//
;(function(async){
  //
  //
  function _deferred() {
    // Determine if deferred has been resolved or rejected.
    // This must be private so we can't modify a deferred's
    // state once is set.
    //
    var state = null;

    // Instantiate deferred's emitter.
    //
    var emitter = async.emitter();

    // Hold params from resolved/rejected deferred.
    //
    var params = [];

    // Hold the rejected status value.
    //
    var REJECTED = "rejected";

    // Hold the resolved status value.
    //
    var RESOLVED = "resolved";

    // Hold the queue name for the `always` event.
    //
    var ALWAYS = "always";

    // Hold the queue name for the `progress` event.
    //
    var PROGRESS = "progress";

    // List all functions that must be proxied in the
    // promise objet.
    //
    var PROMISE_FUNCTIONS = [
      "fail", "done", "progress", "when", "isResolved",
      "isRejected", "isFrozen"
    ];

    // Change the deferred's state. If object is frozen,
    // then an exception will be raised.
    //
    var setState = function(newState, args, frozen) {
      if (frozen) {
        throw new Error("Can't change state of frozen deferred");
      }

      state = newState;

      params = Array.prototype.slice.apply(args);
      emit(ALWAYS, params);
      emit(state, params);
    };

    // Wrap the emitter's emit function, so we can
    // dynamically trigger the event and prepare arguments.
    //
    var emit = function(event, args) {
      args = Array.prototype.slice.apply(args);
      emitter.emit.apply(emitter, [event].concat(args));
    }

    // Initialize the Deferred object.
    //
    function Deferred() {}

    // Initialize the Promise object.
    //
    function Promise() {}

    // Return a deferred's promise, which is just a
    // read-only deferred object.
    Deferred.prototype.promise = function() {
      var deferred = this
        , promise = new Promise()
        , index = 0
        , name
      ;

      var proxy = function(name) {
        return function() {
          return deferred[name].apply(deferred, Array.prototype.slice.apply(arguments));
        };
      };

      for (; index < PROMISE_FUNCTIONS.length; index++) {
        name = PROMISE_FUNCTIONS[index];
        promise[name] = proxy(name);
      }

      return promise;
    };

    // Detect if deferred object is rejected.
    //
    Deferred.prototype.isRejected = function() {
      return state === REJECTED;
    };

    // Detect if deferred object is resolved.
    //
    Deferred.prototype.isResolved = function() {
      return state === RESOLVED;
    };

    // Detect if deferred object is either rejected or resolved.
    //
    Deferred.prototype.isFrozen = function() {
      return !!state;
    };

    // Attach a callback that will be executed when
    // the deferred object is marked as resolved.
    //
    Deferred.prototype.done = function(callback, context) {
      emitter.once(RESOLVED, callback, context);

      if (this.isResolved()) {
        emit(RESOLVED, params);
      }

      return this;
    };

    // Attach a callback that will be executed when
    // the deferred object is marked as rejected.
    //
    Deferred.prototype.fail = function(callback, context) {
      emitter.once(REJECTED, callback, context);

      if (this.isRejected()) {
        emit(REJECTED, params);
      }

      return this;
    };

    // Attach a callback that will be executed when
    // the deferred object is marked as either rejected or
    // resolved.
    //
    Deferred.prototype.always = function(callback, context) {
      emitter.once(ALWAYS, callback, context);

      if (this.isFrozen()) {
        emit(ALWAYS, params);
      }

      return this;
    };

    // Attach a callback that will be executed when
    // the deferred object received the notify signal.
    //
    Deferred.prototype.progress = function(callback, context) {
      if (this.isFrozen()) {
        return;
      }

      emitter.on(PROGRESS, callback, context);
      return this;
    };

    // Mark deferred object as resolved. If the object
    // is frozen, then an exception will be raised.
    // Any provided argument will be passed to the
    // callbacks.
    //
    Deferred.prototype.resolve = function() {
      setState(RESOLVED, arguments, this.isFrozen());
    };

    // Mark deferred object as rejected. If the object
    // is frozen, then an exception will be raised.
    // Any provided argument will be passed to the
    // callbacks.
    //
    Deferred.prototype.reject = function() {
      setState(REJECTED, arguments, this.isFrozen());
    };

    // Trigger the `progress` event. If the deferred object is
    // frozen, then nothing happens.
    //
    // Any provided arguments will be passed to the callbacks.
    //
    Deferred.prototype.notify = function() {
      if (this.isFrozen()) {
        return;
      }

      emit(PROGRESS, arguments);
    };

    // Just return a new instance
    //
    return new Deferred();
  }

  function _when() {
    var objects = Array.prototype.slice.apply(arguments)
      , args = []
      , count = arguments.length
      , index = 0
      , deferred = async.defer()
      , item
    ;

    var resolveFunc = function(index) {
      return function() {
        if (arguments.length <= 1) {
          args.push(arguments[0]);
        } else {
          args.push(Array.prototype.slice.apply(arguments));
        }

        if (args.length === count && !deferred.isFrozen()) {
          deferred.resolve.apply(deferred, args);
        }
      };
    };

    var failFunc = function(index) {
      return function() {
        if (!deferred.isFrozen()) {
          deferred.reject.apply(deferred, arguments);
        }
      };
    };

    for (; index < count; index++) {
      item = objects[index];

      if (item.done && item.fail) {
        item
          .done(resolveFunc(index))
          .fail(failFunc(index))
        ;
      } else {
        async.defer().done(resolveFunc(index)).resolve(item);
      }
    }

    return deferred.promise();
  }

  function _emitter() {
    // Hold all callbacks.
    //
    var listeners = {};

    // Initialize the Emitter object.
    //
    function Emitter() {}

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

    // Attach a new event handler.
    //
    Emitter.prototype.on = function(event, callback, context, once) {
      if (!listeners[event]) {
        listeners[event] = [];
      }

      listeners[event].push(bind(this, event, callback, context, once));

      return this;
    };

    // Detach a specific event handler. If `callback` is
    // not a function, then all event handlers will be removed.
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
    Emitter.prototype.listeners = function(event) {
      return (listeners[event] || []).slice(0);
    };

    // Attach a new event handler that will be executed only once.
    //
    Emitter.prototype.once = function(event, callback, context) {
      this.on(event, callback, context, true);
    };

    // Trigger the specified event. Any additional parameters
    // will be passed to the callback.
    //
    Emitter.prototype.emit = function() {
      var args = Array.prototype.slice.apply(arguments)
        , event = args.shift()
        , listeners = this.listeners(event)
        , callback
        , index
        , count
        , event
      ;

      while (listeners.length) {
        callback = listeners.shift();
        callback.apply(undefined, args);
      }
    };

    return new Emitter();
  }

  // Return a Deferred instance.
  //
  async.defer = _deferred;

  // Coordinate a Deferred queue.
  //
  async.when = _when;

  // Return a new Emitter instance.
  //
  async.emitter = _emitter;
})(typeof(exports) === "undefined" ? this["async"] = {} : exports);
