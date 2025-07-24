import { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import useTranslation from '../utils/useTranslation';

const Hero = () => {
  const heroImages = [
    assets.hero_img,
    assets.hero_img2,
    assets.hero_img4
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Automatically cycle through images every 6 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 500); 
    }, 6000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="hero-outer-wrapper">
      <div className="hero-wrapper">
        {/* Hero image container */}
        <div className="hero-container relative overflow-hidden rounded-xl shadow-lg">
          <div className="image-container">
            {/* Gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
            
            <img
              className={`w-full h-full transition-all duration-700 ease-out ${isTransitioning ? 'opacity-60 scale-105' : 'opacity-100 scale-100'}`}
              src={heroImages[currentImageIndex]}
              alt="Fashion showcase"
              loading="eager"
              width="1600"
              height="900"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            
            {/* Navigation dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentImageIndex(index);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${index === currentImageIndex 
                      ? 'bg-white scale-110 shadow-md' 
                      : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Content overlay positioned on top of image */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="p-8 lg:p-16 max-w-lg">
                {/* Premium Collection Tag */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-[2px] bg-white"></div>
                  <p className="font-medium text-sm uppercase tracking-wider text-white">
                    {t('premiumCollection')}
                  </p>
                </div>
                
                {/* Main Heading */}
                <h1 className="hero-heading text-3xl sm:text-4xl lg:text-6xl font-prata leading-tight mb-6 text-white">
                  <span className="block">{t('heroHeadingLine1')}</span>
                  <span className="block">{t('heroHeadingLine2')}</span>
                  <span className="block">{t('heroHeadingLine3')}</span>
                  <span className="block">{t('heroHeadingLine4')}</span>
                </h1>
                
                {/* Description Text */}
                <p className="text-white/90 text-sm text-justify lg:text-base mb-8 max-w-md">
                  {t('heroDescription')}
                </p>
                
                {/* Call to Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/collection"
                    className="text-primary bg-white hover:bg-white/90 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {t('shopNow')}
                  </a>
                  <a
                    href="/about"
                    className="text-white border border-white hover:bg-white/10 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {t('learnMore')}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Featured tag */}
            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded-lg shadow-md z-20 flex items-center space-x-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <p className="text-xs font-medium">{t('featuredCollection')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 