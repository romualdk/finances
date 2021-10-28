// Node.js program to demonstrate the
// process.stdin Property

// Enter any texts ( User input)
process.stdin.on('data', data => {
  console.log(`You typed ${data.toString()}`);
  process.exit();
  });
  