// Best Practice Solution
function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}

// Complexity
// Time: O(1)
// Space: O(1)

function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
// Complexity
// Time: O(n)
// Space: O(1)
// It only uses a single variable (sum) to store the state.

function sum_to_n_c(n: number): number {
  if (n <= 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_c(n - 1);
}
// Complexity
// Time: O(n)
// Space: O(n) (call stack)