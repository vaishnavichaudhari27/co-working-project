import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPuneOfficeCardById, topPuneCoworkingLocations, getSimilarSpacesByArea } from './gurugramData.js';


/**
 * Coworking Office Details Page for Gurugram
 * Displays multi-image gallery with hover-zoom and full-screen popup lightbox carousel.
 * Below the gallery: Seating Plans, Enquiry Form, and Horizontal Trusted By Top Companies bar.
 */
const OfficeDetail = () => {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Enquiry Form State (All fields initially empty)
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    seats: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  // Similar spaces carousel ref and continuous auto-scroll handlers
  const similarSliderRef = useRef(null);
  const isSliderPausedRef = useRef(false);
  const pauseTimerRef = useRef(null);

  const pauseTemporarily = (duration = 1500) => {
    isSliderPausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      isSliderPausedRef.current = false;
    }, duration);
  };

  const scrollSimilarLeft = () => {
    const slider = similarSliderRef.current;
    if (slider) {
      pauseTemporarily(1500);
      const oneSetWidth = slider.scrollWidth / 4;
      if (slider.scrollLeft <= 50 && oneSetWidth > 0) {
        slider.scrollLeft += oneSetWidth;
      }
      slider.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollSimilarRight = () => {
    const slider = similarSliderRef.current;
    if (slider) {
      pauseTemporarily(1500);
      const oneSetWidth = slider.scrollWidth / 4;
      if (slider.scrollLeft >= oneSetWidth * 2 && oneSetWidth > 0) {
        slider.scrollLeft -= oneSetWidth;
      }
      slider.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Continuous auto-movement animation effect — re-runs when space/area changes
  useEffect(() => {
    const slider = similarSliderRef.current;
    if (!slider) return;

    let animId;
    let lastTime = performance.now();
    let scrollPos = slider.scrollLeft;
    const speed = 45; // Pixels per second for smooth, readable continuous glide

    const step = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isSliderPausedRef.current && slider) {
        scrollPos += speed * dt;
        const oneSetWidth = slider.scrollWidth / 4;
        if (oneSetWidth > 0 && scrollPos >= oneSetWidth) {
          scrollPos -= oneSetWidth;
        }
        slider.scrollLeft = scrollPos;
      } else if (slider) {
        // Keep scrollPos in sync when manually scrolled or paused
        scrollPos = slider.scrollLeft;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [space]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSpace(getPuneOfficeCardById(id));
  }, [id]);

  const images = space?.images || [];

  // Dynamic similar spaces: 4 copies of area-specific cards for infinite scroll loop
  const areaSimilarCards = getSimilarSpacesByArea(space?.area);
  const loopedSimilarOfficeCards = [
    ...areaSimilarCards,
    ...areaSimilarCards,
    ...areaSimilarCards,
    ...areaSimilarCards
  ];

  const openCarousel = (index = 0) => {
    setActiveImageIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => setIsCarouselOpen(false);

  const prevImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard controls for carousel (Escape to close, Arrows to navigate)
  useEffect(() => {
    if (!isCarouselOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeCarousel();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCarouselOpen, images.length]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectPlan = (planTitle) => {
    setFormData((prev) => ({ ...prev, type: planTitle }));
    if (formErrors.type) {
      setFormErrors((prev) => ({ ...prev, type: '' }));
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'This field can not be blank.';
    if (!formData.email.trim()) errors.email = 'This field can not be blank.';
    if (!formData.phone.trim()) errors.phone = 'This field can not be blank.';
    if (!formData.type) errors.type = 'This field can not be blank.';
    if (!formData.seats) errors.seats = 'This field can not be blank.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitted(true);

    // Forward enquiry details to info@mycoworking.in via mailto
    const subject = encodeURIComponent(`Coworking Enquiry for ${space?.name || 'Office'} - ${formData.type}`);
    const body = encodeURIComponent(
      `Property: ${space?.name || ''} (${space?.location || ''})\n` +
      `Client Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: +91 ${formData.phone}\n` +
      `Workspace Type: ${formData.type}\n` +
      `Number of Seats: ${formData.seats}\n` +
      `Enquiry Date: ${new Date().toLocaleString()}\n`
    );
    window.location.href = `mailto:info@mycoworking.in?subject=${subject}&body=${body}`;
  };

  if (!space) {
    return (
      <main className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Office Space Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">The requested coworking space could not be found.</p>
        <Link
          to="/coworking/gurugram"
          className="bg-[#007bff] hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs transition-colors"
        >
          Back to Gurugram Coworking Spaces
        </Link>
      </main>
    );
  }

  // 3 Seating Plans sourced from this particular card
  const seatingPlans = [
    {
      title: 'Dedicated Desk',
      description: 'Fixed workspace in a Coworking Office with all amenities',
      seating: 'Seating : 1 - 100+ Seats',
      price: `${space.price}/* seat`,
      image: images[1] || images[0]
    },
    {
      title: 'Private Cabin',
      description: 'Ready to move fully furnished private office with all amenities',
      seating: 'Seating : 4, 6, 8, 10+ (Customization Available)',
      price: '₹9,999/* seat',
      image: images[2] || images[0]
    },
    {
      title: 'Virtual Office',
      description: 'Build your Company presence with Virtual Office in any city across India',
      seating: 'Company Registration & Mailing Address',
      price: '₹19,999/* year',
      image: images[3] || images[0]
    }
  ];

  // Amenities list matching reference layout
  const amenitiesList = [
    { name: 'High Speed WiFi', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
    { name: 'Meeting Rooms', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Ergo Workstations', icon: 'M4 6h16M4 10h16M4 14h16M8 18h8M12 14v4' },
    { name: 'Printer', icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
    { name: 'Car / Bike Parking', icon: 'M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM5 11l2-5h10l2 5v6H5v-6zm0 0h14' },
    { name: 'Pantry', icon: 'M12 6v12m-3-9a3 3 0 016 0v3a3 3 0 01-6 0V9zm9 4h-2m-10 0H6' },
    { name: 'Housekeeping', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { name: 'Reception', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'Air Conditioning', icon: 'M3 8h18M5 12h14M8 16h8m-11 4h14' },
    { name: 'Tea/Coffee', icon: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3' },
    { name: 'Phone Booth', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { name: 'Lounge', icon: 'M4 11V7a3 3 0 013-3h10a3 3 0 013 3v4M4 11h16M4 11v6a2 2 0 002 2h12a2 2 0 002-2v-6M2 13h2v4H2zm18 0h2v4h-2z' }
  ];

  // Community Events list matching reference layout
  const communityEventsList = [
    { name: 'Innovation & Creativity', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { name: 'Workshop & Training', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Meeting & Gatherings', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Networking Events', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { name: 'Community Building', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Health & Wellness', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
  ];

  return (
    <main className="w-full min-h-screen bg-white antialiased font-sans flex flex-col pb-16">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-[2cm] py-3 sm:py-4 flex flex-col gap-4 sm:gap-5">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="shrink-0">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
            <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/coworking/gurugram" className="hover:text-blue-600 transition-colors">Coworking</Link></li>
            <li>/</li>
            <li className="text-slate-700 font-medium truncate max-w-[200px] sm:max-w-md">{space.name}</li>
          </ol>
        </nav>

        {/* Header: Office Title, Location & Price */}
        <header className="flex flex-row items-end justify-between gap-3 pb-2 border-b border-slate-100 shrink-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate" title={space.name}>
              {space.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{space.location}</p>
          </div>
          <div className="flex flex-col items-end justify-center shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium leading-none">Starting</span>
            <div className="text-lg sm:text-2xl font-extrabold text-[#007bff] leading-tight">
              {space.price}<span className="text-xs sm:text-sm text-slate-600 font-normal"> / Month</span>
            </div>
          </div>
        </header>

        {/* Gallery Grid (Zoom-on-Hover) */}
        <section aria-label="Office image gallery" className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 h-[320px] sm:h-[400px] md:h-[460px] select-none shrink-0">
          {/* 1. Large Left Image */}
          <div
            onClick={() => openCarousel(0)}
            className="group relative md:col-span-6 h-full min-h-0 rounded-2xl overflow-hidden cursor-pointer bg-slate-100 shadow-2xs"
          >
            <img
              src={images[0]}
              alt={`${space.name} 1`}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>

          {/* 2. Middle Stacked 2 Images */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-2.5 sm:gap-3 h-full min-h-0">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                onClick={() => openCarousel(idx)}
                className="group relative h-full min-h-0 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-slate-100 shadow-2xs"
              >
                <img
                  src={images[idx] || images[0]}
                  alt={`${space.name} ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            ))}
          </div>

          {/* 3. Right Tall Image with View All Photos Button */}
          <div
            onClick={() => openCarousel(3)}
            className="group relative md:col-span-3 h-full min-h-0 rounded-2xl overflow-hidden cursor-pointer bg-slate-100 shadow-2xs"
          >
            <img
              src={images[3] || images[0]}
              alt={`${space.name} 4`}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

            {/* View All Photos Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openCarousel(0);
              }}
              className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs sm:text-sm font-semibold shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>📷</span>
              <span>View All Photos ({images.length})</span>
            </button>
          </div>
        </section>

        {/* Quick Highlights / CTA */}
        <section className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600">
            {space.badge && (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
                👑 {space.badge}
              </span>
            )}
            {space.rating && (
              <span className="font-semibold text-slate-800">
                <span className="text-amber-500">★</span> {space.rating} / 5.0 Rating
              </span>
            )}
            <span className="text-slate-400">•</span>
            <span>Verified Coworking Space</span>
          </div>

          <button
            type="button"
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#007bff] hover:bg-blue-600 active:scale-95 text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {space.ctaText || 'Get Quote'}
          </button>
        </section>

        {/* Top Trust Ribbon */}
        <section className="bg-white rounded-xl border border-slate-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-base sm:text-lg">👑</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm">Premium Coworking</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 text-center flex-1 min-w-[200px]">
            The Largest Network of Flex Workspaces in India
          </p>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
            <span>5.0</span>
            <span className="text-amber-400 tracking-tight">★★★★★</span>
          </div>
        </section>

        {/* Main 2-Column Area: Seating Plans (Left) & Enquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start mt-1">
          
          {/* Left Column: Seating Plans Cards */}
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Seating Plans
            </h2>

            <div className="flex flex-col gap-3.5">
              {seatingPlans.map((plan) => (
                <div
                  key={plan.title}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 transition-colors p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Left Plan Image */}
                  <div className="w-full sm:w-44 h-32 sm:h-28 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Center Details */}
                  <div className="flex-1 min-w-0 text-left w-full sm:w-auto">
                    <h3 className="text-base font-bold text-slate-900">{plan.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{plan.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2 font-medium">
                      <span>👤</span>
                      <span>{plan.seating}</span>
                    </div>
                  </div>

                  {/* Right Price & Enquire Button */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 gap-2 sm:gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                      {plan.price}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.title)}
                      className="border border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white active:scale-95 text-xs font-semibold px-4 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      Enquire Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div ref={formRef} className="lg:col-span-4 sticky top-24">
            <div className="bg-[#eef7ff] border border-blue-100 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Interested in this Property
              </h3>
              <p className="text-xs text-slate-500 mb-2.5 mt-0.5">
                Fill your details for a customized quote
              </p>

              {/* 4 Trust Points */}
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-2 mb-3.5 py-2 border-y border-blue-200/50 select-none">
                <div className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium leading-tight">
                  <svg className="w-3.5 h-3.5 text-[#007bff] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Exclusive Pricing & Zero Booking fee</span>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium leading-tight">
                  <svg className="w-3.5 h-3.5 text-[#007bff] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Guided Office Space Tours</span>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium leading-tight">
                  <svg className="w-3.5 h-3.5 text-[#007bff] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Spaces and Trusted Operators</span>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium leading-tight">
                  <svg className="w-3.5 h-3.5 text-[#007bff] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Dedicated Relationship Manager</span>
                </div>
              </div>

              {isSubmitted ? (
                <div className="bg-white/95 border border-green-200 rounded-xl p-4 text-center my-2 shadow-2xs">
                  <div className="text-2xl mb-1">✅</div>
                  <h4 className="text-sm font-bold text-slate-900">Enquiry Forwarded!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Your request has been forwarded to <span className="font-semibold text-blue-600">info@mycoworking.in</span>. Our team will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', type: '', seats: '' });
                    }}
                    className="mt-3 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-3">
                  {/* Name Field */}
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {formErrors.name && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.name}</span>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {formErrors.email && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.email}</span>
                    )}
                  </div>

                  {/* Phone Field with +91 Prefix */}
                  <div>
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors">
                      <span className="px-3 py-2 bg-slate-50 text-slate-600 text-xs sm:text-sm font-semibold border-r border-slate-200 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Mobile Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                    {formErrors.phone && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.phone}</span>
                    )}
                  </div>

                  {/* Dropdowns Row: Type & Seats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
                      >
                        <option value="">Type</option>
                        <option value="Dedicated Desk">Dedicated Desk</option>
                        <option value="Private Cabin">Private Cabin</option>
                        <option value="Virtual Office">Virtual Office</option>
                        <option value="Managed Office">Managed Office</option>
                      </select>
                      {formErrors.type && (
                        <span className="text-[10px] text-red-500 mt-0.5 block leading-tight">{formErrors.type}</span>
                      )}
                    </div>

                    <div>
                      <select
                        name="seats"
                        value={formData.seats}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
                      >
                        <option value="">No. Of Seats</option>
                        <option value="1 - 5 Seats">1 - 5 Seats</option>
                        <option value="6 - 15 Seats">6 - 15 Seats</option>
                        <option value="16 - 50 Seats">16 - 50 Seats</option>
                        <option value="50 - 100 Seats">50 - 100 Seats</option>
                        <option value="100+ Seats">100+ Seats</option>
                      </select>
                      {formErrors.seats && (
                        <span className="text-[10px] text-red-500 mt-0.5 block leading-tight">{formErrors.seats}</span>
                      )}
                    </div>
                  </div>

                  {/* Enquire Now Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#007bff] hover:bg-blue-600 active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg text-xs sm:text-sm shadow-xs transition-all cursor-pointer mt-1"
                  >
                    Enquire Now
                  </button>
                </form>
              )}

              {/* Connect with our space expert */}
              <div className="flex items-center gap-3 pt-3.5 border-t border-blue-200/60 mt-3.5">
                {/* Navbar logo badge beside contacts */}
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 shadow-xs border border-slate-700 select-none">
                  <span className="text-xs font-black text-white tracking-tight">
                    my<span className="text-orange-500">c</span><span className="text-orange-500 font-black">.</span>
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] sm:text-xs text-slate-600 font-medium">
                    Connect with our space expert
                  </span>
                  <a
                    href="mailto:info@mycoworking.in"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007bff] hover:underline truncate"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    info@mycoworking.in
                  </a>
                  <a
                    href="tel:+919028760011"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 mt-0.5"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.74.6 1 1 0 011 1v3.59a1 1 0 01-1 1A16 16 0 013 4a1 1 0 011-1h3.59a1 1 0 011 1 11.72 11.72 0 00.6 3.74 1 1 0 01-.27 1.1l-2.2 2.2z"/>
                    </svg>
                    +91 9028760011
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by Top Companies - Fully Horizontal Spanning Left to Right */}
        <section aria-label="Trusted by top companies" className="w-full bg-[#f0f7ff] border border-blue-100 rounded-2xl p-5 sm:p-6 shadow-xs mt-2">
          <h3 className="text-center text-sm sm:text-base font-bold text-slate-800 tracking-tight mb-4 sm:mb-5">
            Trusted by Top Companies
          </h3>

          <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 items-center justify-items-center select-none">
            {/* 1. INOX */}
            <div className="flex items-center gap-1 font-black text-lg tracking-wider text-[#003366]">
              <span>IN</span>
              <span className="text-amber-500 text-xl leading-none">★</span>
              <span>X</span>
            </div>

            {/* 2. Kotak */}
            <div className="flex items-center gap-1.5 font-bold text-sm text-[#003366]">
              <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black">
                ∞
              </span>
              <span>kotak</span>
            </div>

            {/* 3. Razorpay */}
            <div className="flex items-center gap-1 font-extrabold text-sm text-[#0b5cff] italic">
              <span className="text-base not-italic">⚡</span>
              <span>Razorpay</span>
            </div>

            {/* 4. Doubtnut */}
            <div className="flex items-center gap-1 font-bold text-sm text-[#ff5722]">
              <span className="w-5 h-5 rounded-full bg-[#ff5722] text-white flex items-center justify-center text-[10px] font-black">
                ▶
              </span>
              <span>doubtnut</span>
            </div>

            {/* 5. CredAble */}
            <div className="font-extrabold text-xs sm:text-sm tracking-widest text-[#d97706] uppercase">
              CREDABLE
            </div>

            {/* 6. AccioJob */}
            <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-[#1e293b]">
              <span className="text-blue-600 text-sm font-black">⬡</span>
              <span>AccioJob</span>
            </div>

            {/* 7. Purplle */}
            <div className="flex items-center gap-0.5 font-black text-sm text-[#a21caf] italic">
              <span>purplle</span>
              <span className="text-amber-400 text-xs not-italic">✨</span>
            </div>

            {/* 8. Classplus */}
            <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-[#0284c7]">
              <span className="text-sm font-black">❯❯</span>
              <span>Classplus</span>
            </div>
          </div>
        </section>

        {/* Office Overview, Timing & Amenities Section */}
        <section aria-label="Office Overview, Timings and Amenities" className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs mt-1 flex flex-col gap-6 sm:gap-7 divide-y divide-slate-100">
          {/* 1. Office Overview & Description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {space.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {space.name}, {space.location || 'Gurgaon'}, is one of the most elegant workspaces available. It offers fully furnished dedicated desks and private cabins. The modern facility features amenities such as a parking area, housekeeping service, pantry, power backup, sanitized floors, air conditioning, reception, high-level security, a printer, projector, scanner, speaker, unlimited internet access, and much more.
            </p>
          </div>

          {/* 2. Office Timing */}
          <div className="pt-6 sm:pt-7">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-4">
              Office Timing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Mon - Fri */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-[#007bff]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="16" cy="16" r="4" fill="#e0f2fe" stroke="currentColor" strokeWidth="1.5" />
                    <polyline points="16 14 16 16 17.5 17" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Mon - Fri</span>
                  <span className="text-xs text-slate-500">08:00 AM to 08:00 PM</span>
                </div>
              </div>

              {/* Sat */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-[#007bff]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="16" cy="16" r="4" fill="#e0f2fe" stroke="currentColor" strokeWidth="1.5" />
                    <polyline points="16 14 16 16 17.5 17" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Sat</span>
                  <span className="text-xs text-slate-500">08:00 AM to 08:00 PM</span>
                </div>
              </div>

              {/* Sun */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-[#007bff]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="16" cy="16" r="4" fill="#e0f2fe" stroke="currentColor" strokeWidth="1.5" />
                    <polyline points="16 14 16 16 17.5 17" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">Sun</span>
                  <span className="text-xs text-slate-500">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Amenities */}
          <div className="pt-6 sm:pt-7">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-4 sm:mb-5">
              Amenities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3.5 sm:gap-y-4 gap-x-6">
              {amenitiesList.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-[#007bff]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Location & Google Map */}
          <div className="pt-6 sm:pt-7">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {space.name} Location
            </h3>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mt-1">
              <svg className="w-4 h-4 text-slate-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>{space.location}</span>
            </div>

            {/* Clickable Google Map Container */}
            <div
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${space.name} ${space.location}`)}`, '_blank', 'noopener,noreferrer')}
              className="relative w-full h-72 sm:h-80 md:h-96 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group mt-4 select-none shadow-2xs"
              title="Click to open this office in Google Maps"
            >
              <iframe
                title={`${space.name} Location Map`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${space.name} ${space.location}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />

              {/* Pin Tooltip Popup as in screenshot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full -mt-2 flex flex-col items-center pointer-events-none transition-transform duration-200 group-hover:scale-105">
                <div className="bg-white/95 backdrop-blur-xs text-slate-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-200/90 whitespace-nowrap">
                  {space.name}
                </div>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-white/95" />
                <div className="w-7 h-7 rounded-full bg-[#007bff] text-white flex items-center justify-center shadow-lg mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>

              {/* Open in Google Maps Badge */}
              <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold shadow-md border border-slate-200 transition-all group-hover:bg-[#007bff] group-hover:text-white group-hover:border-[#007bff]">
                <span>📍</span>
                <span>Open in Google Maps ↗</span>
              </div>
            </div>
          </div>

          {/* 5. Operator / Brand Profile */}
          <div className="pt-6 sm:pt-7 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                <span className="text-xs font-black text-orange-500 tracking-tight text-center leading-none uppercase">
                  {space.name.split(' ')[0]}
                </span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {space.name.split(' ')[0]}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Trusted by Clients Across Every Corner of India
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${!isAboutExpanded ? 'line-clamp-3 sm:line-clamp-none' : ''}`}>
              {space.name} helps businesses with the largest flexible workspaces all over India, ranging from single seats to multiple seats. Coworking space solutions by {space.name} are present in 48 micro markets in India, covering the topmost 16 cities. They provide a wide spectrum of solutions to help all types of industries be it startups, small companies (SMEs), or large corporations. {space.name} Coworking solutions are interactive and uniquely designed to enhance productivity so that your business can grow in the target market.
            </p>

            <button
              type="button"
              onClick={() => setIsAboutExpanded((prev) => !prev)}
              className="text-xs text-[#007bff] hover:underline font-semibold self-start cursor-pointer sm:hidden"
            >
              {isAboutExpanded ? 'See Less' : 'See More'}
            </button>
          </div>

          {/* 6. Community Events */}
          <div className="pt-6 sm:pt-7">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-4 sm:mb-5">
              Community Events
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3.5 sm:gap-y-4 gap-x-6">
              {communityEventsList.map((event) => (
                <div key={event.name} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-[#007bff]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={event.icon} />
                    </svg>
                  </div>
                  <span>{event.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Similar Coworking Spaces Section - Matching Reference */}
        <section aria-label="Similar Coworking Spaces" className="w-full bg-[#fdfaf5] border border-amber-100/80 rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden mt-2">
          {/* Decorative Colored Confetti Dots Matching Screenshot */}
          <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-cyan-400 opacity-80 pointer-events-none" />
          <div className="absolute top-12 right-4 w-2.5 h-2.5 rounded-full bg-teal-400 opacity-70 pointer-events-none" />
          <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-pink-400 opacity-60 pointer-events-none" />
          <div className="absolute top-24 right-5 w-2.5 h-2.5 rounded-full bg-orange-300 opacity-75 pointer-events-none" />
          <div className="absolute bottom-6 right-3 w-2.5 h-2.5 rounded-full bg-cyan-300 opacity-70 pointer-events-none" />
          <div className="absolute bottom-10 right-8 w-2 h-2 rounded-full bg-pink-400 opacity-60 pointer-events-none" />

          {/* Golden Laurel Wreath Rating Header */}
          <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8 select-none">
            <div className="flex items-center gap-2 sm:gap-3 text-amber-500">
              {/* Left Laurel Leaves */}
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.5 4c-.8 1.5-1.2 3.1-1.2 4.8 0 2.8 1.2 5.4 3.2 7.2-1.5-.5-2.8-1.5-3.8-2.8-1.4-1.9-2.2-4.2-2.2-6.7 0-1.8.4-3.5 1.2-5 .9.8 1.8 1.6 2.8 2.5zm4.8 2.2c-.6 1.8-1.8 3.3-3.3 4.3-1.6 1.1-3.6 1.7-5.6 1.7-.5 0-1-.1-1.5-.2.5-1.8 1.5-3.5 2.9-4.8 1.9-1.8 4.5-2.8 7.2-2.8.1.6.2 1.2.3 1.8z"/>
              </svg>
              <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none">
                4.8
              </span>
              {/* Right Laurel Leaves (Mirrored) */}
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 shrink-0 -scale-x-100" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.5 4c-.8 1.5-1.2 3.1-1.2 4.8 0 2.8 1.2 5.4 3.2 7.2-1.5-.5-2.8-1.5-3.8-2.8-1.4-1.9-2.2-4.2-2.2-6.7 0-1.8.4-3.5 1.2-5 .9.8 1.8 1.6 2.8 2.5zm4.8 2.2c-.6 1.8-1.8 3.3-3.3 4.3-1.6 1.1-3.6 1.7-5.6 1.7-.5 0-1-.1-1.5-.2.5-1.8 1.5-3.5 2.9-4.8 1.9-1.8 4.5-2.8 7.2-2.8.1.6.2 1.2.3 1.8z"/>
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1.5 tracking-wide">
              Premium Coworking
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-3 tracking-tight">
             Similar Coworking Spaces in {space.area || space.location?.split(',')[0] || 'Gurugram'}
            </h3>
          </div>

          {/* Cards Carousel Container with Continuous Auto-Move & Arrows */}
          <div
            className="relative group/carousel px-1"
            onMouseEnter={() => { isSliderPausedRef.current = true; }}
            onMouseLeave={() => { isSliderPausedRef.current = false; }}
            onTouchStart={() => { isSliderPausedRef.current = true; }}
            onTouchEnd={() => { isSliderPausedRef.current = false; }}
          >
            {/* Left Scroll Button */}
            <button
              type="button"
              onClick={scrollSimilarLeft}
              aria-label="Scroll left"
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center text-lg font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
            >
              ‹
            </button>

            {/* Continuously Moving Scrollable Row */}
            <div
              ref={similarSliderRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-1.5 px-1 select-none [&::-webkit-scrollbar]:hidden"
            >
              {loopedSimilarOfficeCards.map((item, idx) => (
                <article
                  key={`${item.id}-${idx}`}
                  onClick={() => window.open(`/coworking/gurugram/${item.id}`, '_blank', 'noopener,noreferrer')}
                  className="w-[250px] sm:w-[270px] md:w-[285px] shrink-0 bg-transparent rounded-2xl overflow-hidden cursor-pointer group flex flex-col"
                >
                  {/* Card Image */}
                  <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-2xs group-hover:shadow-md transition-shadow">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Card Info matching screenshot */}
                  <div className="pt-2 px-0.5 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#007bff] transition-colors" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                        <span>★</span>
                        <span className="text-slate-700 text-[11px] font-semibold">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                      {item.location}
                    </p>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                      {item.price}<span className="text-[11px] text-slate-500 font-normal"> / month</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button
              type="button"
              onClick={scrollSimilarRight}
              aria-label="Scroll right"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 flex items-center justify-center text-lg font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
            >
              ›
            </button>
          </div>
        </section>

        {/* Section: Explore Top Coworking Locations in Gurugram */}
        <section aria-label="Explore top coworking locations in Gurugram" className="my-10 pt-4 border-t border-slate-200/80">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
            Explore Top Coworking Locations in Gurugram
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
            {topPuneCoworkingLocations.map((location) => (
              <div
                key={location.id}
                role="button"
                tabIndex={0}
                onClick={() => window.open('/coworking/gurugram', '_blank', 'noopener,noreferrer')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.open('/coworking/gurugram', '_blank', 'noopener,noreferrer');
                  }
                }}
                className="group bg-white rounded-lg border border-slate-200 hover:border-blue-300 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Location Image */}
                <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100">
                  <img
                    src={location.image}
                    alt={`Coworking spaces in ${location.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                    <span>{location.ctaText || 'Explore Spaces'}</span>
                    <span className="text-[11px] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Lightbox Modal Carousel (Popup on same screen) */}
      {isCarouselOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeCarousel}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none h-screen max-h-screen h-[100dvh] max-h-[100dvh] overflow-hidden"
        >
          {/* Modal Header */}
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between text-white w-full max-w-6xl mx-auto z-20 shrink-0 py-1">
            <span className="text-xs sm:text-sm font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-full">
              {activeImageIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={closeCarousel}
              aria-label="Close carousel"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Modal Center: Active Image & Left/Right Arrows */}
          <div onClick={(e) => e.stopPropagation()} className="relative flex-1 min-h-0 w-full max-w-6xl mx-auto flex items-center justify-center my-auto overflow-hidden">
            {images.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white text-2xl flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
              >
                ‹
              </button>
            )}

            {/* Standardized Image Stage: Fits 100% on screen in uniform format */}
            <div className="w-full h-full max-h-[66vh] sm:max-h-[70vh] flex items-center justify-center px-10 sm:px-16 overflow-hidden">
              <img
                src={images[activeImageIndex]}
                alt={`${space.name} photo ${activeImageIndex + 1}`}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl select-none"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next photo"
                className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white text-2xl flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
              >
                ›
              </button>
            )}
          </div>

          {/* Modal Bottom: Thumbnail Strip */}
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl mx-auto z-20 shrink-0 py-1.5 flex items-center justify-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-none">
            {images.map((imgUrl, idx) => (
              <button
                key={`thumb-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`shrink-0 w-12 h-9 sm:w-14 sm:h-10 rounded-md overflow-hidden transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'ring-2 ring-[#007bff] scale-105 opacity-100' : 'opacity-40 hover:opacity-85'
                }`}
              >
                <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default OfficeDetail;
