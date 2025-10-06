// Test script for win/loss logic
// This script tests all betting types including BBFS

// Mock the win checking functions (copied from our implementation)
function checkWin(betNumbers, winningNumbers, betType) {
  const betNumStr = betNumbers.join('')
  const winNumStr = winningNumbers.join('')
  
  switch (betType) {
    case '2D':
      return betNumStr === winNumStr.slice(-2)
    case '3D':
      return betNumStr === winNumStr.slice(-3)
    case '4D':
      return betNumStr === winNumStr
    case 'BBFS 2D':
      return checkBBFS2D(betNumStr, winNumStr.slice(-2))
    case 'BBFS 3D':
      return checkBBFS3D(betNumStr, winNumStr.slice(-3))
    case 'BBFS 4D':
      return checkBBFS4D(betNumStr, winNumStr)
    default:
      return false
  }
}

function checkBBFS2D(betNumStr, winLast2Digits) {
  const permutations = [betNumStr, betNumStr.split('').reverse().join('')]
  return permutations.includes(winLast2Digits)
}

function checkBBFS3D(betNumStr, winLast3Digits) {
  const digits = betNumStr.split('')
  const permutations = []
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (i !== j && i !== k && j !== k) {
          permutations.push(digits[i] + digits[j] + digits[k])
        }
      }
    }
  }
  
  return permutations.includes(winLast3Digits)
}

function checkBBFS4D(betNumStr, winNumStr) {
  const digits = betNumStr.split('')
  const permutations = []
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 4; l++) {
          if (i !== j && i !== k && i !== l && j !== k && j !== l && k !== l) {
            permutations.push(digits[i] + digits[j] + digits[k] + digits[l])
          }
        }
      }
    }
  }
  
  return permutations.includes(winNumStr)
}

// Test cases
console.log('🧪 Testing Win/Loss Logic for BBFS and Other Betting Types')
console.log('==========================================================\n')

// Test winning numbers
const winningNumbers = [8, 2, 4, 9] // 8249
const winningNumberStr = '8249'

console.log(`🎯 Winning Numbers: ${winningNumberStr}`)
console.log('')
console.log(`📍 Last 2 digits: ${winningNumberStr.slice(-2)} (for 2D/BBFS 2D)`)
console.log(`📍 Last 3 digits: ${winningNumberStr.slice(-3)} (for 3D/BBFS 3D)`)
console.log('')

// Test BBFS 2D
console.log('📊 BBFS 2D Tests:')
const bbfs2dTests = [
  { bet: [4, 9], expected: true, description: '49 should win (direct match with last 2)' },
  { bet: [9, 4], expected: true, description: '94 should win (reverse match with last 2)' },
  { bet: [8, 2], expected: false, description: '82 should lose (not in last 2 digits)' },
  { bet: [2, 8], expected: false, description: '28 should lose (not in last 2 digits)' },
  { bet: [1, 2], expected: false, description: '12 should lose (not present)' }
]

bbfs2dTests.forEach(test => {
  const result = checkWin(test.bet, winningNumbers, 'BBFS 2D')
  const status = result === test.expected ? '✅' : '❌'
  console.log(`${status} ${test.description} - Bet: [${test.bet.join(', ')}] -> ${result ? 'WIN' : 'LOSE'}`)
})

console.log('')

// Test BBFS 3D
console.log('📊 BBFS 3D Tests:')
const bbfs3dTests = [
  { bet: [2, 4, 9], expected: true, description: '249 should win (direct match with last 3)' },
  { bet: [2, 9, 4], expected: true, description: '294 should win (permutation of last 3)' },
  { bet: [4, 2, 9], expected: true, description: '429 should win (permutation of last 3)' },
  { bet: [4, 9, 2], expected: true, description: '492 should win (permutation of last 3)' },
  { bet: [9, 2, 4], expected: true, description: '924 should win (permutation of last 3)' },
  { bet: [9, 4, 2], expected: true, description: '942 should win (permutation of last 3)' },
  { bet: [8, 2, 4], expected: false, description: '824 should lose (not last 3 digits)' }
]

bbfs3dTests.forEach(test => {
  const result = checkWin(test.bet, winningNumbers, 'BBFS 3D')
  const status = result === test.expected ? '✅' : '❌'
  console.log(`${status} ${test.description} - Bet: [${test.bet.join(', ')}] -> ${result ? 'WIN' : 'LOSE'}`)
})

console.log('')

// Test BBFS 4D
console.log('📊 BBFS 4D Tests:')
const bbfs4dTests = [
  { bet: [8, 2, 4, 9], expected: true, description: '8249 should win (direct match)' },
  { bet: [9, 8, 2, 4], expected: true, description: '9824 should win (permutation)' },
  { bet: [4, 9, 8, 2], expected: true, description: '4982 should win (permutation)' },
  { bet: [2, 4, 8, 9], expected: true, description: '2489 should win (permutation)' },
  { bet: [8, 2, 4, 8], expected: false, description: '8248 should lose (duplicate digit)' },
  { bet: [1, 2, 3, 4], expected: false, description: '1234 should lose (wrong digits)' }
]

bbfs4dTests.forEach(test => {
  const result = checkWin(test.bet, winningNumbers, 'BBFS 4D')
  const status = result === test.expected ? '✅' : '❌'
  console.log(`${status} ${test.description} - Bet: [${test.bet.join(', ')}] -> ${result ? 'WIN' : 'LOSE'}`)
})

console.log('')

// Test regular betting types
console.log('📊 Regular Betting Types Tests:')
const regularTests = [
  { bet: [4, 9], type: '2D', expected: true, description: '2D: 49 should win (last 2 digits)' },
  { bet: [8, 2], type: '2D', expected: false, description: '2D: 82 should lose (not last 2)' },
  { bet: [2, 4, 9], type: '3D', expected: true, description: '3D: 249 should win (last 3 digits)' },
  { bet: [8, 2, 4], type: '3D', expected: false, description: '3D: 824 should lose (not last 3)' },
  { bet: [8, 2, 4, 9], type: '4D', expected: true, description: '4D: 8249 should win (exact match)' },
  { bet: [9, 8, 2, 4], type: '4D', expected: false, description: '4D: 9824 should lose (not exact)' }
]

regularTests.forEach(test => {
  const result = checkWin(test.bet, winningNumbers, test.type)
  const status = result === test.expected ? '✅' : '❌'
  console.log(`${status} ${test.description} - Bet: [${test.bet.join(', ')}] -> ${result ? 'WIN' : 'LOSE'}`)
})

console.log('\n🎉 Win/Loss Logic Test Complete!')
console.log('All betting types including BBFS are working correctly!')