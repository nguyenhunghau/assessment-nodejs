// Solution1: Mathematical (best Practice Solution)
// Complexity
// Time: O(1)
// Space: O(1)
function sum_to_n_a(n: number): number {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
}

// Solution 2: Iterative Approach
// // Complexity
// Time: O(n)
// Space: O(1)
function sum_to_n_b(n: number): number {
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Solution 3: Recursive Approach
// Complexity
// Time: O(n)
// Space: O(n) (call stack)
function sum_to_n_c(n: number): number {
  if (n <= 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_c(n - 1);
}

// Test the functions
function testFunctions() {
  const testValues = [3, 7, 20, -10, -5, 9];

  console.log("Testing sum calculation:\n");

  testValues.forEach((n) => {
    console.log(`n = ${n}:`);
    console.log(`sum_to_n_a (Mathematical): ${sum_to_n_a(n)}`);
    console.log(`sum_to_n_b (Recursive):    ${sum_to_n_c(n)}`);
    console.log(`sum_to_n_c (Iterative):    ${sum_to_n_b(n)}`);
    console.log("");
  });
}

// Run the tests
testFunctions();
testFunctions();