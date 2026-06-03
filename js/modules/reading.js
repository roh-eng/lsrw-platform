/**
 * Highly Controlled Reading Module - Dark Mode
 */

import { saveScore } from '../api/scores.js';

export async function startReading(container) {
    let currentStage = 'guidelines';
    let currentSubmodule = null;
    let activeQuestions = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let readingTimer = null;

    const submodules = [
        { 
            id: 'reading_comprehension', 
            title: 'Reading Comprehension', 
            desc: 'Read a paragraph and answer questions based on the text.',
            benefits: 'Enhances your ability to quickly scan for critical information and summarize large bodies of text in professional environments.',
            available: true
        },
        { 
            id: 'sentence_completion', 
            title: 'Sentence Completion', 
            desc: 'Fill in the blanks using correct English grammar and vocabulary.',
            benefits: 'Improves your grammatical accuracy and helps you use the precise vocabulary required for effective corporate emails.',
            available: true
        }
    ];

    const databanks = {
        reading_comprehension: [
            {
                paragraph: "Cloud computing refers to the on-demand delivery of computing resources — including servers, storage, databases, networking, and software — over the internet, commonly referred to as 'the cloud.' Rather than owning and maintaining physical data centres and servers, organisations can access technology services from a cloud provider and pay only for what they use. This model, known as pay-as-you-go, significantly reduces upfront capital expenditure, allowing businesses to scale resources up or down depending on demand. Large cloud providers such as Amazon Web Services, Microsoft Azure, and Google Cloud operate massive networks of data centres distributed across multiple geographic locations to ensure availability and redundancy. The distributed nature of the cloud means that if one data centre fails, workloads can be automatically redirected to another, minimising downtime. However, organisations that adopt cloud services without careful planning often find themselves facing unexpected operating expenses due to inefficient resource usage or misconfigured services. Security and data privacy are also ongoing concerns, as sensitive information stored in the cloud must be protected against unauthorised access and cyberattacks. Despite these challenges, cloud computing has become the dominant infrastructure model for businesses of all sizes, enabling faster innovation and more agile operations than traditional on-premise systems could provide.",
                questions: [
                    { q: "What is the primary benefit of the pay-as-you-go model?", options: ["Increased capital expenses", "Reduced capital expenses", "Direct active management", "Slower performance"], correct: "Reduced capital expenses" },
                    { q: "What can the pay-as-you-go model lead to if users are unaware?", options: ["Unexpected operating expenses", "Loss of data", "Better security", "Hardware damage"], correct: "Unexpected operating expenses" },
                    { q: "What can happen to workloads if one data centre fails?", options: ["They are permanently lost", "They are automatically redirected to another data centre", "They must be restarted manually by the user", "They are deleted for security reasons"], correct: "They are automatically redirected to another data centre" }
                ]
            },
            {
                paragraph: "A microservices architecture is an approach to software development in which a large application is broken down into a collection of small, independently deployable services, each responsible for a specific business function. Unlike traditional monolithic applications, where all components are tightly coupled into a single deployable unit, microservices are loosely coupled and can be developed, deployed, and scaled independently of one another. Each service typically owns its own data store and communicates with other services through well-defined APIs, most commonly over HTTP or a message queue. This design pattern offers significant advantages in terms of scalability, resilience, and developer autonomy, as teams can work on different services simultaneously without interfering with one another. However, microservices also introduce new complexities, including the need for robust service discovery mechanisms, distributed tracing, and sophisticated deployment pipelines. Managing a large number of microservices requires investment in infrastructure automation tools such as container orchestration platforms. When a single service fails, the system must be designed to degrade gracefully rather than causing a complete outage. Organisations that successfully implement microservices typically report faster release cycles and greater overall system reliability compared to monolithic alternatives.",
                questions: [
                    { q: "What does each microservice implement?", options: ["Multiple capabilities", "A single business capability", "The entire UI", "A central database"], correct: "A single business capability" },
                    { q: "How do microservices communicate?", options: ["Through shared databases", "Through tightly coupled systems", "Through well-defined APIs", "Through active management"], correct: "Through well-defined APIs" },
                    { q: "How should the system behave when a single service fails?", options: ["It should cause a complete outage", "It should degrade gracefully", "It should merge back into a monolith", "It should delete the failed service"], correct: "It should degrade gracefully" }
                ]
            },
            {
                paragraph: "Emotional intelligence, commonly referred to as EQ, is the ability to recognise, understand, manage, and effectively use one's own emotions, as well as to perceive and influence the emotions of others. The concept was popularised by psychologist Daniel Goleman in the 1990s and has since become central to research on leadership, teamwork, and professional success. EQ is typically measured across five core components: self-awareness, self-regulation, motivation, empathy, and social skills. Individuals with high emotional intelligence are better equipped to handle stress, resolve conflicts diplomatically, and build strong professional relationships. Research consistently shows that EQ is a stronger predictor of career success than IQ alone, particularly in roles that involve significant interpersonal interaction. Leaders who demonstrate high EQ tend to inspire greater loyalty and commitment from their teams, as employees feel heard, valued, and understood. Unlike cognitive intelligence, which remains relatively stable throughout adulthood, emotional intelligence can be meaningfully developed through deliberate practice, feedback, and self-reflection. Coaching programmes, mindfulness training, and structured peer feedback are among the most effective methods for improving EQ in professional settings.",
                questions: [
                    { q: "What does EQ stand for?", options: ["Emotional Quotient", "Educational Qualification", "Equal Quality", "Employee Quorum"], correct: "Emotional Quotient" },
                    { q: "How does EQ differ from IQ?", options: ["IQ can be improved; EQ cannot", "EQ can be developed over time; IQ cannot", "They are the same", "EQ only applies to leaders"], correct: "EQ can be developed over time; IQ cannot" },
                    { q: "What is one reason high EQ people make better leaders?", options: ["They earn higher salaries", "They build stronger relationships", "They work longer hours", "They avoid all conflicts"], correct: "They build stronger relationships" }
                ]
            },
            {
                paragraph: "Agile software development is an iterative approach that focuses on collaboration, customer feedback, and small, rapid releases. Unlike traditional waterfall methodology, which requires completing each phase before moving to the next, Agile allows teams to work in short cycles called sprints, typically lasting one to four weeks. At the end of each sprint, a working product increment is delivered. This approach reduces risk and increases flexibility, enabling teams to respond quickly to changing requirements.",
                questions: [
                    { q: "How long do Agile sprints typically last?", options: ["One to four weeks", "One to four months", "One day", "Six months"], correct: "One to four weeks" },
                    { q: "What is delivered at the end of each sprint?", options: ["A final product", "A working product increment", "A project plan", "A budget report"], correct: "A working product increment" },
                    { q: "How does Agile differ from the waterfall methodology?", options: ["Agile requires all phases to be completed before moving forward", "Agile uses short iterative cycles instead of sequential phases", "Waterfall allows more flexibility", "They are identical in approach"], correct: "Agile uses short iterative cycles instead of sequential phases" }
                ]
            },
            {
                paragraph: "Cybersecurity refers to the practice of protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information, extorting money from users, or interrupting normal business processes. A robust cybersecurity strategy requires multiple layers of protection, including firewalls, encryption, regular software updates, and employee training. Human error remains one of the leading causes of security breaches, making awareness programs critical in any organisation.",
                questions: [
                    { q: "What is one common goal of cyberattacks?", options: ["Improving software performance", "Accessing sensitive information", "Reducing company expenses", "Increasing network speed"], correct: "Accessing sensitive information" },
                    { q: "What remains a leading cause of security breaches?", options: ["Outdated hardware", "Human error", "Weak firewalls", "Slow internet"], correct: "Human error" },
                    { q: "Which of the following is NOT mentioned as a cybersecurity protection layer?", options: ["Firewalls", "Encryption", "Employee training", "Open-source software"], correct: "Open-source software" }
                ]
            },
            {
                paragraph: "Effective time management is the process of organising and planning how to divide your time between specific activities. Good time management enables you to work smarter, not harder, so that you get more done in less time even when time is tight and pressures are high. Key time management techniques include setting SMART goals, using priority matrices to distinguish urgent tasks from important ones, time-blocking your calendar, and eliminating common distractions such as unnecessary meetings and excessive social media use.",
                questions: [
                    { q: "What does effective time management enable you to do?", options: ["Work longer hours", "Work smarter and get more done in less time", "Avoid all meetings", "Skip difficult tasks"], correct: "Work smarter and get more done in less time" },
                    { q: "According to the passage, what are priority matrices used for?", options: ["Blocking time on the calendar", "Distinguishing urgent tasks from important ones", "Eliminating all meetings", "Setting SMART goals"], correct: "Distinguishing urgent tasks from important ones" },
                    { q: "Which of these is mentioned as a common distraction?", options: ["Reading books", "Excessive social media use", "Taking breaks", "Physical exercise"], correct: "Excessive social media use" }
                ]
            },
            {
                paragraph: "Artificial intelligence is rapidly transforming the job market. While AI is automating routine and repetitive tasks, it is simultaneously creating new categories of jobs that require human creativity, critical thinking, and emotional intelligence — skills that machines currently cannot replicate. Workers who invest in developing these uniquely human capabilities alongside technical skills will be best positioned for careers in an AI-driven economy. Lifelong learning and adaptability have become essential rather than optional for professionals today.",
                questions: [
                    { q: "What types of tasks is AI primarily automating?", options: ["Creative tasks", "Routine and repetitive tasks", "Strategic planning", "Customer relations"], correct: "Routine and repetitive tasks" },
                    { q: "What skills does AI currently struggle to replicate?", options: ["Data processing", "Human creativity and emotional intelligence", "Mathematical calculations", "Language translation"], correct: "Human creativity and emotional intelligence" },
                    { q: "What has become essential for professionals in an AI-driven economy?", options: ["Avoiding technology", "Lifelong learning and adaptability", "Specialising in one skill only", "Working in isolation"], correct: "Lifelong learning and adaptability" }
                ]
            },
            {
                paragraph: "Design thinking is a human-centred approach to innovation that draws from the designer's toolkit to integrate the needs of people, the possibilities of technology, and the requirements for business success. It follows five key stages: empathise with users, define the problem, ideate solutions, prototype quickly, and test with real users. This iterative process encourages teams to challenge assumptions, reframe problems, and create innovative solutions rather than defaulting to conventional thinking.",
                questions: [
                    { q: "What is design thinking centred around?", options: ["Technology", "Business profit", "Human needs", "Government regulations"], correct: "Human needs" },
                    { q: "What is the third stage of design thinking?", options: ["Empathise", "Define", "Ideate", "Prototype"], correct: "Ideate" },
                    { q: "What does the design thinking process encourage teams to do?", options: ["Follow conventional thinking", "Challenge assumptions and create innovative solutions", "Avoid user testing", "Focus only on technology"], correct: "Challenge assumptions and create innovative solutions" }
                ]
            }
        ],
        sentence_completion: [
            { q: "The manager requested that the report ____ submitted by Friday.", options: ["is", "be", "was", "are"], correct: "be" },
            { q: "Despite ____ tired, she finished the project on time.", options: ["to be", "is", "being", "been"], correct: "being" },
            { q: "If they had known about the traffic, they ____ earlier.", options: ["will leave", "would leave", "left", "would have left"], correct: "would have left" },
            { q: "The new software update is ____ more efficient than the previous one.", options: ["significant", "significantly", "significance", "signify"], correct: "significantly" },
            { q: "Please ensure that all confidential documents are kept ____.", options: ["secure", "securely", "security", "securing"], correct: "secure" },
            { q: "The team ____ the project successfully before the deadline last week.", options: ["complete", "completes", "completed", "completing"], correct: "completed" },
            { q: "Neither the manager ____ the developers were aware of the security breach.", options: ["or", "nor", "but", "and"], correct: "nor" },
            { q: "The CEO asked the team to focus ____ improving customer satisfaction scores.", options: ["at", "for", "on", "in"], correct: "on" },
            { q: "Had we started earlier, we ____ the project on time.", options: ["finish", "will finish", "would have finished", "had finished"], correct: "would have finished" },
            { q: "She is the most ____ developer in the entire organisation.", options: ["talent", "talented", "talently", "talentful"], correct: "talented" },
            { q: "The report must be ____ before it is sent to the client.", options: ["proof-read", "proofing", "proof-reads", "proof"], correct: "proof-read" },
            { q: "We need someone who is not only skilled ____ also a great communicator.", options: ["but", "or", "and", "nor"], correct: "but" },
            { q: "The data ____ collected over three months clearly shows an upward trend.", options: ["were", "was", "is", "are"], correct: "was" },
            { q: "Please ____ any changes to the document before submitting the final version.", options: ["review", "reviews", "reviewed", "reviewing"], correct: "review" },
            { q: "The presentation ____ by the intern was surprisingly impressive.", options: ["delivered", "delivers", "deliver", "delivering"], correct: "delivered" }
        ]
    };

    let activeParagraph = null;

    /* Tailwind helpers (local to this module) */
    const dot = (state) => state === 'on'
        ? '<span class="h-[7px] w-5 rounded-[4px] bg-primary shadow-neon"></span>'
        : state === 'done'
            ? '<span class="h-[7px] w-[7px] rounded-full bg-success"></span>'
            : '<span class="h-[7px] w-[7px] rounded-full bg-line-bright"></span>';
    const optBtn = (opt, idx) => `
        <button type="button" class="answer-option mb-[.65rem] flex w-full cursor-pointer items-center gap-[.85rem] rounded-[12px] border-[1.5px] border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] px-5 py-4 text-left text-[.95rem] text-bright transition-all hover:border-[rgba(114,99,243,0.55)] hover:bg-[rgba(114,99,243,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" data-answer="${opt}">
            <span class="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[7px] bg-[rgba(114,99,243,0.2)] text-[.82rem] font-extrabold text-primary-light">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
        </button>`;

    render();

    function render() {
        if (currentStage === 'guidelines') renderGuidelines();
        else if (currentStage === 'menu') renderMenu();
        else if (currentStage === 'paragraph') renderParagraph();
        else if (currentStage === 'test') renderTest();
        else if (currentStage === 'result') renderResult();
        else if (currentStage === 'reports') renderReports();
    }

    function saveReportData(submodId, questionText, userAnswer, correctAnswer) {
        let reports = JSON.parse(localStorage.getItem('lsrw_reports') || '[]');
        reports.push({
            module: 'Reading',
            submodule: submodId,
            question: questionText,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: userAnswer === correctAnswer,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('lsrw_reports', JSON.stringify(reports));
    }

    function renderGuidelines() {
        container.innerHTML = `
            <div class="module-container mx-auto my-6 max-w-[520px]">
                <div class="card glass-card px-8 py-7">
                    <div class="mb-3 flex items-center gap-3">
                        <i data-lucide="book-open" size="24" style="color:var(--success);" class="flex-shrink-0"></i>
                        <h2 class="text-[1.35rem] text-bright">Reading — Rules</h2>
                    </div>
                    <p class="mb-5 text-[.85rem] leading-relaxed text-muted">
                        Enhances understanding of corporate emails, reports & technical docs. Focus on summarising, identifying key details, and scanning for critical information.
                    </p>

                    <div class="mb-4 rounded-[10px] border border-[rgba(248,113,113,.25)] bg-[var(--error-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-error"><i data-lucide="alert-circle" size="14"></i> BEFORE</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Choose a quiet room.</li>
                            <li>Stable internet connection required.</li>
                            <li>Ensure sufficient battery.</li>
                            <li>Turn off Bluetooth.</li>
                        </ul>
                    </div>

                    <div class="mb-[1.4rem] rounded-[10px] border border-[rgba(251,191,36,.25)] bg-[var(--warning-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-warning"><i data-lucide="alert-triangle" size="14"></i> DURING</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Mic (if used): keep 35–45 cm from mouth.</li>
                            <li>Screenshots and screen recordings not allowed.</li>
                            <li>No notes. Cannot pause the test.</li>
                            <li>Silence notifications and calls.</li>
                        </ul>
                    </div>

                    <button id="accept-rules" type="button" class="btn btn-primary btn-full">
                        I Understand & Accept
                    </button>
                    <button id="back-dash" type="button" class="btn btn-outline btn-full mt-[.65rem]">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        `;

        lucide.createIcons();

        document.getElementById('accept-rules').onclick = () => {
            currentStage = 'menu';
            render();
        };
        document.getElementById('back-dash').onclick = () => window.location.reload();
    }

    function renderMenu() {
        const gridHtml = submodules.map(mod => `
            <div class="card ${mod.available ? 'glass-card hover-lift cursor-pointer' : 'opacity-50 grayscale'} border border-line p-8" ${mod.available ? `onclick="window.startReadingSubmodule('${mod.id}')"` : ''}>
                <h3 class="mb-2 text-bright">${mod.title}</h3>
                <p class="mb-4 text-[.9rem] text-muted">${mod.desc}</p>
                <div class="mb-4 rounded-lg bg-[var(--success-subtle)] p-2 text-[.85rem] text-success">
                    <strong>Benefit:</strong> ${mod.benefits}
                </div>
                ${mod.available ? `
                    <div class="flex gap-4">
                        <span class="badge badge-success">3 Questions</span>
                        <button type="button" class="btn btn-outline px-[.8rem] py-[.3rem] text-[.8rem]" onclick="event.stopPropagation(); window.viewReadingReports('${mod.id}')">Reports</button>
                    </div>
                ` : `<span class="badge badge-warning">Coming Soon</span>`}
            </div>
        `).join('');

        container.innerHTML = `
            <div class="module-container mx-auto max-w-[1000px] animate-slide-up">
                <div class="mb-8 flex items-center justify-between">
                    <h2 class="text-[2rem]">Select Reading Submodule</h2>
                    <button type="button" class="btn btn-outline gap-[.4rem]" onclick="window.location.reload()"><i data-lucide="arrow-left" size="15"></i> Back to Dashboard</button>
                </div>
                <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                    ${gridHtml}
                </div>
            </div>
        `;

        window.startReadingSubmodule = (id) => {
            currentSubmodule = submodules.find(s => s.id === id);
            correctAnswers = 0;
            currentQuestionIndex = 0;

            if (id === 'reading_comprehension') {
                const randomPassage = databanks.reading_comprehension[Math.floor(Math.random() * databanks.reading_comprehension.length)];
                activeParagraph = randomPassage.paragraph;
                activeQuestions = randomPassage.questions;
                currentStage = 'paragraph';
            } else {
                activeQuestions = [...databanks.sentence_completion].sort(() => 0.5 - Math.random()).slice(0, 3);
                currentStage = 'test';
            }
            render();
        };

        window.viewReadingReports = (id) => {
            currentSubmodule = submodules.find(s => s.id === id);
            currentStage = 'reports';
            render();
        }
    }

    function renderParagraph() {
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[900px] animate-fade-in">
                <div class="mb-8 flex items-center justify-between">
                    <span class="badge badge-primary">${currentSubmodule.title}</span>
                    <div class="flex items-center gap-2 text-[1.2rem] font-bold text-warning">
                        <i data-lucide="clock"></i> <span id="para-timer" role="timer">01:00</span>
                    </div>
                </div>

                <div class="card glass-card border border-line p-12 max-[640px]:p-6">
                    <h3 class="mb-6 text-bright">Read the following passage carefully:</h3>
                    <p class="text-[1.2rem] leading-[1.8] text-muted">${activeParagraph}</p>
                </div>
            </div>
        `;

        lucide.createIcons();

        let time = 60;
        readingTimer = setInterval(() => {
            time--;
            const mins = Math.floor(time / 60).toString().padStart(2, '0');
            const secs = (time % 60).toString().padStart(2, '0');
            document.getElementById('para-timer').innerText = `${mins}:${secs}`;
            
            if (time <= 0) {
                clearInterval(readingTimer);
                currentStage = 'test';
                render();
            }
        }, 1000);
    }

    /* collectedAnswers is used by sentence_completion to hold all picks before showing results */
    let collectedAnswers = [];

    function renderTest() {
        const isSentenceCompletion = currentSubmodule.id === 'sentence_completion';

        /* For sentence_completion reset the collector at the start of the first question */
        if (isSentenceCompletion && currentQuestionIndex === 0) collectedAnswers = [];

        const q = activeQuestions[currentQuestionIndex];
        const total = activeQuestions.length;

        const optionsHtml = q.options.map((opt, idx) => optBtn(opt, idx)).join('');

        /* Progress dots */
        const dots = Array.from({ length: total }, (_, i) => {
            const state = i < currentQuestionIndex ? 'done' : i === currentQuestionIndex ? 'on' : '';
            return dot(state);
        }).join('');

        container.innerHTML = `
            <div class="module-container mx-auto my-6 max-w-[760px] animate-slide-up">
                <div class="mb-6 flex items-center justify-between">
                    <span class="badge badge-primary">${currentSubmodule.title}</span>
                    <div class="flex items-center gap-[.85rem]">
                        <div class="flex items-center gap-[.4rem]">${dots}</div>
                        <span class="text-[.82rem] text-muted">Q ${currentQuestionIndex + 1} / ${total}</span>
                    </div>
                </div>

                <div class="card glass-card px-10 py-8">
                    <h3 class="mb-7 text-[1.25rem] leading-[1.55] text-bright">${q.q}</h3>
                    <div id="options-container">
                        ${optionsHtml}
                    </div>
                    ${isSentenceCompletion ? '<p class="mt-2 text-[.75rem] text-muted">Your results will be shown after all questions.</p>' : ''}
                </div>
            </div>
        `;

        const buttons = document.querySelectorAll('.answer-option');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const userAnswer = btn.getAttribute('data-answer');

                /* Mark chosen visually (selection feedback, no correct/wrong reveal) */
                btn.dataset.chosen = '1';
                btn.style.background  = 'rgba(114,99,243,0.25)';
                btn.style.borderColor = 'var(--primary)';
                btn.style.boxShadow   = '0 0 0 2px var(--primary-glow)';
                buttons.forEach(b => b.style.pointerEvents = 'none');

                if (isSentenceCompletion) {
                    /* Collect answer — NO immediate correct/wrong reveal */
                    collectedAnswers.push({ q: q.q, userAnswer, correct: q.correct });
                    saveReportData(currentSubmodule.id, q.q, userAnswer, q.correct);

                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex >= total) {
                            /* Compute score from collected answers */
                            correctAnswers = collectedAnswers.filter(a => a.userAnswer === a.correct).length;
                            currentStage = 'result';
                            render();
                        } else {
                            renderTest();
                        }
                    }, 600); /* short pause so selection is visible, then move on */

                } else {
                    /* Reading comprehension: immediate right/wrong is fine */
                    saveReportData(currentSubmodule.id, q.q, userAnswer, q.correct);
                    if (userAnswer === q.correct) {
                        correctAnswers++;
                        btn.style.background  = 'rgba(34,209,139,0.25)';
                        btn.style.borderColor = 'var(--success)';
                    } else {
                        btn.style.background  = 'rgba(248,113,113,0.22)';
                        btn.style.borderColor = 'var(--error)';
                        buttons.forEach(b => {
                            if (b.getAttribute('data-answer') === q.correct) {
                                b.style.background  = 'rgba(34,209,139,0.18)';
                                b.style.borderColor = 'var(--success)';
                            }
                        });
                    }
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex >= total) currentStage = 'result';
                        render();
                    }, 1400);
                }
            };
        });
    }

    function renderResult() {
        const finalScore = Math.floor((correctAnswers / activeQuestions.length) * 100);
        
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[600px] animate-slide-up">
                <div class="card glass-card border border-line p-16 text-center max-[640px]:p-8">
                    <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-subtle)] text-success">
                        <i data-lucide="check-circle" size="40"></i>
                    </div>
                    <h2 class="mb-4 text-[2.5rem]">Submodule Complete</h2>
                    <p class="mb-12 text-[1.2rem] text-muted">You have successfully finished the ${currentSubmodule.title} test.</p>

                    <div class="mb-12 rounded-2xl bg-black/30 p-8">
                        <h3 class="mb-2 text-bright">Score</h3>
                        <div class="text-[4rem] font-bold text-primary">${finalScore}%</div>
                    </div>

                    <button id="sync-btn" type="button" class="btn btn-primary btn-full btn-lg mb-3">
                        Save & View Reports
                    </button>
                    <button id="exit-btn" type="button" class="btn btn-outline btn-full btn-lg gap-[.4rem]">
                        <i data-lucide="arrow-left" size="16"></i> Back to Dashboard
                    </button>
                </div>
            </div>
        `;

        lucide.createIcons();

        document.getElementById('sync-btn').onclick = async () => {
            const btn = document.getElementById('sync-btn');
            btn.innerHTML = 'Saving...';
            btn.disabled = true;
            try {
                await saveScore('reading', finalScore, 100);
            } catch (e) { console.error(e); }
            currentStage = 'reports';
            render();
        };

        document.getElementById('exit-btn').onclick = async () => {
            try {
                await saveScore('reading', finalScore, 100);
            } catch (e) { console.error(e); }
            window.location.reload();
        }
    }

    function renderReports() {
        const allReports = JSON.parse(localStorage.getItem('lsrw_reports') || '[]');
        const submodReports = allReports.filter(r => r.module === 'Reading' && r.submodule === currentSubmodule.id);

        let reportsHtml = '<p class="text-muted">No attempts recorded for this submodule yet.</p>';

        if (submodReports.length > 0) {
            reportsHtml = submodReports.reverse().map(r => `
                <div class="mb-4 rounded-[12px] border border-line bg-elevated p-6 text-left">
                    <div class="mb-2 text-[.8rem] text-muted">${r.date}</div>
                    <div class="mb-4 font-medium text-bright">${r.question}</div>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between">
                            <span class="text-muted">Your Answer:</span>
                            <span class="font-bold" style="color:${r.isCorrect ? 'var(--success)' : 'var(--error)'};">${r.userAnswer}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted">Correct Answer:</span>
                            <span class="font-bold text-success">${r.correctAnswer}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = `
            <div class="module-container mx-auto max-w-[800px] animate-slide-up">
                <div class="mb-8 flex items-center justify-between">
                    <h2 class="text-[2rem]">${currentSubmodule.title} Reports</h2>
                    <button type="button" class="btn btn-outline" id="back-to-menu-btn">Back to Menu</button>
                </div>
                <div class="card glass-card max-h-[60vh] overflow-y-auto p-8">
                    ${reportsHtml}
                </div>
            </div>
        `;

        document.getElementById('back-to-menu-btn').onclick = () => {
            currentStage = 'menu';
            render();
        };
    }
}
