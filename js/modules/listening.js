/**
 * Highly Controlled Listening Module - Dark Mode
 * Includes Guidelines, Response Selection, and Passage Comprehension with strict timers and rules.
 */

import { saveScore } from '../api/scores.js';

export async function startListening(container) {
    // ---------------------------------------------------------
    // 1. DATA BANKS
    // ---------------------------------------------------------
    const responseBank = [
        { audio: "The meeting is rescheduled to 3 PM tomorrow.", options: ["Cancel the meeting", "Attend at 3 PM tomorrow", "Wait for email", "Ignore it"], correct: 1 },
        { audio: "Please submit the quarterly report by Friday.", options: ["Submit on Thursday", "Submit by Friday", "Ask for extension", "Report is delayed"], correct: 1 },
        { audio: "The server will be down for maintenance at midnight.", options: ["Midnight maintenance", "Server is broken", "Morning maintenance", "No maintenance"], correct: 0 },
        { audio: "Your flight is delayed by two hours.", options: ["Flight cancelled", "2 hour delay", "On time", "Boarding now"], correct: 1 },
        { audio: "Don't forget to lock the main door before leaving.", options: ["Leave it open", "Lock main door", "Call security", "Wait inside"], correct: 1 },
        { audio: "The new client requires a dark mode design.", options: ["Light mode", "Dark mode", "Blue theme", "No preference"], correct: 1 },
        { audio: "Please forward the meeting minutes to all stakeholders by end of day.", options: ["Archive the document", "Forward to stakeholders", "Delete old files", "Schedule another meeting"], correct: 1 },
        { audio: "The budget for Q3 has been approved with a ten percent increase.", options: ["Budget rejected", "Budget same as last quarter", "Budget increased by ten percent", "Budget cut by ten percent"], correct: 2 },
        { audio: "All employees must complete the cybersecurity training by next Monday.", options: ["Training is optional", "Training is due next Monday", "Training was already completed", "Training starts Monday next week is fine"], correct: 1 },
        { audio: "The client has moved the product launch to the first week of December.", options: ["Launch cancelled", "Launch pushed to December", "Launch happening this week", "Launch date unchanged"], correct: 1 },
        { audio: "Please update your status on the project tracker before logging off.", options: ["Log off without updating", "Update status before leaving", "Email the manager", "Skip the tracker"], correct: 1 },
        { audio: "There will be a fire drill on Thursday at two in the afternoon.", options: ["Fire on Thursday", "Drill at 2 PM Thursday", "Drill cancelled", "Drill on Friday"], correct: 1 },
        { audio: "The HR team requires all new joiners to submit their documents within three days.", options: ["Documents in seven days", "Documents in three days", "Documents not required", "Documents in one day"], correct: 1 },
        { audio: "Your code review has been scheduled for ten AM on Wednesday.", options: ["Code review on Tuesday", "Code review Wednesday at 10 AM", "Code review cancelled", "Code review on Thursday"], correct: 1 },
        { audio: "Please ensure you have backed up all critical files before the system upgrade tonight.", options: ["No backup needed", "Backup files before upgrade", "Upgrade is cancelled", "Backup after upgrade"], correct: 1 },
        { audio: "The client presentation has been postponed to next quarter due to budget constraints.", options: ["Presentation today", "Presentation next quarter", "Presentation cancelled permanently", "Budget increased"], correct: 1 },
        { audio: "All team members are required to attend the sprint retrospective on Friday afternoon.", options: ["Attendance optional", "Attend Friday afternoon", "Meeting is on Monday", "Retrospective is cancelled"], correct: 1 },
        { audio: "The office will remain closed on the national holiday falling this Thursday.", options: ["Office open Thursday", "Office closed Thursday", "Holiday is on Friday", "Normal working day"], correct: 1 },
        { audio: "Please coordinate with the design team before finalising any user interface changes.", options: ["Skip design review", "Coordinate with design team first", "Make changes independently", "Wait for client approval only"], correct: 1 },
        { audio: "The new API documentation has been published on the developer portal.", options: ["Docs not available yet", "Docs on developer portal", "Docs sent via email", "Docs under review"], correct: 1 }
    ];

    const passageBank = [
        {
            passage: "Welcome to the orientation. Our company focuses on sustainable energy solutions. You will spend your first week in the engineering department learning about solar grid integrations. On your second week, you will shadow the project managers. Please remember that safety gear is mandatory in all lab areas, and your access badges must be visible at all times.",
            questions: [
                { q: "What does the company focus on?", options: ["Software Development", "Sustainable energy solutions", "Automobile manufacturing", "Financial services"], correct: 1 },
                { q: "What happens in the second week?", options: ["Engineering training", "Shadowing project managers", "Taking a vacation", "Lab testing"], correct: 1 },
                { q: "What is mandatory in lab areas?", options: ["Safety gear", "Laptops", "Coffee", "Formal suits"], correct: 0 }
            ]
        },
        {
            passage: "Good morning everyone. This is your project manager speaking. We have just received approval to proceed with Phase 2 of the CloudSync project. The development team must deliver the authentication module by the end of next sprint. The QA team should prepare test cases starting Monday. All deliverables must be tracked in JIRA and the daily standup will now move from 9 AM to 10 AM to accommodate the offshore team.",
            questions: [
                { q: "Which phase has been approved?", options: ["Phase 1", "Phase 2", "Phase 3", "Phase 4"], correct: 1 },
                { q: "What must the development team deliver by end of sprint?", options: ["API module", "Authentication module", "Database module", "UI module"], correct: 1 },
                { q: "When will the daily standup be held?", options: ["9 AM", "10 AM", "11 AM", "8 AM"], correct: 1 }
            ]
        },
        {
            passage: "This is an urgent announcement from the IT security team. We have detected unusual login activity on several employee accounts. Effective immediately, all employees are required to reset their passwords and enable two-factor authentication. Do not click on any suspicious links in your email. If you believe your account has been compromised, contact the helpdesk on extension 4400 immediately. Your cooperation is essential to maintain company data security.",
            questions: [
                { q: "What have employees been asked to do immediately?", options: ["Shut down computers", "Reset passwords and enable 2FA", "Change email addresses", "Disconnect from the internet"], correct: 1 },
                { q: "What should employees avoid doing?", options: ["Using their phone", "Clicking suspicious links", "Working overtime", "Using the printer"], correct: 1 },
                { q: "What is the helpdesk extension?", options: ["4000", "4200", "4400", "4800"], correct: 2 }
            ]
        },
        {
            passage: "Welcome back from the break. As part of our new performance review cycle, each employee will have a one-on-one session with their line manager in the coming two weeks. You are required to prepare a self-assessment document covering your achievements, challenges faced, and learning goals for the next quarter. Templates have been uploaded to the shared drive. Please submit your self-assessment at least 24 hours before your scheduled session.",
            questions: [
                { q: "What will each employee have in the next two weeks?", options: ["Team meeting", "One-on-one with line manager", "Project presentation", "Training session"], correct: 1 },
                { q: "What should the self-assessment document cover?", options: ["Only achievements", "Achievements, challenges, and learning goals", "Only challenges", "Budget plans"], correct: 1 },
                { q: "When must the self-assessment be submitted?", options: ["One week before session", "Same day as session", "24 hours before session", "After the session"], correct: 2 }
            ]
        },
        {
            passage: "This is a reminder about the upcoming office relocation. Our team will be moving to the new premises at Tech Park, Sector 5 on the 15th of this month. Packing of personal items should begin by the 12th. All desktop systems will be relocated by the IT team. Employees working on critical projects may work from home on the 15th and 16th. Parking stickers for the new building will be distributed by administration next week.",
            questions: [
                { q: "When is the office relocation?", options: ["12th", "14th", "15th", "16th"], correct: 2 },
                { q: "Who will relocate the desktop systems?", options: ["Employees themselves", "IT team", "Admin team", "Movers company"], correct: 1 },
                { q: "What will be distributed by administration?", options: ["New laptops", "Parking stickers", "Access cards", "Packing boxes"], correct: 1 }
            ]
        }
    ];

    // State Variables
    let currentScore = 0;
    let totalQuestions = 0;
    let timerInterval = null;

    // Shuffle helper to get random items
    const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

    // Reusable Tailwind option button (hover handled by utilities, not inline JS)
    const optBtn = (opt, i, cls) => `
        <button type="button" class="${cls} flex w-full cursor-pointer items-center gap-[.85rem] rounded-[12px] border-[1.5px] border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] px-5 py-4 text-left text-[.95rem] text-bright transition-all hover:border-[rgba(114,99,243,0.55)] hover:bg-[rgba(114,99,243,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" data-idx="${i}">
            <span class="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[7px] bg-[rgba(114,99,243,0.2)] text-[.82rem] font-extrabold text-primary-light">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
        </button>`;

    // ---------------------------------------------------------
    // 2. RENDER GUIDELINES (Entry Point)
    // ---------------------------------------------------------
    renderGuidelines();

    function renderGuidelines() {
        container.innerHTML = `
            <div class="module-container mx-auto my-6 max-w-[520px]">
                <div class="card glass-card px-8 py-7">
                    <div class="mb-3 flex items-center gap-3">
                        <i data-lucide="headphones" size="24" style="color:#7263f3;" class="flex-shrink-0"></i>
                        <h2 class="text-[1.35rem] text-bright">Listening — Rules</h2>
                    </div>
                    <p class="mb-5 text-[.85rem] leading-relaxed text-muted">
                        Evaluates your ability to comprehend spoken instructions in a professional context. Read carefully before proceeding.
                    </p>

                    <div class="mb-4 rounded-[10px] border border-[rgba(248,113,113,.25)] bg-[var(--error-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-error"><i data-lucide="alert-circle" size="14"></i> BEFORE</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Choose a quiet room with no background noise.</li>
                            <li>Stable internet connection required.</li>
                            <li>Ensure sufficient battery on your device.</li>
                            <li>Turn off unused Bluetooth devices.</li>
                        </ul>
                    </div>

                    <div class="mb-[1.4rem] rounded-[10px] border border-[rgba(251,191,36,.25)] bg-[var(--warning-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-warning"><i data-lucide="alert-triangle" size="14"></i> DURING</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Do not touch the microphone.</li>
                            <li>Headset mic: keep 3–5 cm from mouth; laptop mic: sit 30–45 cm away.</li>
                            <li>Screenshots and screen recordings are not allowed.</li>
                            <li>Silence all notifications and incoming calls.</li>
                        </ul>
                    </div>

                    <button id="accept-guidelines-btn" type="button" class="btn btn-primary btn-full">
                        I Understand &amp; Accept
                    </button>
                    <button id="back-dash" type="button" class="btn btn-outline btn-full mt-[.65rem]">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('accept-guidelines-btn').onclick = renderSubModuleSelection;
        document.getElementById('back-dash').onclick = () => window.location.reload();
    }

    // ---------------------------------------------------------
    // 3. SUB-MODULE SELECTION
    // ---------------------------------------------------------
    function renderSubModuleSelection() {
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[900px] animate-fade-in">
                <button id="back-to-dash" type="button" class="btn btn-outline mb-8 gap-[.4rem]">
                    <i data-lucide="arrow-left" size="15"></i> Back to Dashboard
                </button>

                <div class="card glass-card p-16 text-center max-[640px]:p-8">
                    <h2 class="mb-4 font-display text-[2.5rem] max-[640px]:text-[1.8rem]">Select Assessment Type</h2>
                    <p class="mb-12 text-[1.1rem] text-muted">Once selected, you cannot navigate back.</p>

                    <div class="grid grid-cols-2 gap-8 max-[640px]:grid-cols-1 max-[640px]:gap-4">
                        <div class="card card-hover border border-line bg-elevated" id="btn-response" role="button" tabindex="0" aria-label="Start Response Selection assessment" style="cursor:pointer;">
                            <div class="mx-auto mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-[rgba(88,101,242,0.1)]" style="color:#5865f2;">
                                <i data-lucide="message-square" size="30"></i>
                            </div>
                            <h3 class="mb-2">Response Selection</h3>
                            <p class="mb-4 text-[.9rem] text-muted">Listen to short clips. 2 plays max per clip. 5-second timer per question.</p>
                            <div class="rounded-lg bg-[var(--success-subtle)] p-2 text-left text-[.85rem] text-success">
                                <strong>Benefit:</strong> Trains you to rapidly interpret intent and context in fast-paced professional dialogues.
                            </div>
                        </div>

                        <div class="card card-hover border border-line bg-elevated" id="btn-passage" role="button" tabindex="0" aria-label="Start Passage Comprehension assessment" style="cursor:pointer;">
                            <div class="mx-auto mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-[var(--success-subtle)] text-success">
                                <i data-lucide="file-audio" size="30"></i>
                            </div>
                            <h3 class="mb-2">Passage Comprehension</h3>
                            <p class="mb-4 text-[.9rem] text-muted">Listen to a 1-min passage. Answer 3 questions. 5-second timer per question.</p>
                            <div class="rounded-lg bg-[var(--success-subtle)] p-2 text-left text-[.85rem] text-success">
                                <strong>Benefit:</strong> Improves your ability to extract critical facts and retain long-form information from meetings.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('back-to-dash').onclick = () => window.location.reload();

        const wire = (id, fn) => {
            const el = document.getElementById(id);
            el.onclick = fn;
            el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
        };
        wire('btn-response', () => startResponseSelection());
        wire('btn-passage',  () => startPassageComprehension());
    }

    // ---------------------------------------------------------
    // 4. RESPONSE SELECTION FLOW
    // ---------------------------------------------------------
    function startResponseSelection() {
        // Randomly pick 3 questions from bank
        const selectedQuestions = shuffleArray(responseBank).slice(0, 3);
        totalQuestions = 3;
        let qIndex = 0;
        let playCount = 0;

        function renderRSQuestion() {
            if (qIndex >= totalQuestions) return finishModule("Response Selection");

            const q = selectedQuestions[qIndex];
            playCount = 0;

            container.innerHTML = `
                <div class="module-container mx-auto max-w-[800px]">
                    <div class="mb-8 flex items-center justify-between">
                        <span class="badge badge-error animate-pulse-glow"><i data-lucide="lock" size="14" class="mr-1 inline"></i> Test in Progress - Do Not Exit</span>
                        <div class="text-right">
                            <div class="text-[.8rem] font-bold text-muted">QUESTION</div>
                            <div class="text-[1.25rem] font-extrabold text-primary">${qIndex + 1} / ${totalQuestions}</div>
                        </div>
                    </div>

                    <div class="card glass-card border border-line p-16 text-center max-[640px]:p-8">
                        <h2 class="mb-4 text-[2rem]">Response Selection</h2>
                        <p class="mb-8 text-muted">Listen to the short clip and choose the best response. Max 2 plays.</p>

                        <button id="rs-play-btn" type="button" class="btn btn-primary mb-4 h-20 w-20 rounded-full" aria-label="Play audio clip">
                            <i data-lucide="play" size="28" fill="white"></i>
                        </button>
                        <div id="play-limit-text" class="mb-12 text-[.9rem] font-semibold text-warning" role="status" aria-live="polite">Plays remaining: 2</div>

                        <div id="rs-options-container" style="display: none; opacity: 0; transition: opacity 0.5s;">
                            <div class="mb-4 flex items-center justify-between">
                                <h4 class="text-bright">Select Answer:</h4>
                                <div id="timer-display" class="font-display text-[1.5rem] font-extrabold text-error">05</div>
                            </div>
                            <div class="grid grid-cols-1 gap-3 text-left">
                                ${q.options.map((opt, i) => optBtn(opt, i, 'rs-opt-btn')).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();

            const playBtn = document.getElementById('rs-play-btn');
            const limitText = document.getElementById('play-limit-text');
            const optionsContainer = document.getElementById('rs-options-container');

            playBtn.onclick = () => {
                if (playCount >= 2) return;
                playCount++;
                limitText.innerText = `Plays remaining: ${2 - playCount}`;
                
                playBtn.disabled = true;
                const speech = new SpeechSynthesisUtterance(q.audio);
                speech.rate = 0.9;
                window.speechSynthesis.speak(speech);

                speech.onend = () => {
                    playBtn.disabled = false;
                    if (playCount === 2) {
                        playBtn.style.opacity = '0.5';
                        playBtn.style.pointerEvents = 'none';
                    }
                    // Show options if not already shown
                    if (optionsContainer.style.display === 'none') {
                        optionsContainer.style.display = 'block';
                        setTimeout(() => optionsContainer.style.opacity = '1', 50);
                        startStrictTimer(5, () => handleAnswerTimeout(q.correct));
                    }
                };
            };

            const optionBtns = document.querySelectorAll('.rs-opt-btn');
            optionBtns.forEach(btn => {
                btn.onclick = () => {
                    clearInterval(timerInterval);
                    const selected = parseInt(btn.dataset.idx);
                    if (selected === q.correct) currentScore++;
                    
                    // Visual feedback is disabled to keep it strictly like an exam
                    btn.style.borderColor = 'var(--primary)';
                    btn.style.background = 'rgba(88, 101, 242, 0.2)';
                    
                    optionBtns.forEach(b => b.style.pointerEvents = 'none');
                    setTimeout(() => { qIndex++; renderRSQuestion(); }, 1000);
                };
            });
        }

        function handleAnswerTimeout() {
            clearInterval(timerInterval);
            const timerEl = document.getElementById('timer-display');
            if (timerEl) {
                timerEl.innerText = '00';
                timerEl.style.color = 'var(--text-muted)';
            }
            document.querySelectorAll('.rs-opt-btn').forEach(b => b.style.pointerEvents = 'none');
            setTimeout(() => { qIndex++; renderRSQuestion(); }, 1000);
        }

        renderRSQuestion();
    }

    // ---------------------------------------------------------
    // 5. PASSAGE COMPREHENSION FLOW
    // ---------------------------------------------------------
    function startPassageComprehension() {
        const pData = shuffleArray(passageBank)[0]; // Pick one passage
        totalQuestions = pData.questions.length; // usually 3
        let qIndex = 0;

        // Phase 1: Listen to Passage
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[800px]">
                <div class="mb-8 flex items-center justify-between">
                    <span class="badge badge-error animate-pulse-glow"><i data-lucide="lock" size="14" class="mr-1 inline"></i> Test in Progress - Do Not Exit</span>
                </div>

                <div class="card glass-card border border-line p-16 text-center max-[640px]:p-8">
                    <h2 class="mb-4 text-[2rem]">Passage Comprehension</h2>
                    <p class="mb-12 text-muted">Listen to the passage carefully. It will only play once. You will have 5 seconds buffer before questions begin.</p>

                    <button id="pc-play-btn" type="button" class="btn btn-primary rounded-[50px] px-12 py-6 text-[1.2rem]">
                        <i data-lucide="play" size="24" fill="white"></i> Play Passage
                    </button>

                    <div id="pc-status" style="display: none;" class="mt-8 text-[1.2rem] font-bold text-primary" role="status" aria-live="polite">
                        Playing...
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        const playBtn = document.getElementById('pc-play-btn');
        const statusText = document.getElementById('pc-status');

        playBtn.onclick = () => {
            playBtn.style.display = 'none';
            statusText.style.display = 'block';

            const speech = new SpeechSynthesisUtterance(pData.passage);
            speech.rate = 0.85;
            window.speechSynthesis.speak(speech);

            speech.onend = () => {
                statusText.innerText = "Get Ready... 5";
                statusText.style.color = "var(--warning)";
                
                let countdown = 4;
                const bufferInterval = setInterval(() => {
                    statusText.innerText = `Get Ready... ${countdown}`;
                    countdown--;
                    if (countdown < 0) {
                        clearInterval(bufferInterval);
                        renderPCQuestion(pData.questions, qIndex);
                    }
                }, 1000);
            };
        };

        function renderPCQuestion(questions, index) {
            if (index >= questions.length) return finishModule("Passage Comprehension");

            const q = questions[index];

            container.innerHTML = `
                <div class="module-container mx-auto max-w-[800px]">
                    <div class="mb-8 flex items-center justify-between">
                        <span class="badge badge-error animate-pulse-glow"><i data-lucide="lock" size="14" class="mr-1 inline"></i> Test in Progress - Do Not Exit</span>
                        <div class="text-right">
                            <div class="text-[.8rem] font-bold text-muted">QUESTION</div>
                            <div class="text-[1.25rem] font-extrabold text-primary">${index + 1} / ${questions.length}</div>
                        </div>
                    </div>

                    <div class="card glass-card border border-line p-16 max-[640px]:p-8">
                        <div class="mb-8 flex items-start justify-between">
                            <h3 class="flex-1 pr-8 text-[1.5rem] text-bright">${q.q}</h3>
                            <div id="timer-display" class="font-display text-[2.5rem] font-extrabold leading-none text-error">05</div>
                        </div>

                        <div class="grid grid-cols-1 gap-3">
                            ${q.options.map((opt, i) => optBtn(opt, i, 'pc-opt-btn')).join('')}
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();

            startStrictTimer(5, () => {
                // Time up
                qIndex++;
                renderPCQuestion(questions, qIndex);
            });

            const optionBtns = document.querySelectorAll('.pc-opt-btn');
            optionBtns.forEach(btn => {
                btn.onclick = () => {
                    clearInterval(timerInterval);
                    const selected = parseInt(btn.dataset.idx);
                    if (selected === q.correct) currentScore++;
                    
                    btn.style.borderColor = 'var(--primary)';
                    btn.style.background = 'rgba(88, 101, 242, 0.2)';
                    optionBtns.forEach(b => b.style.pointerEvents = 'none');
                    
                    setTimeout(() => { qIndex++; renderPCQuestion(questions, qIndex); }, 1000);
                };
            });
        }
    }

    // ---------------------------------------------------------
    // 6. UTILITIES & RESULT
    // ---------------------------------------------------------
    function startStrictTimer(seconds, timeoutCallback) {
        let timeLeft = seconds;
        const display = document.getElementById('timer-display');
        display.innerText = timeLeft.toString().padStart(2, '0');

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft >= 0) {
                display.innerText = timeLeft.toString().padStart(2, '0');
            } else {
                clearInterval(timerInterval);
                timeoutCallback();
            }
        }, 1000);
    }

    function finishModule(moduleName) {
        container.innerHTML = `
            <div class="result-container mx-auto max-w-[700px] animate-slide-up text-center">
                <div class="card glass-card border border-line p-20 max-[640px]:p-8">
                    <div class="mb-8 text-[5rem]" aria-hidden="true">✅</div>
                    <h2 class="mb-4 font-display text-[2.5rem]">Assessment Complete</h2>
                    <p class="mb-12 text-[1.1rem] text-muted">You have completed the <strong>${moduleName}</strong> track under strict examination rules.</p>

                    <div class="mb-12 rounded-[20px] border border-line bg-elevated p-10">
                        <div class="mb-2 text-[.9rem] font-extrabold uppercase tracking-[.1em] text-muted">Score Achieved</div>
                        <div class="font-display text-[4rem] font-black leading-none text-primary">${currentScore} / ${totalQuestions}</div>
                    </div>

                    <button id="finish-btn" type="button" class="btn btn-primary btn-full btn-lg gap-2">
                        Save &amp; Back to Dashboard <i data-lucide="arrow-left" size="16"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('finish-btn').onclick = async () => {
            const btn = document.getElementById('finish-btn');
            btn.disabled = true;
            btn.innerHTML = '<span class="loader" style="width: 20px; height: 20px; border-color: white; border-bottom-color: transparent;"></span>';
            
            try {
                // Scale score to percentage for the DB or keep it as absolute, DB saves (achieved, total)
                await saveScore('listening', currentScore, totalQuestions);
            } catch (err) {
                console.error(err);
            }
            window.location.reload(); // Go back to dashboard naturally
        };
    }
}
