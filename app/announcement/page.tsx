'use client';

const apps = [
  {
    date: '01-11-2025',
    name: 'Brokmang.',
    description: 'A comprehensive financial management platform designed for CEOs and brokerage firm owners. Monitor financial metrics, identify breakeven points, and track sales performance with daily, monthly, and quarterly reports. Leverage AI-powered recommendations to optimize business operations.',
    price: '100 EGP/Month with AI, Free without AI',
  },
  {
    date: '01-12-2025',
    name: 'WKOUTS.',
    description: 'A strategic lead conversion platform connecting developer sales teams with qualified brokers. Maximize walkout client opportunities and prevent lost deals through intelligent broker matching and seamless collaboration.',
    price: 'Commission Based',
  },
  {
    date: '15-01-2026',
    name: 'متعسر',
    description: 'A financial restructuring solution for clients facing payment difficulties. Provides tailored exit strategies and alternative payment plans to help clients navigate challenging financial situations while protecting investments.',
    price: 'Commission Based',
  },
  {
    date: '01-02-2026',
    name: 'Super Whatsapp',
    description: 'An enterprise WhatsApp marketing and communication platform. Launch targeted campaigns, reduce no-answer rates through CRM integration, and manage developer communications at scale. Advanced AI features coming soon.',
    price: '300 EGP/Month',
  },
  {
    date: '01-04-2026',
    name: 'SaleMate',
    description: 'The ultimate broker ecosystem platform. Access premium leads, utilize our free AI-powered CRM for deal closure, partner with top-tier brokerages for enhanced commission structures, and gain real-time access to primary inventory markets.',
    price: 'Different Plans',
  },
  {
    date: '01-10-2026',
    name: 'Prop IQ',
    description: 'A comprehensive real estate intelligence platform delivering deep market insights, verified data analytics, and performance metrics for developers and brokerage firms. Make data-driven decisions with authentic market intelligence.',
    price: 'Different Plans',
  },
];

export default function AnnouncementPage() {
  return (
    <div className="min-h-screen md:h-screen bg-white overflow-y-auto md:overflow-hidden flex items-center">
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-6">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-6">
          <div className="flex justify-center items-center mb-2 md:mb-3">
            <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
              <img src="/martining-logo.png" alt="Martining Innovation Studio" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-1 md:mb-2" style={{ color: '#7DCFBE' }}>
            INNOVATIONS ERA
          </h1>

          <p className="text-base md:text-lg font-semibold text-gray-700 mb-1">
            The Martining Innovation Studio
          </p>
          <p className="text-xs md:text-sm text-gray-600 max-w-3xl mx-auto px-4">
            A comprehensive suite of PropTech solutions empowering Real Estate Brokers, Developers, and Clients
          </p>
        </div>

        {/* Timeline Section - Desktop Horizontal */}
        <div className="hidden md:block relative max-w-full mx-auto px-4">
          <div className="flex items-start justify-between gap-2 relative">
            {/* Timeline Line */}
            <div className="absolute top-[60px] left-0 right-0 h-1" style={{ background: 'linear-gradient(to right, #A8E6D7, #7DCFBE, #5ABAA7)' }}></div>

            {apps.map((app, index) => (
              <div key={index} className="flex-1 relative">
                {/* Timeline Dot */}
                <div className="absolute top-[54px] left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10" style={{ backgroundColor: '#7DCFBE' }}></div>

                {/* Content Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all mt-20" style={{ borderWidth: '2px', borderColor: '#A8E6D7' }}>
                  <div className="text-center">
                    <div className="inline-block text-white text-xs font-bold px-2 py-1 rounded-full mb-2" style={{ backgroundColor: '#7DCFBE' }}>
                      {app.date}
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: '#5ABAA7' }}>
                      {app.name}
                    </h3>
                    <p className="text-xs text-gray-700 mb-2 leading-relaxed text-left">
                      {app.description}
                    </p>
                    <div className="text-xs text-center">
                      <span className="font-semibold text-gray-800">Price: </span>
                      <span className="font-medium" style={{ color: '#5ABAA7' }}>{app.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section - Mobile Vertical */}
        <div className="md:hidden relative max-w-md mx-auto px-4">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, #A8E6D7, #7DCFBE, #5ABAA7)' }}></div>

            {apps.map((app, index) => (
              <div key={index} className="relative mb-6 pl-16">
                {/* Timeline Dot */}
                <div className="absolute left-[26px] top-2 w-5 h-5 rounded-full border-3 border-white shadow-lg z-10" style={{ backgroundColor: '#7DCFBE' }}></div>

                {/* Content Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 shadow-sm" style={{ borderWidth: '2px', borderColor: '#A8E6D7' }}>
                  <div className="inline-block text-white text-xs font-bold px-2 py-1 rounded-full mb-2" style={{ backgroundColor: '#7DCFBE' }}>
                    {app.date}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#5ABAA7' }}>
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {app.description}
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800">Price: </span>
                    <span className="font-medium" style={{ color: '#5ABAA7' }}>{app.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 md:mt-6">
          <h2 className="text-lg md:text-2xl font-black text-gray-800 inline-block border-b-4 pb-1" style={{ borderColor: '#7DCFBE' }}>
            THIS IS THE AI INNOVATION ERA
          </h2>
        </div>
      </div>
    </div>
  );
}

