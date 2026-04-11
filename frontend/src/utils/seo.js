import { useEffect } from 'react';

export const useSEO = (title, description) => {
  useEffect(() => {
    // 1. Update Title dynamically
    document.title = `${title} | KULT NETWORK`;
    
    // 2. Update Description dynamically
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }, [title, description]);
};
