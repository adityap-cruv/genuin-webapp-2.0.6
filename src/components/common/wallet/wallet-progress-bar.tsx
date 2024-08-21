export const WalletProgressBarCard = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-4 rounded-2xl bg-monochrome-white p-4 sm:p-6">
      <div className="relative h-5 w-full">
        <div
          className="absolute h-full border border-e-2 border-monochrome-white bg-[#83A2FF]"
          style={{
            width: `${75}%`,
            borderRadius: '50px 25px 25px 50px',
          }}
        />
        <div
          className="absolute right-0 h-full border border-s-2 border-monochrome-white bg-[#77CE1A]"
          style={{
            width: `${25}%`,
            borderRadius: '25px 50px 50px 25px',
          }}
        />
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#83A2FF] sm:h-3 sm:w-3" />
          <div className="flex flex-col text-monochrome-black">
            <span className="text-body-1-demi sm:text-title-2-demi">$75.25</span>
            <span className="text-cap-1-med sm:text-cap-1-med">Reward credits</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#77CE1A] sm:h-3 sm:w-3" />
          <div className="flex flex-col text-monochrome-black">
            <span className="text-body-1-demi sm:text-title-2-demi">$25</span>
            <span className="text-cap-1-med sm:text-cap-1-med">Cash Earnings</span>
          </div>
        </div>
      </div>
    </div>
  )
}
