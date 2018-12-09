import memoizeOne from "memoize-one";
import React from "react";
const $createMemoizedLambda1 = memoizeOne((console, log) => () =>
  console.log("test")
);
const $createMemoizedLambda0 = memoizeOne(
  (doSomething, event, thing) => (ev, other) =>
    doSomething(ev, event, thing, other)
);
const MyComponent = ({ event, thing, doSomething }) => (
  <div onClick={$createMemoizedLambda0(doSomething, event, thing)} />
);
const MyOtherComponent = () => (
  <div onClick={$createMemoizedLambda1(console, log)} />
);
