export const WalletEarnMoreCard = () => {
  return (
    <div className="bg-monochrome-white flex flex-col items-center gap-2 rounded-2xl p-6 text-center">
      <div className="relative h-12 w-12">
        <div className="border-monochrome-white bg-red absolute left-4 z-10 h-12 w-12 rounded-full border-2" />
        <div className="border-monochrome-white bg-blue absolute right-4 h-12 w-12 rounded-full border-2" />
      </div>

      <p className="text-body-1-demi text-secondary">Want to earn more cash?</p>
      <p className="text-cap-1-med text-tertiary">
        Earn real cash by completing challenges. Explore challenges from different brands.
      </p>
    </div>
  );
};
