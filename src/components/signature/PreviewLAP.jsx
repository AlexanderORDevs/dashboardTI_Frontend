import { useEffect, useState } from 'react';
import { getDigitalSignatureById } from '@/services/digitalSignature/getDigitalSignature';

export function PreviewLAP({ fullname, position, phoneNumber, email }) {
  const [logoImg, setLogoImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogo() {
      try {
        setLoading(true);

        const logo = await getDigitalSignatureById(5);
        const proxiedUrl = logo.url.replace('/img/', '/media/proxy.php?file=');

        setLogoImg(proxiedUrl);
      } catch (error) {
        console.error('Error loading LAP logo', error);
      } finally {
        setLoading(false);
      }
    }

    loadLogo();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[150px] items-center justify-center">
        Loading signature…
      </div>
    );
  }

  return (
    <div
      id="digital_signature"
      className="relative flex w-[850px] bg-white text-left font-avenir"
    >
      <div className="flex items-center">
        {/* LOGO */}
        <div className="mr-10 flex h-full justify-center bg-[#D44619] p-2">
          {logoImg && (
            <img
              src={logoImg}
              crossOrigin="anonymous"
              className="w-[250px] p-10"
              alt="Company Logo"
            />
          )}
        </div>

        {/* INFO */}
        <div>
          <h2 className="text-5xl font-extrabold text-[#141414]">{fullname}</h2>
          <h3 className="pb-3 text-2xl font-medium text-[#D44619]">
            {position}
          </h3>

          <p className="text-xl">
            <span>e-mail: {email}</span>
          </p>
          <p className="pb-4 text-xl">
            <span>Phone: {phoneNumber}</span>
          </p>

          <div className="flex w-[280px] justify-center rounded-full bg-[#D44619] px-6 py-1 text-white">
            <span className="text-xl text-gray-200">
              www.legalhelpadvisor.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
