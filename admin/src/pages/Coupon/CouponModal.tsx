

export default function CouponModal({ data, onClose }: { data: any; onClose: () => void }) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl p-6 bg-slate-900 rounded-xl">
        <h2 className="mb-4 text-xl font-bold text-white">Commission Details</h2>

        <div className="grid grid-cols-1 gap-4 text-white md:grid-cols-2">
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold ">Discount Type</p>
            <p> {data.discountType}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Coupon Used :</p>
            <p>{data?.usesCount}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Max Discount Amount</p>
            <p> {data?.maxDiscountAmount}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Min Purchase Amount</p>
            <p> {data?.minPurchaseAmount}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Per User Limit:</p>
            <p>{data.perUserLimit}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Bonus Fractions:</p>
            <p> {data.bonusFractions}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border  transition-all shadow-sm mt-4">
          <p className="text-lg font-semibold">Broker Note:</p>
          <p>{data.description}</p>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="font-serif text-lg text-slate-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
   