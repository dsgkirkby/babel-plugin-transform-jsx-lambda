import React from "react";

const MyComponent = ({ event, thing, doSomething }) => (
  <div onClick={(ev, other) => doSomething(ev, event, thing, other)} />
);

const MyOtherComponent = () => <div onClick={() => console.log("test")} />;
