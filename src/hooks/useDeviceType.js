import { useState, useEffect } from 'react';

function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    updateDeviceType(); // Run on initial render
    window.addEventListener('resize', updateDeviceType);

    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return isMobile;
}

export default useDeviceType;
