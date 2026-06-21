import { FaWhatsapp, FaFacebook, FaInstagram, FaFilePdf } from 'react-icons/fa';

const integrations = [
  { icon: FaWhatsapp, name: 'WhatsApp', desc: 'Share standings to status & groups', position: 'top-left' },
  { icon: FaFacebook, name: 'Facebook', desc: 'Post league tables to your page', position: 'top-right' },
  { icon: FaInstagram, name: 'Instagram', desc: 'Export images for stories & feeds', position: 'bottom-left' },
  { icon: FaFilePdf, name: 'PDF Export', desc: 'Print-ready tables for posters', position: 'bottom-right' },
];

export default function IntegrationsSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <span className="landing-pill-badge">EXPORT & SHARE</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-6 tracking-tight">
            Seamless sharing
          </h2>
          <p className="text-white/45 mt-4 max-w-lg mx-auto">
            Download PNG, JPG, or PDF and share directly to the platforms your community uses.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
          <div className="landing-crosshair-h" aria-hidden="true" />
          <div className="landing-crosshair-v" aria-hidden="true" />
          <div className="landing-hub-glow" aria-hidden="true">
            <div className="landing-hub-icon">
              <FaFilePdf className="text-2xl text-white" />
            </div>
          </div>

          {integrations.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="landing-feature-card p-6 md:p-8 text-center"
              >
                <Icon className="text-2xl text-red-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">{item.name}</h3>
                <p className="text-white/40 text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
