/**
 * Loans Data Generator
 * Generates consistent, realistic loan data for testing and development
 * Uses seeded random generation for reproducibility
 */

// Seeded random number generator for consistent data generation
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return function () {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

// Nigerian names pool for borrowers
const NIGERIAN_FIRST_NAMES = [
  'Ademola', 'Chioma', 'Oluwaseun', 'Ngozi', 'Babatunde',
  'Amaka', 'Chukwuemeka', 'Folake', 'Ikenna', 'Jumoke',
  'Kehinde', 'Nneka', 'Obinna', 'Titilayo', 'Uche',
  'Yetunde', 'Adebayo', 'Chinwe', 'Emeka', 'Funmilayo',
  'Ifeanyi', 'Kemi', 'Nnamdi', 'Oluwatoyin', 'Segun'
];

const NIGERIAN_LAST_NAMES = [
  'Adeyemi', 'Okafor', 'Okonkwo', 'Adeleke', 'Nwosu',
  'Olayinka', 'Chukwu', 'Afolabi', 'Eze', 'Ogunleye',
  'Okeke', 'Adebisi', 'Nwankwo', 'Oyebanji', 'Onyeka',
  'Adewale', 'Chinedu', 'Oladipo', 'Nnadi', 'Taiwo'
];

export interface LoanRecord {
  id: string; // Unique identifier
  loanId: string; // Display ID (5 digits)
  borrowerName: string;
  status: 'Active' | 'Scheduled' | 'Missed Payment';
  amount: number; // In Naira
  interestRate: number; // Percentage (e.g., 7.25)
  nextRepaymentDate: Date;
  disbursementDate: Date;
  branchId: string;
  missedPayments?: number; // Number of missed payments
}

/**
 * Generate a random Nigerian name
 */
function generateNigerianName(random: () => number): string {
  const firstName = NIGERIAN_FIRST_NAMES[Math.floor(random() * NIGERIAN_FIRST_NAMES.length)];
  const lastName = NIGERIAN_LAST_NAMES[Math.floor(random() * NIGERIAN_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Generate a random number within a range
 */
function randomInRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

/**
 * Generate a random date within a range
 */
function randomDate(random: () => number, startDate: Date, endDate: Date): Date {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const randomTime = startTime + random() * (endTime - startTime);
  return new Date(randomTime);
}

/**
 * Generate consistent loan data for a branch
 * @param branchId - Branch identifier for seeding
 * @param count - Number of loan records to generate (default: 100)
 * @returns Array of loan records
 */
export function generateLoansData(branchId: string, count: number = 100): LoanRecord[] {
  const random = seededRandom(branchId);
  const loans: LoanRecord[] = [];
  
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 12);
  
  const twentyFourMonthsAgo = new Date(now);
  twentyFourMonthsAgo.setMonth(now.getMonth() - 24);
  
  const twelveMonthsFromNow = new Date(now);
  twelveMonthsFromNow.setMonth(now.getMonth() + 12);

  for (let i = 0; i < count; i++) {
    // Generate 5-digit loan ID
    const loanId = (10000 + Math.floor(random() * 90000)).toString();
    
    // Generate borrower name from Nigerian names pool
    const borrowerName = generateNigerianName(random);
    
    // Status distribution: 70% Active, 20% Scheduled, 10% Missed Payment
    const statusRoll = random();
    let status: 'Active' | 'Scheduled' | 'Missed Payment';
    let missedPayments: number | undefined;
    
    if (statusRoll < 0.70) {
      status = 'Active';
    } else if (statusRoll < 0.90) {
      status = 'Scheduled';
    } else {
      status = 'Missed Payment';
      // Missed payments: 1-3 payments
      missedPayments = Math.floor(randomInRange(random, 1, 4));
    }
    
    // Amount: ₦40,000 - ₦100,000
    const amount = Math.round(randomInRange(random, 40000, 100000) / 1000) * 1000;
    
    // Interest rate: 6.75% - 8.50%
    const interestRate = Math.round(randomInRange(random, 6.75, 8.50) * 100) / 100;
    
    // Disbursement date: Within past 24 months
    const disbursementDate = randomDate(random, twentyFourMonthsAgo, now);
    
    // Next repayment date: Within next 12 months
    const nextRepaymentDate = randomDate(random, now, twelveMonthsFromNow);
    
    const loan: LoanRecord = {
      id: `${branchId}-loan-${i}`,
      loanId,
      borrowerName,
      status,
      amount,
      interestRate,
      nextRepaymentDate,
      disbursementDate,
      branchId
    };
    
    if (missedPayments !== undefined) {
      loan.missedPayments = missedPayments;
    }
    
    loans.push(loan);
  }

  return loans;
}

/**
 * Calculate loan statistics from loan data
 */
export interface LoanStatistics {
  totalLoans: {
    count: number;
    growth: number; // Percentage
  };
  activeLoans: {
    count: number;
    growth: number;
  };
  completedLoans: {
    count: number;
    growth: number;
  };
}

export function calculateLoanStatistics(loans: LoanRecord[]): LoanStatistics {
  const totalCount = loans.length;
  const activeCount = loans.filter(loan => loan.status === 'Active').length;
  
  // For demo purposes, generate realistic growth percentages
  // In production, this would compare against historical data
  const random = seededRandom('statistics');
  
  return {
    totalLoans: {
      count: totalCount,
      growth: Math.round(randomInRange(random, 5, 15) * 10) / 10
    },
    activeLoans: {
      count: activeCount,
      growth: Math.round(randomInRange(random, 3, 12) * 10) / 10
    },
    completedLoans: {
      count: totalCount - activeCount,
      growth: Math.round(randomInRange(random, 2, 10) * 10) / 10
    }
  };
}
