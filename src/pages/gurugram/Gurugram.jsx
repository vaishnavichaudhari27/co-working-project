import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { puneNeighborhoods,
   puneOfficeCards,
   morePuneOfficeCards,
   finalPuneOfficeCards, 
   featuredPuneOfficeCards,
    pageTwoPuneOfficeCards, 
    pageTwoMorePuneOfficeCards, 
    pageTwoFinalPuneOfficeCards, 
    pageTwoFeaturedPuneOfficeCards, 
    officeSolutions, 
    perfectWorkspaceBanner, 
    customizedOfficeBanner, 
    stillNotFindingBanner, 
    paginationData,
    pageThreePuneOfficeCards,
    pageThreeMorePuneOfficeCards,
    pageThreeFinalPuneOfficeCards,
    pageThreeFeaturedPuneOfficeCards,
    pageFourPuneOfficeCards,
    pageFourMorePuneOfficeCards,
    pageFourFinalPuneOfficeCards,
    pageFourFeaturedPuneOfficeCards,
    topPuneCoworkingLocations,
    areaExtraOfficeCards

   } from './gurugramData.js';

/**
 * Individual Coworking Space Card with isolated multi-image sliding closure mechanism
 * Implements continuous infinite looping in the same slide direction.
 */
const OfficeCard = ({ space }) => {
  const hasMultipleImages = Boolean(space.images && space.images.length > 1);
  const extendedImages = hasMultipleImages
    ? [space.images[space.images.length - 1], ...space.images, space.images[0]]
    : space.images || [];

  const [currentIndex, setCurrentIndex] = useState(hasMultipleImages ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isTransitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitionEnabled(true);
          setIsAnimating(false);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitionEnabled]);

  const handlePrevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isAnimating || !hasMultipleImages) return;
    setIsAnimating(true);
    setIsTransitionEnabled(true);
    setCurrentIndex((previousIndex) => previousIndex - 1);
  };

  const handleNextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isAnimating || !hasMultipleImages) return;
    setIsAnimating(true);
    setIsTransitionEnabled(true);
    setCurrentIndex((previousIndex) => previousIndex + 1);
  };

  const handleTransitionEnd = () => {
    if (!hasMultipleImages) return;
    if (currentIndex === extendedImages.length - 1) {
      setIsTransitionEnabled(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      setIsTransitionEnabled(false);
      setCurrentIndex(extendedImages.length - 2);
    } else {
      setIsAnimating(false);
    }
  };

  const handleCardClick = (event) => {
    // Avoid triggering if clicked on inner action buttons
    if (event.target.closest('button')) return;
    window.open(`/coworking/gurugram/${space.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Media slider block */}
      <figure className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 select-none">
        {/* Absolute badge overlay */}
        {space.badge && (
          <div className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-slate-800 shadow-xs">
            <span className="text-amber-500 text-xs">👑</span>
            <span>{space.badge}</span>
          </div>
        )}

        {/* Sliding images container with continuous infinite looping */}
        <div
          className={`flex h-full w-full ${isTransitionEnabled ? 'transition-transform duration-300 ease-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedImages.map((imageUrl, imageIndex) => {
            const displayIndex = hasMultipleImages
              ? (imageIndex === 0
                  ? space.images.length
                  : imageIndex === extendedImages.length - 1
                  ? 1
                  : imageIndex)
              : 1;

            return (
              <img
                key={`${space.id}-img-${imageIndex}`}
                src={imageUrl}
                alt={`${space.name} - ${space.location} workspace interior view ${displayIndex}`}
                loading="lazy"
                className="w-full h-full shrink-0 object-cover pointer-events-none"
              />
            );
          })}
        </div>

        {/* Absolute left and right overlay action navigation arrows on hover states */}
        {space.images && space.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label={`Previous image of ${space.name}`}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md focus:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={`Next image of ${space.name}`}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md focus:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </figure>

      {/* Meta details layer */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          {/* Header Row: Office Name & Star Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#007bff] transition-colors">
              <a
                href={`/coworking/gurugram/${space.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:underline"
              >
                {space.name}
              </a>
            </h3>
            {space.rating ? (
              <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-amber-500">
                <span>★</span>
                <span className="text-slate-700 text-[11px]">{space.rating}</span>
              </div>
            ) : null}
          </div>

          {/* Area Subtitle */}
          <p className="text-xs text-slate-500 mt-0.5">
            {space.location}
          </p>
        </div>

        {/* Pricing & CTA Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-1">
          <div className="text-xs text-slate-600">
            <span className="text-sm font-bold text-slate-900">{space.price}</span>
            <span className="text-[11px] text-slate-500 font-normal"> {space.period}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/coworking/gurugram/${space.id}`, '_blank', 'noopener,noreferrer');
            }}
            className="bg-[#007bff] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-[4px] shadow-2xs transition-all cursor-pointer"
          >
            {space.ctaText}
          </button>
        </div>
      </div>
    </article>
  );
};

/**
 * Main Pune Coworking Listings Page Container
 */
const Gurugram = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(paginationData.initialPage || 1);

  const handlePageChange = (page) => {
    if (page < 1 || page > paginationData.totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocationClick = (locationName) => {
    setSelectedNeighborhood((prev) => (prev?.toLowerCase() === locationName.toLowerCase() ? null : locationName));
    const headerElement = document.getElementById('coworking-listings-header');
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  // Helper to extract numeric price from string (e.g., "₹6,499" -> 6499)
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const num = parseInt(String(priceStr).replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Helper to filter card by selected price range
  const matchesPrice = (card) => {
    if (!selectedPrice) return true; // No price filter active
    const priceNum = parsePrice(card.price);
    if (selectedPrice === '5000') return priceNum <= 5000;
    if (selectedPrice === '10000') return priceNum <= 10000;
    if (selectedPrice === '15000') return priceNum >= 10000;
    return true;
  };

  const activeTopSpaces = currentPage === 1 ? puneOfficeCards : currentPage === 2 ? pageTwoPuneOfficeCards : currentPage === 3 ? pageThreePuneOfficeCards : currentPage === 4 ? pageFourPuneOfficeCards : [];

  // ============================================================================
  // Area Filtering Logic with Extra 10 Real Internet Office Cards per Area
  // ----------------------------------------------------------------------------
  // 1. Jab koi Area Button ACTIVE ho (selectedNeighborhood != null):
  //    - Existing cards me se us area ke matching cards filter honge.
  //    - Sath me internet se laye gaye naye 10 cards (areaExtraOfficeCards[selectedNeighborhood]) judenge.
  // 2. Jab koi Area Button ACTIVE NAHI ho (All Cards view):
  //    - Naye 10 cards chup (hidden) rahenge, sirf default existing cards hi dikhenge.
  // ============================================================================

  // Current page ke existing top cards me se area match
  const existingFilteredTopSpaces = selectedNeighborhood
    ? activeTopSpaces.filter(
        (space) =>
          space.area?.toLowerCase() === selectedNeighborhood.toLowerCase() ||
          space.location?.toLowerCase().includes(selectedNeighborhood.toLowerCase())
      )
    : activeTopSpaces;

  // Selected area ke extra 10 real cards (sirf tab milenge jab area button active ho)
  const extraAreaCards = (selectedNeighborhood && areaExtraOfficeCards && areaExtraOfficeCards[selectedNeighborhood])
    ? areaExtraOfficeCards[selectedNeighborhood]
    : [];

  // Combined cards to display in top grid (area filtered):
  const combinedSpaces = selectedNeighborhood
    ? [
        ...existingFilteredTopSpaces,
        ...extraAreaCards.filter(
          (extra) => !existingFilteredTopSpaces.some((ex) => ex.name.toLowerCase() === extra.name.toLowerCase())
        )
      ]
    : activeTopSpaces;

  // Apply price filter to displayedSpaces
  const displayedSpaces = selectedPrice
    ? combinedSpaces.filter(matchesPrice)
    : combinedSpaces;

  const activeMoreSpaces = currentPage === 1 ? morePuneOfficeCards : currentPage === 2 ? pageTwoMorePuneOfficeCards : currentPage === 3 ? pageThreeMorePuneOfficeCards : currentPage === 4 ? pageFourMorePuneOfficeCards : [];

  const displayedMoreSpaces = activeMoreSpaces.filter((space) => {
    const matchesArea = !selectedNeighborhood ||
      space.area?.toLowerCase() === selectedNeighborhood.toLowerCase() ||
      space.location?.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    return matchesArea && matchesPrice(space);
  });

  const activeFinalSpaces = currentPage === 1 ? finalPuneOfficeCards : currentPage === 2 ? pageTwoFinalPuneOfficeCards : currentPage === 3 ? pageThreeFinalPuneOfficeCards : currentPage === 4 ? pageFourFinalPuneOfficeCards : [];

  const displayedFinalSpaces = activeFinalSpaces.filter((space) => {
    const matchesArea = !selectedNeighborhood ||
      space.area?.toLowerCase() === selectedNeighborhood.toLowerCase() ||
      space.location?.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    return matchesArea && matchesPrice(space);
  });

  const activeOfficeCards = currentPage === 1 ? featuredPuneOfficeCards : currentPage === 2 ? pageTwoFeaturedPuneOfficeCards : currentPage === 3 ? pageThreeFeaturedPuneOfficeCards : currentPage === 4 ? pageFourFeaturedPuneOfficeCards : []; 

  const displayedFeaturedSpaces = activeOfficeCards.filter((space) => {
    const matchesArea = !selectedNeighborhood ||
      space.area?.toLowerCase() === selectedNeighborhood.toLowerCase() ||
      space.location?.toLowerCase().includes(selectedNeighborhood.toLowerCase());
    return matchesArea && matchesPrice(space);
  });


  return (
    <main className="w-full min-h-screen bg-[#fafbfc] px-4 py-4 sm:px-8 sm:py-6 lg:px-12 antialiased font-sans">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/coworking/gurugram" className="hover:text-blue-600 transition-colors">Coworking</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-slate-800 font-medium" aria-current="page">Gurugram</li>
          <li aria-hidden="true">/</li>
        </ol>
      </nav>

      {/* Header Section: Title and Filter Controls */}
      <header id="coworking-listings-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Coworking Spaces In Gurgaon
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              aria-label="Filter by popular locations"
              className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 pr-6 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Popular Locations</option>
              {puneNeighborhoods.map((neighborhood) => (
                <option key={`opt-${neighborhood}`} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400" aria-hidden="true">
              ▼
            </span>
          </div>

          <div className="relative">
            <select
              aria-label="Filter by price range"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-3 py-1.5 pr-6 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Price</option>
              <option value="5000">Up to ₹5,000</option>
              <option value="10000">Up to ₹10,000</option>
              <option value="15000">₹10,000+</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400" aria-hidden="true">
              ▼
            </span>
          </div>
        </div>
      </header>

      {/* Section: 18 Neighborhood Filter Pills */}
      <section aria-label="Neighborhood filters" className="mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {puneNeighborhoods.map((neighborhood) => {
            const isSelected = selectedNeighborhood === neighborhood;
            return (
              <button
                type="button"
                key={neighborhood}
                onClick={() =>
                  setSelectedNeighborhood(isSelected ? null : neighborhood)
                }
                className={`text-[11px] sm:text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {neighborhood}
              </button>
            );
          })}
        </div>
      </section>

      {/* Section: Coworking Spaces Grid */}
      <section aria-label="Coworking spaces list">
        {displayedSpaces.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <p>
              {selectedNeighborhood
                ? `No coworking spaces found for ${selectedNeighborhood}${selectedPrice ? ' in the selected price range.' : '.'}`
                : 'No coworking spaces found in the selected price range.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedNeighborhood(null);
                setSelectedPrice('');
              }}
              className="mt-2 text-xs text-blue-600 underline cursor-pointer"
            >
              Show all Gurugram spaces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayedSpaces.map((space) => (
              <OfficeCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </section>

      {/* Section: Find Your Perfect Office Solution */}
      <section aria-label="Office solutions" className="mt-8 sm:mt-12 bg-[#eaf4fb] rounded-2xl p-6 sm:p-8 lg:p-10 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
          Find Your Perfect Office Solution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {officeSolutions.map((solution) => (
            <article
              key={solution.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs border border-blue-50/50 flex flex-row items-stretch transition-shadow hover:shadow-md"
            >
              {/* Image side */}
              <div className="w-[45%] shrink-0 overflow-hidden bg-slate-100">
                <img
                  src={solution.image}
                  alt={solution.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text & CTA side */}
              <div className="w-[55%] p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 leading-snug">
                    {solution.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {solution.description}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    className="bg-[#007bff] hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all w-fit cursor-pointer"
                  >
                    {solution.ctaText}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section: Additional Coworking Spaces Grid */}
      {displayedMoreSpaces.length > 0 && (
        <section aria-label="Additional coworking spaces list" className="mb-10 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayedMoreSpaces.map((space) => (
              <OfficeCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Discover your perfect workspace banner */}
      <section
        aria-label="Discover perfect workspace"
        className="w-full rounded-2xl overflow-hidden mb-12 shadow-xs relative bg-cover bg-right bg-no-repeat min-h-[190px] sm:min-h-[220px] md:min-h-[250px] flex items-center border border-blue-100/60"
        style={{
          backgroundImage: `url(${perfectWorkspaceBanner.bgImage})`
        }}
      >
        {/* Soft light blue gradient overlay on left fading smoothly into photo on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#eaf4fb] via-[#eaf4fb]/95 sm:via-[#eaf4fb]/85 to-transparent pointer-events-none"></div>

        <div className="relative z-10 px-6 sm:px-10 md:px-12 py-8 sm:py-10 max-w-xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">
            {perfectWorkspaceBanner.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed max-w-md">
            {perfectWorkspaceBanner.subtitle}
          </p>
          <button
            type="button"
            className="bg-[#007bff] hover:bg-blue-600 active:scale-95 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-all w-fit cursor-pointer"
          >
            {perfectWorkspaceBanner.ctaText}
          </button>
        </div>
      </section>

      {/* Section: Spotlight Coworking Spaces Grid */}
      {displayedFinalSpaces.length > 0 && (
        <section aria-label="Spotlight coworking spaces list" className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayedFinalSpaces.map((space) => (
              <OfficeCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Customized Office Solutions Banner */}
      <section
        aria-label="Customized office solutions"
        className="w-full rounded-2xl overflow-hidden mb-12 shadow-xs relative bg-cover bg-right bg-no-repeat min-h-[190px] sm:min-h-[220px] md:min-h-[240px] flex items-center border border-blue-100/60"
        style={{
          backgroundImage: `url(${customizedOfficeBanner.bgImage})`
        }}
      >
        {/* Soft light blue gradient overlay on left fading smoothly into photo on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e3f4fc] via-[#e3f4fc]/95 sm:via-[#e3f4fc]/85 to-transparent pointer-events-none"></div>

        <div className="relative z-10 px-6 sm:px-10 md:px-12 py-8 sm:py-10 max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
            {customizedOfficeBanner.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 sm:gap-x-10 mb-6">
            {customizedOfficeBanner.features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#027fff] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
                  </svg>
                </span>
                <span className="text-xs sm:text-sm text-slate-800 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="bg-[#027fff] hover:bg-blue-600 active:scale-95 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-all w-fit cursor-pointer"
          >
            {customizedOfficeBanner.ctaText}
          </button>
        </div>
      </section>

      {/* Section: Featured Coworking Spaces Grid */}
      {displayedFeaturedSpaces.length > 0 && (
        <section aria-label="Featured coworking spaces list" className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayedFeaturedSpaces.map((space) => (
              <OfficeCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* Section: Still Not Finding Coworking Space Banner */}
      <section
        aria-label="Still not able to find coworking space"
        className="w-full rounded-2xl overflow-hidden mb-8 shadow-xs relative bg-cover bg-right bg-no-repeat min-h-[170px] sm:min-h-[190px] md:min-h-[210px] flex items-center border border-blue-100/60"
        style={{
          backgroundImage: `url(${stillNotFindingBanner.bgImage})`
        }}
      >
        {/* Soft light blue gradient overlay on left fading smoothly into photo on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#eaf4fb] via-[#eaf4fb]/95 sm:via-[#eaf4fb]/85 to-transparent pointer-events-none"></div>

        <div className="relative z-10 px-6 sm:px-10 md:px-12 py-8 sm:py-10 max-w-xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2 tracking-tight">
            {stillNotFindingBanner.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed max-w-md">
            {stillNotFindingBanner.subtitle}
          </p>
          <button
            type="button"
            className="bg-[#007bff] hover:bg-blue-600 active:scale-95 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-all w-fit cursor-pointer"
          >
            {stillNotFindingBanner.ctaText}
          </button>
        </div>
      </section>

      {/* Section: Pagination Controls */}
      <nav aria-label="Coworking spaces pagination" className="flex items-center justify-center my-8">
        <div className="inline-flex items-center rounded-md border border-slate-200 shadow-2xs overflow-hidden bg-white text-xs sm:text-sm">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
            className={`px-3.5 py-2 font-medium border-r border-slate-200 transition-colors ${
              currentPage === 1
                ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer'
            }`}
          >
            Previous
          </button>

          {/* Page Number Buttons */}
          {Array.from({ length: paginationData.totalPages }, (_, index) => index + 1).map((page) => {
            const isActive = currentPage === page;
            return (
              <button
                key={`pagination-page-${page}`}
                type="button"
                onClick={() => handlePageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`min-w-[38px] py-2 font-semibold border-r border-slate-200 transition-colors text-center ${
                  isActive
                    ? 'bg-[#007bff] text-white cursor-default'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage === paginationData.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
            className={`px-3.5 py-2 font-medium transition-colors ${
              currentPage === paginationData.totalPages
                ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer'
            }`}
          >
            Next
          </button>
        </div>
      </nav>

      {/* Section: Explore Top Coworking Locations in Pune */}
      <section aria-label="Explore top coworking locations in Pune" className="my-10 pt-4 border-t border-slate-200/80">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
          Explore Top Coworking Locations in Pune
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
          {topPuneCoworkingLocations.map((location) => {
            const isSelected = selectedNeighborhood?.toLowerCase() === location.name.toLowerCase();
            return (
              <div
                key={location.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleLocationClick(location.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLocationClick(location.name);
                  }
                }}
                className={`group bg-white rounded-lg border overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Location Image */}
                <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src={location.image}
                    alt={`Coworking spaces in ${location.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      Selected
                    </span>
                  )}
                </div>

                {/* Location Content */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-snug font-normal">
                      Coworking Space in
                    </p>
                    <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight mt-0.5">
                      {location.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-50 flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span>{location.ctaText}</span>
                    <span className="text-[11px] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Gurugram;
