<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Passionate Reader</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              beige: {
                50: '#FDFBF9',
                100: '#F9F5F0', // Main Background
                200: '#F2EBE0',
                300: '#E6DCCF',
                800: '#4A4641',
                900: '#2D2A26', // Primary Text (Soft Black)
              },
              primary: {
                DEFAULT: '#FF1D8D', // Rose Pink
                light: '#FF64B0',
                dark: '#D6006D',
                10: '#FF1D8D1A', // 10% opacity
                20: '#FF1D8D33', // 20% opacity
              },
              accent: {
                DEFAULT: '#D4C5B0', // Warm sand
                light: '#EBE0D0',
                peach: '#F2D4C2',
              }
            },
            fontFamily: {
              serif: ['"Playfair Display"', 'serif'],
              sans: ['"Manrope"', 'sans-serif'],
            },
            backgroundImage: {
              'hero-pattern': "url('hero-section-rose-3.webp')",
              'mesh-primary': 'radial-gradient(at 0% 0%, hsla(330,80%,63%,0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(27,55%,85%,0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(330,80%,63%,0.1) 0px, transparent 50%)',
              'glow-primary': 'radial-gradient(circle at 50% 50%, rgba(255, 29, 141, 0.2) 0%, rgba(249, 245, 240, 0) 70%)',
            },
            boxShadow: {
              'book': '0 25px 50px -12px rgba(45, 42, 38, 0.25), 0 10px 30px -5px rgba(45, 42, 38, 0.15)',
              'soft': '0 4px 30px rgba(127, 133, 193, 0.1)',
            },
            maxWidth: {
              'site': '1920px',
            }
          }
        }
      }
    </script>
    <style>
      body {
        background-color: #F2EBE0;
        color: #2D2A26;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      html {
        scroll-behavior: smooth;
      }
      /* Custom utility to hide scrollbar but keep functionality if needed */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      /* Animation utility from Hero */
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.8s ease-out forwards;
      }
    </style>
  </head>
  <body>
    <div class="min-h-screen bg-beige-200 text-beige-900 selection:bg-primary/20 selection:text-primary-dark">
      
      <!-- Navbar -->
      <nav class="fixed top-0 w-full z-50 transition-all duration-500 ease-in-out py-6">
        <div class="w-full max-w-site mx-auto px-[clamp(1.5rem,5vw,5rem)] flex items-center justify-between relative">
          
          <!-- Left: Circular Image Logo -->
          <div class="flex-shrink-0 z-20">
            <a href="index.html" class="group block">
               <div class="w-[50px] md:w-[60px] lg:w-[70px] aspect-square rounded-full overflow-hidden border-2 border-primary/20 shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 group-hover:shadow-lg bg-white">
                 <img src="tpr-logo.png" alt="The Passionate Reader Logo" class="w-full h-full object-cover">
               </div>
               <span class="sr-only">The Passionate Reader</span>
            </a>
          </div>
  
          <!-- Center: Navigation (Floating Pill) -->
          <div id="nav-pill" class="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center space-x-[clamp(1.5rem,2vw,2.5rem)] px-[clamp(2rem,3vw,3rem)] py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm transition-all duration-300 hover:bg-white/30 hover:shadow-md">
              <a href="index.html" class="relative font-sans text-xs lg:text-sm font-semibold text-beige-900 hover:text-primary transition-colors duration-200 tracking-widest uppercase after:content-[''] after:absolute after:w-0 after:h-px after:bg-primary after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full">Home</a>
              <a href="reviews.html" class="relative font-sans text-xs lg:text-sm font-semibold text-beige-900 hover:text-primary transition-colors duration-200 tracking-widest uppercase after:content-[''] after:absolute after:w-0 after:h-px after:bg-primary after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full">Reviews</a>
              <a href="#search" class="relative font-sans text-xs lg:text-sm font-semibold text-beige-900 hover:text-primary transition-colors duration-200 tracking-widest uppercase after:content-[''] after:absolute after:w-0 after:h-px after:bg-primary after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full">PowerSearch</a>
              <a href="#blog" class="relative font-sans text-xs lg:text-sm font-semibold text-beige-900 hover:text-primary transition-colors duration-200 tracking-widest uppercase after:content-[''] after:absolute after:w-0 after:h-px after:bg-primary after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full">Blog</a>
              <a href="#about" class="relative font-sans text-xs lg:text-sm font-semibold text-beige-900 hover:text-primary transition-colors duration-200 tracking-widest uppercase after:content-[''] after:absolute after:w-0 after:h-px after:bg-primary after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full">About</a>
          </div>
  
          <!-- Right: CTA -->
          <div class="hidden md:flex items-center justify-end z-20">
            <button class="inline-flex items-center justify-center transition-all duration-300 ease-out font-sans font-medium rounded-full tracking-wide bg-white text-primary hover:bg-primary hover:text-white shadow-soft hover:shadow-lg transform hover:-translate-y-0.5 text-sm px-6 py-2.5">
              Subscribe
            </button>
          </div>
  
          <!-- Mobile Toggle -->
          <button 
            class="lg:hidden text-beige-900 focus:outline-none p-2 ml-auto z-20 bg-white/40 rounded-full backdrop-blur-md hover:bg-white/60 transition-colors"
            aria-label="Toggle menu"
          >
            <div class="w-6 h-6 flex flex-col justify-center items-center gap-[5px]">
              <span class="h-0.5 bg-current transition-all duration-300 w-5 origin-center"></span>
              <span class="h-0.5 bg-current transition-all duration-300 w-5 origin-center"></span>
              <span class="h-0.5 bg-current transition-all duration-300 w-5 origin-center"></span>
            </div>
          </button>
        </div>
  
        <!-- Mobile Menu Overlay -->
        <div id="mobile-menu"
          class="lg:hidden fixed inset-0 bg-beige-200/98 backdrop-blur-xl z-10 pt-32 px-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 -translate-y-full pointer-events-none"
        >
          <div class="flex flex-col items-center space-y-6">
              <a href="/" class="font-serif text-3xl md:text-4xl text-beige-900 hover:text-primary transition-colors">Home</a>
              <a href="reviews.html" class="font-serif text-3xl md:text-4xl text-beige-900 hover:text-primary transition-colors">Reviews</a>
              <a href="#search" class="font-serif text-3xl md:text-4xl text-beige-900 hover:text-primary transition-colors">PowerSearch</a>
              <a href="#blog" class="font-serif text-3xl md:text-4xl text-beige-900 hover:text-primary transition-colors">Blog</a>
              <a href="#about" class="font-serif text-3xl md:text-4xl text-beige-900 hover:text-primary transition-colors">About</a>
            <div class="pt-8 w-full max-w-xs">
               <button class="inline-flex items-center justify-center transition-all duration-300 ease-out font-sans font-medium rounded-full tracking-wide bg-white text-primary hover:bg-primary hover:text-white shadow-soft hover:shadow-lg transform hover:-translate-y-0.5 text-lg px-8 py-3 w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <!-- Hero Section -->
        <section class="relative w-full h-[100dvh] min-h-[100dvh] flex items-center overflow-hidden pt-[clamp(4rem,10vh,6rem)]">
      
            <!-- Background Image & Overlay -->
            <div class="absolute inset-0 bg-hero-pattern bg-cover bg-center bg-no-repeat z-0"></div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-beige-200/80 via-white/10 to-transparent z-0"></div>
      
            <!-- Content Container -->
            <div class="relative w-full max-w-site mx-auto px-[clamp(1.5rem,5vw,5rem)] h-full flex items-center z-10">
              <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,4vw,4rem)] lg:gap-8 items-center h-full lg:h-auto content-center">
                
                <!-- Left Column: Typography (Span 7 cols) -->
                <div class="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-[clamp(1.5rem,3vh,3rem)] order-2 lg:order-1 pb-10 lg:pb-0">
                  
                  <div class="space-y-[clamp(1rem,2vh,2rem)] w-full">
                    <div class="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm transition-transform hover:scale-105 cursor-default mx-auto lg:mx-0">
                       <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse"></span>
                       <span class="text-beige-900/90 text-[10px] md:text-xs font-bold uppercase tracking-widest font-sans">
                         Reviews by Dabney Grinnan
                       </span>
                    </div>
                    
                    <h1 class="font-serif text-[clamp(2.5rem,7.5vw,6.5rem)] leading-[1] md:leading-[0.9] text-beige-900 font-medium tracking-tighter">
                      The <span class="text-primary italic relative inline-block mr-1 md:mr-2">Passionate
                        <svg class="absolute w-full h-[clamp(0.6rem,1.2vw,1.2rem)] -bottom-1 md:-bottom-2 lg:-bottom-3 left-0 text-primary opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                          <path d="M0 5 Q 50 12 100 5" stroke="currentColor" stroke-width="3" fill="none" />
                        </svg>
                      </span>Reader
                    </h1>
                    
                    <p class="font-sans text-[clamp(1rem,1.5vw,1.5rem)] text-beige-900/80 leading-relaxed font-light max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
                      Uncovering the finest in fiction. Join me for honest reviews, literary deep dives, and a celebration of the stories that move us.
                    </p>
                  </div>
      
                  <div class="pt-2 md:pt-4">
                    <button class="inline-flex items-center justify-center transition-all duration-300 ease-out font-sans font-medium rounded-full tracking-wide bg-white text-primary hover:bg-primary hover:text-white shadow-soft hover:shadow-lg transform hover:-translate-y-0.5 text-[clamp(1rem,1.2vw,1.25rem)] px-[clamp(2rem,3vw,3rem)] py-[clamp(0.8rem,1.5vh,1.25rem)] shadow-lg shadow-primary/10">
                      See more reviews
                    </button>
                  </div>
                </div>
      
                <!-- Right Column: Book/Visual (Span 5 cols) -->
                <div class="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2 w-full pt-4 lg:pt-0">
                  
                  <!-- Centered Book Container -->
                  <div class="relative w-[clamp(160px,45vw,300px)] aspect-[2/3] group perspective-1000 z-10">
                    
                    <!-- Book Cover -->
                    <div class="absolute inset-0 shadow-2xl rounded-xl overflow-hidden bg-gray-100 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] z-0 ring-1 ring-white/20">
                        <img 
                        src="https://allaboutromance.com/wp-content/uploads/2013/11/1-4.jpg" 
                        alt="When the Marquess Met His Match by Laura Lee Guhrke" 
                        class="w-full h-full object-cover"
                        />
                        
                        <!-- Premium Lighting Effects -->
                        <div class="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/30 pointer-events-none mix-blend-overlay"></div>
                        <div class="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                        <!-- Spine Highlight -->
                        <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-white/30 pointer-events-none z-10"></div>
                    </div>
      
                    <!-- Ultra-Glassy Floating Info Card (Hanging) -->
                    <div class="absolute -bottom-8 md:-bottom-12 left-1/2 transform -translate-x-1/2 w-[120%] bg-white/40 backdrop-blur-xl backdrop-contrast-125 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-4 md:p-6 text-center transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:bg-white/60 z-20">
                        
                        <!-- Subtle noise texture overlay for realism (optional, kept simple for now) -->
                        <div class="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none"></div>

                        <div class="relative z-10">
                            <div class="flex justify-center space-x-0.5 md:space-x-1 text-primary mb-2 md:mb-3 drop-shadow-sm">
                                <!-- Stars -->
                                <svg class="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <svg class="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <svg class="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <svg class="w-3 h-3 md:w-4 md:h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <!-- Empty/Half Star -->
                                <svg class="w-3 h-3 md:w-4 md:h-4 text-primary/40 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
          
                            <h3 class="font-serif text-[clamp(1rem,4vw,1.5rem)] text-beige-900 leading-tight mb-2 italic line-clamp-2">
                              When the Marquess Met His Match
                            </h3>
                            
                            <p class="font-sans text-[10px] md:text-xs font-bold tracking-widest uppercase text-beige-900/60 mb-2 md:mb-3">
                              Laura Lee Guhrke
                            </p>
                            
                            <div class="flex flex-wrap justify-center gap-2 text-[10px] md:text-xs font-sans text-beige-900/80">
                              <span class="bg-white/50 border border-white/40 px-2 md:px-3 py-1 rounded-full text-beige-900 font-semibold backdrop-blur-sm">Historical Romance</span>
                            </div>
                        </div>
                    </div>
                  </div>
      
                </div>
              </div>
            </div>
          </section>
        
        <!-- Latest from the Journal -->
        <section id="reviews" class="py-24 px-[clamp(1.5rem,5vw,5rem)] w-full max-w-site mx-auto border-t border-beige-300/50">
           <div class="text-center mb-20">
             <span class="font-sans text-xs md:text-sm font-bold tracking-[0.2em] text-primary uppercase mb-3 block">Fresh Off the Press</span>
             <h2 class="font-serif text-4xl md:text-5xl text-beige-900 mb-6">Latest from the Journal</h2>
             <p class="font-sans text-beige-800/70 max-w-2xl mx-auto text-lg font-light leading-relaxed">
               Explore our most recent thoughts on classic literature, modern fiction, and the writing life.
             </p>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
             
             <!-- Article 1 -->
             <article class="group cursor-pointer flex flex-col items-center">
               <div class="relative w-full mb-8 flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2">
                 <div class="w-[180px] md:w-[200px] shadow-book transition-transform duration-500 group-hover:scale-105 rounded-sm overflow-hidden">
                   <img src="https://allaboutromance.com/wp-content/uploads/2019/12/1-29.jpg" alt="The Christmas Miracle of Jonathan Toomey" class="w-full h-auto block">
                 </div>
               </div>
               
               <div class="text-center px-4">
                 <div class="mb-3 flex items-center justify-center gap-2">
                   <span class="px-2 py-0.5 border border-beige-300 rounded-full text-[10px] font-bold tracking-widest uppercase text-beige-800/60 bg-white/50">Desert Isle Keeper</span>
                 </div>
                 
                 <h3 class="font-serif text-2xl text-beige-900 mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                   The Christmas Miracle of Jonathan Toomey
                 </h3>
                 <p class="font-sans text-xs font-bold tracking-widest text-beige-900/50 uppercase mb-4">
                   Susan Wojciechowski
                 </p>
                 <p class="font-sans text-beige-800/80 text-[0.95rem] leading-relaxed line-clamp-3 mb-6">
                   Despite being a family of non-believers, every year we pull out our holiday paraphernalia. We dress the tree, hanging with care the delicate glass ornaments gifted to us over the many years...
                 </p>
                 
                 <a href="single-book-review.html" class="inline-flex items-center text-xs font-bold tracking-widest uppercase text-primary border-b border-primary/20 pb-0.5 hover:text-primary-dark hover:border-primary transition-all">
                   Read Review
                 </a>
               </div>
             </article>

             <!-- Article 2 -->
             <article class="group cursor-pointer flex flex-col items-center">
               <div class="relative w-full mb-8 flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2">
                 <div class="w-[180px] md:w-[200px] shadow-book transition-transform duration-500 group-hover:scale-105 rounded-sm overflow-hidden">
                   <img src="https://allaboutromance.com/wp-content/uploads/2025/12/1-24.jpg" alt="The Plight Before Christmas" class="w-full h-auto block">
                 </div>
               </div>
               
               <div class="text-center px-4">
                 <div class="mb-3 flex items-center justify-center gap-2">
                   <span class="px-2 py-0.5 border border-beige-300 rounded-full text-[10px] font-bold tracking-widest uppercase text-beige-800/60 bg-white/50">AAR Review</span>
                 </div>
                 
                 <h3 class="font-serif text-2xl text-beige-900 mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                   The Plight Before Christmas
                 </h3>
                 <p class="font-sans text-xs font-bold tracking-widest text-beige-900/50 uppercase mb-4">
                   Kate Stewart
                 </p>
                 <p class="font-sans text-beige-800/80 text-[0.95rem] leading-relaxed line-clamp-3 mb-6">
                   The Plight Before Christmas needs an editor, has leads in their late thirties who behave at least ten years younger, and manufactures so much angst in its final few chapters...
                 </p>
                 
                 <a href="single-book-review.html" class="inline-flex items-center text-xs font-bold tracking-widest uppercase text-primary border-b border-primary/20 pb-0.5 hover:text-primary-dark hover:border-primary transition-all">
                   Read Review
                 </a>
               </div>
             </article>

             <!-- Article 3 -->
             <article class="group cursor-pointer flex flex-col items-center">
               <div class="relative w-full mb-8 flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2">
                 <div class="w-[180px] md:w-[200px] shadow-book transition-transform duration-500 group-hover:scale-105 rounded-sm overflow-hidden">
                   <img src="https://allaboutromance.com/wp-content/uploads/2025/12/1-8.jpg" alt="Hunk for the Holidays" class="w-full h-auto block">
                 </div>
               </div>
               
               <div class="text-center px-4">
                 <div class="mb-3 flex items-center justify-center gap-2">
                   <span class="px-2 py-0.5 border border-beige-300 rounded-full text-[10px] font-bold tracking-widest uppercase text-beige-800/60 bg-white/50">AAR Review</span>
                 </div>
                 
                 <h3 class="font-serif text-2xl text-beige-900 mb-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                   Hunk for the Holidays
                 </h3>
                 <p class="font-sans text-xs font-bold tracking-widest text-beige-900/50 uppercase mb-4">
                   Katie Lane
                 </p>
                 <p class="font-sans text-beige-800/80 text-[0.95rem] leading-relaxed line-clamp-3 mb-6">
                   Hunk for the Holidays knows exactly what it is: a light Christmas love story that exists just to entertain. Lane leans into the charm of a slightly ridiculous premise...
                 </p>
                 
                 <a href="single-book-review.html" class="inline-flex items-center text-xs font-bold tracking-widest uppercase text-primary border-b border-primary/20 pb-0.5 hover:text-primary-dark hover:border-primary transition-all">
                   Read Review
                 </a>
               </div>
             </article>

           </div>
           
           <div class="mt-16 text-center">
              <a href="reviews.html" class="inline-flex items-center justify-center transition-all duration-300 ease-out font-sans font-medium rounded-full tracking-wide bg-white text-beige-900 border border-beige-300 hover:border-primary hover:text-primary hover:shadow-lg transform hover:-translate-y-0.5 text-sm px-8 py-3">
                  View All Reviews
              </a>
           </div>
        </section>

        <!-- Newsletter Section -->
        <section id="newsletter" class="py-24 px-[clamp(1.5rem,5vw,5rem)] w-full relative overflow-hidden bg-beige-100">
           <!-- Background Image & Overlay -->
           <div class="absolute inset-0 bg-[url('newsletter-section.jpg')] bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"></div>
           <div class="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
           
           <!-- Decorative Background Elements -->
           <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
           <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

           <div class="relative w-full max-w-2xl mx-auto text-center z-10">
             <span class="font-sans text-xs md:text-sm font-bold tracking-[0.2em] text-primary uppercase mb-4 block">Stay in the Loop</span>
             <h2 class="font-serif text-4xl md:text-5xl text-beige-900 mb-6">A Weekly Dose of Literature</h2>
             <p class="font-sans text-beige-800/70 text-lg font-light leading-relaxed mb-10">
               Join our community of passionate readers. Receive hand-picked book recommendations, exclusive reviews, and literary essays directly to your inbox every Sunday.
             </p>

             <form class="flex flex-col md:flex-row items-stretch gap-4 max-w-lg mx-auto" onsubmit="event.preventDefault();">
               <input 
                 type="email" 
                 placeholder="Your email address" 
                 class="flex-1 bg-white border border-beige-300 text-beige-900 text-sm rounded-full px-6 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-beige-400"
                 required
               >
               <button type="submit" class="inline-flex items-center justify-center transition-all duration-300 ease-out font-sans font-medium rounded-full tracking-wide bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 text-sm px-8 py-3">
                 Subscribe
               </button>
             </form>
             <p class="font-sans text-[10px] text-beige-800/40 uppercase tracking-wider mt-4">
               No spam, ever. Unsubscribe at any time.
             </p>
           </div>
        </section>
      </main>
      
      <footer class="bg-beige-200 py-12 px-6 text-center font-sans text-beige-800 text-sm">
        <p>&copy; <span id="year"></span> The Passionate Reader. All rights reserved.</p>
      </footer>
    </div>
    <script>
      document.getElementById('year').textContent = new Date().getFullYear();
    </script>
    <script src="script.js"></script>
  </body>
</html>

---

