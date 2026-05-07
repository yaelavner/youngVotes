document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. iPhone Live Clock
       ========================================================================== */
    const timeElement = document.getElementById('iphone-time');
    const dateElement = document.getElementById('iphone-date');

    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    function updateClock() {
        const now = new Date();
        
        // Time format HH:MM
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;

        // Date format: יום X, DD ב-Month
        const dayName = hebrewDays[now.getDay()];
        const day = now.getDate();
        const monthName = hebrewMonths[now.getMonth()];
        dateElement.textContent = `יום ${dayName}, ${day} ב${monthName}`;
    }

    // Update every minute
    setInterval(updateClock, 60000);
    updateClock(); // Initial call

    /* ==========================================================================
       2. Election Countdown
       ========================================================================== */
    const countdownElement = document.getElementById('countdown-text');
    const electionDate = new Date('2026-10-27T00:00:00');

    function updateCountdown() {
        const now = new Date();
        const diffTime = electionDate - now;

        if (diffTime <= 0) {
            countdownElement.textContent = "היום זה יום הבחירות! צאו להצביע!";
            return;
        }

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        countdownElement.textContent = `נשארו עוד ${diffDays} ימים עד לבחירות 2026.`;
    }

    updateCountdown();
    // Update daily
    setInterval(updateCountdown, 1000 * 60 * 60 * 24);

    /* ==========================================================================
       3. Slide to Unlock (Hero Section)
       ========================================================================== */
    const unlockSlider = document.getElementById('unlock-slider');
    const sliderThumb = document.getElementById('slider-thumb');
    let isUnlocked = false;

    // Support for RTL direction: input type="range" in RTL goes right-to-left usually.
    // However, our custom thumb needs visual updating.
    unlockSlider.addEventListener('input', (e) => {
        if (isUnlocked) return;
        const val = parseInt(e.target.value);
        
        // Move the visual thumb
        // Assuming slider is LTR inside for simplicity, but if RTL, left side means lower value in CSS.
        // We'll calculate percentage for the thumb left position.
        // The thumb width is 46px, track is 100%. We calculate center.
        const percentage = val;
        sliderThumb.style.left = `calc(${percentage}% - (${percentage * 0.46}px))`; // simple approximation for offset

        // If reached end
        if (val >= 95) {
            isUnlocked = true;
            // Scroll to next section
            document.getElementById('section1').scrollIntoView({ behavior: 'smooth' });
            
            // Reset after a short delay
            setTimeout(() => {
                unlockSlider.value = 0;
                sliderThumb.style.left = '2px';
                isUnlocked = false;
            }, 1000);
        }
    });

    /* ==========================================================================
       4. Mandate Slider (Section 1)
       ========================================================================== */
    const friendsSlider = document.getElementById('friends-slider');
    const friendsCountText = document.getElementById('friends-count');
    const mandateResultText = document.getElementById('mandate-result-text');
    const graphBar = document.getElementById('graph-bar');

    const mandateStates = [
        {
            count: "0",
            text: "הקול שלך הוא התחלה, אבל לבד קשה להזיז הרים.",
            graphHeight: "10%"
        },
        {
            count: "5",
            text: "מזל טוב, הרגע השפעתם על תקציב של כמה מיליונים למלגות סטודנטים.",
            graphHeight: "35%"
        },
        {
            count: "20",
            text: "כאן זה כבר נהיה מעניין. כמות כזו של אנשים יכולה להכריע מי ייכנס לכנסת ומי יישאר בחוץ בגלל אחוז החסימה.",
            graphHeight: "70%"
        },
        {
            count: "100+",
            text: "בום. זה הכוח לשנות חוקים. ככה נראית דמוקרטיה שעובדת בשבילכם.",
            graphHeight: "100%"
        }
    ];

    friendsSlider.addEventListener('input', (e) => {
        const stateIndex = parseInt(e.target.value);
        const state = mandateStates[stateIndex];

        friendsCountText.textContent = state.count;
        mandateResultText.textContent = state.text;
        graphBar.style.height = state.graphHeight;
    });

    /* ==========================================================================
       5. Accordion (Section 2 - Myths)
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                accItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                accItem.querySelector('.icon').textContent = '+';
                // Reset heights
                accItem.querySelector('.accordion-content').style.maxHeight = null;
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                header.querySelector('.icon').textContent = '−';
                // We set max-height large enough to hold content
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Initialize the first accordion item height
    const firstAccordionContent = document.querySelector('.accordion-item.active .accordion-content');
    if (firstAccordionContent) {
        firstAccordionContent.style.maxHeight = firstAccordionContent.scrollHeight + "px";
    }

    /* ==========================================================================
       6. Smooth Scroll for Buttons
       ========================================================================== */
    const navButtons = document.querySelectorAll('.next-section');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            if (targetId) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /* ==========================================================================
       7. Intersection Observer for Animations (Optional Polish)
       ========================================================================== */
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add base styles and observe
    document.querySelectorAll('.split-section .content-side, .split-section .device-side, .centered-device-section .iphone-frame').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        fadeObserver.observe(el);
    });
});
