import { useEffect, useState } from 'react';
import { getDigitalSignatureById } from '@/services/digitalSignature/getDigitalSignature';

export function PreviewLHA({ fullname, position, phoneNumber, email }) {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogo() {
      try {
        const media = await getDigitalSignatureById(6);
        const proxiedUrl = media.url.replace('/img/', '/media/proxy.php?file=');

        setLogoUrl(proxiedUrl);
      } catch (error) {
        console.error('Error loading LAP logo:', error);
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
      className="relative w-[700px] bg-white pb-6 pt-6 text-left"
    >
      <div className="items-top flex bg-white pb-3">
        {/* First column: Logo */}
        <div className="ml-8 flex w-5/12 justify-center">
          {logoUrl && (
            <img
              src={logoUrl}
              crossOrigin="anonymous"
              className="w-[250px] p-10"
              alt="Company Logo"
            />
          )}
        </div>

        {/* Yellow dividing line */}
        <div className="mx-5 mr-10 h-[202px] w-[1px] bg-[#3A3A3A]"></div>

        {/* Second column: Name, title and images */}
        <div className="w-3/4">
          <h2 className="text-4xl font-bold text-[#253CA1]">{fullname}</h2>
          <h3 className="pb-3 font-montserrat text-[20px] font-extrabold">
            {position}
          </h3>
          <p className="text-sm">
            <span className="font-bold">e-mail:</span>{' '}
            <span className="font-normal ">{email}</span>
          </p>
          <p className="pb-4 text-sm">
            <span className="font-bold">Phone:</span>{' '}
            <span className="font-normal">{phoneNumber}</span>
          </p>
          <div className="flex w-[280px] justify-center rounded-r-full bg-[#253CA1] px-6 py-3 text-white">
            <span className="text-4x1">
              <span className="text-gray-200">www.legalhelpadvisor.com</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
