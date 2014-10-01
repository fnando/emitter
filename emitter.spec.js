var Emitter = require("./emitter");

describe("Emitter", function() {
  var emitter, callback;

  beforeEach(function() {
    emitter = Emitter.create();
    callback = jasmine.createSpy();
  });

  it("runs callback multiple times", function() {
    emitter.on("test", callback);
    emitter.emit("test");
    emitter.emit("test");

    expect(callback.calls.length).toEqual(2);
  });

  it("runs callback only once", function() {
    emitter.once("test", callback);
    emitter.emit("test");
    emitter.emit("test");

    expect(callback.calls.length).toEqual(1);
  });

  it("sets context", function() {
    emitter.on("test", callback, "CONTEXT");
    emitter.emit("test");

    expect(callback.mostRecentCall.object).toEqual("CONTEXT");
  });

  it("raises no error when emitting a missing event", function() {
    expect(function(){
      emitter.emit("missing");
    }).not.toThrow();
  });

  it("passes arguments to the callback", function() {
    emitter.on("test", callback);
    emitter.emit("test", 1, 2, 3);

    expect(callback.mostRecentCall.args).toEqual([1,2,3]);
  });

  it("emits event to multiple callbacks", function() {
    var otherCallback = jasmine.createSpy();

    emitter.on("test", callback);
    emitter.on("test", otherCallback);
    emitter.emit("test");

    expect(callback).wasCalled();
    expect(otherCallback).wasCalled();
  });

  it("returns listeners for a given event", function() {
    var otherCallback = jasmine.createSpy()
      , yetAnotherCallback = jasmine.createSpy()
    ;

    emitter.on("test", callback);
    emitter.on("test", otherCallback);
    emitter.on("other test", yetAnotherCallback);

    expect(emitter.listeners("test").length).toEqual(2);
  });

  it("returns an empty listener array for unknown events", function() {
    expect(emitter.listeners("missing")).toEqual([]);
  });

  it("removes all listeners", function() {
    emitter.on("test", callback);
    emitter.on("test", callback);
    emitter.off("test");

    expect(emitter.listeners("test")).toEqual([]);
  });

  it("removes specific listener", function() {
    var otherCallback = jasmine.createSpy();

    emitter.on("test", callback);
    emitter.on("test", otherCallback);
    emitter.off("test", callback);

    expect(emitter.listeners("test").length).toEqual(1);
  });

  it("extends object", function() {
    var target = {};
    Emitter.extend(target);

    expect(typeof target.on).toEqual("function");
    expect(typeof target.off).toEqual("function");
    expect(typeof target.once).toEqual("function");
    expect(typeof target.emit).toEqual("function");
    expect(typeof target.listeners).toEqual("function");
    expect(typeof target._emitter).toEqual("object");
  });

  it("extends object with custom attribute name", function() {
    var target = {};
    Emitter.extend(target, "emitter");

    expect(typeof target._emitter).toEqual("undefined");
    expect(typeof target.emitter).toEqual("object");
  });

  it("proxies calls when extending object", function() {
    var target = {};
    Emitter.extend(target);
    target.on("event", callback);
    target.emit("event", 1);

    expect(callback).wasCalledWith(1);
  });

  it("returns extended object", function(){
    var target = {};
    expect(Emitter.extend(target)).toEqual(target);
  });
});
