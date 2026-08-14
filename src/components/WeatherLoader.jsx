const WeatherLoader = () => (
  <div
    className="glass-card md:rounded-4xl md:p-8 p-4 w-full h-full min-h-[380px] flex flex-col justify-between"
  >
    {/* City + description skeleton */}
    <div className="space-y-2">
      <div className="skeleton h-8 w-32 rounded-md" />
      <div className="skeleton h-4 w-24 rounded-md" />
    </div>

    {/* Temp + icon skeleton */}
    <div className="flex items-center justify-between py-4">
      <div className="skeleton h-20 w-36 rounded-md" />
      <div className="skeleton h-16 w-16 rounded-full" />
    </div>

    {/* Stats bar skeleton */}
    <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-5 mb-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton h-5 w-10 rounded" />
        </div>
      ))}
    </div>

    {/* 5-Day Forecast skeleton */}
    <div className="flex items-center justify-between border-t border-white/6 pt-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="skeleton h-3 w-6 rounded" />
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-3 w-8 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default WeatherLoader;
