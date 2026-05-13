const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">About Weather Notify</h1>
        <p className="text-gray-300 text-lg leading-8 mb-6">
          Weather Notify keeps you ahead of sudden weather changes. Subscribe once and get timely WhatsApp alerts
          when heatwaves or heavy rain are expected in your area.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Why we built it</h2>
            <p className="text-gray-300 leading-7">
              We wanted a simple way to turn live weather data into actionable alerts. Weather Notify focuses on
              the essentials and delivers them directly to WhatsApp.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-3">What you get</h2>
            <ul className="text-gray-300 leading-7 list-disc list-inside space-y-2">
              <li>Real-time weather updates for your city.</li>
              <li>Heatwave and rain alerts.</li>
              <li>Simple subscription experience.</li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Our vision</h2>
            <p className="text-gray-300 leading-7">
              Make weather safety effortless by delivering reliable, local alerts to everyone, everywhere.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-3">Our mission</h2>
            <p className="text-gray-300 leading-7">
              Turn trusted weather data into clear WhatsApp notifications that help people plan their day and
              stay prepared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
