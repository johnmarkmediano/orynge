/* ============ NAVIGATION ============ */
const pages = ['home','about','services','skills','portfolio','contact'];
const navLinks = document.getElementById('navLinks');
const mobileMenu = document.getElementById('mobileMenu');
const burgerBtn = document.getElementById('burgerBtn');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let transitionTimer = 0;
let reverseTimer = 0;
let typeTimer = 0;
let statsAnimationToken = 0;

function goTo(page){
  if(!pages.includes(page)) return;

  // Page transition overlay
  const overlay = document.querySelector('.page-transition');
  window.clearTimeout(transitionTimer);
  window.clearTimeout(reverseTimer);
  if(overlay && !prefersReducedMotion){
    overlay.classList.add('active');
    transitionTimer = window.setTimeout(() => {
      switchPage(page);
      overlay.classList.remove('active');
      overlay.classList.add('reverse');
      reverseTimer = window.setTimeout(() => overlay.classList.remove('reverse'), 260);
    }, 200);
  } else {
    switchPage(page);
  }
}

function switchPage(page){
  pages.forEach(p => {
    const el = document.getElementById(p);
    if(el) el.classList.toggle('active', p === page);
  });

  document.querySelectorAll('nav.links button, nav.mobile-menu button').forEach(b => {
    const isActive = b.dataset.page === page;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  if(mobileMenu){
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }
  if(burgerBtn){
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', 'Open menu');
  }

  document.body.dataset.page = page;
  syncHash(page);
  window.dispatchEvent(new CustomEvent('pageChanged', { detail: page }));

  // Reset scroll progress on page change
  const scrollProgress = document.getElementById('scrollProgress');
  if(scrollProgress){
    scrollProgress.style.transform = 'scaleX(0)';
  }

  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  
  // Focus management for accessibility
  const main = document.querySelector('main');
  if(main){
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  }
}

if(navLinks){
  navLinks.querySelectorAll('button[data-page]').forEach(b => b.addEventListener('click', () => goTo(b.dataset.page)));
}
if(mobileMenu){
  mobileMenu.querySelectorAll('button[data-page]').forEach(b => b.addEventListener('click', () => goTo(b.dataset.page)));
}
if(burgerBtn){
  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burgerBtn.setAttribute('aria-expanded', isOpen);
    burgerBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    if(isOpen){
      const firstBtn = mobileMenu.querySelector('.nav-btn');
      if(firstBtn) firstBtn.focus();
    }
  });
}

window.addEventListener('load', () => {
  if(window.location.hash){
    const page = window.location.hash.replace('#','');
    if(pages.includes(page)) switchPage(page);
  }
  
  // Initialize stats if home is active
  if(document.body.dataset.page === 'home' || !document.body.dataset.page){
    setTimeout(animateStats, 500);
  }
});

/* Deep links (index.html#about) must work both on load and when already on the page. */
window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#','');
  if(pages.includes(page) && document.body.dataset.page !== page){
    switchPage(page);
  }
});

/* Keep the address bar in sync so the landing page is always a shareable link. */
function syncHash(page){
  const nextHash = page === 'home' ? '' : `#${page}`;
  if(window.location.hash === nextHash) return;
  const url = nextHash ? `${window.location.pathname}${window.location.search}${nextHash}` : window.location.pathname + window.location.search;
  window.history.replaceState(null,'',url);
}

/* ============ TYPEWRITER ============ */
const roles = ['Social Media Management','Marketing Support','Content Strategy','Photo & Video Editing'];
let rIdx=0, cIdx=0, deleting=false;
const typeEl = document.getElementById('typeTarget');
function typeLoop(){
  if(!typeEl || (document.body.dataset.page && document.body.dataset.page !== 'home')) return;
  if(prefersReducedMotion){
    typeEl.textContent = roles[0];
    return;
  }
  const word = roles[rIdx];
  if(!deleting){
    cIdx++;
    typeEl.textContent = word.slice(0,cIdx);
    if(cIdx===word.length){ deleting=true; typeTimer=window.setTimeout(typeLoop,1400); return; }
  } else {
    cIdx--;
    typeEl.textContent = word.slice(0,cIdx);
    if(cIdx===0){ deleting=false; rIdx=(rIdx+1)%roles.length; }
  }
  typeTimer=window.setTimeout(typeLoop, deleting ? 35 : 75);
}
// Start typewriter when home page is active
function startTypewriter(){
  window.clearTimeout(typeTimer);
  if(document.body.dataset.page === 'home' || !document.body.dataset.page){
    typeLoop();
  }
}
window.addEventListener('pageChanged', e => {
  if(e.detail === 'home'){
    rIdx=0; cIdx=0; deleting=false;
    startTypewriter();
  }
});
startTypewriter();

/* ============ CURSOR GLOW ============ */
const glow = document.getElementById('glow');
let mx=window.innerWidth/2, my=window.innerHeight/2;
if(glow && !prefersReducedMotion){
  window.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    glow.style.left = mx + 'px';
    glow.style.top = my + 'px';
  });
} else if(glow){
  glow.style.display = 'none';
}

/* card spotlight */
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX-r.left)+'px');
    card.style.setProperty('--my', (e.clientY-r.top)+'px');
  });
});

/* ============ SKILLS ANIMATION ============ */
/* ============ CONTACT FORM ============ */
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    
    // Honeypot check - if filled, it's likely a bot
    const honeypot = contactForm.querySelector('input[name="website"]');
    if(honeypot && honeypot.value.trim()){
      // Silently fail for bots
      console.log('Spam attempt blocked');
      return;
    }
    
    const name=document.getElementById('fName').value.trim();
    const email=document.getElementById('fEmail').value.trim();
    const reason=document.getElementById('fReason').value;
    const timeline=document.getElementById('fTimeline').value;
    const msg=document.getElementById('fMessage').value.trim();
    const status=document.getElementById('formStatus');
    const btn=document.getElementById('sendBtn');
    
    // Validate all required fields
    let hasError = false;
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if(!validateField(field)) hasError = true;
    });
    
    if(hasError){
      if(status) status.textContent = 'Please fix the errors above.';
      return;
    }
    
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      showFieldError(document.getElementById('fEmail'), 'Please enter a valid email address');
      if(status) status.textContent = 'Please enter a valid email address.';
      return;
    }

    if(btn){
      btn.disabled = true;
      btn.classList.add('loading');
      const btnText = btn.querySelector('.btn-text');
      if(btnText) btnText.textContent = 'Opening email client...';
    }

    const to = document.getElementById('emailVal')?.textContent?.trim() || 'orynge.ph@gmail.com';
    const subject = encodeURIComponent(`Portfolio inquiry — ${reason} (${name})`);
    const body = encodeURIComponent(`From: ${name} (${email})\nReason: ${reason}\nTimeline: ${timeline}\n\n${msg}`);
    
    try {
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      if(status) status.textContent = 'Draft opened in your email app — please send from there.';
      status.style.color = 'var(--orange-bright)';
    } catch(err) {
      if(status) status.textContent = 'Failed to open email client. Please copy the email manually.';
      status.style.color = 'var(--ember)';
      console.error('Mailto error:', err);
    }

    if(btn){
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('loading');
        const btnText = btn.querySelector('.btn-text');
        if(btnText) btnText.textContent = 'Open in Email App';
      }, 2200);
    }
  });

  const inputs = contactForm.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    // Skip honeypot field
    if(input.name === 'website') return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearError(input));
  });
}

function validateField(field){
  if(field.hasAttribute('required') && !field.value.trim()){
    showFieldError(field, 'This field is required');
    return false;
  }
  if(field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)){
    showFieldError(field, 'Please enter a valid email address');
    return false;
  }
  clearError(field);
  return true;
}

function showFieldError(field, message){
  clearError(field);
  field.setAttribute('aria-invalid', 'true');
  const error = document.createElement('span');
  error.className = 'field-error';
  error.textContent = message;
  field.parentNode.appendChild(error);
}

function clearError(field){
  field.removeAttribute('aria-invalid');
  field.style.borderColor = '';
  const error = field.parentNode.querySelector('.field-error');
  if(error) error.remove();
}

/* ============ WELCOME & UTILITIES ============ */

// Copy email to clipboard
window.copyEmail = function(){
  const email = document.getElementById('emailVal')?.textContent?.trim();
  if(!email) return;

  const copyText = async () => {
    try {
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(email);
      } else {
        const temp = document.createElement('textarea');
        temp.value = email;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.top = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      showCopyToast('Email copied to clipboard!');
    } catch (error) {
      console.warn('Clipboard copy failed:', error);
      showCopyToast('Failed to copy');
    }
  };

  copyText();
};

function showCopyToast(msg){
  const toast = document.getElementById('copyToast');
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Scroll progress indicator
const scrollProgress = document.getElementById('scrollProgress');
if(scrollProgress){
  let ticking = false;
  window.addEventListener('scroll', () => {
    if(!ticking){
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTop / docHeight;
        const boundedProgress = Math.min(1, Math.max(0, progress));
        scrollProgress.style.transform = `scaleX(${boundedProgress})`;
        scrollProgress.setAttribute('aria-valuenow', Math.round(boundedProgress * 100));
        ticking = false;
      });
    }
  }, {passive: true});
}

// Pointer-driven depth effects stay off touch devices and reduced-motion preferences.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if(finePointer && !prefersReducedMotion){
  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('mousemove', event => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });

  let targetParallaxX = 0;
  let targetParallaxY = 0;
  let currentParallaxX = 0;
  let currentParallaxY = 0;
  let parallaxFrame = 0;

  const animateParallax = () => {
    currentParallaxX += (targetParallaxX - currentParallaxX) * 0.12;
    currentParallaxY += (targetParallaxY - currentParallaxY) * 0.12;
    document.querySelectorAll('.hero').forEach(hero => {
      if(hero.closest('.page.active')){
        hero.style.transform = `translate3d(${currentParallaxX}px, ${currentParallaxY}px, 0)`;
      }
    });
    if(Math.abs(targetParallaxX - currentParallaxX) > 0.01 || Math.abs(targetParallaxY - currentParallaxY) > 0.01){
      parallaxFrame = requestAnimationFrame(animateParallax);
    } else {
      parallaxFrame = 0;
    }
  };

  window.addEventListener('mousemove', event => {
    targetParallaxX = (event.clientX / window.innerWidth - 0.5) * 2.4;
    targetParallaxY = (event.clientY / window.innerHeight - 0.5) * 2.4;
    if(!parallaxFrame) parallaxFrame = requestAnimationFrame(animateParallax);
  });

  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Konami code easter egg
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiIndex = 0;
window.addEventListener('keydown', e => {
  if(e.code === konami[konamiIndex]){
    konamiIndex++;
    if(konamiIndex === konami.length){
      triggerEasterEgg();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});
function triggerEasterEgg(){
  const egg = document.getElementById('easterEgg');
  if(!egg || prefersReducedMotion) return;
  egg.textContent = 'KONAMI CODE ACTIVATED — Developer Mode Unlocked!';
  egg.classList.add('show');
  for(let i=0;i<30;i++) createConfetti();
  setTimeout(() => egg.classList.remove('show'), 4000);
}

// Confetti particles
function createConfetti(){
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; width:10px; height:10px; border-radius:50%;
    background:${getComputedStyle(document.documentElement).getPropertyValue('--orange').trim()};
    left:${Math.random()*window.innerWidth}px; top:-20px;
    pointer-events:none; z-index:9999;
    animation:fall ${2+Math.random()*2}s linear forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
const style = document.createElement('style');
style.textContent = `@keyframes fall{to{transform:translateY(${window.innerHeight+100}px) rotate(${Math.random()*720}deg);opacity:0;}}`;
document.head.appendChild(style);

// Interactive stat counter animation
function animateStats(){
  const animationToken = ++statsAnimationToken;
  document.querySelectorAll('.stat b[data-target], .impact-stat b[data-target]').forEach(stat => {
    const target = parseInt(stat.dataset.target);
    if(isNaN(target)) return;
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const suffix = stat.dataset.suffix || '';
    const isCompact = stat.dataset.compact === 'true';
    const formatStat = value => {
      if(isCompact || target >= 1000) return (value / 1000).toFixed(1).replace('.0','') + 'K' + suffix;
      return Math.floor(value) + suffix;
    };
    function count(){
      if(animationToken !== statsAnimationToken) return;
      current += step;
      if(current < target){
        stat.textContent = formatStat(current);
        requestAnimationFrame(count);
      } else {
        stat.textContent = formatStat(target);
      }
    }
    count();
  });
}

// Trigger stat animation when home page becomes active
window.addEventListener('pageChanged', e => {
  statsAnimationToken++;
  if(e.detail === 'home' || e.detail === 'portfolio'){
    setTimeout(animateStats, 300);
  }
});

// Initialize stats on load if home is active
if(document.body.dataset.page === 'home'){
  setTimeout(animateStats, 500);
}

// Smooth reveal on scroll for sections
if(!prefersReducedMotion){
  const observerOptions = {threshold: 0.1, rootMargin: '0px 0px -50px 0px'};
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.svc-card, .info-card, .skill-group, .impact-stat, .portfolio-work-strip figure, .certificate-frame, .profile-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 260ms var(--ease-out), transform 260ms var(--ease-out)';
    revealObserver.observe(el);
  });

  window.addEventListener('pageChanged', event => {
    const page = document.getElementById(event.detail);
    page?.querySelectorAll('.svc-card, .info-card, .skill-group, .impact-stat, .portfolio-work-strip figure, .certificate-frame, .profile-card').forEach(el => {
      revealObserver.unobserve(el);
      const bounds = el.getBoundingClientRect();
      if(bounds.top < window.innerHeight && bounds.bottom > 0){
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
      revealObserver.observe(el);
    });
  });
}

document.querySelectorAll('.btn-primary, .btn-ghost, .hire-btn, .send-btn').forEach(btn => {
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.addEventListener('click', event => createRipple(btn, event));
});

document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('click', event => createRipple(card, event));
});

function createRipple(element, event){
  const bounds = element.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = `${event.clientX - bounds.left}px`;
  ripple.style.top = `${event.clientY - bounds.top}px`;
  element.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), {once:true});
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

function applyTheme(theme){
  if(!theme || !['light','dark'].includes(theme)) return;
  document.documentElement.setAttribute('data-theme', theme);

  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Theme preference could not be saved:', error);
  }
}

function getPreferredTheme(){
  try {
    const saved = localStorage.getItem('theme');
    if(saved && ['light','dark'].includes(saved)) return saved;
  } catch (error) {
    console.warn('Theme preference could not be read:', error);
  }

  return 'light';
}

applyTheme(getPreferredTheme());

const lightScheme = window.matchMedia('(prefers-color-scheme: light)');
if(typeof lightScheme.addEventListener === 'function'){
  lightScheme.addEventListener('change', e => {
    try {
      if(!localStorage.getItem('theme')){
        applyTheme(e.matches ? 'light' : 'dark');
      }
    } catch (error) {
      console.warn('System theme sync failed:', error);
    }
  });
} else if(typeof lightScheme.addListener === 'function'){
  lightScheme.addListener(e => {
    try {
      if(!localStorage.getItem('theme')){
        applyTheme(e.matches ? 'light' : 'dark');
      }
    } catch (error) {
      console.warn('System theme sync failed:', error);
    }
  });
}

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}
if(themeToggle){
  themeToggle.addEventListener('click', toggleTheme);
}
if(mobileThemeToggle){
  mobileThemeToggle.addEventListener('click', toggleTheme);
}

// Keyboard navigation for mobile menu
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && mobileMenu?.classList.contains('open')){
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn?.focus();
    burgerBtn?.setAttribute('aria-expanded', 'false');
    burgerBtn?.setAttribute('aria-label', 'Open menu');
  }
});

// Focus management for page transitions
window.addEventListener('pageChanged', () => {
  const main = document.querySelector('main');
  if(main) main.focus();
});

// Preload critical resources
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* ============ PORTFOLIO DATA ============ */
const portfolioWorks = [
  { src:'image/4.jpg',  title:'ORYNGE logo', cat:'BRAND IDENTITY', alt:'Orange ORYNGE logo mark on a pale background', desc:'A single orange ORYNGE letterform on a pale field, kept as plain as the brand it stands for.' },
  { src:'image/12.jpg', title:'Panagiabong 2026 event mark', cat:'EVENT DESIGN', alt:'Colorful Panagiabong 2026 event mark with the line Connected by Cause, Powered by Purpose', desc:'An event mark built around the line "Connected by Cause, Powered by Purpose."' },
  { src:'image/11.jpg', title:'Creative portfolio cover', cat:'EDITORIAL', alt:'Black-and-white Creative Portfolio cover for Art Block', desc:'A black-and-white cover design that opens the Art Block creative portfolio.' },
  { src:'image/10.jpg', title:'American Cuisine infographic', cat:'ILLUSTRATION', alt:'Illustrated American Cuisine infographic about hamburgers', desc:'An illustrated infographic that explains American Cuisine through hamburgers.' },
  { src:'image/8.jpg',  title:'Face painting poster', cat:'EVENT DESIGN', alt:'Face painting event poster featuring two children', desc:'An event poster for a face-painting activity, built around a photo of two children.' },
  { src:'image/7.jpg',  title:'Fall of Luminance', cat:'ARTWORK', alt:'Framed painting titled Fall of Luminance by Princess Anasyl Pama', desc:'A framed painting titled Fall of Luminance by Princess Anasyl Pama.' },
  { src:'image/5.jpg',  title:'Meet the artist', cat:'EDITORIAL', alt:'Meet the Artist portfolio page featuring Princess Anasyl Pama', desc:'A "Meet the Artist" page that introduces Princess Anasyl Pama and her work.' },
  { src:'image/3.jpg',  title:'Public painting poster', cat:'EVENT DESIGN', alt:'Public painting event poster with a group photo', desc:'A poster for a public painting event, built around a group photo.' },
  { src:'image/2.jpg',  title:'Conqueror graphic', cat:'SOCIAL GRAPHIC', alt:'Red Conqueror graphic with a lion illustration and the line Conquering the race through Christ alone', desc:'A red graphic with a lion and the line "Conquering the race through Christ alone."' }
];

const portfolioVideos = [
  { src:'image/17.mp4', title:'GenSan Night Market', kicker:'CITY EDIT', feature:true, duration:'3:37', alt:'17 portfolio video', desc:'One of the edits in the ORYNGE video library — full creative storytelling and pacing.' },
  { src:'image/15.mp4', title:'Orynge Edit', kicker:'SOCIAL REEL', feature:false, duration:'0:24', alt:'Short-form video edit 01', desc:'A high-retention short-form edit built for TikTok and Instagram Reels engagement.' },
  { src:'image/16.mp4', title:'Scenery Edit', kicker:'CREATIVE CUT', feature:false, duration:'0:21', alt:'Short-form video edit 02', desc:'Dynamic pacing, rhythm-matched cuts, and punchy visual hooks from the ORYNGE content library.' }
];

const pad2 = value => String(value).padStart(2,'0');

/* ============ FULL-SIZE VIEWER WITH DESCRIPTION ============ */
const mediaViewer = document.getElementById('mediaViewer');
const mediaViewerStage = document.getElementById('mediaViewerStage');
const mediaViewerTitle = document.getElementById('mediaViewerTitle');
const mediaViewerKicker = document.getElementById('mediaViewerKicker');
const mediaViewerDesc = document.getElementById('mediaViewerDesc');
const mediaViewerCount = document.getElementById('mediaViewerCount');
let mediaViewerIndex = 0;

function showMediaViewerSlide(index){
  if(!mediaViewer || !mediaViewerStage || !mediaViewerTitle || !mediaViewerCount) return;
  const total = portfolioWorks.length;
  if(!total) return;
  mediaViewerIndex = (index + total) % total;
  const work = portfolioWorks[mediaViewerIndex];

  mediaViewer.querySelector('.media-viewer-download')?.remove();
  mediaViewerStage.replaceChildren();
  mediaViewerTitle.textContent = work.title;
  if(mediaViewerKicker) mediaViewerKicker.textContent = work.cat;
  if(mediaViewerDesc) mediaViewerDesc.textContent = work.desc;
  mediaViewerCount.textContent = `${pad2(mediaViewerIndex + 1)} / ${pad2(total)}`;

  const image = document.createElement('img');
  image.src = work.src;
  image.alt = work.alt;
  image.decoding = 'async';
  mediaViewerStage.append(image);
}

function openMediaViewer(index){
  if(!mediaViewer) return;
  if(!mediaViewer.open) mediaViewer.showModal();
  showMediaViewerSlide(index);
}

document.getElementById('mediaViewerClose')?.addEventListener('click',() => mediaViewer?.close());
document.getElementById('mediaViewerPrevious')?.addEventListener('click',() => showMediaViewerSlide(mediaViewerIndex - 1));
document.getElementById('mediaViewerNext')?.addEventListener('click',() => showMediaViewerSlide(mediaViewerIndex + 1));
mediaViewer?.addEventListener('click',event => { if(event.target === mediaViewer) mediaViewer.close(); });
mediaViewer?.addEventListener('keydown',event => {
  if(event.key === 'ArrowLeft'){ event.preventDefault(); showMediaViewerSlide(mediaViewerIndex - 1); }
  else if(event.key === 'ArrowRight'){ event.preventDefault(); showMediaViewerSlide(mediaViewerIndex + 1); }
});

/* ============ 3D COVERFLOW OF ALL WORKS ============ */
const carousel3D = document.getElementById('portfolio3DCarousel');
const carousel3DViewport = document.getElementById('carousel3DViewport');
const carousel3DTrack = document.getElementById('carousel3DTrack');
const carousel3DPagination = document.getElementById('carousel3DPagination');
const carousel3DTitle = document.getElementById('carousel3DTitle');
const carousel3DCount = document.getElementById('carousel3DCount');
const carousel3DPrev = document.getElementById('carousel3DPrev');
const carousel3DNext = document.getElementById('carousel3DNext');

if(carousel3D && carousel3DViewport && carousel3DTrack && portfolioWorks.length){
  const cards3D = [];
  const dots3D = [];
  const total = portfolioWorks.length;
  let active3D = 0;
  let autoplay3D = 0;
  let drag3D = null;
  let suppressClick3D = false;

  portfolioWorks.forEach((work, index) => {
    const card = document.createElement('figure');
    card.className = 'carousel-3d__card';
    card.dataset.index = index;
    card.dataset.offset = 'hidden';
    card.setAttribute('role','group');
    card.setAttribute('aria-roledescription','slide');
    card.setAttribute('aria-label',`Slide ${index + 1} of ${total}: ${work.title}`);

    const media = document.createElement('div');
    media.className = 'carousel-3d__media';
    const image = document.createElement('img');
    image.src = work.src;
    image.alt = work.alt;
    image.loading = index < 3 ? 'eager' : 'lazy';
    image.decoding = 'async';
    media.append(image);

    const indexTag = document.createElement('span');
    indexTag.className = 'carousel-3d__index';
    indexTag.textContent = pad2(index + 1);

    card.append(media, indexTag);
    carousel3DTrack.append(card);
    cards3D.push(card);
  });

  if(carousel3DPagination){
    portfolioWorks.forEach((work, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-3d__dot';
      dot.setAttribute('aria-label',`Go to slide ${index + 1}: ${work.title}`);
      dot.addEventListener('click', () => goTo3D(index));
      carousel3DPagination.append(dot);
      dots3D.push(dot);
    });
  }

  function render3D(){
    cards3D.forEach((card, index) => {
      let offset = (index - active3D + total) % total;
      if(offset > total / 2) offset -= total;
      const isActive = offset === 0;
      card.dataset.offset = Math.abs(offset) > 2 ? 'hidden' : String(offset);
      card.tabIndex = isActive ? 0 : -1;
    });

    dots3D.forEach((dot, index) => {
      const isActive = index === active3D;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    const work = portfolioWorks[active3D];
    if(carousel3DTitle) carousel3DTitle.textContent = work.title;
    if(carousel3DCount) carousel3DCount.textContent = `${pad2(active3D + 1)} / ${pad2(total)}`;
    carousel3D.setAttribute('aria-label',`3D portfolio carousel, slide ${active3D + 1} of ${total}: ${work.title}`);
  }

  function scheduleAutoplay3D(){
    window.clearTimeout(autoplay3D);
    if(prefersReducedMotion || document.hidden) return;
    if(document.body.dataset.page && document.body.dataset.page !== 'portfolio') return;
    if(mediaViewer?.open) return;
    if(carousel3D.matches(':hover') || carousel3D.contains(document.activeElement)) return;
    autoplay3D = window.setTimeout(() => goTo3D(active3D + 1), 5200);
  }

  function goTo3D(index){
    active3D = (index + total) % total;
    render3D();
    scheduleAutoplay3D();
  }

  cards3D.forEach((card, index) => {
    card.addEventListener('click', () => {
      if(suppressClick3D) return;
      if(index === active3D) openMediaViewer(index);
      else goTo3D(index);
    });
    card.addEventListener('keydown', event => {
      if(event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if(index === active3D) openMediaViewer(index);
      else goTo3D(index);
    });
  });

  carousel3DPrev?.addEventListener('click', () => goTo3D(active3D - 1));
  carousel3DNext?.addEventListener('click', () => goTo3D(active3D + 1));

  carousel3D.addEventListener('keydown', event => {
    if(event.key === 'ArrowLeft'){ event.preventDefault(); goTo3D(active3D - 1); }
    else if(event.key === 'ArrowRight'){ event.preventDefault(); goTo3D(active3D + 1); }
    else if(event.key === 'Home'){ event.preventDefault(); goTo3D(0); }
    else if(event.key === 'End'){ event.preventDefault(); goTo3D(total - 1); }
  });

  function endDrag3D(){
    window.removeEventListener('pointermove', onDragMove3D);
    window.removeEventListener('pointerup', onDragEnd3D);
    window.removeEventListener('pointercancel', onDragEnd3D);
    carousel3DViewport.classList.remove('is-dragging');
    carousel3DTrack.style.transform = '';
    if(drag3D && Math.abs(drag3D.moved) > 8){
      suppressClick3D = true;
      window.setTimeout(() => { suppressClick3D = false; }, 60);
    }
    drag3D = null;
  }

  function onDragMove3D(event){
    if(!drag3D) return;
    const deltaX = event.clientX - drag3D.x;
    const deltaY = event.clientY - drag3D.y;
    drag3D.moved = deltaX;
    if(Math.abs(deltaY) > Math.abs(deltaX) * 1.6){
      carousel3DTrack.style.transform = '';
      return;
    }
    carousel3DTrack.style.transform = `translate3d(${deltaX * 0.22}px,0,0)`;
  }

  function onDragEnd3D(event){
    if(!drag3D) return;
    const deltaX = event.clientX - drag3D.x;
    const deltaY = event.clientY - drag3D.y;
    endDrag3D();
    if(Math.abs(deltaX) > 46 && Math.abs(deltaY) < 80){
      goTo3D(active3D + (deltaX < 0 ? 1 : -1));
    } else {
      scheduleAutoplay3D();
    }
  }

  carousel3DViewport.addEventListener('pointerdown', event => {
    if(event.button !== 0) return;
    if(event.target.closest('video,button,a')) return;
    drag3D = { x:event.clientX, y:event.clientY, moved:0 };
    window.clearTimeout(autoplay3D);
    carousel3DViewport.classList.add('is-dragging');
    window.addEventListener('pointermove', onDragMove3D);
    window.addEventListener('pointerup', onDragEnd3D);
    window.addEventListener('pointercancel', onDragEnd3D);
  });

  carousel3D.addEventListener('mouseenter', () => window.clearTimeout(autoplay3D));
  carousel3D.addEventListener('mouseleave', scheduleAutoplay3D);
  carousel3D.addEventListener('focusin', () => window.clearTimeout(autoplay3D));
  carousel3D.addEventListener('focusout', () => window.setTimeout(scheduleAutoplay3D, 0));
  document.addEventListener('visibilitychange', scheduleAutoplay3D);
  mediaViewer?.addEventListener('close', () => { window.clearTimeout(autoplay3D); scheduleAutoplay3D(); });

  window.addEventListener('pageChanged', event => {
    if(event.detail !== 'portfolio'){ window.clearTimeout(autoplay3D); return; }
    render3D();
    scheduleAutoplay3D();
  });

  render3D();
  scheduleAutoplay3D();
}

/* ============ 3D INTERACTIVE VIDEO CAROUSEL (ONE LINE REEL) ============ */
const video3DCarousel = document.getElementById('video3DCarousel');
const video3DViewport = document.getElementById('video3DViewport');
const video3DTrack = document.getElementById('video3DTrack');
const video3DPagination = document.getElementById('video3DPagination');
const video3DTitle = document.getElementById('video3DTitle');
const video3DKicker = document.getElementById('video3DKicker');
const video3DCount = document.getElementById('video3DCount');
const video3DPrev = document.getElementById('video3DPrev');
const video3DNext = document.getElementById('video3DNext');

if(video3DCarousel && video3DViewport && video3DTrack && portfolioVideos.length){
  const videoCards3D = [];
  const videoDots3D = [];
  const totalVideos = portfolioVideos.length;
  let activeVideo3D = 0;
  let dragVideo3D = null;
  let suppressVideoClick = false;

  portfolioVideos.forEach((item, index) => {
    const card = document.createElement('figure');
    card.className = 'video-carousel-3d__card';
    card.dataset.index = index;
    card.dataset.offset = 'hidden';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `Video slide ${index + 1} of ${totalVideos}: ${item.title}`);

    const frame = document.createElement('div');
    frame.className = 'video-card__frame';

    const video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'none';
    video.src = item.src;
    video.setAttribute('aria-label', item.alt);

    const badge = document.createElement('span');
    badge.className = 'video-card__badge';
    badge.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    badge.append(item.duration);

    const indexTag = document.createElement('span');
    indexTag.className = 'video-card__index';
    indexTag.textContent = pad2(index + 1);

    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'video-card__play';
    play.setAttribute('aria-label', 'Play ' + item.title);
    play.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';

    const togglePlayback = () => {
      // Pause any other playing video on the page
      document.querySelectorAll('video').forEach(other => {
        if(other !== video && !other.paused){
          other.pause();
          other.closest('.video-carousel-3d__card')?.classList.remove('is-playing');
        }
      });

      if(video.paused){
        video.controls = true;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    play.addEventListener('click', e => {
      e.stopPropagation();
      togglePlayback();
    });

    video.addEventListener('click', e => {
      if(!video.controls){
        e.stopPropagation();
        togglePlayback();
      }
    });

    video.addEventListener('playing', () => card.classList.add('is-playing'));
    video.addEventListener('pause', () => card.classList.remove('is-playing'));
    video.addEventListener('ended', () => {
      card.classList.remove('is-playing');
      video.controls = false;
    });

    frame.append(video, badge, indexTag, play);

    const body = document.createElement('figcaption');
    body.className = 'video-card__body';
    const copy = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = item.title;
    const desc = document.createElement('p');
    desc.textContent = item.desc;
    copy.append(heading, desc);

    const fallback = document.createElement('a');
    fallback.className = 'video-card__fallback';
    fallback.href = item.src;
    fallback.download = item.src.split('/').pop();
    fallback.textContent = 'Download video';

    body.append(copy, fallback);
    card.append(frame, body);
    video.addEventListener('error', () => card.classList.add('is-unsupported'), { once: true });

    video3DTrack.append(card);
    videoCards3D.push(card);
  });

  if(video3DPagination){
    portfolioVideos.forEach((item, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-3d__dot';
      dot.setAttribute('aria-label', `Go to video slide ${index + 1}: ${item.title}`);
      dot.addEventListener('click', () => goToVideo3D(index));
      video3DPagination.append(dot);
      videoDots3D.push(dot);
    });
  }

  function pauseAllVideos(){
    videoCards3D.forEach(card => {
      const vid = card.querySelector('video');
      if(vid && !vid.paused){
        vid.pause();
        vid.controls = false;
        card.classList.remove('is-playing');
      }
    });
  }

  function renderVideo3D(){
    videoCards3D.forEach((card, index) => {
      let offset = (index - activeVideo3D + totalVideos) % totalVideos;
      if(offset > totalVideos / 2) offset -= totalVideos;
      const isActive = offset === 0;
      card.dataset.offset = Math.abs(offset) > 1 ? (offset < 0 ? '-1' : '1') : String(offset);
      card.tabIndex = isActive ? 0 : -1;
    });

    videoDots3D.forEach((dot, index) => {
      const isActive = index === activeVideo3D;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    const activeItem = portfolioVideos[activeVideo3D];
    if(video3DTitle) video3DTitle.textContent = activeItem.title;
    if(video3DKicker) video3DKicker.textContent = activeItem.kicker || 'VIDEO WORK';
    if(video3DCount) video3DCount.textContent = `${pad2(activeVideo3D + 1)} / ${pad2(totalVideos)}`;
    video3DCarousel.setAttribute('aria-label', `3D video carousel, slide ${activeVideo3D + 1} of ${totalVideos}: ${activeItem.title}`);
  }

  function goToVideo3D(index){
    const target = (index + totalVideos) % totalVideos;
    if(target !== activeVideo3D){
      pauseAllVideos();
      activeVideo3D = target;
      renderVideo3D();
    }
  }

  videoCards3D.forEach((card, index) => {
    card.addEventListener('click', () => {
      if(suppressVideoClick) return;
      if(index !== activeVideo3D){
        goToVideo3D(index);
      }
    });

    card.addEventListener('keydown', event => {
      if(event.key === 'Enter' || event.key === ' '){
        if(index !== activeVideo3D){
          event.preventDefault();
          goToVideo3D(index);
        }
      }
    });
  });

  video3DPrev?.addEventListener('click', () => goToVideo3D(activeVideo3D - 1));
  video3DNext?.addEventListener('click', () => goToVideo3D(activeVideo3D + 1));

  video3DCarousel.addEventListener('keydown', event => {
    if(event.key === 'ArrowLeft'){ event.preventDefault(); goToVideo3D(activeVideo3D - 1); }
    else if(event.key === 'ArrowRight'){ event.preventDefault(); goToVideo3D(activeVideo3D + 1); }
    else if(event.key === 'Home'){ event.preventDefault(); goToVideo3D(0); }
    else if(event.key === 'End'){ event.preventDefault(); goToVideo3D(totalVideos - 1); }
  });

  // Touch and Pointer Drag Support
  function endVideoDrag(){
    window.removeEventListener('pointermove', onVideoDragMove);
    window.removeEventListener('pointerup', onVideoDragEnd);
    window.removeEventListener('pointercancel', onVideoDragEnd);
    video3DViewport.classList.remove('is-dragging');
    video3DTrack.style.transform = '';
    if(dragVideo3D && Math.abs(dragVideo3D.moved) > 8){
      suppressVideoClick = true;
      window.setTimeout(() => { suppressVideoClick = false; }, 60);
    }
    dragVideo3D = null;
  }

  function onVideoDragMove(event){
    if(!dragVideo3D) return;
    const deltaX = event.clientX - dragVideo3D.x;
    const deltaY = event.clientY - dragVideo3D.y;
    dragVideo3D.moved = deltaX;
    if(Math.abs(deltaY) > Math.abs(deltaX) * 1.6){
      video3DTrack.style.transform = '';
      return;
    }
    video3DTrack.style.transform = `translate3d(${deltaX * 0.22}px,0,0)`;
  }

  function onVideoDragEnd(event){
    if(!dragVideo3D) return;
    const deltaX = event.clientX - dragVideo3D.x;
    const deltaY = event.clientY - dragVideo3D.y;
    endVideoDrag();
    if(Math.abs(deltaX) > 42 && Math.abs(deltaY) < 80){
      goToVideo3D(activeVideo3D + (deltaX < 0 ? 1 : -1));
    }
  }

  video3DViewport.addEventListener('pointerdown', event => {
    if(event.button !== 0) return;
    if(event.target.closest('video,button,a')) return;
    dragVideo3D = { x: event.clientX, y: event.clientY, moved: 0 };
    video3DViewport.classList.add('is-dragging');
    window.addEventListener('pointermove', onVideoDragMove);
    window.addEventListener('pointerup', onVideoDragEnd);
    window.addEventListener('pointercancel', onVideoDragEnd);
  });

  window.addEventListener('pageChanged', event => {
    if(event.detail !== 'portfolio'){
      pauseAllVideos();
      return;
    }
    renderVideo3D();
  });

  renderVideo3D();
}

/* ============ PHONE FEED DEMO SCROLL ============ */
const phoneFeed = document.getElementById('phoneFeed');

if(phoneFeed && !prefersReducedMotion){
  const FEED_SPEED = 40;
  const FEED_HOLD = 1500;
  const FEED_STEP_MS = 32;
  let timerId = 0;
  let direction = 1;
  let holdUntil = 0;
  let lastTs = 0;
  let userTook = false;
  let inView = false;

  const feedMax = () => Math.max(0, phoneFeed.scrollHeight - phoneFeed.clientHeight);

  function feedTick(){
    const now = performance.now();
    if(!lastTs) lastTs = now;
    const dt = Math.min(0.05,(now - lastTs) / 1000);
    lastTs = now;
    if(!inView || userTook) return;
    const max = feedMax();
    if(max <= 6 || now < holdUntil) return;

    if(direction > 0 && phoneFeed.scrollTop >= max - 0.5){
      phoneFeed.scrollTop = max;
      direction = -1;
      holdUntil = now + FEED_HOLD;
      return;
    }
    if(direction < 0 && phoneFeed.scrollTop <= 0.5){
      phoneFeed.scrollTop = 0;
      direction = 1;
      holdUntil = now + FEED_HOLD;
      return;
    }
    phoneFeed.scrollTop += FEED_SPEED * dt * direction;
  }

  function feedStart(){
    if(!timerId && inView && !userTook){
      lastTs = 0;
      timerId = window.setInterval(feedTick, FEED_STEP_MS);
    }
  }
  function feedStop(){ if(timerId){ window.clearInterval(timerId); timerId = 0; } }

  ['wheel','touchstart','pointerdown','keydown'].forEach(evt => {
    phoneFeed.addEventListener(evt, () => { userTook = true; feedStop(); }, { once:true, passive:true });
  });
  phoneFeed.addEventListener('mouseenter', feedStop);
  phoneFeed.addEventListener('mouseleave', feedStart);
  phoneFeed.addEventListener('focusin', feedStop);
  phoneFeed.addEventListener('focusout', feedStart);

  if('IntersectionObserver' in window){
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        inView = entry.isIntersecting;
        if(inView) feedStart(); else feedStop();
      });
    },{ threshold:0.35 }).observe(phoneFeed);
  } else {
    inView = true;
    feedStart();
  }

  document.addEventListener('visibilitychange', () => { if(document.hidden) feedStop(); else feedStart(); });
  window.addEventListener('pageChanged', event => {
    if(event.detail === 'portfolio'){ inView = true; feedStart(); }
    else { inView = false; feedStop(); }
  });

  if(document.body.dataset.page === 'portfolio'){ inView = true; feedStart(); }
}
