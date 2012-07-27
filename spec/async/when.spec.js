var async = require("../../async.js");

describe("async.when", function() {
  var deferred, otherDeferred, callback, otherCallback, promise;

  beforeEach(function() {
    callback = jasmine.createSpy();
    deferred = async.defer();
    otherDeferred = async.defer();
  });

  it("returns a promise", function() {
    expect(async.when().constructor.name).toEqual("Promise");
  });

  it("runs callbacks right away when using non-deferred objects", function() {
    async.when(1, "hello", {name: "object"}).done(callback);
    expect(callback).wasCalledWith(1, "hello", {name: "object"});
  });

  it("runs resolved callbacks", function() {
    async.when(deferred).done(callback);
    deferred.resolve(1);

    expect(callback).wasCalledWith(1);
  });

  it("passes multiple arguments as an array", function() {
    async.when(deferred).done(callback);
    deferred.resolve(1, 2, 3);

    expect(callback).wasCalledWith([1, 2, 3]);
  });

  it("runs rejected callbacks", function() {
    async.when(deferred).fail(callback);
    deferred.reject(1);

    expect(callback).wasCalledWith(1);
  });

  it("runs callbacks for promise", function() {
    async.when(deferred.promise()).done(callback);
    deferred.resolve(1);

    expect(callback).wasCalledWith(1);
  });

  it("handles multiple failing deferreds", function() {
    async.when(deferred, otherDeferred)
      .fail(callback)
    ;

    deferred.reject(1);
    otherDeferred.reject(2);

    expect(callback.calls.length).toEqual(1);
    expect(callback).wasCalledWith(1);
  });
});
