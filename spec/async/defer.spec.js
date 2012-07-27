var async = require("../../async.js");

describe("async.defer", function() {
  var deferred, callback, otherCallback, promise;

  beforeEach(function() {
    deferred = async.defer();
    callback = jasmine.createSpy();
    otherCallback = jasmine.createSpy();
  });

  it("runs callbacks for resolved state", function() {
    deferred
      .done(callback)
      .done(otherCallback)
    ;

    deferred.resolve();

    expect(callback).wasCalled();
    expect(otherCallback).wasCalled();
  });

  it("runs callbacks for rejected state", function() {
    deferred
      .fail(callback)
      .fail(otherCallback)
    ;

    deferred.reject();

    expect(callback).wasCalled();
    expect(otherCallback).wasCalled();
  });

  it("runs progress callbacks", function() {
    deferred.progress(callback);

    deferred.notify(1, 2, 3);
    deferred.notify(4, 5, 6);
    deferred.notify(7, 8, 9);

    expect(callback.calls.length).toEqual(3);
    expect(callback.calls[0].args).toEqual([1,2,3]);
    expect(callback.calls[1].args).toEqual([4,5,6]);
    expect(callback.calls[2].args).toEqual([7,8,9]);
  });

  it("ignores progress callback when deferred is resolved", function() {
    deferred.progress(callback);
    deferred.resolve();
    deferred.notify();

    expect(callback).wasNotCalled();
  });

  it("ignores progress callback when deferred is rejected", function() {
    deferred.progress(callback);
    deferred.reject();
    deferred.notify();

    expect(callback).wasNotCalled();
  });

  it("throws error when trying to resolve an already resolved deferred", function() {
    deferred.resolve();

    expect(function(){
      deferred.resolve();
    }).toThrow("Can't change state of frozen deferred");
  });

  it("throws error when trying to resolve an already rejected deferred", function() {
    deferred.reject();

    expect(function(){
      deferred.resolve();
    }).toThrow("Can't change state of frozen deferred");
  });

  it("throws error when trying to reject an already resolved deferred", function() {
    deferred.resolve();

    expect(function(){
      deferred.reject();
    }).toThrow("Can't change state of frozen deferred");
  });

  it("throws error when trying to reject an already rejected deferred", function() {
    deferred.reject();

    expect(function(){
      deferred.reject();
    }).toThrow("Can't change state of frozen deferred");
  });

  it("executes `always` callback when resolving deferred", function() {
    deferred.always(callback);
    deferred.resolve();

    expect(callback).wasCalled();
  });

  it("executes `always` callback when rejecting deferred", function() {
    deferred.always(callback);
    deferred.reject();

    expect(callback).wasCalled();
  });

  it("is resolved", function() {
    deferred.resolve();

    expect(deferred.isResolved()).toBeTruthy();
  });

  it("isn't resolved", function() {
    deferred.reject();

    expect(deferred.isResolved()).toBeFalsy();
  });

  it("is reject", function() {
    deferred.reject();

    expect(deferred.isRejected()).toBeTruthy();
  });

  it("isn't rejected", function() {
    deferred.resolve();

    expect(deferred.isRejected()).toBeFalsy();
  });

  it("is frozen when resolved", function() {
    deferred.resolve();
    expect(deferred.isFrozen()).toBeTruthy();
  });

  it("is frozen when rejected", function() {
    deferred.reject();
    expect(deferred.isFrozen()).toBeTruthy();
  });

  it("isn't frozen", function() {
    expect(deferred.isFrozen()).toBeFalsy();
  });

  it("sets context for resolved callback", function() {
    deferred.done(callback, "CONTEXT");
    deferred.resolve();

    expect(callback.mostRecentCall.object).toEqual("CONTEXT");
  });

  it("sets context for rejected callback", function() {
    deferred.fail(callback, "CONTEXT");
    deferred.reject();

    expect(callback.mostRecentCall.object).toEqual("CONTEXT");
  });

  it("sets context for progress callback", function() {
    deferred.progress(callback, "CONTEXT");
    deferred.notify();

    expect(callback.mostRecentCall.object).toEqual("CONTEXT");
  });

  describe("promise", function() {
    beforeEach(function() {
      promise = deferred.promise();
    });

    it("returns readonly deferred (a.k.a. promise)", function() {
      expect(promise.resolve).toBeFalsy();
      expect(promise.reject).toBeFalsy();
      expect(promise.notify).toBeFalsy();
    });

    it("proxies resolved callbacks", function() {
      promise.done(callback);
      deferred.resolve();

      expect(callback).wasCalled();
    });

    it("proxies rejected callbacks", function() {
      promise.fail(callback);
      deferred.reject();

      expect(callback).wasCalled();
    });

    it("proxies progress callbacks", function() {
      promise.progress(callback);
      deferred.notify();

      expect(callback).wasCalled();
    });
  });
});
