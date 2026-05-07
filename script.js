document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Custom Slide to Unlock Logic
       ========================================================================== */
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');
    const track = document.getElementById('slider-track');
    
    let isDragging = false;
    let startX = 0;
    let isUnlocked = false;

    function handleStart(e) {
        if (isUnlocked) return;
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        thumb.style.transition = 'none';
        fill.style.transition = 'none';
    }

    function handleMove(e) {
        if (!isDragging || isUnlocked) return;
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        
        // Since we want Left-to-Right sliding:
        // RTL direction implies coordinates might be reversed visually if the whole page is RTL,
        // but clientX is absolute from the left of the screen.
        let diffX = currentX - startX;
        
        // Boundaries
        const trackWidth = track.offsetWidth;
        const maxMove = trackWidth - thumb.offsetWidth - 8; // padding

        if (diffX < 0) diffX = 0;
        if (diffX > maxMove) diffX = maxMove;

        thumb.style.left = `calc(4px + ${diffX}px)`;
        fill.style.width = `calc(52px + ${diffX}px)`; // thumb width + diff

        if (diffX >= maxMove * 0.95) {
            unlockAction();
        }
    }

    function handleEnd() {
        if (!isDragging || isUnlocked) return;
        isDragging = false;
        // Snap back if not unlocked
        thumb.style.transition = 'left 0.3s ease';
        fill.style.transition = 'width 0.3s ease';
        thumb.style.left = '4px';
        fill.style.width = '0%';
    }

    thumb.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    thumb.addEventListener('touchstart', handleStart, {passive: true});
    document.addEventListener('touchmove', handleMove, {passive: true});
    document.addEventListener('touchend', handleEnd);

    function unlockAction() {
        isUnlocked = true;
        // 1. Remove lock state
        document.body.classList.remove('locked-state');
        // 2. Show main content
        const mainContent = document.getElementById('main-content');
        mainContent.classList.remove('hidden-until-unlock');
        
        // 3. Scroll to Section 1 which will trigger the IntersectionObserver to shrink the phone
        setTimeout(() => {
            document.getElementById('section1').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    /* ==========================================================================
       2. Sticky Phone & Scroll Observer Logic
       ========================================================================== */
    const stickyContainer = document.getElementById('sticky-phone-container');
    const sections = document.querySelectorAll('.scroll-section');
    const phoneScreens = document.querySelectorAll('.phone-screen');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetScreenId = entry.target.getAttribute('data-screen');
                const isHero = entry.target.id === 'hero';

                // Handle Phone Position (Center vs Side)
                // If it's unlocked and we scroll back up to hero, it stays side? 
                // Wait, if we are unlocked, Hero section is empty anyway.
                // Let's make it so if hero is visible, it scales back to hero-mode.
                if (isHero && !document.body.classList.contains('locked-state')) {
                    // Let's actually keep it in hero mode if we scroll all the way up
                    stickyContainer.classList.add('hero-mode');
                    stickyContainer.classList.remove('side-mode');
                } else if (!isHero) {
                    stickyContainer.classList.remove('hero-mode');
                    stickyContainer.classList.add('side-mode');
                }

                // Handle Screen Content inside the Phone
                phoneScreens.forEach(screen => {
                    if (screen.id === targetScreenId) {
                        screen.classList.add('active-screen');
                    } else {
                        screen.classList.remove('active-screen');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    /* ==========================================================================
       3. iPhone Live Clock & Countdown
       ========================================================================== */
    const timeElement = document.getElementById('iphone-time');
    const dateElement = document.getElementById('iphone-date');
    const countdownElement = document.getElementById('countdown-text');
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;

        const dayName = hebrewDays[now.getDay()];
        const day = now.getDate();
        const monthName = hebrewMonths[now.getMonth()];
        dateElement.textContent = `יום ${dayName}, ${day} ב${monthName}`;
    }

    function updateCountdown() {
        const now = new Date();
        const electionDate = new Date('2026-10-27T00:00:00');
        const diffTime = electionDate - now;
        if (diffTime <= 0) {
            countdownElement.textContent = "היום זה יום הבחירות! צאו להצביע!";
        } else {
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            countdownElement.textContent = `נשארו עוד ${diffDays} ימים עד לבחירות 2026.`;
        }
    }
    setInterval(updateClock, 60000);
    updateClock();
    updateCountdown();

    /* ==========================================================================
       4. Mandate Slider (Section 1)
       ========================================================================== */
    const friendsSlider = document.getElementById('friends-slider');
    const friendsCountText = document.getElementById('friends-count');
    const dynamicMainText = document.getElementById('dynamic-main-text');
    const dynamicBottomLine = document.getElementById('dynamic-bottom-line');
    const graphBar = document.getElementById('graph-bar');

    const mandateStates = [
        {
            count: "0",
            mainText: "הקול שלך הוא התחלה, אבל לבד קשה להזיז הרים.",
            bottomLine: "השורה התחתונה: בבחירות האחרונות, אלפי קולות הלכו לפח רק כי אנשים חשבו ש'הקול שלי לא משנה'. אל תיכנסו לסטטיסטיקה הזו.",
            graphHeight: "10%"
        },
        {
            count: "5",
            mainText: "מזל טוב, הרגע השפעתם על תקציב של כמה מיליונים למלגות סטודנטים.",
            bottomLine: "השורה התחתונה: 5 אנשים נשמע קצת, אבל זה מספיק כדי להזיז רשימות מקומיות או לייצר יתרון בפריימריז. כל קול נספר.",
            graphHeight: "35%"
        },
        {
            count: "20",
            mainText: "כאן זה כבר נהיה מעניין. כמות כזו של אנשים יכולה להכריע מי ייכנס לכנסת.",
            bottomLine: "השורה התחתונה: מפלגות נופלות על חודו של קול ועל אחוז החסימה. 20 אנשים שמצביעים ביחד זה כוח שאי אפשר להתעלם ממנו.",
            graphHeight: "70%"
        },
        {
            count: "100+",
            mainText: "בום. זה הכוח לשנות חוקים. ככה נראית דמוקרטיה שעובדת בשבילכם.",
            bottomLine: "השורה התחתונה: כשהדור שלנו מתאחד, הפוליטיקאים חייבים לעבוד בשבילנו. פשוט מאוד, המנדט אצלכם בידיים.",
            graphHeight: "100%"
        }
    ];

    friendsSlider.addEventListener('input', (e) => {
        const stateIndex = parseInt(e.target.value);
        const state = mandateStates[stateIndex];

        friendsCountText.textContent = state.count;
        dynamicMainText.textContent = state.mainText;
        dynamicBottomLine.innerHTML = `<strong>השורה התחתונה:</strong> ${state.bottomLine.replace('השורה התחתונה: ', '')}`;
        graphBar.style.height = state.graphHeight;
    });


    /* ==========================================================================
       5. WhatsApp Myths (Section 2)
       ========================================================================== */
    const chatBubbles = document.querySelectorAll('.chat-bubble.actionable');
    const mythExpTitle = document.getElementById('myth-exp-title');
    const mythExpReality = document.getElementById('myth-exp-reality');
    const mythExpAction = document.getElementById('myth-exp-action');
    const mythExplanationBox = document.getElementById('myth-explanation');

    const mythsData = {
        myth1: {
            title: 'מיתוס: "פתק לבן זה אקט מחאתי חזק"',
            reality: 'המציאות: פתק לבן הוא פשוט פתק פסול. הוא לא נספר במניין הקולות הכשרים ולא משפיע על חלוקת המנדטים.',
            action: 'איך שוברים אותו: מסבירים שמי ששם פתק לבן בעצם נותן את הקול שלו למי שהוא הכי שונא.'
        },
        myth2: {
            title: 'מיתוס: "כולם אותו דבר, שום דבר לא ישתנה"',
            reality: 'המציאות: הפער בין קואליציה אחת לאחרת הוא ההבדל בין תחבורה ציבורית בשבת לבין סגר, או בין סיוע בשכר דירה להתעלמות מוחלטת.',
            action: 'איך שוברים אותו: מראים להם הצבעה אחת מהכנסת האחרונה שפגעה בהם ישירות.'
        },
        myth3: {
            title: 'מיתוס: "אין לי כוח לזה, זה יום חופש, אני בים."',
            reality: 'המציאות: בזמן שאתם בים, הקבוצות הכי מאורגנות במדינה עומדות בתור לקלפי ב-100% הצבעה. הן סופרות על זה שתהיו בים.',
            action: 'איך שוברים אותו: קובעים ללכת להצביע ביחד בבוקר, ואז נוסעים לים.'
        }
    };

    chatBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            const mythKey = bubble.getAttribute('data-myth');
            const data = mythsData[mythKey];
            
            chatBubbles.forEach(b => b.classList.remove('active'));
            bubble.classList.add('active');

            mythExpTitle.textContent = data.title;
            mythExpReality.textContent = data.reality;
            mythExpAction.textContent = data.action;
            
            // Animation reset
            mythExplanationBox.style.transition = 'none';
            mythExplanationBox.style.transform = 'translateY(10px)';
            mythExplanationBox.style.opacity = '0';
            
            // Trigger reflow
            void mythExplanationBox.offsetWidth;
            
            mythExplanationBox.style.transition = 'all 0.3s ease';
            mythExplanationBox.style.transform = 'translateY(0)';
            mythExplanationBox.style.opacity = '1';
        });
    });

    /* ==========================================================================
       6. Cards Popup (Section 3) - Instagram style
       ========================================================================== */
    const followBtns = document.querySelectorAll('.follow-btn');
    const conceptPopup = document.getElementById('concept-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupDesc = document.getElementById('popup-desc');
    const closePopupBtn = document.querySelector('.close-popup');

    const conceptsData = {
        mandate: { title: "מנדט", desc: "המושב בכנסת. יש 120 כאלה. כל מנדט שווה בערך 35,000-40,000 קולות (תלוי בשיעור ההצבעה)." },
        hasima: { title: "אחוז החסימה", desc: '"תנאי הסף". מפלגה שלא מקבלת לפחות 3.25% מכלל הקולות – נשארת בחוץ, וכל הקולות שלה נזרקים לפח.' },
        matza: { title: "מצע בחירות", desc: 'ה"סטורי" של המפלגה. מה הם מבטיחים לעשות אם יבחרו (ספוילר: כדאי לבדוק אם הם באמת עבדו בזה בעבר).' },
        odafim: { title: "הסכם עודפים", desc: '"טינדר של מפלגות". שתי מפלגות חותמות ביניהן ששאריות הקולות שלהן יתאחדו כדי לנסות להשיג עוד מנדט אחד נוסף למי שגדולה יותר.' },
        coalition: { title: "קואליציה vs אופוזיציה", desc: 'הקואליציה הם אלו ש"בממשלה" (הקבוצה ששולטת), והאופוזיציה הם אלו שמבקרים אותם ומנסים להחליף אותם.' }
    };

    followBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const conceptKey = btn.getAttribute('data-concept');
            const data = conceptsData[conceptKey];
            
            popupTitle.textContent = data.title;
            popupDesc.textContent = data.desc;
            conceptPopup.classList.add('show');
            
            // Visual toggle for follow button
            if(btn.textContent === 'עקוב') {
                btn.textContent = 'נעקב';
                btn.style.background = '#ccc';
                btn.style.color = '#333';
            }
        });
    });

    closePopupBtn.addEventListener('click', () => {
        conceptPopup.classList.remove('show');
    });

});
