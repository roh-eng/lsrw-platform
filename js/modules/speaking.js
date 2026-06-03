/**
 * Highly Controlled Speaking Module - Dark Mode
 * Includes Guidelines, Sub-modules selection, strict exam constraints, and Reports.
 */

import { saveScore } from '../api/scores.js';
import { evaluateWritingTask } from '../api/ai.js';

export async function startSpeaking(container) {
    let currentStage = 'guidelines';
    let currentSubmodule = null;
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let playCount = 0;
    let recordingTimer = null;
    let mediaRecorder = null;
    let audioChunks = [];

    const submodules = [
        { id: 'listen_repeat', title: 'Listen and Repeat', desc: 'Listen to a sentence and repeat it exactly.', available: true, qCount: 3, benefits: 'Enhances active listening and exact pronunciation replication under pressure.' },
        { id: 'speak_out', title: 'Speak Out', desc: 'Speak about a situation in an enterprise context.', available: true, qCount: 3, benefits: 'Builds confidence in spontaneous communication and articulating thoughts clearly.' },
        { id: 'read_out', title: 'Read Out', desc: 'Read a paragraph out loud. Evaluated on pronunciation and speed.', available: true, qCount: 3, benefits: 'Improves your pacing, pronunciation, and clarity when presenting written information.' },
        { id: 'retell_story', title: 'Retell a Story', desc: 'Listen to a story and retell it in your own words.', available: true, qCount: 1, benefits: 'Strengthens memory retention, comprehension, and ability to summarize key events.' },
        { id: 'speaking_situation', title: 'Speaking Situation', desc: 'Speak how you would handle a specific situation.', available: true, qCount: 3, benefits: 'Develops empathy and real-time problem-solving skills in professional contexts.' },
        { id: 'short_answer', title: 'Short Answer', desc: 'Answer a grammar/communication question shortly.', available: true, qCount: 3, benefits: 'Sharpens quick thinking and grammatical accuracy for direct questioning.' },
        { id: 'sentence_building', title: 'Sentence Building', desc: 'Rearrange jumbled words into a sentence and speak it.', available: true, qCount: 3, benefits: 'Improves structural grammar and ability to form coherent thoughts quickly.' },
        { id: 'give_opinion', title: 'Give your opinion', desc: 'Give your opinion on a topic.', available: true, qCount: 3, benefits: 'Practices expressing and defending subjective viewpoints professionally.' },
        { id: 'answer_questions', title: 'Answer questions', desc: 'Answer general questions.', available: true, qCount: 3, benefits: 'Prepares you for standard interview and Q&A formats.' },
        { id: 'image_description', title: 'Image description', desc: 'Describe a given image.', available: true, qCount: 3, benefits: 'Enhances visual-to-verbal translation and descriptive vocabulary.' }
    ];

    const databanks = {
        listen_repeat: [
            { text: "The presentation will begin in five minutes.", correct: "The presentation will begin in five minutes." },
            { text: "Please ensure all reports are submitted by Friday.", correct: "Please ensure all reports are submitted by Friday." },
            { text: "Innovation is the key to our company's success.", correct: "Innovation is the key to our company's success." },
            { text: "The client meeting has been postponed to next Thursday.", correct: "The client meeting has been postponed to next Thursday." },
            { text: "Please review the pull request before the end of day.", correct: "Please review the pull request before the end of day." },
            { text: "Effective communication builds trust within a professional team.", correct: "Effective communication builds trust within a professional team." },
            { text: "The new software deployment will happen over the weekend.", correct: "The new software deployment will happen over the weekend." },
            { text: "All employees should update their profiles on the HR portal.", correct: "All employees should update their profiles on the HR portal." },
            { text: "Please coordinate with the QA team before releasing the build.", correct: "Please coordinate with the QA team before releasing the build." },
            { text: "The project timeline has been extended by two additional weeks.", correct: "The project timeline has been extended by two additional weeks." }
        ],
        speak_out: [
            { text: "How would you handle a conflict with a senior developer?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "Describe a time you missed a deadline and how you managed it.", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "How do you ensure clear communication in a remote team?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "What steps would you take if you discovered a critical bug one hour before release?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "How do you prioritise tasks when working on multiple projects simultaneously?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "Describe how you would explain a technical concept to a non-technical stakeholder.", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "How would you approach giving constructive feedback to a peer whose work is substandard?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "What do you do when you disagree with your manager's decision on a project?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "How would you motivate a team that is experiencing low morale during a difficult project?", correct: "[Open Answer] - Evaluated on Fluency and Tone" },
            { text: "Describe a situation where you had to learn a new technology quickly under pressure.", correct: "[Open Answer] - Evaluated on Fluency and Tone" }
        ],
        read_out: [
            { text: "Cloud computing provides on-demand availability of computer system resources.", correct: "Cloud computing provides on-demand availability of computer system resources." },
            { text: "A microservices architecture consists of a collection of small, autonomous services.", correct: "A microservices architecture consists of a collection of small, autonomous services." },
            { text: "Effective leadership is not about making speeches or being liked.", correct: "Effective leadership is not about making speeches or being liked." },
            { text: "Data privacy regulations require organisations to protect user information at all times.", correct: "Data privacy regulations require organisations to protect user information at all times." },
            { text: "Agile methodology emphasises iterative development and continuous feedback from stakeholders.", correct: "Agile methodology emphasises iterative development and continuous feedback from stakeholders." },
            { text: "Artificial intelligence is transforming industries by automating repetitive and complex tasks.", correct: "Artificial intelligence is transforming industries by automating repetitive and complex tasks." },
            { text: "Version control systems allow teams to collaborate on code without overwriting each other's changes.", correct: "Version control systems allow teams to collaborate on code without overwriting each other's changes." },
            { text: "The ability to adapt quickly to changing requirements is a highly valued skill in modern workplaces.", correct: "The ability to adapt quickly to changing requirements is a highly valued skill in modern workplaces." },
            { text: "Clear and concise documentation reduces onboarding time and improves team productivity significantly.", correct: "Clear and concise documentation reduces onboarding time and improves team productivity significantly." },
            { text: "Cross-functional collaboration between design, development, and business teams leads to better product outcomes.", correct: "Cross-functional collaboration between design, development, and business teams leads to better product outcomes." }
        ],
        retell_story: [
            { text: "A startup was struggling to find its market fit. After conducting interviews with 100 potential users, the team decided to pivot their product into a mobile application. Within just one month of launching the new app, they saw their revenue triple, proving that listening to user feedback was the key to their success.", correct: "[Story Retold] - Evaluated on Keywords" }
        ],
        speaking_situation: [
            { text: "You notice a colleague looking stressed and missing deadlines.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "A client is unhappy with the recent feature update.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "You are asked to take over a project midway with little documentation.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "Your team discovers a security vulnerability one day before the product launch.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "A junior team member made a mistake that caused data loss. How do you respond?", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "You are in a meeting and a colleague takes credit for your work in front of the manager.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "The client keeps changing requirements after development has already begun.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "Your manager assigns you a task that you believe is beyond your current skill level.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "Two team members are having a heated argument during a critical project phase.", correct: "[Situational Response] - Evaluated on Empathy and Action" },
            { text: "You are asked to present your project to the CEO with only 30 minutes of preparation.", correct: "[Situational Response] - Evaluated on Empathy and Action" }
        ],
        short_answer: [
            { text: "What is the past tense of 'run'?", correct: "ran" },
            { text: "Which punctuation mark is used to end a question?", correct: "question mark" },
            { text: "What do you call the person who manages a team?", correct: "manager" },
            { text: "What is the plural of 'criterion'?", correct: "criteria" },
            { text: "What word means the opposite of 'expand'?", correct: "contract" },
            { text: "What is the correct form: 'He doesn't' or 'He don't'?", correct: "he doesn't" },
            { text: "What is a synonym for the word 'collaborate'?", correct: "cooperate" },
            { text: "What is the noun form of the verb 'decide'?", correct: "decision" },
            { text: "In which tense is this sentence: 'She has completed the report'?", correct: "present perfect" },
            { text: "What do we call a formal letter sent to apply for a job?", correct: "cover letter" }
        ],
        sentence_building: [
            { words: ["project", "finished", "the", "he", "early"], correct: "he finished the project early" },
            { words: ["meeting", "scheduled", "is", "for", "tomorrow"], correct: "meeting is scheduled for tomorrow" },
            { words: ["report", "the", "please", "email", "me"], correct: "please email me the report" },
            { words: ["team", "the", "deadline", "missed", "project", "the"], correct: "the project team missed the deadline" },
            { words: ["updated", "software", "the", "been", "has"], correct: "the software has been updated" },
            { words: ["client", "feedback", "positive", "the", "gave"], correct: "the client gave positive feedback" },
            { words: ["manager", "review", "code", "asked", "the", "for"], correct: "the manager asked for code review" },
            { words: ["presentation", "impressive", "was", "the", "very"], correct: "the presentation was very impressive" },
            { words: ["issue", "escalate", "need", "we", "this", "to"], correct: "we need to escalate this issue" },
            { words: ["documentation", "clear", "write", "always"], correct: "always write clear documentation" }
        ],
        give_opinion: [
            { text: "Do you think remote work is more productive than office work?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "What is your opinion on using AI in software development?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Should companies prioritize experience over education?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Is it important for engineers to have good communication skills?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Do you believe that failure is an important part of professional growth?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Should freshers accept any job offer or wait for the right opportunity?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "What do you think is more important: technical skills or soft skills?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Is social media a useful tool for professional networking?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Do you think continuous learning is necessary throughout a career?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" },
            { text: "Should companies invest more in employee mental health support?", correct: "[Opinion Expressed] - Evaluated on Fluency and Vocabulary" }
        ],
        answer_questions: [
            { text: "What are your greatest professional strengths?", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "Where do you see yourself in five years?", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "Describe your ideal work environment.", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "Why should we hire you for this role?", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "Tell me about yourself in under two minutes.", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "What is your greatest weakness and how are you working on it?", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "Describe a challenging project you successfully completed.", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "How do you handle working under pressure and tight deadlines?", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "What motivates you to perform well in your work?", correct: "[Interview Answer] - Evaluated on Confidence" },
            { text: "Do you have any questions for us about the company or role?", correct: "[Interview Answer] - Evaluated on Confidence" }
        ],
        image_description: [
            { text: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80", correct: "[Image Described] - Evaluated on Descriptive Vocabulary" },
            { text: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", correct: "[Image Described] - Evaluated on Descriptive Vocabulary" },
            { text: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80", correct: "[Image Described] - Evaluated on Descriptive Vocabulary" },
            { text: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80", correct: "[Image Described] - Evaluated on Descriptive Vocabulary" },
            { text: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80", correct: "[Image Described] - Evaluated on Descriptive Vocabulary" },
            { text: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80", correct: "[Image Described] - Evaluated on Descriptive Vocabulary" }
        ]
    };

    let activeQuestions = [];

    function saveReportData(submodId, questionText, userAnswer, correctAnswer, isCorrect) {
        let reports = JSON.parse(localStorage.getItem('lsrw_reports') || '[]');
        reports.push({
            module: 'Speaking',
            submodule: submodId,
            question: questionText,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('lsrw_reports', JSON.stringify(reports));
    }

    render();

    function render() {
        if (currentStage === 'guidelines') renderGuidelines();
        else if (currentStage === 'menu') renderMenu();
        else if (currentStage === 'test') renderTest();
        else if (currentStage === 'result') renderResult();
        else if (currentStage === 'reports') renderReports();
    }

    function renderGuidelines() {
        container.innerHTML = `
            <div class="module-container mx-auto my-6 max-w-[520px]">
                <div class="card glass-card px-8 py-7">
                    <div class="mb-3 flex items-center gap-3">
                        <i data-lucide="mic" size="24" style="color:var(--warning);" class="flex-shrink-0"></i>
                        <h2 class="text-[1.35rem] text-bright">Speaking — Rules & Benefits</h2>
                    </div>
                    <p class="mb-5 text-[.85rem] leading-relaxed text-muted">
                        Build pronunciation and fluency through real-world exercises. Helps you lead meetings and communicate professionally.
                    </p>

                    <div class="mb-4 rounded-[10px] border border-[rgba(248,113,113,.25)] bg-[var(--error-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-error"><i data-lucide="alert-circle" size="14"></i> BEFORE</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Sit in a quiet, well-lit location.</li>
                            <li>Stable internet connection required.</li>
                            <li>Ensure sufficient battery on your device.</li>
                            <li>Turn off unused Bluetooth devices.</li>
                        </ul>
                    </div>

                    <div class="mb-[1.4rem] rounded-[10px] border border-[rgba(251,191,36,.25)] bg-[var(--warning-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-warning"><i data-lucide="alert-triangle" size="14"></i> DURING</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Built-in mic: 35–45 cm; headset: 3–5 cm from mouth.</li>
                            <li>Earphones without dedicated mic are not allowed.</li>
                            <li>No notes. Cannot pause the test.</li>
                            <li>Silence all notifications and calls.</li>
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
            <div class="card ${mod.available ? 'glass-card hover-lift cursor-pointer' : 'opacity-50 grayscale'} border border-line p-8" ${mod.available ? `onclick="window.startSpeakingSubmodule('${mod.id}')"` : ''}>
                <h3 class="mb-2 text-bright">${mod.title}</h3>
                <p class="mb-4 text-[.9rem] text-muted">${mod.desc}</p>
                <div class="mb-4 rounded-lg bg-[var(--success-subtle)] p-2 text-[.85rem] text-success">
                    <strong>Benefit:</strong> ${mod.benefits}
                </div>
                ${mod.available ? `
                    <div class="mt-4 flex gap-4">
                        <span class="badge badge-success">${mod.qCount} Question${mod.qCount !== 1 ? 's' : ''}</span>
                        <button type="button" class="btn btn-outline px-[.8rem] py-[.3rem] text-[.8rem]" onclick="event.stopPropagation(); window.viewSpeakingReports('${mod.id}')">Reports</button>
                    </div>
                ` : `<span class="badge badge-warning">Coming Soon</span>`}
            </div>
        `).join('');

        container.innerHTML = `
            <div class="module-container mx-auto max-w-[1200px] animate-slide-up">
                <div class="mb-8 flex items-center justify-between">
                    <h2 class="flex items-center gap-4 text-[2rem]"><i data-lucide="mic" style="color:var(--warning);"></i> Select Speaking Submodule</h2>
                    <button type="button" class="btn btn-outline gap-[.4rem]" onclick="window.location.reload()"><i data-lucide="arrow-left" size="15"></i> Back to Dashboard</button>
                </div>
                <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                    ${gridHtml}
                </div>
            </div>
        `;

        lucide.createIcons();

        window.startSpeakingSubmodule = (id) => {
            currentSubmodule = submodules.find(s => s.id === id);
            const qCount = currentSubmodule.qCount || 3;
            activeQuestions = [...databanks[id]].sort(() => 0.5 - Math.random()).slice(0, qCount);
            currentQuestionIndex = 0;
            correctAnswers = 0;
            currentStage = 'test';
            render();
        };

        window.viewSpeakingReports = (id) => {
            currentSubmodule = submodules.find(s => s.id === id);
            currentStage = 'reports';
            render();
        }
    }

    function renderTest() {
        const q = activeQuestions[currentQuestionIndex];
        playCount = 0;
        
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[800px] animate-fade-in">
                <div class="mb-8 flex justify-between">
                    <span class="badge badge-primary">${currentSubmodule.title}</span>
                    <span class="text-muted">Question ${currentQuestionIndex + 1} of ${activeQuestions.length}</span>
                </div>

                <div class="card glass-card border border-line p-12 text-center max-[640px]:p-6">
                    <h3 class="mb-8 text-bright" id="test-instruction"></h3>

                    <div id="test-content" class="mb-8 flex min-h-[100px] items-center justify-center text-[1.4rem] text-muted"></div>

                    <div id="audio-controls" style="display: none;" class="mb-8">
                        <button id="play-btn" type="button" class="btn btn-primary px-8 py-4">▶ Play Audio</button>
                        <p id="play-limit" class="mt-4 text-[.9rem] text-error" role="status" aria-live="polite">Plays remaining: 2</p>
                    </div>

                    <div id="prep-timer-container" style="display: none;" class="mb-8">
                        <p class="mb-2 text-warning">Preparation Time</p>
                        <h2 id="prep-timer" class="text-[3rem] [font-variant-numeric:tabular-nums]">--</h2>
                    </div>

                    <div id="record-container" style="display: none;" class="mb-8">
                        <p class="mb-2 animate-pulse font-bold text-error">RECORDING IN PROGRESS</p>
                        <h2 id="record-timer" class="mb-4 text-[3rem] [font-variant-numeric:tabular-nums]">--</h2>
                        <div class="mb-6">
                            <i data-lucide="mic" size="48" style="color:var(--error);"></i>
                        </div>
                        <div class="mb-2 text-[.7rem] font-bold uppercase tracking-[.08em] text-muted">Live Transcript</div>
                        <div id="live-transcript" class="min-h-[80px] rounded-[10px] border-[1.5px] border-[rgba(114,99,243,0.3)] bg-[rgba(114,99,243,0.08)] p-5 text-[1rem] italic leading-[1.6] text-bright transition-all" aria-live="polite">Listening… speak clearly into your microphone.</div>
                        <div id="speech-support-msg" style="display:none;" class="mt-2 text-[.75rem] text-warning">⚠ Speech recognition not supported in this browser. Use Chrome for best results.</div>
                    </div>

                    <div id="test-action" style="display:none;">
                       <button id="next-btn" type="button" class="btn btn-success px-12 py-4">Submit & Next</button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        setupTestLogic(q);
    }

    function setupTestLogic(q) {
        const instruction = document.getElementById('test-instruction');
        const content = document.getElementById('test-content');
        const audioControls = document.getElementById('audio-controls');
        const playBtn = document.getElementById('play-btn');
        const playLimit = document.getElementById('play-limit');
        const prepContainer = document.getElementById('prep-timer-container');
        const recordContainer = document.getElementById('record-container');
        const actionContainer = document.getElementById('test-action');
        const nextBtn = document.getElementById('next-btn');

        let audioTextToPlay = "";
        let prepTime = 5;
        let recordTime = 60;
        let requiresAudioPlay = false;

        if (currentSubmodule.id === 'listen_repeat') {
            instruction.innerText = "Listen to the sentence and repeat it exactly.";
            requiresAudioPlay = true;
            audioTextToPlay = q.text;
            recordTime = 15;
            prepTime = 5;
        } else if (currentSubmodule.id === 'speak_out') {
            instruction.innerText = "Speak out about the following situation:";
            content.innerText = '"' + q.text + '"';
            prepTime = 10;
            recordTime = 60;
        } else if (currentSubmodule.id === 'read_out') {
            instruction.innerText = "Read the following paragraph out loud clearly:";
            content.innerText = q.text;
            prepTime = 10;
            recordTime = 45;
        } else if (currentSubmodule.id === 'retell_story') {
            instruction.innerText = "Listen to the story. Then retell it in your own words.";
            requiresAudioPlay = true;
            audioTextToPlay = q.text;
            prepTime = 5;
            recordTime = 60;
        } else if (currentSubmodule.id === 'speaking_situation') {
            instruction.innerText = "How would you handle this situation?";
            content.innerText = q.text;
            prepTime = 10;
            recordTime = 60;
        } else if (currentSubmodule.id === 'short_answer') {
            instruction.innerText = "Listen to the question and provide a short spoken answer.";
            requiresAudioPlay = true;
            audioTextToPlay = q.text;
            prepTime = 5;
            recordTime = 10;
        } else if (currentSubmodule.id === 'sentence_building') {
            instruction.innerText = "Rearrange the words to form a correct sentence and speak it out.";
            content.innerText = q.words.join(" / ");
            prepTime = 15;
            recordTime = 15;
        } else if (currentSubmodule.id === 'give_opinion') {
            instruction.innerText = "Give your opinion on the following topic:";
            content.innerText = q.text;
            prepTime = 15;
            recordTime = 60;
        } else if (currentSubmodule.id === 'answer_questions') {
            instruction.innerText = "Answer the following question clearly:";
            content.innerText = q.text;
            prepTime = 10;
            recordTime = 45;
        } else if (currentSubmodule.id === 'image_description') {
            instruction.innerText = "Describe what you see in this image:";
            content.innerHTML = `<img src="${q.text}" alt="Scene to describe aloud" class="max-h-[300px] max-w-full rounded-lg border border-line shadow-mid">`;
            prepTime = 15;
            recordTime = 60;
        }

        let currentTranscript = '';
        let interimTranscript = '';
        let recognition = null;

        const startRecording = async () => {
            prepContainer.style.display = 'none';
            recordContainer.style.display = 'block';
            actionContainer.style.display = 'block';
            
            const transcriptDisplay = document.getElementById('live-transcript');
            
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.continuous    = true;
                recognition.interimResults = true;
                recognition.lang           = 'en-US';

                recognition.onresult = (event) => {
                    interimTranscript = '';
                    let finalT = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) finalT += event.results[i][0].transcript;
                        else interimTranscript += event.results[i][0].transcript;
                    }
                    if (finalT) currentTranscript += finalT + ' ';
                    if (transcriptDisplay) {
                        const full = (currentTranscript + interimTranscript).trim();
                        transcriptDisplay.innerText = full || 'Listening… keep speaking.';
                        /* highlight interim text differently */
                        if (interimTranscript) transcriptDisplay.style.color = 'var(--text-muted)';
                        else transcriptDisplay.style.color = 'var(--text-bright)';
                    }
                };

                recognition.onerror = (e) => {
                    if (e.error === 'not-allowed') {
                        if (transcriptDisplay) transcriptDisplay.innerText = '⚠ Microphone permission denied. Please allow microphone access and reload.';
                    }
                };

                try { recognition.start(); } catch(e) { console.log(e); }
            } else {
                /* Browser does not support Web Speech API */
                const msg = document.getElementById('speech-support-msg');
                if (msg) msg.style.display = 'block';
                if (transcriptDisplay) transcriptDisplay.innerText = 'Speech recognition unavailable. Your answer will be submitted as empty — use Chrome for best results.';
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
            } catch(e) {
                console.log("No mic permission, simulating record.");
            }

            let rt = recordTime;
            document.getElementById('record-timer').innerText = rt.toString().padStart(2, '0');
            recordingTimer = setInterval(() => {
                rt--;
                document.getElementById('record-timer').innerText = rt.toString().padStart(2, '0');
                if (rt <= 0) {
                    clearInterval(recordingTimer);
                    finishRecording();
                }
            }, 1000);
        };

        const finishRecording = async () => {
            if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
            if (recordingTimer) clearInterval(recordingTimer);
            if (recognition) {
                try { recognition.stop(); } catch(e) {}
            }
            
            nextBtn.innerHTML = 'Evaluating <i data-lucide="loader" class="loader-icon"></i>';
            nextBtn.disabled = true;
            lucide.createIcons();

            const userSpoken = (currentTranscript + interimTranscript).trim();
            const targetText = q.correct || q.text;
            
            /* ── Improved speech accuracy scoring ── */
            const normalize = s => s.toLowerCase()
                .replace(/[.,/#!$%^&*;:{}=\-_`~()']/g, '')
                .replace(/\s{2,}/g, ' ').trim();

            const cleanUser   = normalize(userSpoken);
            const cleanTarget = normalize(q.correct || q.text);

            /* Word-level accuracy % (position-aware + fallback set match) */
            function speechAccuracy(spoken, target) {
                if (!spoken) return 0;
                if (spoken === target) return 100;
                if (spoken.includes(target) || target.includes(spoken)) return 92;
                const sw = spoken.split(' ');
                const tw = target.split(' ');
                let posMatch = 0, setMatch = 0;
                const swSet = new Set(sw);
                tw.forEach((w, i) => {
                    if (sw[i] === w) posMatch++;
                    else if (swSet.has(w)) setMatch++;
                });
                return Math.min(95, Math.round(((posMatch + setMatch * 0.6) / tw.length) * 100));
            }

            let isCorrect = false;
            let displayUserAns = userSpoken || "[No speech detected]";
            let accuracyPct = 0;

            if (['listen_repeat', 'read_out', 'sentence_building', 'short_answer'].includes(currentSubmodule.id)) {
                if (!cleanUser) {
                    displayUserAns = "[No speech captured — check microphone permissions]";
                } else {
                    accuracyPct = speechAccuracy(cleanUser, cleanTarget);
                    isCorrect   = accuracyPct >= 65;   /* ≥65% word match = correct */
                    displayUserAns = `You said: "${userSpoken}" — Accuracy: ${accuracyPct}%`;
                }
            } else {
                /* Open answers — use AI evaluation */
                if (cleanUser.length < 8) {
                    isCorrect = false;
                    displayUserAns = "[Response too short or no speech detected]";
                } else {
                    const aiRes = await evaluateWritingTask(
                        `You are evaluating a spoken response. The question/prompt was: "${q.text}". Rate the spoken answer for fluency, relevance, and professional tone.`,
                        userSpoken
                    );
                    isCorrect      = aiRes.score >= 45;
                    accuracyPct    = aiRes.score;
                    displayUserAns = `${userSpoken}\n\n[AI Score: ${aiRes.score}%]\nFeedback: ${aiRes.feedback}`;
                }
            }

            if (isCorrect) correctAnswers++; 
            
            // Save report
            let displayQ = q.text || q.words.join(" ");
            saveReportData(currentSubmodule.id, displayQ, displayUserAns, q.correct, isCorrect);
            
            currentQuestionIndex++;
            if (currentQuestionIndex >= activeQuestions.length) {
                currentStage = 'result';
                render();
            } else {
                renderTest();
            }
        };

        nextBtn.onclick = () => finishRecording();

        const startPrep = () => {
            audioControls.style.display = 'none';
            prepContainer.style.display = 'block';
            let pt = prepTime;
            document.getElementById('prep-timer').innerText = pt.toString().padStart(2, '0');

            const pTimer = setInterval(() => {
                pt--;
                document.getElementById('prep-timer').innerText = pt.toString().padStart(2, '0');
                if (pt <= 0) {
                    clearInterval(pTimer);
                    /* ── MANUAL MIC: show "Start Speaking" button instead of auto-starting ── */
                    prepContainer.innerHTML = `
                        <div class="py-4 text-center">
                            <p class="mb-4 text-[1.05rem] font-bold text-success">
                                ✅ Preparation time over. Ready to speak?
                            </p>
                            <button id="manual-start-btn" type="button" class="btn btn-success gap-[.6rem] rounded-[50px] px-10 py-[1.1rem] text-[1.05rem] shadow-[0_0_20px_rgba(34,209,139,0.35)]">
                                <i data-lucide="mic" size="20"></i> Enable Mic &amp; Start Speaking
                            </button>
                            <p class="mt-3 text-[.78rem] text-muted">
                                Click the button when you are ready. Recording will begin immediately.
                            </p>
                        </div>`;
                    lucide.createIcons();
                    document.getElementById('manual-start-btn').onclick = startRecording;
                }
            }, 1000);
        };

        if (requiresAudioPlay) {
            audioControls.style.display = 'block';
            playBtn.onclick = () => {
                if (playCount >= 2) return;
                playCount++;
                playLimit.innerText = `Plays remaining: ${2 - playCount}`;
                
                playBtn.disabled = true;
                const utterance = new SpeechSynthesisUtterance(audioTextToPlay);
                utterance.onend = () => {
                    playBtn.disabled = false;
                    if (playCount >= 2) {
                        playBtn.style.display = 'none';
                        startPrep();
                    }
                };
                window.speechSynthesis.speak(utterance);
            };
            
            const skipBtn = document.createElement('button');
            skipBtn.className = "btn btn-outline";
            skipBtn.innerText = "Ready to answer";
            skipBtn.style.marginTop = "1rem";
            skipBtn.style.marginLeft = "1rem";
            skipBtn.onclick = () => {
                window.speechSynthesis.cancel();
                startPrep();
            };
            audioControls.appendChild(skipBtn);

        } else {
            startPrep();
        }
    }

    function renderResult() {
        const finalScore = activeQuestions.length > 0 ? Math.floor((correctAnswers / activeQuestions.length) * 100) : 0;
        
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[600px] animate-slide-up">
                <div class="card glass-card border border-line p-16 text-center max-[640px]:p-8">
                    <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-subtle)] text-success">
                        <i data-lucide="check-circle" size="40"></i>
                    </div>
                    <h2 class="mb-4 text-[2.5rem]">Submodule Complete</h2>
                    <p class="mb-12 text-[1.2rem] text-muted">You have successfully finished the ${currentSubmodule.title} test.</p>

                    <div class="mb-12 rounded-2xl border border-line bg-elevated p-8">
                        <h3 class="mb-2 text-bright">Score</h3>
                        <div class="font-display text-[4rem] font-bold text-primary">${finalScore}%</div>
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
                await saveScore('speaking', finalScore, 100);
            } catch (e) { console.error(e); }
            currentStage = 'reports';
            render();
        };

        document.getElementById('exit-btn').onclick = async () => {
            try {
                await saveScore('speaking', finalScore, 100);
            } catch (e) { console.error(e); }
            window.location.reload();
        }
    }

    function renderReports() {
        const allReports = JSON.parse(localStorage.getItem('lsrw_reports') || '[]');
        const submodReports = allReports.filter(r => r.module === 'Speaking' && r.submodule === currentSubmodule.id);

        let reportsHtml = '<p class="text-muted">No attempts recorded for this submodule yet.</p>';

        if (submodReports.length > 0) {
            reportsHtml = submodReports.reverse().map(r => `
                <div class="mb-4 rounded-[12px] border border-line bg-elevated p-6 text-left">
                    <div class="mb-2 text-[.8rem] text-muted">${r.date}</div>
                    <div class="mb-4 font-medium text-bright">${r.question}</div>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between gap-4">
                            <span class="text-muted">Your Answer:</span>
                            <span class="text-right font-bold" style="color:${r.isCorrect ? 'var(--success)' : 'var(--error)'};">${r.userAnswer}</span>
                        </div>
                        <div class="flex justify-between gap-4">
                            <span class="text-muted">Ideal Answer/Feedback:</span>
                            <span class="text-right font-bold text-primary">${r.correctAnswer}</span>
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
