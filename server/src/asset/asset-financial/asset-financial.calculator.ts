export interface AssetFinancialInput {
  marketValue: number;
  netOperationalIncome: number;
  expectedAppreciationPercentage: number;
  totalFractions: number;
  currentPricePerFraction: number;
}

export type AssetMetaLike = {
  metaKey: string;
  metaValue: string | null;
};

// House value = ₹45,000,000 (₹4.5 crore)
// Yield = (3,150,000 ÷ 45,000,000) × 100
// Yield = 7%

// House earns rent = ₹3,150,000 per year
// Rent per fraction = 3,150,000 ÷ 1000
// Rent per fraction = ₹3,150 per year
// If you own 1 small piece, you earn ₹3,150 per year

// House is divided into 1000 small pieces (fractions)
// Yearly rent = ₹3,150,000
// 5 years rent = 3,150,000 × 5
// = ₹15,750,000
// House grows 7.5% every year.
// For simple understanding:
// 7.5% × 5 years = 37.5%
// House value increase:
// 45,000,000 × 37.5%
// = ₹16,875,000
// Total benefit = Rent + Value increase
// Total benefit = 15,750,000 + 16,875,000
// Total benefit = ₹32,625,000

// Step C: Total benefit after 5 years
// Total benefit = Rent + Value increase
// Total benefit = 15,750,000 + 16,875,000
// Total benefit = ₹32,625,000

// One piece price = ₹1,250
// House value grows 7.5% every year

// Market Value -	Total property value	₹45,000,000
// Net Operating Income (NOI)	- Yearly rent after expenses	₹3,150,000
// Expected Appreciation -	Expected yearly growth	7.5%
// Total Fractions -	Total pieces of asset	1000
// Price per Fraction -	Current selling price	₹1,250

export class AssetFinancialCalculator {
  constructor() {}
  calculate(input: AssetFinancialInput) {
    const {
      marketValue, // 10 crore
      netOperationalIncome, // 80 lakh yearly rent
      expectedAppreciationPercentage, // 6% yearly growth
      totalFractions,
      currentPricePerFraction,
    } = input;

    // console.log('data', input);
    if (!marketValue || !netOperationalIncome || !totalFractions) {
      return null;
    }

    // yield percent means this percent rent return every year
    const actualYieldPercent = (netOperationalIncome / marketValue) * 100;

    // One fraction earns ₹3,150 rent per year
    const annualRentPerFraction = netOperationalIncome / totalFractions;

    // After 5 years, property value may increase by ₹1.68 Cr
    const appreciationValue5Y =
      marketValue * ((expectedAppreciationPercentage * 5) / 100);

    // Over 5 years, this asset gives ~72.5% return
    const totalReturn5Y = netOperationalIncome * 5 + appreciationValue5Y;

    const safeROI5Y = (totalReturn5Y / marketValue) * 100;

    return {
      yield: {
        actualYieldPercent: Number(actualYieldPercent.toFixed(2)),
      },
      perFraction: {
        annualRent: Number(annualRentPerFraction.toFixed(2)),
        price: currentPricePerFraction,
      },
      roi: {
        fiveYearROI: Number(safeROI5Y.toFixed(2)),
        appreciation5Y: Number(appreciationValue5Y.toFixed(2)),
      },
    };
  }
}
