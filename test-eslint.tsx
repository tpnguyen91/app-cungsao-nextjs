import React from 'react';

// This should trigger unused variable warning
const unusedVariable = 'test';

// This should trigger console warning
console.log('test');

// This should trigger missing dependency warning
const Component = () => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    setCount(count + 1);
  }, []); // Missing count dependency

  return <div>{count}</div>;
};
