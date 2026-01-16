# Problem 4: Sum Calculations

Three different implementations to calculate the sum from 1 to n.

## Solutions

### 1. Mathematical Formula (Best Practice)
- **Time Complexity:** O(1)
- **Space Complexity:** O(1)
- Uses the formula: `n * (n + 1) / 2`
- Most efficient approach

### 2. Iterative Approach
- **Time Complexity:** O(n)
- **Space Complexity:** O(1)
- Uses a loop to sum all numbers from 1 to n

### 3. Recursive Approach
- **Time Complexity:** O(n)
- **Space Complexity:** O(n) due to call stack
- Recursively adds numbers from n down to 1

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Run the Program

```bash
npm start
```

Or:

```bash
npm run dev
```

### Output

The program will test all three implementations with various values:
- Positive numbers: 3, 7, 20, 9
- Negative numbers: -10, -5

Example output:
```
Testing sum calculation:

n = 3:
sum_to_n_a (Mathematical): 6
sum_to_n_b (Recursive):    6
sum_to_n_c (Iterative):    6

n = 7:
sum_to_n_a (Mathematical): 28
sum_to_n_b (Recursive):    28
sum_to_n_c (Iterative):    28
```

## Functions

- `sum_to_n_a(n)` - Mathematical formula approach
- `sum_to_n_b(n)` - Iterative loop approach
- `sum_to_n_c(n)` - Recursive approach

## Notes

For negative numbers, the iterative and recursive approaches return 0, while the mathematical formula still calculates based on the formula which may produce unexpected results for negative inputs.
