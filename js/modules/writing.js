/**
 * Business Writing Module - Dark Mode
 * Multiple Submodules: Summary, Typing, Dictation, Email, Passage Reconstruction
 */

import { saveScore } from '../api/scores.js';
import { evaluateWritingTask } from '../api/ai.js';

export async function startWriting(container) {
    
    const submodulesData = {
        summary: {
            title: "Summary & Opinion", icon: "file-text", color: "var(--primary)",
            description: "Read a provided paragraph and articulate your personal opinion on the topic.",
            instructions: [
                "A small paragraph will be displayed.",
                "You must write your opinion based on the paragraph.",
                "Your score will be evaluated based on context similarity and writing quality.",
                "There is 1 question per attempt."
            ],
            questions: [
                "Artificial Intelligence is rapidly transforming industries across the world by automating repetitive and time-consuming tasks. While this leads to increased efficiency and productivity, it also raises serious concerns about job displacement, particularly for workers in low-skill roles. Ethical questions around algorithmic bias, data privacy, and autonomous decision-making are becoming increasingly prominent in both government and corporate discussions. Regulators are struggling to create frameworks that keep pace with the speed of AI development. The challenge for society is to harness the potential of AI while building robust safeguards against its misuse and ensuring equitable distribution of its benefits.",

                "Climate change is one of the most pressing global challenges of the twenty-first century, with rising temperatures and extreme weather events becoming increasingly frequent and severe. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary drivers of these changes. The consequences include melting polar ice caps, rising sea levels, prolonged droughts, and disruptions to food systems. Urgent global cooperation is required to reduce carbon emissions and transition to renewable sources of energy. Every nation, corporation, and individual has a role to play in mitigating the impacts of climate change before the damage becomes irreversible.",

                "Remote work has fundamentally reshaped modern corporate culture in ways that were unimaginable just a decade ago. Companies have discovered that employees can be highly productive outside of traditional office environments, often reporting better work-life balance and reduced commute stress. However, remote work also creates new challenges, including difficulties in maintaining team cohesion, ensuring equitable access to resources, and preventing professional isolation. Communication gaps between remote and in-office employees can lead to misaligned expectations and missed opportunities for collaboration. As hybrid models become the new norm, organisations must invest in the right tools, policies, and culture to make distributed work genuinely effective for everyone.",

                "Social media platforms have fundamentally transformed how people consume news, share information, and engage with the world around them. While these platforms have democratised content creation and given marginalised voices a global stage, they have also created an environment where misinformation spreads faster than fact-checked reporting. Algorithms designed to maximise engagement often prioritise sensational or emotionally charged content over accurate information. This has contributed to the rise of echo chambers, polarisation, and declining trust in mainstream media institutions. Addressing this challenge requires a combination of platform responsibility, digital literacy education, and thoughtful regulation that protects free expression while reducing harm.",

                "The gig economy has grown explosively over the past decade, with platforms like ride-sharing services, freelance marketplaces, and food delivery apps creating new categories of work. On one hand, gig work offers unprecedented flexibility, allowing individuals to set their own schedules and pursue multiple income streams simultaneously. On the other hand, gig workers typically lack the job security, health benefits, pension contributions, and legal protections enjoyed by traditional employees. This has led to growing debates about the classification of gig workers and the responsibilities that platform companies bear towards them. Policymakers around the world are now grappling with how to create fair labour standards for this rapidly evolving sector.",

                "An increasing number of companies around the world are experimenting with four-day workweeks, with several large-scale trials producing encouraging early results. Employees who work fewer days tend to report lower stress levels, greater job satisfaction, and improved mental health outcomes. Productivity in many cases actually increases, as workers focus more intensely during their shorter working hours and take fewer sick days. Critics, however, argue that a four-day model may not be suitable for all industries, particularly those requiring continuous operations or face-to-face customer service. Ultimately, the success of shorter workweeks depends on careful implementation, strong management support, and a culture that values outcomes over hours worked.",

                "Data privacy has emerged as one of the defining issues of the digital age, as companies collect and monetise vast quantities of personal information with limited transparency or accountability. Citizens are increasingly aware that their browsing habits, purchase history, location data, and social interactions are being tracked and sold to third parties without their meaningful consent. Landmark regulations such as the General Data Protection Regulation in Europe have begun to address these concerns, giving individuals greater control over their data. However, enforcement remains inconsistent, and technological innovation continues to outpace regulatory frameworks. Building a trustworthy digital economy will require both stronger laws and a fundamental cultural shift in how organisations approach data stewardship.",

                "Electric vehicles are steadily gaining momentum as a sustainable alternative to conventional petrol and diesel cars, driven by falling battery costs, government incentives, and growing consumer awareness of climate change. Major automakers are investing billions in EV technology, and new models offering greater range and faster charging times are entering the market every year. Nevertheless, significant challenges remain, including concerns about the environmental impact of battery production and disposal, inadequate charging infrastructure in rural and developing regions, and the carbon footprint of electricity generation in countries still reliant on coal. The transition to electric mobility also has profound implications for the millions of workers employed in traditional automotive supply chains. Achieving a genuinely green transportation future will require coordinated action across industry, government, and civil society.",

                "Diversity, equity, and inclusion have become central pillars of modern organisational strategy, driven both by ethical imperatives and compelling business evidence. Research consistently demonstrates that diverse teams — in terms of gender, ethnicity, background, and thinking style — produce more creative solutions and make better decisions than homogeneous groups. However, achieving genuine inclusion requires more than simply hiring from a broader pool of candidates; it demands systemic changes to organisational culture, leadership behaviour, and career development processes. Many companies still face significant gaps between their stated commitments to diversity and the lived experiences of their employees from underrepresented groups. Bridging that gap requires sustained effort, transparent measurement, and genuine accountability at the highest levels of leadership.",

                "The mental health crisis among young professionals has reached alarming proportions, with burnout, anxiety, and depression becoming disturbingly common in high-pressure work environments. Long working hours, the blurring of work-life boundaries in the digital age, and intense performance expectations have created conditions that are fundamentally incompatible with sustainable wellbeing. Despite growing awareness, many organisations still treat mental health as a private matter rather than a workplace responsibility, leaving employees to manage crises largely on their own. Progressive companies are beginning to invest in employee assistance programmes, flexible scheduling, and psychologically safe cultures where people can speak openly about their struggles. However, meaningful progress will require nothing less than a fundamental rethinking of what it means to be a productive and healthy professional in the modern economy."
            ]
        },
        typing: {
            title: "Typing Test", icon: "keyboard", color: "var(--primary)",
            description: "Evaluate your typing speed and accuracy.",
            instructions: [
                "A paragraph will be visible on the screen.",
                "Type the paragraph exactly as shown.",
                "Your Words Per Minute (WPM) and accuracy (errors) will be calculated.",
                "There is 1 passage per attempt."
            ],
            questions: [
                "Programming is the process of creating a set of instructions that tell a computer how to perform a task. These instructions are written using specific programming languages such as Python, Java, or JavaScript. Each language has its own syntax and rules, but they all share the common goal of solving problems through logical thinking. Software engineers often spend as much time debugging existing code as they do writing new code. Mastering programming requires consistent practice, patience, and a genuine curiosity to understand how systems work.",

                "Effective communication is one of the most valuable skills a professional can develop in today's fast-paced workplace. It enables teams to collaborate efficiently, reduces the risk of costly misunderstandings, and builds trust between colleagues and clients. Clear communication means being able to express ideas concisely in writing, deliver presentations confidently, and listen actively when others are speaking. In a globalised business environment, professionals must also adapt their communication style to suit different cultures and contexts. Investing time in developing strong communication skills pays dividends throughout every stage of a career.",

                "The rapid advancement of technology over the past two decades has profoundly changed the way we live, work, and communicate. Entire industries have been disrupted by digital transformation, creating new opportunities while making some traditional roles obsolete. Professionals who embrace continuous learning and stay current with emerging technologies are far better positioned to thrive in this evolving landscape. Adaptability has become one of the most sought-after qualities in the modern workplace, valued alongside technical expertise and domain knowledge. Those who resist change risk being left behind in an increasingly competitive and technology-driven global economy.",

                "Version control systems such as Git are essential tools for modern software development teams. They allow developers to track every change made to a codebase, collaborate seamlessly across distributed teams, and roll back to stable versions when problems arise. Without version control, managing large codebases with multiple contributors would be chaotic and error-prone. Platforms such as GitHub and GitLab have built powerful collaboration features on top of Git, making code review, issue tracking, and project management more accessible. Understanding version control is now considered a fundamental skill for any developer entering the workforce.",

                "Critical thinking is the disciplined ability to analyse facts objectively, question assumptions, and evaluate evidence before arriving at a well-reasoned conclusion. In professional settings, critical thinkers are able to identify flaws in arguments, separate relevant information from noise, and propose solutions based on logic rather than intuition alone. This skill is particularly valuable in fast-moving environments where decisions must be made quickly and under pressure. Developing critical thinking requires regular practice, exposure to diverse perspectives, and a willingness to challenge one's own beliefs and biases. Organisations that cultivate a culture of critical thinking tend to make fewer costly mistakes and adapt more effectively to change.",

                "Customer satisfaction is the cornerstone of any successful business, regardless of its size or industry. When customers feel valued and receive products or services that meet or exceed their expectations, they are far more likely to remain loyal and recommend the brand to others. Companies that consistently prioritise the customer experience invest heavily in training their staff, gathering feedback, and resolving complaints quickly and professionally. In the digital age, a single negative review can spread rapidly and damage a company's reputation, making proactive customer service more important than ever. Organisations that truly put the customer at the centre of their operations tend to outperform their competitors over the long term.",

                "A well-structured resume is one of the most powerful tools in a job seeker's arsenal, capable of opening doors to interviews that might otherwise remain closed. Recruiters typically spend only a few seconds scanning each application, which means the resume must immediately communicate the candidate's most relevant skills and achievements. Using clear headings, bullet points, and action verbs helps to make the document easy to read and impactful. Tailoring the resume to each specific job description, rather than sending a generic document to every employer, significantly increases the chances of success. A professional resume does not just list duties; it quantifies achievements and demonstrates the tangible value the candidate has delivered in previous roles.",

                "Continuous integration and continuous deployment, commonly abbreviated as CI and CD, are practices that have transformed the way modern software teams develop and release products. CI involves automatically testing every code change as it is merged into the main branch, catching bugs early before they can affect production systems. CD extends this by automating the release process, allowing teams to deploy updates to users quickly, safely, and with minimal manual intervention. Together, these practices reduce risk, shorten the feedback loop between developers and users, and enable teams to iterate rapidly in response to changing requirements. Adopting CI and CD requires investment in automated testing and infrastructure but consistently delivers a strong return through improved quality and faster delivery.",

                "Leadership is not about holding authority or occupying a position of power; it is fundamentally about inspiring others to do their best work and move collectively towards a shared goal. Effective leaders communicate a clear and compelling vision, create an environment where people feel safe to take risks and share ideas, and recognise both individual and team contributions openly. They listen more than they speak, make decisions with both data and empathy, and hold themselves accountable to the same standards they set for others. Great leadership is developed through experience, reflection, and a genuine commitment to the growth of those around you. In today's complex and rapidly changing world, the organisations that succeed are almost invariably those with leaders who prioritise people as much as performance.",

                "Problem-solving is one of the most universally valued competencies in any professional environment, from entry-level roles to executive leadership. An effective problem-solver begins by clearly defining the issue rather than jumping immediately to solutions, because a well-framed problem is already half-solved. They then gather relevant data, identify the root cause rather than merely treating symptoms, and evaluate multiple potential solutions before deciding on the best course of action. Structured frameworks such as the five whys analysis, fishbone diagrams, and design thinking methodologies provide systematic approaches to tackling complex challenges. Professionals who combine analytical rigour with creative thinking and strong communication skills are the ones who consistently deliver the most impactful and durable solutions."
            ]
        },
        dictation: {
            title: "Dictation", icon: "headphones", color: "var(--warning)",
            description: "Listen to spoken words and type their correct spelling.",
            instructions: [
                "You will hear 3 words one by one.",
                "Type the spelling of each word.",
                "Ensure your sound is turned on.",
                "Evaluated at the end of the 3 questions."
            ],
            words: [
                'Accommodate', 'Embarrass', 'Fluorescent', 'Millennium', 'Privilege',
                'Separate', 'Unnecessary', 'Vacuum', 'Conscious', 'Entrepreneur',
                'Liaison', 'Occurrence', 'Commitment', 'Recommendation', 'Achievement',
                'Questionnaire', 'Miscellaneous', 'Maintenance', 'Harassment', 'Correspondence',
                'Acquaintance', 'Perseverance', 'Bureaucracy', 'Committee', 'Thoroughly',
                'Competent', 'Excellence', 'Appropriate', 'Collaboration', 'Proficiency'
            ]
        },
        email: {
            title: "Email Writing", icon: "mail", color: "var(--success)",
            description: "Draft a professional email based on a specific scenario.",
            instructions: [
                "You will be given a scenario.",
                "Fill in the Subject, Body, and Signature.",
                "You have 5 minutes to complete the email.",
                "There is 1 question per attempt."
            ],
            questions: [
                "Write an email to your Headmaster requesting permission to conduct a cultural event in the college auditorium.",
                "Write an email to your project manager requesting a two-day leave due to a family emergency.",
                "Write an email to a client apologizing for the delay in delivering the software update.",
                "Write an email to a recruiter thanking them for the interview and reiterating your interest in the position.",
                "Write an email to your team announcing a change in the project deadline and the revised timeline.",
                "Write an email to HR requesting clarification on the company's work-from-home policy.",
                "Write an email to a vendor following up on a quotation that was promised two weeks ago.",
                "Write an email to your manager proposing a new process improvement idea for the team's workflow.",
                "Write an email to a colleague who is leaving the company, wishing them well and summarising your experience working together.",
                "Write an email to your client providing a weekly status update on the ongoing software development project."
            ]
        },
        reconstruction: {
            title: "Passage Reconstruction", icon: "refresh-cw", color: "var(--error)",
            description: "Rearrange a jumbled text into a coherent passage.",
            instructions: [
                "You will see a text with jumbled words/sentences.",
                "Rearrange and type the full passage correctly.",
                "There is 1 question per attempt."
            ],
            questions: [
                { original: "The sun was shining brightly. Birds were singing in the trees. We decided to go for a picnic.", jumbled: "trees. the in singing were Birds brightly. shining was sun The picnic. a for go to decided We" },
                { original: "Learning to code opens many doors. It enhances problem solving skills. Anyone can learn with practice.", jumbled: "doors. many opens code to Learning skills. solving problem enhances It practice. with learn can Anyone" },
                { original: "Teamwork makes the dream work. Collaboration leads to better results. Always support your peers.", jumbled: "results. better to leads Collaboration work. dream the makes Teamwork peers. your support Always" },
                { original: "Communication is the foundation of every successful relationship. It builds trust and mutual understanding. Without it, even the best teams fail.", jumbled: "understanding. mutual and trust builds It relationship. successful every of foundation the is Communication fail. teams best the even it, Without" },
                { original: "Set clear goals every morning. Review your progress each evening. Adjust your plan as needed.", jumbled: "evening. each progress your Review morning. every goals clear Set needed. as plan your Adjust" },
                { original: "Innovation thrives in inclusive environments. Diverse perspectives lead to creative solutions. Companies must prioritise diversity to stay competitive.", jumbled: "solutions. creative to lead perspectives Diverse environments. inclusive in thrives Innovation competitive. stay to diversity prioritise must Companies" },
                { original: "Read widely to expand your vocabulary. Practice writing daily to build fluency. Feedback from others accelerates improvement.", jumbled: "fluency. build to daily writing Practice vocabulary. your expand to widely Read improvement. accelerates others from Feedback" },
                { original: "Data tells a story. Learn to read it critically. Insights from data drive better business decisions.", jumbled: "critically. it read to Learn story. a tells Data decisions. business better drive data from Insights" }
            ]
        }
    };

    let currentStage = 'guidelines';
    
    render();

    function render() {
        if (currentStage === 'guidelines') renderGuidelines();
        else if (currentStage === 'menu') renderMenu();
    }

    function renderGuidelines() {
        container.innerHTML = `
            <div class="module-container mx-auto my-6 max-w-[520px]">
                <div class="card glass-card px-8 py-7">
                    <div class="mb-3 flex items-center gap-3">
                        <i data-lucide="pen-tool" size="24" style="color:var(--error);" class="flex-shrink-0"></i>
                        <h2 class="text-[1.35rem] text-bright">Writing — Rules</h2>
                    </div>
                    <p class="mb-5 text-[.85rem] leading-relaxed text-muted">
                        Evaluates professional communication, typing speed, listening accuracy, and cognitive reconstruction through realistic business tasks.
                    </p>

                    <div class="mb-4 rounded-[10px] border border-[rgba(248,113,113,.25)] bg-[var(--error-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-error"><i data-lucide="alert-circle" size="14"></i> BEFORE</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Ensure keyboard is functioning properly.</li>
                            <li>Stable internet connection required.</li>
                            <li>Sound on — dictation requires audio.</li>
                            <li>Sufficient device battery.</li>
                        </ul>
                    </div>

                    <div class="mb-[1.4rem] rounded-[10px] border border-[rgba(251,191,36,.25)] bg-[var(--warning-subtle)] p-4">
                        <h4 class="mb-[.6rem] flex items-center gap-[.4rem] text-[.8rem] text-warning"><i data-lucide="alert-triangle" size="14"></i> DURING</h4>
                        <ul class="list-disc pl-5 text-[.83rem] leading-[1.75] text-muted">
                            <li>Do not switch tabs or windows.</li>
                            <li>Observe strict time limits carefully.</li>
                            <li>Screenshots and recordings not allowed.</li>
                            <li>Cannot pause. Silence notifications.</li>
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
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[1200px] animate-slide-up">
                <div class="mb-8 flex items-center justify-between">
                    <h2 class="flex items-center gap-4 text-[2rem]"><i data-lucide="pen-tool" style="color:var(--error);"></i> Select Writing Submodule</h2>
                    <button type="button" class="btn btn-outline gap-[.4rem]" onclick="window.location.reload()"><i data-lucide="arrow-left" size="15"></i> Back to Dashboard</button>
                </div>

                <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
                    <div class="card card-hover submodule-card cursor-pointer p-6 text-center" data-sub="summary" role="button" tabindex="0" aria-label="Summary and Opinion">
                        <i data-lucide="file-text" size="32" style="color:var(--primary);" class="mb-4"></i>
                        <h4 class="mb-2">Summary & Opinion</h4>
                        <p class="text-[.8rem] text-muted">Read a paragraph and write your opinion.</p>
                    </div>
                    <div class="card card-hover submodule-card cursor-pointer p-6 text-center" data-sub="typing" role="button" tabindex="0" aria-label="Typing test">
                        <i data-lucide="keyboard" size="32" style="color:var(--primary);" class="mb-4"></i>
                        <h4 class="mb-2">Typing</h4>
                        <p class="text-[.8rem] text-muted">Type the visible paragraph to evaluate WPM.</p>
                    </div>
                    <div class="card card-hover submodule-card cursor-pointer p-6 text-center" data-sub="dictation" role="button" tabindex="0" aria-label="Dictation">
                        <i data-lucide="headphones" size="32" style="color:var(--warning);" class="mb-4"></i>
                        <h4 class="mb-2">Dictation</h4>
                        <p class="text-[.8rem] text-muted">Listen to words and type spellings.</p>
                    </div>
                    <div class="card card-hover submodule-card cursor-pointer p-6 text-center" data-sub="email" role="button" tabindex="0" aria-label="Email writing">
                        <i data-lucide="mail" size="32" style="color:var(--success);" class="mb-4"></i>
                        <h4 class="mb-2">Email Writing</h4>
                        <p class="text-[.8rem] text-muted">Draft professional emails based on scenarios.</p>
                    </div>
                    <div class="card card-hover submodule-card cursor-pointer p-6 text-center" data-sub="reconstruction" role="button" tabindex="0" aria-label="Passage reconstruction">
                        <i data-lucide="refresh-cw" size="32" style="color:var(--error);" class="mb-4"></i>
                        <h4 class="mb-2">Passage Reconstruction</h4>
                        <p class="text-[.8rem] text-muted">Rearrange jumbled sentences.</p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        
        document.querySelectorAll('.submodule-card').forEach(card => {
            const open = () => showSubmoduleIntro(card.dataset.sub);
            card.onclick = open;
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        });
    }

    function showSubmoduleIntro(subId) {
        const info = submodulesData[subId];
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[800px] animate-fade-in">
                <button type="button" class="btn btn-outline mb-8" id="back-to-writing">
                    <i data-lucide="arrow-left" size="18"></i> Back
                </button>

                <div class="card glass-card p-12 text-center max-[640px]:p-6">
                    <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                        <i data-lucide="${info.icon}" size="40" style="color:${info.color};"></i>
                    </div>
                    <h2 class="mb-4 font-display text-[2.5rem] text-bright">${info.title}</h2>
                    <p class="mb-8 text-[1.1rem] leading-relaxed text-muted">${info.description}</p>

                    <div class="mb-8 rounded-2xl border border-line bg-elevated p-6 text-left">
                        <h4 class="mb-4 text-bright">Instructions:</h4>
                        <ul class="list-disc pl-6 text-[.95rem] leading-relaxed text-muted">
                            ${info.instructions.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>

                    <button type="button" class="btn btn-primary px-12 py-4 text-[1.1rem]" id="start-submodule-btn">
                        Start Assessment <i data-lucide="play" size="18"></i>
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('back-to-writing').onclick = renderMenu;
        document.getElementById('start-submodule-btn').onclick = () => startSubmoduleExecution(subId);
    }

    function startSubmoduleExecution(subId) {
        if(subId === 'summary') runSummaryOpinion();
        else if(subId === 'typing') runTypingTest();
        else if(subId === 'dictation') runDictationTest();
        else if(subId === 'email') runEmailTest();
        else if(subId === 'reconstruction') runReconstructionTest();
    }

    // ========== RESULT DASHBOARD ========== //
    function showResultsDashboard(score, maxScore, detailsHtml) {
        // Save score to DB
        saveScore('writing', score, maxScore).catch(console.error);

        container.innerHTML = `
            <div class="module-container mx-auto max-w-[800px] animate-slide-up">
                <div class="card glass-card p-16 text-center max-[640px]:p-8">
                    <h2 class="mb-4 font-display text-[3rem] text-bright">Assessment Complete</h2>
                    <div class="mx-auto my-8 flex h-[150px] w-[150px] items-center justify-center rounded-full border-[10px] border-elevated font-display text-[3rem] font-black text-primary shadow-[0_0_30px_var(--primary-glow)]" style="border-top-color:var(--primary);">
                        ${Math.round((score/maxScore)*100)}%
                    </div>

                    <div class="mb-12 rounded-2xl border border-line bg-elevated p-8 text-left">
                        <h4 class="mb-4 border-b border-line pb-2 text-bright">Performance Details</h4>
                        <div class="text-[1rem] leading-relaxed text-muted">
                            ${detailsHtml}
                        </div>
                    </div>

                    <div class="flex justify-center gap-4 max-[640px]:flex-col">
                        <button type="button" class="btn btn-outline" id="back-to-modules">
                            <i data-lucide="grid" size="18"></i> More Submodules
                        </button>
                        <button type="button" class="btn btn-primary" id="back-to-main">
                            <i data-lucide="arrow-left" size="18"></i> Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('back-to-modules').onclick = renderMenu;
        document.getElementById('back-to-main').onclick = () => window.location.reload();
    }

    // ========== SUBMODULE: SUMMARY & OPINION ========== //
    function runSummaryOpinion() {
        const questions = submodulesData.summary.questions;
        const p = questions[Math.floor(Math.random() * questions.length)];
        
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[900px] animate-fade-in">
                <div class="mb-8 flex justify-between">
                    <h3 class="text-[1.5rem]">Summary & Opinion</h3>
                    <span class="badge badge-primary">1 Question</span>
                </div>
                <div class="card glass-card mb-8 p-8">
                    <h4 class="mb-4 text-muted">Read this paragraph:</h4>
                    <p class="rounded-[12px] border-l-4 border-primary bg-elevated p-6 text-[1.1rem] leading-relaxed text-bright">${p}</p>
                </div>
                <div class="card glass-card p-8">
                    <label for="opinion-input" class="mb-4 block text-muted">Write your opinion:</label>
                    <textarea id="opinion-input" class="input-field mb-4 min-h-[200px] w-full resize-y" placeholder="Type your opinion here..."></textarea>
                    <div class="text-right">
                        <button type="button" class="btn btn-primary" id="submit-btn">Submit Analysis <i data-lucide="send" size="18"></i></button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        document.getElementById('submit-btn').onclick = async () => {
            const btn = document.getElementById('submit-btn');
            btn.innerHTML = 'Evaluating with AI... <i data-lucide="loader" class="loader-icon"></i>';
            btn.disabled = true;
            lucide.createIcons();

            const text = document.getElementById('opinion-input').value.trim();
            const words = text.split(/\s+/).filter(w => w.length > 0).length;
            
            const result = await evaluateWritingTask(`Read this paragraph and write your opinion on it: "${p}"`, text);
            
            showResultsDashboard(result.score, 100, `
                <p><strong>Words Written:</strong> ${words}</p>
                <p><strong>AI Evaluation:</strong> ${result.score}/100</p>
                <p style="margin-top: 1rem; color: var(--primary);"><strong>Feedback:</strong> ${result.feedback}</p>
            `);
        };
    }

    // ========== SUBMODULE: TYPING ========== //
    function runTypingTest() {
        const questions = submodulesData.typing.questions;
        const p = questions[Math.floor(Math.random() * questions.length)];
        
        let startTime = null;
        
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[900px] animate-fade-in">
                <div class="mb-8 flex justify-between">
                    <h3 class="text-[1.5rem]">Typing Test</h3>
                    <span class="badge badge-primary">Evaluate WPM</span>
                </div>
                <div class="card glass-card mb-8 p-8">
                    <h4 class="mb-4 text-muted">Type the following paragraph:</h4>
                    <p class="select-none text-[1.1rem] leading-relaxed text-bright">${p}</p>
                </div>
                <div class="card glass-card p-8">
                    <label for="typing-input" class="sr-only">Type the paragraph</label>
                    <textarea id="typing-input" class="input-field mb-4 min-h-[150px] w-full resize-y" placeholder="Start typing here... Timer starts on first keypress."></textarea>
                    <div class="text-right">
                        <button type="button" class="btn btn-primary" id="submit-btn">Finish Typing <i data-lucide="check" size="18"></i></button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        const input = document.getElementById('typing-input');
        input.addEventListener('input', () => {
            if(!startTime) startTime = new Date();
        });
        
        document.getElementById('submit-btn').onclick = () => {
            const endTime = new Date();
            const timeTaken = startTime ? (endTime - startTime) / 1000 / 60 : 0; // in minutes
            const text = input.value.trim();
            const originalWords = p.split(/\s+/);
            const typedWords = text.split(/\s+/).filter(w => w.length > 0);
            
            let errors = 0;
            originalWords.forEach((ow, i) => {
                if(typedWords[i] !== ow) errors++;
            });
            if(typedWords.length < originalWords.length) {
                errors += (originalWords.length - typedWords.length);
            }
            
            const wpm = timeTaken > 0 ? Math.round((typedWords.length / timeTaken)) : 0;
            let score = Math.max(0, 100 - (errors * 10)); // Strict: 10 points off per error
            if(wpm < 40) score = Math.max(0, score - 50); // Strict: Must meet 40 WPM or huge penalty
            score = Math.max(0, Math.min(100, score));
            
            showResultsDashboard(score, 100, `
                <p><strong>Words Per Minute (WPM):</strong> ${wpm}</p>
                <p><strong>Errors:</strong> ${errors}</p>
                <p><strong>Time Taken:</strong> ${timeTaken > 0 ? (timeTaken * 60).toFixed(1) + ' seconds' : 'N/A'}</p>
            `);
        };
    }

    // ========== SUBMODULE: DICTATION ========== //
    function runDictationTest() {
        const allWords = [...submodulesData.dictation.words].sort(() => 0.5 - Math.random());
        const testWords = allWords.slice(0, 3);
        let currentIdx = 0;
        const answers = [];
        
        function renderWord() {
            if (currentIdx >= 3) {
                let correct = 0;
                let details = '';
                testWords.forEach((w, i) => {
                    if(answers[i].toLowerCase() === w.toLowerCase()) {
                        correct++;
                        details += `<p class="mb-2">Word ${i+1}: <span class="text-success">${answers[i]}</span> (Correct)</p>`;
                    } else {
                        details += `<p class="mb-2">Word ${i+1}: <span class="text-error">${answers[i]}</span> (Incorrect, was <strong>${w}</strong>)</p>`;
                    }
                });
                const score = Math.round((correct / 3) * 100);
                showResultsDashboard(score, 100, details);
                return;
            }
            
            container.innerHTML = `
                <div class="module-container mx-auto max-w-[600px] animate-fade-in">
                    <div class="mb-8 flex justify-between">
                        <h3 class="text-[1.5rem]">Dictation</h3>
                        <span class="badge badge-warning">Word ${currentIdx + 1} of 3</span>
                    </div>
                    <div class="card glass-card p-12 text-center max-[640px]:p-6">
                        <button type="button" class="btn btn-outline mb-8 h-20 w-20 rounded-full" id="play-btn" aria-label="Play the word">
                            <i data-lucide="volume-2" size="32" style="color:var(--warning);"></i>
                        </button>
                        <p class="mb-6 text-muted">Click to listen, then type the spelling.</p>
                        <label for="word-input" class="sr-only">Type the spelling of the word you heard</label>
                        <input type="text" id="word-input" class="input-field mb-8 w-full text-center text-[1.5rem]" placeholder="Type here..." autocomplete="off">
                        <button type="button" class="btn btn-primary w-full" id="next-btn">
                            ${currentIdx === 2 ? 'Submit Assessment' : 'Next Word'} <i data-lucide="arrow-right" size="18"></i>
                        </button>
                    </div>
                </div>
            `;
            lucide.createIcons();
            
            document.getElementById('play-btn').onclick = () => {
                const utterance = new SpeechSynthesisUtterance(testWords[currentIdx]);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            };
            
            document.getElementById('next-btn').onclick = () => {
                const val = document.getElementById('word-input').value.trim();
                if(!val) {
                    alert("Please type a spelling.");
                    return;
                }
                answers.push(val);
                currentIdx++;
                renderWord();
            };
        }
        
        renderWord();
    }

    // ========== SUBMODULE: EMAIL WRITING ========== //
    function runEmailTest() {
        const questions = submodulesData.email.questions;
        const scenario = questions[Math.floor(Math.random() * questions.length)];
        
        let timeLeft = 300; // 5 minutes
        let timerInterval;
        
        function render() {
            container.innerHTML = `
                <div class="module-container mx-auto max-w-[900px] animate-fade-in">
                    <div class="mb-6 flex items-center justify-between">
                        <h3 class="text-[1.5rem]">Email Writing</h3>
                        <div class="font-display text-[1.5rem] font-bold text-error" id="timer-display" role="timer">05:00</div>
                    </div>

                    <div class="mb-8 rounded-lg border-l-4 border-success bg-[var(--success-subtle)] p-6">
                        <h4 class="mb-2 text-success">Scenario</h4>
                        <p class="leading-relaxed text-bright">${scenario}</p>
                    </div>

                    <div class="card glass-card p-8">
                        <div class="input-group">
                            <label for="email-subject">Subject</label>
                            <input type="text" id="email-subject" class="input-field" placeholder="Brief subject line...">
                        </div>
                        <div class="input-group">
                            <label for="email-body">Body</label>
                            <textarea id="email-body" class="input-field min-h-[200px] resize-y" placeholder="Dear..."></textarea>
                        </div>
                        <div class="input-group">
                            <label for="email-sig">Signature</label>
                            <input type="text" id="email-sig" class="input-field" placeholder="Best regards, ...">
                        </div>

                        <div class="mt-8 text-right">
                            <button type="button" class="btn btn-primary" id="submit-btn">Send Email <i data-lucide="send" size="18"></i></button>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            
            timerInterval = setInterval(() => {
                timeLeft--;
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                const td = document.getElementById('timer-display');
                if(td) td.innerText = `${m}:${s}`;
                
                if(timeLeft <= 0) {
                    clearInterval(timerInterval);
                    submitEmail();
                }
            }, 1000);
            
            document.getElementById('submit-btn').onclick = async () => {
                clearInterval(timerInterval);
                await submitEmail();
            };
        }
        
        async function submitEmail() {
            const btn = document.getElementById('submit-btn');
            btn.innerHTML = 'Evaluating with AI... <i data-lucide="loader" class="loader-icon"></i>';
            btn.disabled = true;
            lucide.createIcons();

            const sub = document.getElementById('email-subject').value.trim();
            const body = document.getElementById('email-body').value.trim();
            const sig = document.getElementById('email-sig').value.trim();
            
            const fullEmail = `Subject: ${sub}\n\n${body}\n\n${sig}`;
            
            const result = await evaluateWritingTask(`Write an email for the following scenario: "${scenario}"`, fullEmail);
            
            showResultsDashboard(result.score, 100, `
                <p><strong>Subject Included:</strong> ${sub.length > 0 ? 'Yes' : 'No'}</p>
                <p><strong>Signature Included:</strong> ${sig.length > 0 ? 'Yes' : 'No'}</p>
                <p><strong>AI Evaluation:</strong> ${result.score}/100</p>
                <p style="margin-top: 1rem; color: var(--primary);"><strong>Feedback:</strong> ${result.feedback}</p>
            `);
        }
        
        render();
    }

    // ========== SUBMODULE: PASSAGE RECONSTRUCTION ========== //
    function runReconstructionTest() {
        const questions = submodulesData.reconstruction.questions;
        const q = questions[Math.floor(Math.random() * questions.length)];
        
        container.innerHTML = `
            <div class="module-container mx-auto max-w-[900px] animate-fade-in">
                <div class="mb-8 flex justify-between">
                    <h3 class="text-[1.5rem]">Passage Reconstruction</h3>
                    <span class="badge badge-error">1 Question</span>
                </div>

                <div class="card glass-card mb-8 p-8">
                    <h4 class="mb-4 text-muted">Jumbled Passage:</h4>
                    <p class="rounded-[12px] border border-[rgba(255,69,58,0.2)] bg-[rgba(255,69,58,0.1)] p-6 text-[1.2rem] leading-relaxed text-error">${q.jumbled}</p>
                </div>

                <div class="card glass-card p-8">
                    <label for="recon-input" class="mb-4 block text-muted">Reconstruct the passage below:</label>
                    <textarea id="recon-input" class="input-field mb-4 min-h-[150px] w-full resize-y" placeholder="Type the correct passage here..."></textarea>
                    <div class="text-right">
                        <button type="button" class="btn btn-primary" id="submit-btn">Submit Reconstruction <i data-lucide="check" size="18"></i></button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        
        document.getElementById('submit-btn').onclick = () => {
            const text = document.getElementById('recon-input').value.trim();
            const normOriginal = q.original.toLowerCase().replace(/\s+/g, ' ').trim();
            const normText     = text.toLowerCase().replace(/\s+/g, ' ').trim();

            let score = 0;
            if (normOriginal === normText) {
                score = 100;
            } else {
                // Partial credit: word-overlap (60%) + positional match (40%)
                const origWords = normOriginal.split(' ');
                const userWords = normText.split(' ');
                const pool = [...origWords];
                let wordMatches = 0;
                userWords.forEach(w => {
                    const idx = pool.indexOf(w);
                    if (idx !== -1) { wordMatches++; pool.splice(idx, 1); }
                });
                let seqMatches = 0;
                for (let i = 0; i < Math.min(origWords.length, userWords.length); i++) {
                    if (origWords[i] === userWords[i]) seqMatches++;
                }
                const overlapScore = (wordMatches / origWords.length) * 60;
                const seqScore     = (seqMatches  / origWords.length) * 40;
                score = Math.round(Math.min(95, overlapScore + seqScore)); // cap at 95 for non-perfect
            }

            showResultsDashboard(score, 100, `
                <p><strong>Your Input:</strong> ${text || '(empty)'}</p>
                <p style="margin-top: 0.5rem;"><strong>Correct Passage:</strong> ${q.original}</p>
                <p style="margin-top: 0.5rem;"><strong>Score:</strong> ${score}% — ${score === 100 ? 'Perfect match!' : score >= 70 ? 'Good reconstruction.' : 'Keep practising.'}</p>
            `);
        };
    }
}
