/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset prop, matches the pattern in rwa.api.ts */
import { useMemo, useState } from 'react';

interface InvestmentCalculatorProps {
  asset: any;
}

function calculateIRR(cashFlows: number[]): number {
  let rate = 0.1;

  for (let i = 0; i < 1000; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(dnpv) < 1e-10) break;
    rate -= npv / dnpv;
  }

  return rate * 100;
}

export default function InvestmentCalculatorChart({
  asset,
}: InvestmentCalculatorProps) {
  const [fractionsOwned, setFractionsOwned] = useState(20);
  const [growthMode, setGrowthMode] = useState<'conservative' | 'aggressive'>(
    'conservative'
  );
  const [yieldOverride, setYieldOverride] = useState<number | null>(null);
  const [appreciationOverride, setAppreciationOverride] = useState<
    number | null
  >(null);

  const maxFractions =
    Number(asset?.totalFractions) && asset.totalFractions > 0
      ? Number(asset.totalFractions)
      : 100;

  const currency =
    asset?.meta?.find((m: any) => m.metaKey === 'currency')?.metaValue === 'AED'
      ? 'AED'
      : '₹';

  const rentalMonthly =
    Number(
      asset?.meta?.find((m: any) => m.metaKey === 'rentalIncomeMonthly')
        ?.metaValue
    ) || 0;

  const apiYield = Number(asset.financials?.yield?.actualYieldPercent ?? 0);

  const pricePerFraction = Number(asset?.price?.currentPricePerFraction || 0);
  const baseInvestment = pricePerFraction * fractionsOwned;

  const apiAppreciation =
    Number(asset.financials?.roi?.appreciation5Y ?? 0) > 0
      ? ((Number(asset.financials?.roi?.appreciation5Y) / baseInvestment) *
          100) /
        5 // Approximate annual growth if it's 5Y total
      : Number(
          asset?.meta?.find(
            (m: any) => m.metaKey === 'expectedAppreciationPercentage'
          )?.metaValue ?? 0
        );

  const expectedYield = yieldOverride ?? apiYield;
  const expectedAppreciation = appreciationOverride ?? apiAppreciation;

  const adjustedAppreciation =
    growthMode === 'aggressive'
      ? expectedAppreciation * 1.25
      : expectedAppreciation * 0.85;

  const investmentData = useMemo(() => {
    const years = 5;
    const startYear = new Date().getFullYear();

    let cumulativeValue = baseInvestment;

    return Array.from({ length: years }).map((_, i) => {
      const year = (startYear + i).toString();

      const yearlyRental =
        rentalMonthly * 12 * Math.pow(1 + expectedYield / 100, i);

      const growthAmount = cumulativeValue * (adjustedAppreciation / 100);

      cumulativeValue += growthAmount;

      return {
        year,
        investment: baseInvestment,
        rental: Math.round(yearlyRental),
        growth: Math.round(cumulativeValue),
      };
    });
  }, [baseInvestment, rentalMonthly, expectedYield, adjustedAppreciation]);

  function getNiceStep(max: number) {
    const roughStep = max / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;

    let niceResidual = 1;
    if (residual > 5) niceResidual = 10;
    else if (residual > 2) niceResidual = 5;
    else if (residual > 1) niceResidual = 2;

    return niceResidual * magnitude;
  }

  const irr = useMemo(() => {
    if (!investmentData.length || baseInvestment <= 0) return 0;

    const cashFlows: number[] = [];

    cashFlows.push(-baseInvestment);
    investmentData.slice(0, -1).forEach((d) => {
      cashFlows.push(d.rental);
    });

    const finalYear = investmentData[investmentData.length - 1];
    const appreciation = finalYear.growth - baseInvestment;

    cashFlows.push(finalYear.rental + appreciation);

    return calculateIRR(cashFlows);
  }, [investmentData, baseInvestment]);

  function formatIRR(irr: number) {
    if (!isFinite(irr) || irr < 0) return 'N/A';
    if (irr > 50) return '>50%';
    return `${irr.toFixed(2)}%`;
  }

  const MAX_VALUE = Math.max(
    baseInvestment,
    ...investmentData.map((d) => d.growth)
  );

  const yAxisSteps = useMemo(() => {
    if (MAX_VALUE <= 0) return [0];

    const step = getNiceStep(MAX_VALUE);
    const top = Math.ceil(MAX_VALUE / step) * step;

    const steps: number[] = [];
    for (let v = 0; v <= top; v += step) {
      steps.push(v);
    }

    return steps.reverse();
  }, [MAX_VALUE]);

  const projectedReturn =
    (investmentData[investmentData.length - 1]?.growth || 0) +
    investmentData.reduce((sum, d) => sum + d.rental, 0);

  return (
    <div className="w-full text-[#0B2545] dark:text-white font-work space-y-8 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-6 lg:p-8 shadow-sm">
      <div className="space-y-1 mb-6">
        <h2 className="font-serif font-28 font-semibold tracking-tight">
          Investment Calculator
        </h2>
        <div className="w-12 h-1 bg-yellow rounded-full" />
      </div>

      <p className="text-sm text-[#0B2545] dark:text-white">
        Projected investment return of{' '}
        <span className="font-semibold">
          {currency} {projectedReturn.toLocaleString()}
        </span>{' '}
        in 5 years
      </p>

      <div className="flex flex-col md:flex-row justify-between items-center gap-2 max-w-[850px]">
        <div className="space-y-4 w-full max-w-[520px]">
          <SliderRow
            label="Structural Co-ownership owned"
            value={fractionsOwned}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={maxFractions}
                value={Math.min(fractionsOwned, maxFractions)}
                onChange={(e) => setFractionsOwned(Number(e.target.value))}
                className="w-full accent-[#4F86C0]"
              />

              <input
                type="number"
                min={1}
                max={maxFractions}
                value={fractionsOwned}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val > 0) {
                    setFractionsOwned(Math.min(val, maxFractions));
                  }
                }}
                className="w-[90px] bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 rounded-lg px-2 py-1 text-sm text-[#0B2545] dark:text-white outline-none focus:border-[#3A76C0]/50 transition-colors"
              />
              <button
                onClick={() => setFractionsOwned(20)}
                className="transition text-sm"
                title="Reset Structural Co-ownership to default"
              >
                ⟳
              </button>
            </div>
          </SliderRow>

          <SliderRow
            label="Property value growth (5 years)"
            value={`${expectedAppreciation.toFixed(2)}%`}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={50}
                step={0.1}
                value={expectedAppreciation}
                onChange={(e) =>
                  setAppreciationOverride(Number(e.target.value))
                }
                className="w-full accent-[#4F86C0]"
              />

              <button
                onClick={() => setAppreciationOverride(null)}
                className=" transition text-sm"
                title="Reset growth to default"
              >
                ⟳
              </button>
            </div>
          </SliderRow>

          <SliderRow
            label="Expected annual rental yield"
            value={`${expectedYield.toFixed(2)}%`}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={30}
                step={0.1}
                value={expectedYield}
                onChange={(e) => setYieldOverride(Number(e.target.value))}
                className="w-full accent-[#4F86C0]"
              />

              <button
                onClick={() => setYieldOverride(null)}
                className="transition text-sm"
                title="Reset yield to default"
              >
                ⟳
              </button>
            </div>
          </SliderRow>
        </div>

        <div className="flex gap-3 mt-2 hidden">
          {(['conservative', 'aggressive'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setGrowthMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 font-medium ${
                growthMode === mode
                  ? 'bg-[#0B2545] dark:bg-white text-white dark:text-[#0B2545] shadow-md'
                  : 'bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 text-[#0B2545] dark:text-white hover:bg-[#F5F8FF] dark:hover:bg-white/10'
              }`}
            >
              {mode === 'conservative' ? 'Conservative' : 'Aggressive'}
            </button>
          ))}
        </div>
      </div>
      <div className="relative flex w-full aspect-[16/9] min-h-[260px] max-h-[420px] px-3 sm:px-6 lg:px-10 overflow-y-auto sm:overflow-hidden">
        <div className="flex flex-col justify-between text-[10px] sm:text-[12px] md:text-[14px] text-gray-500 dark:text-gray-400 pr-3 sm:pr-6">
          {yAxisSteps.map((v) => (
            <span key={v}>{v.toLocaleString()}</span>
          ))}
        </div>

        <div className="relative grid items-end w-full h-full grid-cols-[repeat(auto-fit,minmax(40px,1fr))] gap-2 sm:gap-5 md:gap-6 lg:gap-8 max-w-[800px]">
          {/* Gridlines — aligned to the Y-axis steps for a proper chart look */}
          <div className="absolute inset-0 -z-10 flex flex-col justify-between">
            {yAxisSteps.map((v) => (
              <div
                key={v}
                className="w-full border-t border-dashed border-gray-200 dark:border-white/10"
              />
            ))}
          </div>

          {investmentData.map((item) => {
            const investmentValue = item.investment;
            const rentalValue = item.rental;
            const appreciationValue = item.growth - baseInvestment;

            const investmentH = (investmentValue / MAX_VALUE) * 100;
            const rentalH = (rentalValue / MAX_VALUE) * 100;
            const growthH = (appreciationValue / MAX_VALUE) * 100;

            const minHeight = 2;

            return (
              <div
                key={item.year}
                className="flex flex-col items-center h-full"
              >
                <div
                  className="group relative h-full flex flex-col justify-end hover:brightness-110 transition-all cursor-pointer"
                  style={{ width: 'clamp(12px, 5vw , 48px)' }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0B2545] dark:bg-white text-white dark:text-[#0B2545] shadow-xl text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-50 font-medium">
                    {currency} {item.growth.toLocaleString()}
                  </div>

                  <div
                    className="bg-yellow transition-all duration-700 ease-out rounded-t-[4px] sm:rounded-t-[6px] shadow-[0_-1px_6px_rgba(0,0,0,0.08)]"
                    style={{ height: `${Math.max(growthH, minHeight)}%` }}
                  />
                  <div
                    className="bg-link transition-all duration-700 ease-out"
                    style={{ height: `${Math.max(rentalH, minHeight)}%` }}
                  />
                  <div
                    className="bg-slate-400 dark:bg-slate-500 transition-all duration-700 ease-out rounded-b-[4px] sm:rounded-b-[6px]"
                    style={{ height: `${Math.max(investmentH, minHeight)}%` }}
                  />
                </div>

                <span className="mt-3 text-[10px] sm:text-[12px] text-gray-500 dark:text-gray-400">
                  {item.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[850px] bg-white dark:bg-white/5 border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl py-6 px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Legend
          color="bg-slate-400 dark:bg-slate-500"
          label="Investment"
          amount={`${currency} ${baseInvestment.toLocaleString()}`}
        />
        <Legend
          color="bg-link"
          label="Rental Income"
          amount={`${currency} ${investmentData
            .reduce((sum, d) => sum + d.rental, 0)
            .toLocaleString()}`}
        />
        {/* <Legend
          color="bg-yellow"
          label="Growth"
          amount={`${currency} ${
            investmentData[investmentData.length - 1].growth
          }`}
        /> */}

        <Legend
          color="bg-yellow"
          label="Value appreciation"
          amount={`${currency} ${(
            investmentData[investmentData.length - 1].growth - baseInvestment
          ).toLocaleString('en-In')}`}
        />

        <p className="text-center text-sm text-dark-grey mt-4 sm:col-span-3">
          Estimated IRR:{' '}
          <span className="text-[#0B2545] dark:text-white font-semibold">
            {formatIRR(irr)}
          </span>
        </p>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  amount,
}: {
  color: string;
  label: string;
  amount: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-[#0B2545] dark:text-white">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-[12px] sm:text-[14px] lg:text-[16px]">
          {label}
        </span>
      </div>
      <span className="font-20 font-medium">{amount}</span>
    </div>
  );
}

function SliderRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string | number;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#0B2545] dark:text-white">{label}</span>
        <span className="text-[#0B2545] dark:text-white font-medium">
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}
