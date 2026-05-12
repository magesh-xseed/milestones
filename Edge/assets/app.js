        const appPages = Object.freeze({
            home: 'index.html',
            teacherBlocks: 'teacher-blocks.html',
            parentBlocks: 'parent-blocks.html',
            teacherLessonDetail: 'teacher-lesson-detail.html',
            parentLessonPlan: 'parent-lesson-plan.html',
            communication: 'communication.html',
            learnometer: 'learnometer.html',
            profile: 'profile.html',
            frontOffice: 'front-office.html',
            practiceGym: 'practice-gym.html'
        });

        const bodyDataset = document.body?.dataset || {};
        const APP_BOOT = {
            pageTitle: bodyDataset.pageTitle || document.title,
            initialTab: bodyDataset.initialTab || 'Teacher Lesson Plan',
            activeNavTitle: bodyDataset.activeNavTitle || bodyDataset.initialTab || '',
            initialHash: bodyDataset.initialHash || ''
        };

        function getNavItemClass(title, isMobile = false) {
            const isActive = APP_BOOT.activeNavTitle === title;
            const baseClass = isMobile
                ? 'nav-button focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-semibold tracking-wide transition-all duration-300'
                : 'nav-button focus-ring flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 text-xs font-semibold tracking-wide';
            const activeClass = ' active bg-white text-wine shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]';
            const inactiveClass = isMobile
                ? ' text-[#6D5D5A] hover:bg-white hover:text-wine'
                : ' text-[#6D5D5A] hover:text-wine';
            return `${baseClass}${isActive ? activeClass : inactiveClass}`;
        }

        function renderAppShell() {
            document.title = APP_BOOT.pageTitle;
            document.body.className = 'overflow-x-hidden antialiased selection:bg-[#A41034]/10';
            document.body.innerHTML = `
    <div class="orb top-[-10%] right-[-5%] h-[400px] w-[400px] bg-[#f59138]"></div>
    <div class="orb bottom-[-5%] left-[-5%] h-[300px] w-[300px] bg-[#A41034]"></div>

    <header class="sticky top-0 z-50 w-full border-b border-wine-5 bg-white px-6 backdrop-blur-xl md:px-12">
        <div class="mx-auto flex h-24 max-w-[1600px] items-center justify-between">
            <a href="${appPages.home}" class="focus-ring flex items-center" aria-label="SuperTeacher Edge home">
                <img src="assets/st-edge-logo4.png" alt="SuperTeacher Edge" class="h-14 w-auto object-contain">
            </a>

            <nav class="hidden items-center rounded-[2rem] border border-wine-5 bg-amber-light p-1.5 lg:flex" aria-label="Primary navigation">
                <a href="${appPages.home}" class="${getNavItemClass('Teacher Lesson Plan')}" data-nav-title="Teacher Lesson Plan"${APP_BOOT.activeNavTitle === 'Teacher Lesson Plan' ? ' aria-current="page"' : ''}>
                    <span>Teacher Lesson Plan</span>
                </a>
                <a href="${appPages.parentLessonPlan}" class="${getNavItemClass('Parent Lesson Plan')}" data-nav-title="Parent Lesson Plan"${APP_BOOT.activeNavTitle === 'Parent Lesson Plan' ? ' aria-current="page"' : ''}>
                    <span>Parent Lesson Plan</span>
                </a>
                <a href="${appPages.communication}" class="${getNavItemClass('Communication')}" data-nav-title="Communication"${APP_BOOT.activeNavTitle === 'Communication' ? ' aria-current="page"' : ''}>
                    <span>Communication</span>
                </a>
                <a href="${appPages.learnometer}" class="${getNavItemClass('Learnometer')}" data-nav-title="Learnometer"${APP_BOOT.activeNavTitle === 'Learnometer' ? ' aria-current="page"' : ''}>
                    <span>Learnometer</span>
                </a>
            </nav>

            <div class="flex items-center gap-6">
                <a href="${appPages.practiceGym}" id="practiceGymHeaderButton"
                    class="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-[#E9C9CD] bg-[#FFF7F4] px-4 text-[12px] font-bold text-[#BD1740] transition-all hover:border-[#BD1740]/30 hover:bg-[#BD1740] hover:text-white focus:outline-none"
                    aria-label="Open Practice Gym">
                    <i data-lucide="dumbbell" class="h-4 w-4"></i>
                    <span class="hidden sm:inline">Practice Gym</span>
                </a>
                <div class="relative shrink-0">
                    <button type="button" id="profileToggle"
                        class="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-wine text-sm font-bold tracking-wide text-white shadow-[0_2px_8px_rgba(164,16,52,0.25)] transition-all hover:shadow-[0_4px_16px_rgba(164,16,52,0.35)]"
                        aria-label="Open profile menu" aria-expanded="false">
                        RS
                    </button>
                    <div id="profileMenu"
                        class="profile-menu hidden absolute right-0 top-[calc(100%+10px)] z-[200] min-w-[210px] rounded-[14px] bg-white p-1.5 shadow-[0_8px_32px_rgba(26,18,16,0.12),0_1px_4px_rgba(26,18,16,0.06)] transition-all duration-200">
                        <div class="border-b border-[#f0ebe6] px-3.5 pb-3 pt-2.5">
                            <div class="text-sm font-bold text-[#1a1210]">Ravi Sharma</div>
                            <div class="mt-0.5 text-xs text-[#8a7968]">Teacher</div>
                        </div>
                        <div class="py-1.5">
                            <a href="${appPages.profile}" id="profileMenuProfileButton"
                                class="profile-menu-item block w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-[#1a1210] transition-colors">Profile</a>
                            <a href="${appPages.frontOffice}" id="profileMenuFrontOfficeButton"
                                class="profile-menu-item block w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-[#1a1210] transition-colors">Front Office</a>
                            <button type="button"
                                class="profile-menu-item w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-[#1a1210] transition-colors">Content Generation System</button>
                        </div>
                        <div class="border-t border-[#f0ebe6] pb-0.5 pt-1.5">
                            <button type="button"
                                class="profile-menu-item sign-out w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-wine transition-colors">Sign Out</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="focus-ring p-2 text-wine lg:hidden" id="menuToggle"
                    aria-label="Open navigation menu" aria-expanded="false">
                    <i data-lucide="menu" class="h-7 w-7"></i>
                </button>
            </div>
        </div>
        <nav id="mobileMenu" class="hidden border-t border-wine-5 pb-5 lg:hidden" aria-label="Mobile navigation">
            <div class="grid gap-2 rounded-[1.5rem] bg-amber-light p-2">
                <a href="${appPages.home}" class="${getNavItemClass('Teacher Lesson Plan', true)}" data-nav-title="Teacher Lesson Plan"${APP_BOOT.activeNavTitle === 'Teacher Lesson Plan' ? ' aria-current="page"' : ''}>
                    <i data-lucide="graduation-cap" class="h-4 w-4"></i>
                    <span>Teacher Lesson Plan</span>
                </a>
                <a href="${appPages.parentLessonPlan}" class="${getNavItemClass('Parent Lesson Plan', true)}" data-nav-title="Parent Lesson Plan"${APP_BOOT.activeNavTitle === 'Parent Lesson Plan' ? ' aria-current="page"' : ''}>
                    <i data-lucide="home" class="h-4 w-4"></i>
                    <span>Parent Lesson Plan</span>
                </a>
                <a href="${appPages.communication}" class="${getNavItemClass('Communication', true)}" data-nav-title="Communication"${APP_BOOT.activeNavTitle === 'Communication' ? ' aria-current="page"' : ''}>
                    <i data-lucide="message-square" class="h-4 w-4"></i>
                    <span>Communication</span>
                </a>
                <a href="${appPages.learnometer}" class="${getNavItemClass('Learnometer', true)}" data-nav-title="Learnometer"${APP_BOOT.activeNavTitle === 'Learnometer' ? ' aria-current="page"' : ''}>
                    <i data-lucide="line-chart" class="h-4 w-4"></i>
                    <span>Learnometer</span>
                </a>
            </div>
        </nav>
    </header>

    <main class="tab-panel max-w-[1280px] mx-auto px-6 py-8" data-tab-panel="Teacher Lesson Plan">
        <section id="curriculum-sections" class="space-y-[0.8rem]"></section>
    </main>

    <main class="tab-panel hidden max-w-[1280px] mx-auto px-4 py-4 sm:px-6" data-tab-panel="Communication">
        <aside id="communicationFilterToolbar"
            class="fixed bottom-20 left-4 right-4 z-40 hidden lg:bottom-auto lg:left-auto lg:right-4 lg:top-[calc(50%+1rem)] lg:-translate-y-1/2"
            aria-label="Filter announcements by grade"></aside>

        <section id="communicationFeed" class="mx-auto grid max-w-[760px] gap-4"></section>
        <div id="communicationFabRoot"></div>
        <div id="communicationModalRoot"></div>
    </main>

    <main class="tab-panel hidden max-w-[1280px] mx-auto px-6" data-tab-panel="Learnometer" id="learnometerPanel"></main>

    <main class="tab-panel hidden gym mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:py-7" data-tab-panel="Practice Test"
        id="practiceGymPanel">
        <div id="practiceGymRoot"></div>
    </main>

    <main class="tab-panel hidden mx-auto max-w-[960px] px-4 py-6 sm:px-5 lg:py-8" data-tab-panel="Profile"
        id="profilePanel">
        <div id="profileRoot"></div>
    </main>

    <main class="tab-panel hidden mx-auto max-w-[960px] px-4 py-6 sm:px-5 lg:py-8" data-tab-panel="Front Office"
        id="frontOfficePanel">
        <div id="frontOfficeRoot"></div>
    </main>

    <aside id="gradeToolbar"
        class="fixed bottom-20 left-4 right-4 z-40 hidden lg:bottom-auto lg:left-auto lg:right-4 lg:top-[calc(50%+1rem)] lg:-translate-y-1/2"
        aria-label="Quick navigation"></aside>
    <button id="toolbarToggle" type="button"
        class="focus-ring fixed bottom-5 right-5 z-40 hidden h-12 w-12 place-items-center rounded-full border border-[#A41034]/10 bg-white/90 text-[#A41034] shadow-[0_16px_40px_rgba(123,3,35,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-[#fffaf3] lg:hidden"
        aria-label="Open quick navigation" aria-expanded="false">
        <i data-lucide="panel-right-open" class="h-5 w-5"></i>
    </button>
    <div id="appToast"
        class="pointer-events-none fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 rounded-2xl border border-[#A41034]/10 bg-white px-4 py-3 text-sm font-semibold text-[#1C1917] opacity-0 shadow-[0_18px_45px_rgba(123,3,35,0.16)] transition-all duration-300"
        role="status" aria-live="polite"></div>
    <div id="practiceGymGlobalFabRoot"></div>
            `;
        }

        renderAppShell();

        if (!window.location.hash && APP_BOOT.initialHash) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${APP_BOOT.initialHash}`);
        }

        const currentGradeId = 'grade-1';
        let activeGradeId = currentGradeId;
        let activeBlockKey = '';
        let toolbarOpen = false;
        let currentToolbarView = 'home';
        let activeAppTab = APP_BOOT.initialTab;
        let currentRole = 'principle';
        let programmaticBlockScrollTarget = '';
        let programmaticBlockScrollTimer = null;
        let parentTipDismissed = false;
        let parentLearningView = 'weekly';
        const completedLessonKeys = new Set();
        let lessonNotesState = {};
        const expandedGradeIds = new Set([currentGradeId]);
        const collapsedBlockIds = new Set();
        const initializedCollapsedBlockRoutes = new Set();
        let lastAutoScrolledBlocksRoute = '';
        let scrollToTopOnRender = false;

        const iconPaths = {
            book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
            math: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/>',
            globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
            monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
            flask: '<path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3 20.4 20a1.3 1.3 0 0 1-1.1 2H4.7a1.3 1.3 0 0 1-1.1-2L10 9.31"/><path d="M8.5 14h7"/>',
            landmark: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/>',
            hindi: '<path d="M4 4h16"/><path d="M7 4v16"/><path d="M7 12h5a4 4 0 0 0 0-8"/><path d="M17 4v16"/>',
            early: '<path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
        };

        const initialAnnouncements = [
            {
                id: 1,
                author: 'XSEED Admin',
                role: 'School Administrator',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                timestamp: '2 hours ago',
                audience: 'All Grades',
                text: 'Dear Parents,\n\nWe are excited to announce our upcoming Annual Science Exhibition on May 15th. Students from Grade 3 to Grade 8 will be presenting their projects. All parents are warmly invited to attend between 10:00 AM - 1:00 PM.',
                media: [{ type: 'image', url: 'https://picsum.photos/seed/scienceexpo/900/420', alt: 'Science Exhibition' }, { type: 'image', url: 'https://picsum.photos/seed/scienceexpo2/900/600', alt: 'Science Exhibition 2' }],
                reactions: { '👍': 24, '❤️': 18, '🎉': 31, '😊': 12, '🙏': 8 },
                myReactions: new Set()
            },
            {
                id: 2,
                author: 'Grade 4 Team',
                role: 'Class Teachers',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grade4',
                timestamp: '1 day ago',
                audience: 'Grade 4',
                text: 'Dear Parents,\n\nThe Mathematics Unit Assessment for Block 03 is scheduled for Friday, May 2nd. Please ensure your child has revised chapters on fractions and decimals. The assessment schedule and syllabus are attached below.',
                media: { type: 'pdf', name: 'Assessment_Schedule_Grade4.pdf', size: '240 KB' },
                reactions: { '👍': 45, '❤️': 12, '🎉': 5, '😊': 20, '🙏': 33 },
                myReactions: new Set()
            },
            {
                id: 3,
                author: "Principal's Office",
                role: 'Administration',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Principal',
                timestamp: '3 days ago',
                audience: 'All Grades',
                text: 'Dear Parents,\n\nSchool will remain closed on Thursday, May 1st on account of International Labour Day. Regular classes will resume on Friday, May 2nd. Wishing everyone a restful long weekend!',
                media: null,
                reactions: { '👍': 89, '❤️': 34, '🎉': 22, '😊': 56, '🙏': 12 },
                myReactions: new Set()
            },
            {
                id: 4,
                author: 'Sports Department',
                role: 'Physical Education',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sports',
                timestamp: '1 week ago',
                audience: 'Grade 5 - Grade 8',
                text: 'We are incredibly proud to share that our school football team has won the Inter-School Championship 2026! Watch the highlights from the final match below. A huge congratulations to all the players and coaches! 🏆',
                media: { type: 'video', thumbnail: 'https://picsum.photos/seed/football/900/450', alt: 'Football Championship Highlights' },
                reactions: { '👍': 112, '❤️': 98, '🎉': 145, '😊': 67, '🙏': 23 },
                myReactions: new Set()
            },
            {
                id: 5,
                author: 'Grade 2 Team',
                role: 'Class Teachers',
                timestamp: '2 days ago',
                audience: 'Grade 2',
                text: "Dear Parents,\n\nHere's a snapshot from today's hands-on activity where students created their own mini ecosystems in a jar. The excitement and curiosity in the classroom was wonderful to see!",
                media: { type: 'image', url: 'https://picsum.photos/seed/classroom/400/700', alt: 'Classroom Activity' },
                reactions: { '👍': 67, '❤️': 91, '🎉': 44, '😊': 38, '🙏': 15 },
                myReactions: new Set()
            }
        ].map((announcement) => ({ ...announcement, myReactions: new Set() }));
        const communicationGradeFilters = ['All Grades', 'Nursery', 'LKG', 'UKG', ...Array.from({ length: 8 }, (_, index) => `Grade ${index + 1}`)];
        const ALL_STUDENTS = [
            { id: 1, name: 'Aarav Kumar', grade: 'Grade 4' },
            { id: 2, name: 'Priya Sharma', grade: 'Grade 4' },
            { id: 3, name: 'Rohan Menon', grade: 'Grade 4' },
            { id: 4, name: 'Ananya Iyer', grade: 'Grade 3' },
            { id: 5, name: 'Karthik Rajan', grade: 'Grade 3' },
            { id: 6, name: 'Divya Pillai', grade: 'Grade 5' },
            { id: 7, name: 'Siddharth Nair', grade: 'Grade 5' },
            { id: 8, name: 'Meera Krishnan', grade: 'Grade 2' },
            { id: 9, name: 'Arjun Patel', grade: 'Grade 2' },
            { id: 10, name: 'Lakshmi Varma', grade: 'Grade 6' },
            { id: 11, name: 'Vivek Subramaniam', grade: 'Grade 6' },
            { id: 12, name: 'Ishaan Chowdhury', grade: 'Grade 1' },
            { id: 13, name: 'Sneha Reddy', grade: 'Grade 1' },
            { id: 14, name: 'Aditya Bose', grade: 'Grade 7' },
            { id: 15, name: 'Kavya Nambiar', grade: 'Grade 7' },
            { id: 16, name: 'Rahul Desai', grade: 'Grade 8' },
            { id: 17, name: 'Pooja Venkatesh', grade: 'Grade 8' },
            { id: 18, name: 'Nikhil Shetty', grade: 'Grade 3' },
            { id: 19, name: 'Tanvi Joshi', grade: 'Grade 5' },
            { id: 20, name: 'Aryan Ghosh', grade: 'Grade 4' }
        ];
        const communicationGroups = [];
        let communicationFilter = 'All Grades';
        let communicationSearchQuery = '';
        let communicationFabOpen = false;
        let communicationComposing = false;
        let communicationModal = null;
        let communicationReturnModal = null;
        let announcementDraftAudience = 'All Grades';
        let announcementDraftText = '';
        let groupDraftName = '';
        let groupDraftSearch = '';
        let groupDraftSelected = new Set();
        let manageExpandedGroup = null;
        let manageConfirmDelete = null;
        let appToastTimer = null;
        const profileGradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
        const profileSubjectOptions = ['English', 'Science', 'Mathematics', 'Hindi', 'Computer Science', 'Social Science'];
        let profileState = {
            name: 'Ravi Sharma',
            email: 'ravi.sharma@xseededu.org',
            countryCode: '+91',
            mobile: '+91 98765 43210',
            gender: 'Male',
            address: 'B-1204, Palm Residency, Sector 54',
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122003',
            country: 'India',
            schoolName: 'Sunrise Global School',
            schoolCode: 'XORG103138',
            combinations: [
                { grade: 'Grade 4', subject: 'Science' },
                { grade: 'Grade 4', subject: 'English' }
            ],
            draftGrade: 'Grade 1',
            draftSubject: 'English',
            child: {
                name: 'Aarav Sharma',
                gender: 'Male',
                grade: 'Grade 4',
                schoolName: 'Sunrise Global School'
            }
        };
        let frontOfficeState = {
            activeTab: 'School Management',
            view: 'list',
            selectedSchoolId: 'sunrise-global-school',
            dashboardRange: 'Last 7 Days',
            dashboardView: 'SuperTeacher',
            dashboardGroup: 'Branch',
            createSchool: {
                schoolName: '',
                board: 'CBSE',
                tier: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                adminNumber: '',
                adminEmail: ''
            }
        };
        const frontOfficeSchools = [
            {
                id: 'sunrise-global-school',
                name: 'Sunrise Global School',
                board: 'CBSE',
                city: 'Gurgaon',
                xorgCode: 'XORG103138',
                teachers: 42,
                parents: 380,
                wau: 78,
                status: 'Active',
                teacherCode: 'TCH-1347',
                parentCode: 'PAR-5613',
                modules: [
                    { name: 'Lessons', enabled: true },
                    { name: 'Practice', enabled: true },
                    { name: 'Communication', enabled: true },
                    { name: 'Learnometer', enabled: true },
                    { name: 'Front Office', enabled: false }
                ],
                users: [
                    { initials: 'DS', name: 'Divya Sharma', meta: 'Gr 3-4 · Science', role: 'Teacher', lastSeen: '2h ago' },
                    { initials: 'RK', name: 'Ramesh Kumar', meta: 'Gr 3-4 · Maths', role: 'Teacher', lastSeen: 'Yesterday' },
                    { initials: 'AP', name: 'Aisha Patel', meta: 'Parent · Grade 4', role: 'Parent', lastSeen: 'Today' }
                ],
                dashboardStats: {
                    totalMinutes: '125.39',
                    activeUsers: '5%',
                    avgUsage: '6.27'
                }
            },
            { id: 'delhi-public-academy', name: 'Delhi Public Academy', board: 'CBSE', city: 'New Delhi', xorgCode: 'XORG103412', teachers: 68, parents: 520, wau: 54, status: 'Active', dashboardStats: { totalMinutes: '216.44', activeUsers: '14%', avgUsage: '18.92' } },
            { id: 'jyoti-convent-school', name: 'Jyoti Convent School', board: 'ICSE', city: 'Kolkata', xorgCode: 'XORG103587', teachers: 31, parents: 240, wau: 91, status: 'Active', dashboardStats: { totalMinutes: '304.10', activeUsers: '22%', avgUsage: '24.16' } },
            { id: 'vidya-vihar', name: 'Vidya Vihar', board: 'CBSE', city: 'Ahmedabad', xorgCode: 'XORG103742', teachers: 24, parents: 180, wau: 12, status: 'Inactive', dashboardStats: { totalMinutes: '42.61', activeUsers: '3%', avgUsage: '4.08' } }
        ];
        const frontOfficeDashboardRows = [
            ['Bangalore', '10.94'],
            ['Chennai', '32.97'],
            ['Delhi', '71.43'],
            ['Guwahati', '163.60'],
            ['Hyderabad 1', '7.65'],
            ['Hyderabad 2', '24.39'],
            ['Madurai', '12.05']
        ];
        const frontOfficeDashboardSeries = [
            { name: 'Bangalore', color: '#5B7CFA', values: [48, 44, 53, 61, 58, 65] },
            { name: 'Chennai', color: '#A7D34B', values: [38, 41, 39, 46, 43, 47] },
            { name: 'Delhi', color: '#59639B', values: [18, 22, 57, 55, 43, 35] },
            { name: 'Guwahati', color: '#F68B2C', values: [60, 56, 40, 69, 84, 88] },
            { name: 'Hyderabad 1', color: '#5BB6F6', values: [26, 24, 27, 29, 26, 24] },
            { name: 'Hyderabad 2', color: '#F4C23D', values: [14, 17, 15, 22, 19, 18] },
            { name: 'Madurai', color: '#E98CA6', values: [21, 19, 24, 23, 22, 25] }
        ];
        const frontOfficeSchoolUserRows = [
            ['13', 'Jermin Jersha', 'G4 - Social Science, G5 - Social Science', '18.40'],
            ['14', 'Leenu Resolgin', 'G8 - Social Science', '11.20'],
            ['15', 'Leenu Resolgin', 'G7 - English, G7 - Mathematics, G7 - Science, G7 - Social Science', '24.75'],
            ['16', 'Nimisha', 'G1 - Environmental Science, G3 - Environmental Science, G5 - Mathematics, G5 - Science, G5 - Social Science, G7 - Science', '21.33'],
            ['17', 'Priyadharshini P', 'G2 - English, G2 - Environmental Science, G6 - English, G6 - Mathematics, G6 - Science, G6 - Social Science', '16.92'],
            ['18', 'Reji', 'G2 - Mathematics, G3 - Mathematics, G4 - Mathematics, G5 - Mathematics, G7 - Mathematics, G8 - Mathematics', '28.07'],
            ['19', 'RS Renuka', 'G1 - English, G2 - English, G4 - Social Science, G5 - Social Science, G6 - Social Science', '13.44'],
            ['20', 'Varsha', 'UKG - Early Childhood', '8.65']
        ];
        const frontOfficeGradeUsageRows = [
            ['Grade 1', '-', '12.20', '9.50', '8.70', '-', '-', '10.13'],
            ['Grade 2', '-', '14.80', '12.10', '10.20', '-', '-', '12.37'],
            ['Grade 3', '-', '18.40', '15.90', '17.30', '-', '-', '17.20'],
            ['Grade 4', '-', '11.60', '-', '12.80', '15.30', '9.40', '12.28'],
            ['Grade 5', '-', '15.20', '-', '16.40', '18.10', '10.20', '14.98'],
            ['Grade 6', '-', '11.90', '-', '12.10', '13.20', '10.60', '11.95'],
            ['Grade 7', '-', '17.70', '-', '19.20', '26.04', '14.10', '19.26'],
            ['Grade 8', '-', '10.40', '-', '11.90', '12.20', '9.80', '11.08'],
            ['Upper Kindergarten', '7.80', '-', '-', '-', '-', '-', '7.80'],
            ['School Average', '7.80', '15.88', '12.50', '14.79', '20.18', '12.76', '14.49']
        ];
        const frontOfficeSchoolSeries = [{ name: 'XORG103138', color: '#C87483', values: [34, 7, 0, 82, 75, 5, 54, 4] }];

        function escapeHtml(value = '') {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function showAppToast(message) {
            const toast = document.getElementById('appToast');
            if (!toast) return;

            toast.textContent = message;
            toast.classList.remove('hidden');
            requestAnimationFrame(() => {
                toast.classList.remove('opacity-0');
                toast.classList.add('opacity-100', '-translate-y-1');
            });

            if (appToastTimer) clearTimeout(appToastTimer);
            appToastTimer = setTimeout(() => {
                toast.classList.add('opacity-0');
                toast.classList.remove('opacity-100', '-translate-y-1');
                appToastTimer = setTimeout(() => {
                    toast.classList.add('hidden');
                    appToastTimer = null;
                }, 300);
            }, 2200);
        }

        function initialsFromName(name) {
            return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
        }

        function audienceMatchesFilter(announcement, filter) {
            if (filter === 'All Grades') return true;
            if (announcement.audience === 'All Grades' || announcement.audience === filter) return true;

            const range = announcement.audience.match(/Grade\s+(\d+)\s*-\s*Grade\s+(\d+)/i);
            const grade = filter.match(/Grade\s+(\d+)/i);
            if (!range || !grade) return false;

            const gradeNumber = Number(grade[1]);
            return gradeNumber >= Number(range[1]) && gradeNumber <= Number(range[2]);
        }

        function renderAnnouncementText(text) {
            return text.split('\n\n')
                .map((paragraph) => `<p class="text-[15px] font-medium leading-7 text-[#44403C]">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
                .join('');
        }

        function openImageLightbox(src = '', alt = '') {
            closeImageLightbox();
            const lightbox = document.createElement('div');
            lightbox.id = 'communicationImageLightbox';
            lightbox.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4';
            lightbox.innerHTML = `
                <button type="button" class="focus-ring absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-[#1C1917] shadow-2xl" aria-label="Close image preview" data-close-image-lightbox>
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
                <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="block max-h-[92vh] max-w-[92vw] rounded-xl object-contain" data-image-lightbox-content>
            `;
            lightbox.addEventListener('click', closeImageLightbox);
            lightbox.querySelector('[data-image-lightbox-content]')?.addEventListener('click', (event) => event.stopPropagation());
            lightbox.querySelector('[data-close-image-lightbox]')?.addEventListener('click', closeImageLightbox);
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            lucide.createIcons();
        }

        function closeImageLightbox() {
            document.getElementById('communicationImageLightbox')?.remove();
            document.body.style.overflow = '';
        }

        function getGradeSortValue(gradeLabel = '') {
            const match = String(gradeLabel).match(/(\d+)/);
            return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
        }

        function renderProfileScreen() {
            const root = document.getElementById('profileRoot');
            if (!root) return;
            const sortedCombinations = [...profileState.combinations].sort((left, right) => {
                const gradeDiff = getGradeSortValue(left.grade) - getGradeSortValue(right.grade);
                if (gradeDiff !== 0) return gradeDiff;
                return left.subject.localeCompare(right.subject);
            });

            root.innerHTML = `
                <section>
                    <div class="mx-auto max-w-[860px]">
                        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 class="text-[2.2rem] font-black tracking-[-0.04em] text-[#1F1A17] sm:text-[2.6rem]">Profile</h1>
                            </div>
                            <button type="button" id="profileSaveButton" class="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-[#B1123B] px-7 text-sm font-bold text-white transition-colors hover:bg-[#930f31] focus:outline-none">
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div class="mx-auto mt-6 max-w-[860px] space-y-4">
                        <section class="rounded-[1.6rem] border border-[#E8DDD6] bg-[#FBF6F2] p-5 sm:p-5">
                            <h2 class="text-[1.05rem] font-bold text-[#231D1A]">Basic Details</h2>
                            <div class="mt-4 space-y-3">
                                <div class="grid gap-4 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Name</span>
                                        <div class="mt-2 flex h-12 items-center rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                            <input data-profile-field="name" value="${escapeHtml(profileState.name)}" class="h-full w-full bg-transparent text-[14px] font-medium text-[#211C19] outline-none" />
                                            <span class="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#E04E45] text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 10a1 1 0 0 1 1-1h1V7a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8Zm4-1h6V7a3 3 0 1 0-6 0v2Zm2 5a1 1 0 1 0 2 0 1 1 0 0 0-2 0Zm-3 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0Zm6 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"/></svg>
                                            </span>
                                        </div>
                                    </label>
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Gender</span>
                                        <select data-profile-field="gender" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                            <option ${profileState.gender === 'Male' ? 'selected' : ''}>Male</option>
                                            <option ${profileState.gender === 'Female' ? 'selected' : ''}>Female</option>
                                            <option ${profileState.gender === 'Other' ? 'selected' : ''}>Other</option>
                                        </select>
                                    </label>
                                </div>

                                <div class="grid gap-x-4 gap-y-3 md:grid-cols-2">
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Email</span>
                                        <input data-profile-field="email" value="${escapeHtml(profileState.email)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                    </label>
                                    <div class="grid gap-x-4 gap-y-3 md:grid-cols-[120px_minmax(0,1fr)]">
                                        <label class="block">
                                            <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Code</span>
                                            <input data-profile-field="countryCode" value="${escapeHtml(profileState.countryCode)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                        </label>
                                        <label class="block">
                                            <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Mobile</span>
                                            <input data-profile-field="mobile" value="${escapeHtml(profileState.mobile)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                        </label>
                                    </div>
                                </div>

                                <div class="grid gap-x-4 gap-y-3 md:grid-cols-2">
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Address</span>
                                        <input data-profile-field="address" value="${escapeHtml(profileState.address)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                    </label>
                                    <div></div>
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">City</span>
                                        <input data-profile-field="city" value="${escapeHtml(profileState.city)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                    </label>
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">State</span>
                                        <input data-profile-field="state" value="${escapeHtml(profileState.state)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                    </label>
                                    <label class="block">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Country</span>
                                        <input data-profile-field="country" value="${escapeHtml(profileState.country)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                    </label>
                                    <label class="block md:max-w-[240px]">
                                        <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Postal Code</span>
                                        <input data-profile-field="postalCode" value="${escapeHtml(profileState.postalCode)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section class="rounded-[1.6rem] border border-[#E8DDD6] bg-[#FBF6F2] p-5 sm:p-5">
                            <h2 class="text-[1.05rem] font-bold text-[#231D1A]">School Details</h2>
                            <div class="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
                                <label class="block">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">School Name</span>
                                    <input data-profile-field="schoolName" value="${escapeHtml(profileState.schoolName)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-[#F1E9E3] px-4 text-[14px] font-medium text-[#6C635D] outline-none" />
                                </label>
                                <label class="block">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">School Code</span>
                                    <input data-profile-field="schoolCode" value="${escapeHtml(profileState.schoolCode)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-[#F1E9E3] px-4 text-[14px] font-medium text-[#6C635D] outline-none" />
                                </label>
                            </div>
                        </section>

                        <section class="rounded-[1.6rem] border border-[#E8DDD6] bg-[#FBF6F2] p-5 sm:p-5">
                            <h2 class="text-[1.05rem] font-bold text-[#231D1A]">Grade Subject Combinations</h2>
                            <p class="mt-1 text-[13px] font-medium text-[#8B7E77]">You can add 6 grade subject combinations.</p>
                            <div class="mt-4 flex flex-wrap gap-3">
                                ${sortedCombinations.map((item) => `
                                    <span class="inline-flex items-center gap-3 rounded-full border border-[#E4D9D2] bg-white px-3 py-2 text-[14px] font-semibold text-[#2A2320] shadow-[0_4px_10px_rgba(51,7,23,0.03)]">
                                        <span>${escapeHtml(item.grade)}</span>
                                        <span class="text-[#B7AAA3]">&bull;</span>
                                        <span>${escapeHtml(item.subject)}</span>
                                        <button type="button" class="focus-ring inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FCE9EC] text-[#C24560] hover:bg-[#F9D9E0] focus:outline-none" data-profile-remove-grade="${escapeHtml(item.grade)}" data-profile-remove-subject="${escapeHtml(item.subject)}" aria-label="Remove ${escapeHtml(item.grade)} ${escapeHtml(item.subject)}">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                            <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                                <select id="profileDraftGrade" class="h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                    ${profileGradeOptions.map((grade) => `<option value="${escapeHtml(grade)}" ${profileState.draftGrade === grade ? 'selected' : ''}>${grade}</option>`).join('')}
                                </select>
                                <select id="profileDraftSubject" class="h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                    ${profileSubjectOptions.map((subject) => `<option value="${escapeHtml(subject)}" ${profileState.draftSubject === subject ? 'selected' : ''}>${subject}</option>`).join('')}
                                </select>
                                <button type="button" id="profileAddCombinationButton" class="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-[#B1123B] px-6 text-lg font-bold text-white transition-colors hover:bg-[#930f31] focus:outline-none">Add</button>
                            </div>
                        </section>

                        <section class="rounded-[1.6rem] border border-[#E8DDD6] bg-[#FBF6F2] p-5 sm:p-5">
                            <h2 class="text-[1.05rem] font-bold text-[#231D1A]">Child Details</h2>
                            <div class="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
                                <label class="block">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Student Name</span>
                                    <input data-profile-child-field="name" value="${escapeHtml(profileState.child.name)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                </label>
                                <label class="block">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Gender</span>
                                    <select data-profile-child-field="gender" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                        <option ${profileState.child.gender === 'Male' ? 'selected' : ''}>Male</option>
                                        <option ${profileState.child.gender === 'Female' ? 'selected' : ''}>Female</option>
                                        <option ${profileState.child.gender === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </label>
                                <label class="block">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">Grade</span>
                                    <select data-profile-child-field="grade" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                        ${profileGradeOptions.map((grade) => `<option value="${escapeHtml(grade)}" ${profileState.child.grade === grade ? 'selected' : ''}>${grade}</option>`).join('')}
                                    </select>
                                </label>
                                <label class="block">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9C8F87]">School Name</span>
                                    <input data-profile-child-field="schoolName" value="${escapeHtml(profileState.child.schoolName)}" class="mt-2 h-12 w-full rounded-[1.1rem] border border-[#E4D9D2] bg-white px-4 text-[14px] font-medium text-[#211C19] outline-none" />
                                </label>
                            </div>
                        </section>
                    </div>
                </section>
            `;

            bindProfileEvents();
        }

        function bindProfileEvents() {
            const root = document.getElementById('profileRoot');
            if (!root) return;

            root.querySelectorAll('[data-profile-field]').forEach((field) => {
                field.addEventListener('input', (event) => {
                    profileState = { ...profileState, [event.currentTarget.dataset.profileField]: event.currentTarget.value };
                });
            });

            root.querySelectorAll('[data-profile-child-field]').forEach((field) => {
                field.addEventListener('input', (event) => {
                    profileState = {
                        ...profileState,
                        child: {
                            ...profileState.child,
                            [event.currentTarget.dataset.profileChildField]: event.currentTarget.value
                        }
                    };
                });
            });

            root.querySelector('#profileDraftGrade')?.addEventListener('change', (event) => {
                profileState = { ...profileState, draftGrade: event.currentTarget.value };
            });

            root.querySelector('#profileDraftSubject')?.addEventListener('change', (event) => {
                profileState = { ...profileState, draftSubject: event.currentTarget.value };
            });

            root.querySelector('#profileAddCombinationButton')?.addEventListener('click', () => {
                const exists = profileState.combinations.some((item) => item.grade === profileState.draftGrade && item.subject === profileState.draftSubject);
                if (exists) {
                    showAppToast('This combination already exists.');
                    return;
                }
                profileState = {
                    ...profileState,
                    combinations: [...profileState.combinations, { grade: profileState.draftGrade, subject: profileState.draftSubject }]
                };
                renderProfileScreen();
            });

            root.querySelectorAll('[data-profile-remove-grade]').forEach((button) => {
                button.addEventListener('click', () => {
                    profileState = {
                        ...profileState,
                        combinations: profileState.combinations.filter((item) => !(item.grade === button.dataset.profileRemoveGrade && item.subject === button.dataset.profileRemoveSubject))
                    };
                    renderProfileScreen();
                });
            });

            root.querySelector('#profileSaveButton')?.addEventListener('click', () => {
                showAppToast('Profile changes saved.');
            });
        }

        function getFrontOfficeSelectedSchool() {
            return frontOfficeSchools.find((school) => school.id === frontOfficeState.selectedSchoolId) || frontOfficeSchools[0];
        }

        function getFrontOfficeStats() {
            return {
                schools: frontOfficeSchools.length,
                teachers: frontOfficeSchools.reduce((total, school) => total + (school.teachers || 0), 0),
                parents: frontOfficeSchools.reduce((total, school) => total + (school.parents || 0), 0)
            };
        }

        function renderFrontOfficeMetric(value, label) {
            return `
                <article class="rounded-[1.15rem] border border-[#E8DDD6] bg-[#FBF6F2] p-3.5">
                    <p class="text-[1.55rem] font-black leading-none text-[#1F1A17]">${value}</p>
                    <p class="mt-2 text-[11px] font-semibold text-[#6F645E]">${label}</p>
                </article>
            `;
        }

        function renderFrontOfficeToggle() {
            const tabs = ['School Management', 'Data Dashboard'];
            return `
                <div class="inline-flex rounded-full border border-[#E8DDD6] bg-[#F1E9E3] p-1">
                    ${tabs.map((tab) => `
                        <button type="button" class="focus-ring rounded-full px-4 py-2 text-[11px] font-bold transition-colors ${frontOfficeState.activeTab === tab ? 'bg-white text-[#B1123B] shadow-[0_2px_10px_rgba(51,7,23,0.06)]' : 'text-[#6F645E]'}" data-frontoffice-tab="${tab}">
                            ${tab}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        function renderFrontOfficeSchoolList() {
            const stats = getFrontOfficeStats();
            return `
                <section class="mx-auto max-w-[860px]">
                    <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 class="text-[1.6rem] font-black tracking-[-0.04em] text-[#1F1A17] sm:text-[1.85rem]">Front Office</h1>
                            <p class="mt-1.5 text-[12px] font-medium text-[#6F645E]">Manage schools, access codes, and module enablement.</p>
                        </div>
                        ${renderFrontOfficeToggle()}
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-3">
                        ${renderFrontOfficeMetric(stats.schools, 'Schools')}
                        ${renderFrontOfficeMetric(stats.teachers, 'Teachers')}
                        ${renderFrontOfficeMetric(stats.parents, 'Parents')}
                    </div>
                    <section class="mt-5 rounded-[1.15rem] border border-[#E8DDD6] bg-white p-4">
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9C8F87]">Schools</p>
                            </div>
                            <button type="button" class="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#B1123B] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#930f31]" data-frontoffice-action="create-school">
                                <span class="text-base leading-none">+</span>
                                <span>New School</span>
                            </button>
                        </div>
                        <div class="mt-4 divide-y divide-[#E9E0DA]">
                            ${frontOfficeSchools.map((school) => `
                                <button type="button" class="focus-ring flex w-full items-center justify-between gap-3 py-3.5 text-left transition-colors hover:bg-[#FCF8F5]" data-frontoffice-action="open-school" data-school-id="${school.id}">
                                    <div class="flex min-w-0 items-center gap-4">
                                        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-[0.9rem] ${school.status === 'Inactive' ? 'bg-[#F2ECE6] text-[#9C8F87]' : 'bg-[#A62342] text-[#F6C95B]'}">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 22h16"/><path d="M7 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M10 9h.01"/><path d="M14 9h.01"/><path d="M10 13h.01"/><path d="M14 13h.01"/><path d="M10 17h.01"/><path d="M14 17h.01"/></svg>
                                        </span>
                                        <span class="min-w-0">
                                            <span class="block truncate text-[15px] font-bold text-[#221C19]">${school.name}</span>
                                            <span class="mt-0.5 block text-[12px] font-medium text-[#6F645E]">${school.board} · ${school.city} · ${school.teachers} teachers</span>
                                        </span>
                                    </div>
                                    <span class="flex shrink-0 items-center gap-4">
                                        <span class="text-right">
                                            <span class="block text-[15px] font-black ${school.wau >= 70 ? 'text-[#5F9E6E]' : school.wau >= 40 ? 'text-[#2B2521]' : 'text-[#C25555]'}">${school.wau}%</span>
                                            <span class="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#9C8F87]">WAU</span>
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#9C8F87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 6 6 6-6 6"/></svg>
                                    </span>
                                </button>
                            `).join('')}
                        </div>
                    </section>
                </section>
            `;
        }

        function renderFrontOfficeSchoolDetail() {
            const school = getFrontOfficeSelectedSchool();
            return `
                <section class="mx-auto max-w-[860px]">
                    <button type="button" class="focus-ring inline-flex items-center gap-2 text-[12px] font-semibold text-[#6F645E]" data-frontoffice-action="back-to-list">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
                        <span>All Schools</span>
                    </button>
                    <div class="mt-4 flex items-start justify-between gap-4">
                        <div>
                            <h1 class="text-[1.6rem] font-black tracking-[-0.04em] text-[#1F1A17]">${school.name}</h1>
                            <p class="mt-1.5 text-[12px] font-medium text-[#6F645E]">${school.board} · ${school.city}</p>
                        </div>
                        <span class="rounded-full bg-[#EAF6EC] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#68A97A]">${school.status}</span>
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-3">
                        ${renderFrontOfficeMetric(school.teachers, 'Teachers')}
                        ${renderFrontOfficeMetric(school.parents, 'Parents')}
                        ${renderFrontOfficeMetric(`${school.wau}%`, 'Weekly active')}
                    </div>
                    <section class="mt-5 rounded-[1.15rem] border border-[#E8DDD6] bg-white p-4">
                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9C8F87]">Access Codes</p>
                        <div class="mt-3 space-y-2.5">
                            <div class="flex items-center justify-between rounded-[0.95rem] border border-[#E8DDD6] bg-[#FBF6F2] px-3.5 py-3">
                                <span class="text-[12px] font-semibold text-[#8B7E77]">Teacher Code</span>
                                <span class="text-[15px] font-black tracking-[0.06em] text-[#2B2521]">${school.teacherCode}</span>
                            </div>
                            <div class="flex items-center justify-between rounded-[0.95rem] border border-[#E8DDD6] bg-[#FBF6F2] px-3.5 py-3">
                                <span class="text-[12px] font-semibold text-[#8B7E77]">Parent Code</span>
                                <span class="text-[15px] font-black tracking-[0.06em] text-[#2B2521]">${school.parentCode}</span>
                            </div>
                        </div>
                    </section>
                    <section class="mt-5 rounded-[1.15rem] border border-[#E8DDD6] bg-white p-4">
                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9C8F87]">Enabled Modules</p>
                        <div class="mt-3 divide-y divide-[#ECE3DC]">
                            ${school.modules.map((module) => `
                                <div class="flex items-center justify-between py-3">
                                    <span class="text-[13px] font-semibold ${module.enabled ? 'text-[#2B2521]' : 'text-[#A79A91]'}">${module.name}</span>
                                    <button type="button" class="focus-ring inline-flex h-6 w-10 items-center rounded-full p-1 transition-colors ${module.enabled ? 'bg-[#A62342] justify-end' : 'bg-[#E8DDD6] justify-start'}" data-frontoffice-action="toggle-module" data-module-name="${module.name}">
                                        <span class="h-4 w-4 rounded-full bg-white"></span>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    <section class="mt-5 rounded-[1.15rem] border border-[#E8DDD6] bg-white p-4">
                        <div class="flex items-center justify-between gap-4">
                            <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9C8F87]">Users</p>
                            <button type="button" class="focus-ring inline-flex items-center gap-2 rounded-full border border-[#D96A76] px-3 py-1.5 text-[11px] font-bold text-[#C44D5D]" data-frontoffice-action="bulk-upload">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16.5A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5"/></svg>
                                <span>Bulk Upload</span>
                            </button>
                        </div>
                        <div class="mt-3 divide-y divide-[#ECE3DC]">
                            ${school.users.map((user) => `
                                <div class="flex items-center justify-between gap-4 py-3">
                                    <div class="flex min-w-0 items-center gap-4">
                                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#8D5F68] text-[11px] font-bold text-white">${user.initials}</span>
                                        <span class="min-w-0">
                                            <span class="block truncate text-[13px] font-bold text-[#2B2521]">${user.name}</span>
                                            <span class="block text-[11px] font-medium text-[#8B7E77]">${user.meta}</span>
                                        </span>
                                    </div>
                                    <div class="text-right">
                                        <span class="inline-flex rounded-full bg-[#DDF3FA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4B8E9E]">${user.role}</span>
                                        <span class="mt-1.5 block text-[10px] font-medium text-[#9C8F87]">${user.lastSeen}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </section>
            `;
        }

        function renderFrontOfficeCreateSchool() {
            const form = frontOfficeState.createSchool;
            return `
                <section class="mx-auto max-w-[860px]">
                    <button type="button" class="focus-ring inline-flex items-center gap-2 text-[12px] font-semibold text-[#6F645E]" data-frontoffice-action="back-to-list">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg>
                        <span>Back to Schools</span>
                    </button>
                    <div class="mt-4">
                        <h1 class="text-[1.6rem] font-black tracking-[-0.04em] text-[#1F1A17]">Create School</h1>
                        <p class="mt-1.5 text-[12px] font-medium text-[#6F645E]">A parent code and teacher code will be generated on submit.</p>
                    </div>
                    <section class="mt-5 rounded-[1.15rem] border border-[#E8DDD6] bg-white p-4">
                        <div class="space-y-2.5">
                            <label class="block">
                                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">School Name</span>
                                <input value="${escapeHtml(form.schoolName)}" data-frontoffice-form="schoolName" placeholder="e.g. Sunrise Global School" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">
                            </label>
                            <div class="grid gap-x-3 gap-y-2.5 md:grid-cols-2">
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">Board</span>
                                    <select data-frontoffice-form="board" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                        ${['CBSE', 'ICSE', 'State Board'].map((item) => `<option ${form.board === item ? 'selected' : ''}>${item}</option>`).join('')}
                                    </select>
                                </label>
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">Monthly Fee Tier (Optional)</span>
                                    <select data-frontoffice-form="tier" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none">
                                        <option value="">Select tier</option>
                                        <option ${form.tier === 'Tier 1' ? 'selected' : ''}>Tier 1</option>
                                        <option ${form.tier === 'Tier 2' ? 'selected' : ''}>Tier 2</option>
                                        <option ${form.tier === 'Tier 3' ? 'selected' : ''}>Tier 3</option>
                                    </select>
                                </label>
                            </div>
                            <label class="block">
                                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">Address</span>
                                <textarea data-frontoffice-form="address" rows="4" placeholder="Street, area, landmark" class="mt-1.5 min-h-[100px] w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 py-3 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">${escapeHtml(form.address)}</textarea>
                            </label>
                            <div class="grid gap-x-3 gap-y-2.5 md:grid-cols-3">
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">City</span>
                                    <input value="${escapeHtml(form.city)}" data-frontoffice-form="city" placeholder="e.g. Bengaluru" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">
                                </label>
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">State</span>
                                    <input value="${escapeHtml(form.state)}" data-frontoffice-form="state" placeholder="e.g. Haryana" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">
                                </label>
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">Pincode</span>
                                    <input value="${escapeHtml(form.pincode)}" data-frontoffice-form="pincode" placeholder="e.g. 122002" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">
                                </label>
                            </div>
                            <div class="grid gap-x-3 gap-y-2.5 md:grid-cols-2">
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">Admin Number</span>
                                    <input value="${escapeHtml(form.adminNumber)}" data-frontoffice-form="adminNumber" placeholder="e.g. +91 98765 43210" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">
                                </label>
                                <label class="block">
                                    <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9C8F87]">Admin Email</span>
                                    <input value="${escapeHtml(form.adminEmail)}" data-frontoffice-form="adminEmail" placeholder="e.g. admin@school.org" class="mt-1.5 h-11 w-full rounded-[1rem] border border-[#E4D9D2] bg-[#FBF6F2] px-4 text-[14px] font-medium text-[#211C19] outline-none placeholder:text-[#A4A0A5]">
                                </label>
                            </div>
                            <div class="pt-2">
                                <button type="button" class="focus-ring inline-flex h-10 items-center justify-center rounded-full bg-[#B1123B] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#930f31]" data-frontoffice-action="submit-school">
                                    Create School
                                </button>
                            </div>
                        </div>
                    </section>
                </section>
            `;
        }

        function renderFrontOfficeDashboardChart() {
            const width = 760;
            const height = 200;
            const paddingX = 42;
            const paddingTop = 18;
            const paddingBottom = 24;
            const max = 90;
            const min = 0;
            const plotHeight = height - paddingTop - paddingBottom;
            const plotWidth = width - (paddingX * 2);
            const xStep = plotWidth / 5;
            const yFor = (value) => paddingTop + ((max - value) / (max - min)) * plotHeight;
            const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
            const gridValues = [90, 70, 50, 30];
            return `
                <div class="overflow-hidden rounded-[1.15rem] border border-[#E8DDD6] bg-[#FBF6F2] p-3">
                    <div class="flex flex-wrap gap-3 pb-2">
                        ${frontOfficeDashboardSeries.map((series) => `
                            <span class="inline-flex items-center gap-2 text-[10px] font-semibold text-[#6F645E]">
                                <span class="h-2.5 w-2.5 rounded-full" style="background:${series.color};"></span>
                                <span>${series.name}</span>
                            </span>
                        `).join('')}
                    </div>
                    <svg viewBox="0 0 ${width} ${height}" class="w-full">
                        ${gridValues.map((value) => `
                            <g>
                                <line x1="${paddingX}" y1="${yFor(value)}" x2="${width - paddingX}" y2="${yFor(value)}" stroke="#E7DDD6" stroke-width="1"/>
                                <text x="${paddingX - 10}" y="${yFor(value) + 4}" fill="#9C8F87" font-size="9" text-anchor="end">${value * 2}</text>
                            </g>
                        `).join('')}
                        ${weeks.map((week, index) => `<text x="${paddingX + (xStep * index)}" y="${height - 6}" fill="#9C8F87" font-size="9" text-anchor="middle">${week}</text>`).join('')}
                        ${frontOfficeDashboardSeries.map((series) => {
                            const path = series.values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${paddingX + (xStep * index)} ${yFor(value)}`).join(' ');
                            return `
                                <path d="${path}" fill="none" stroke="${series.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                ${series.values.map((value, index) => `
                                    <circle cx="${paddingX + (xStep * index)}" cy="${yFor(value)}" r="3" fill="white" stroke="${series.color}" stroke-width="2"/>
                                `).join('')}
                            `;
                        }).join('')}
                    </svg>
                </div>
            `;
        }

        function renderFrontOfficeSchoolDashboardChart() {
            const width = 760;
            const height = 220;
            const paddingX = 38;
            const paddingTop = 16;
            const paddingBottom = 28;
            const max = 90;
            const min = 0;
            const plotHeight = height - paddingTop - paddingBottom;
            const plotWidth = width - (paddingX * 2);
            const xStep = plotWidth / 7;
            const yFor = (value) => paddingTop + ((max - value) / (max - min)) * plotHeight;
            const labels = ['15 Mar', '22 Mar', '29 Mar', '05 Apr', '12 Apr', '19 Apr', '26 Apr', '03 May'];
            const series = frontOfficeSchoolSeries[0];
            const path = series.values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${paddingX + (xStep * index)} ${yFor(value)}`).join(' ');
            return `
                <div class="overflow-hidden rounded-[1.15rem] border border-[#E8DDD6] bg-white p-0">
                    <div class="border-b border-[#ECE3DC] px-4 py-3">
                        <p class="text-[12px] font-bold text-[#2B2521]">Average Usage per Registered Teacher per Week Over Time</p>
                    </div>
                    <div class="p-3">
                        <div class="flex justify-center pb-2">
                            <span class="inline-flex items-center gap-2 text-[10px] font-semibold text-[#6F645E]">
                                <span class="h-2.5 w-2.5 rounded-full" style="background:${series.color};"></span>
                                <span>${series.name}</span>
                            </span>
                        </div>
                        <svg viewBox="0 0 ${width} ${height}" class="w-full">
                            ${[80, 60, 40, 20, 0].map((value) => `
                                <g>
                                    <line x1="${paddingX}" y1="${yFor(value)}" x2="${width - paddingX}" y2="${yFor(value)}" stroke="#E7DDD6" stroke-width="1"/>
                                    <text x="${paddingX - 10}" y="${yFor(value) + 4}" fill="#9C8F87" font-size="9" text-anchor="end">${value * 2}</text>
                                </g>
                            `).join('')}
                            <path d="${path}" fill="none" stroke="${series.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                            ${series.values.map((value, index) => `
                                <circle cx="${paddingX + (xStep * index)}" cy="${yFor(value)}" r="3" fill="white" stroke="${series.color}" stroke-width="2"/>
                                <text x="${paddingX + (xStep * index)}" y="${height - 8}" fill="#9C8F87" font-size="8.5" text-anchor="middle">${labels[index]}</text>
                            `).join('')}
                        </svg>
                    </div>
                </div>
            `;
        }

        function renderFrontOfficeSchoolDashboardContent() {
            const school = getFrontOfficeSelectedSchool();
            const stats = school.dashboardStats || { totalMinutes: '0.00', activeUsers: '0%', avgUsage: '0.00' };
            return `
                <section class="mt-4">
                    <div>
                        <h2 class="text-[1.35rem] font-black tracking-[-0.03em] text-[#1F1A17]">${school.name}</h2>
                        <p class="mt-1 text-[11px] font-medium text-[#6F645E]">${school.board} · ${school.city}</p>
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-3">
                        <article class="rounded-[1.15rem] border border-[#E8DDD6] bg-white p-3.5">
                            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F4E5A]">Total Minutes Used</p>
                            <p class="mt-2 text-[1.45rem] font-black leading-none text-[#8F3145]">${stats.totalMinutes}</p>
                            <p class="mt-2 text-[10px] font-medium text-[#8B7E77]">The total number of minutes used by all users</p>
                        </article>
                        <article class="rounded-[1.15rem] border border-[#E8DDD6] bg-white p-3.5">
                            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F4E5A]">Active Users %</p>
                            <p class="mt-2 text-[1.45rem] font-black leading-none text-[#8F3145]">${stats.activeUsers}</p>
                            <p class="mt-2 text-[10px] font-medium text-[#8B7E77]">The percentage of users who have used the app at least once</p>
                        </article>
                        <article class="rounded-[1.15rem] border border-[#E8DDD6] bg-white p-3.5">
                            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8F4E5A]">Average Usage per Registered Teacher per Week</p>
                            <p class="mt-2 text-[1.45rem] font-black leading-none text-[#8F3145]">${stats.avgUsage}</p>
                            <p class="mt-2 text-[10px] font-medium text-[#8B7E77]">The average number of minutes used per registered teacher per week</p>
                        </article>
                    </div>
                    <section class="mt-4 overflow-hidden rounded-[1.15rem] border border-[#E8DDD6] bg-white">
                        <div class="border-b border-[#ECE3DC] px-4 py-3">
                            <p class="text-[12px] font-bold text-[#2B2521]">Average Usage Per User Per Week</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-left">
                                <thead class="bg-[#FBF6F2] text-[10px] font-bold text-[#2B2521]">
                                    <tr>
                                        <th class="px-4 py-2.5">#</th>
                                        <th class="px-4 py-2.5">User Name</th>
                                        <th class="px-4 py-2.5">Grade · Subject Allotments</th>
                                        <th class="px-4 py-2.5 text-right">Average Usage per Week</th>
                                    </tr>
                                </thead>
                                <tbody class="text-[11px] font-medium text-[#6F645E]">
                                    ${frontOfficeSchoolUserRows.map((row) => `
                                        <tr class="border-t border-[#F1E9E3]">
                                            <td class="px-4 py-2.5">${row[0]}</td>
                                            <td class="px-4 py-2.5 font-semibold text-[#2B2521]">${row[1]}</td>
                                            <td class="px-4 py-2.5">${row[2]}</td>
                                            <td class="px-4 py-2.5 text-right">${row[3]}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section class="mt-4 overflow-hidden rounded-[1.15rem] border border-[#E8DDD6] bg-white">
                        <div class="border-b border-[#ECE3DC] px-4 py-3">
                            <p class="text-[12px] font-bold text-[#2B2521]">Grade · Subject Usage</p>
                            <p class="mt-1 text-[10px] font-semibold text-[#8F4E5A]">( Average Minutes Used for a Grade-Subject per User )</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-left">
                                <thead class="bg-[#FBF6F2] text-[10px] font-bold text-[#2B2521]">
                                    <tr>
                                        <th class="px-4 py-2.5">Grade Name</th>
                                        <th class="px-4 py-2.5">Early Childhood</th>
                                        <th class="px-4 py-2.5">English</th>
                                        <th class="px-4 py-2.5">Environmental Science</th>
                                        <th class="px-4 py-2.5">Mathematics</th>
                                        <th class="px-4 py-2.5">Science</th>
                                        <th class="px-4 py-2.5">Social Science</th>
                                        <th class="px-4 py-2.5 text-center">Grade Average</th>
                                    </tr>
                                </thead>
                                <tbody class="text-[11px] font-medium text-[#6F645E]">
                                    ${frontOfficeGradeUsageRows.map((row) => `
                                        <tr class="border-t border-[#F1E9E3]">
                                            <td class="px-4 py-2.5 font-semibold text-[#2B2521]">${row[0]}</td>
                                            <td class="px-4 py-2.5">${row[1]}</td>
                                            <td class="px-4 py-2.5">${row[2]}</td>
                                            <td class="px-4 py-2.5">${row[3]}</td>
                                            <td class="px-4 py-2.5">${row[4]}</td>
                                            <td class="px-4 py-2.5">${row[5]}</td>
                                            <td class="px-4 py-2.5">${row[6]}</td>
                                            <td class="px-4 py-2.5">
                                                <span class="block rounded-sm bg-[#FAECEE] px-3 py-1 text-center font-bold text-[#9B4A5C]">${row[7]}</span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section class="mt-4">
                        ${renderFrontOfficeSchoolDashboardChart()}
                    </section>
                </section>
            `;
        }

        function renderFrontOfficeDashboard() {
            const stats = getFrontOfficeStats();
            const groupLabel = frontOfficeState.dashboardGroup;
            const isSchoolView = groupLabel === 'School';
            return `
                <section class="mx-auto max-w-[860px]">
                    <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 class="text-[1.6rem] font-black tracking-[-0.04em] text-[#1F1A17] sm:text-[1.85rem]">Front Office</h1>
                            <p class="mt-1.5 text-[12px] font-medium text-[#6F645E]">Manage schools, access codes, and module enablement.</p>
                        </div>
                        ${renderFrontOfficeToggle()}
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-3">
                        ${renderFrontOfficeMetric(stats.schools, 'Schools')}
                        ${renderFrontOfficeMetric(stats.teachers, 'Teachers')}
                        ${renderFrontOfficeMetric(stats.parents, 'Parents')}
                    </div>
                    <div class="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="text-[12px] font-semibold text-[#6F645E]">View</span>
                            <select class="h-9 rounded-full border border-[#E8DDD6] bg-white px-3.5 text-[11px] font-semibold text-[#2B2521]" data-frontoffice-dashboard="view">
                                ${['SuperTeacher', 'Learnometer'].map((item) => `<option ${frontOfficeState.dashboardView === item ? 'selected' : ''}>${item}</option>`).join('')}
                            </select>
                            <select class="h-9 rounded-full border border-[#E8DDD6] bg-white px-3.5 text-[11px] font-semibold text-[#2B2521]" data-frontoffice-dashboard="group">
                                ${['Branch', 'Cluster', 'School'].map((item) => `<option ${frontOfficeState.dashboardGroup === item ? 'selected' : ''}>${item}</option>`).join('')}
                            </select>
                            ${isSchoolView ? `
                                <select class="h-9 rounded-full border border-[#E8DDD6] bg-white px-3.5 text-[11px] font-semibold text-[#2B2521]" data-frontoffice-dashboard-school>
                                    ${frontOfficeSchools.map((item) => `<option value="${item.id}" ${item.id === frontOfficeState.selectedSchoolId ? 'selected' : ''}>${item.xorgCode || item.id}</option>`).join('')}
                                </select>
                            ` : ''}
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <select class="h-9 rounded-full border border-[#E8DDD6] bg-white px-3.5 text-[11px] font-semibold text-[#2B2521]" data-frontoffice-dashboard="range">
                                ${['Last 7 Days', 'Last 30 Days'].map((item) => `<option ${frontOfficeState.dashboardRange === item ? 'selected' : ''}>${item}</option>`).join('')}
                            </select>
                            <span class="text-[11px] font-semibold text-[#8FA0BF]">May 3, 2026 - May 9, 2026</span>
                        </div>
                    </div>
                    ${isSchoolView ? `
                        ${frontOfficeState.selectedSchoolId ? renderFrontOfficeSchoolDashboardContent() : ''}
                    ` : `
                        <section class="mt-4">
                            <p class="mb-2.5 text-[12px] font-bold text-[#2B2521]">${groupLabel} Wise Average Usage per Registered Teacher per Week</p>
                            <div class="overflow-hidden rounded-[1.15rem] border border-[#E8DDD6] bg-white">
                                <div class="grid grid-cols-[minmax(0,1fr)_180px] border-b border-[#ECE3DC] bg-[#FBF6F2] px-3.5 py-2.5 text-[10px] font-bold text-[#2B2521]">
                                    <span>${groupLabel}</span>
                                    <span class="text-right">Average Usage per Registered Teacher per Week</span>
                                </div>
                                ${frontOfficeDashboardRows.map(([branch, value]) => `
                                    <div class="grid grid-cols-[minmax(0,1fr)_180px] border-b border-[#F1E9E3] px-3.5 py-2.5 text-[11px] font-semibold text-[#6F645E] last:border-b-0">
                                        <span>${branch}</span>
                                        <span class="text-right">${value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                        <section class="mt-4">
                            <p class="mb-2.5 text-[12px] font-bold text-[#2B2521]">Average Usage per Registered Teacher per Week Over Time</p>
                            ${renderFrontOfficeDashboardChart()}
                        </section>
                    `}
                </section>
            `;
        }

        function renderFrontOffice() {
            const root = document.getElementById('frontOfficeRoot');
            if (!root) return;
            let markup = '';
            if (frontOfficeState.activeTab === 'Data Dashboard') {
                markup = renderFrontOfficeDashboard();
            } else if (frontOfficeState.view === 'detail') {
                markup = renderFrontOfficeSchoolDetail();
            } else if (frontOfficeState.view === 'create') {
                markup = renderFrontOfficeCreateSchool();
            } else {
                markup = renderFrontOfficeSchoolList();
            }
            root.innerHTML = markup;
            bindFrontOfficeEvents();
        }

        function bindFrontOfficeEvents() {
            const root = document.getElementById('frontOfficeRoot');
            if (!root) return;

            root.querySelectorAll('[data-frontoffice-tab]').forEach((button) => {
                button.addEventListener('click', () => {
                    frontOfficeState = {
                        ...frontOfficeState,
                        activeTab: button.dataset.frontofficeTab,
                        view: button.dataset.frontofficeTab === 'Data Dashboard' ? 'dashboard' : 'list'
                    };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="open-school"]').forEach((button) => {
                button.addEventListener('click', () => {
                    frontOfficeState = {
                        ...frontOfficeState,
                        activeTab: 'School Management',
                        view: 'detail',
                        selectedSchoolId: button.dataset.schoolId
                    };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="open-school-dashboard"]').forEach((button) => {
                button.addEventListener('click', () => {
                    frontOfficeState = {
                        ...frontOfficeState,
                        activeTab: 'Data Dashboard',
                        view: 'dashboard',
                        selectedSchoolId: button.dataset.schoolId
                    };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="back-to-list"]').forEach((button) => {
                button.addEventListener('click', () => {
                    frontOfficeState = { ...frontOfficeState, activeTab: 'School Management', view: 'list' };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="create-school"]').forEach((button) => {
                button.addEventListener('click', () => {
                    frontOfficeState = { ...frontOfficeState, activeTab: 'School Management', view: 'create' };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="toggle-module"]').forEach((button) => {
                button.addEventListener('click', () => {
                    const school = getFrontOfficeSelectedSchool();
                    school.modules = school.modules.map((module) => module.name === button.dataset.moduleName ? { ...module, enabled: !module.enabled } : module);
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-form]').forEach((field) => {
                field.addEventListener('input', (event) => {
                    frontOfficeState = {
                        ...frontOfficeState,
                        createSchool: {
                            ...frontOfficeState.createSchool,
                            [event.currentTarget.dataset.frontofficeForm]: event.currentTarget.value
                        }
                    };
                });
            });

            root.querySelectorAll('[data-frontoffice-dashboard]').forEach((field) => {
                field.addEventListener('change', (event) => {
                    const key = event.currentTarget.dataset.frontofficeDashboard;
                    frontOfficeState = { ...frontOfficeState, view: 'dashboard', [`dashboard${key.charAt(0).toUpperCase()}${key.slice(1)}`]: event.currentTarget.value };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-dashboard-school]').forEach((field) => {
                field.addEventListener('change', (event) => {
                    frontOfficeState = { ...frontOfficeState, selectedSchoolId: event.currentTarget.value, view: 'dashboard' };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="submit-school"]').forEach((button) => {
                button.addEventListener('click', () => {
                    showAppToast('School created. Access codes generated.');
                    frontOfficeState = { ...frontOfficeState, activeTab: 'School Management', view: 'list' };
                    renderFrontOffice();
                });
            });

            root.querySelectorAll('[data-frontoffice-action="bulk-upload"]').forEach((button) => {
                button.addEventListener('click', () => showAppToast('Bulk upload flow coming next.'));
            });
        }

        function renderAnnouncementMedia(media) {
            if (!media) return '';
            if (Array.isArray(media)) {
                return `
                    <div class="mt-5 flex gap-2.5 overflow-x-auto" style="scrollbar-width: none; -ms-overflow-style: none;">
                        ${media.map((item) => `
                            <button type="button" class="focus-ring h-[200px] shrink-0 cursor-zoom-in overflow-hidden rounded-2xl focus:outline-none" style="width: calc(72% - 5px); min-width: calc(72% - 5px);" data-image-preview-src="${escapeHtml(item.url)}" data-image-preview-alt="${escapeHtml(item.alt || '')}" aria-label="Preview ${escapeHtml(item.alt || 'announcement image')}">
                                <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt || '')}" class="h-full w-full object-cover">
                            </button>
                        `).join('')}
                    </div>
                `;
            }

            if (media.type === 'image') {
                return `
                    <button type="button" class="focus-ring mt-5 block h-[200px] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#F5F5F4] focus:outline-none" data-image-preview-src="${escapeHtml(media.url)}" data-image-preview-alt="${escapeHtml(media.alt || '')}" aria-label="Preview ${escapeHtml(media.alt || 'announcement image')}">
                        <img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.alt || '')}" class="h-full w-full object-cover">
                    </button>
                `;
            }

            if (media.type === 'pdf') {
                return `
                    <div class="mt-5 flex items-center gap-4 rounded-3xl border border-[#E7E5E4] bg-[#F5F5F4] p-4">
                        <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#A41034] text-white">
                            <i data-lucide="file-text" class="h-5 w-5"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-black text-[#1C1917]">${escapeHtml(media.name)}</p>
                            <p class="mt-0.5 text-[11px] font-bold  tracking-wider text-[#A8A29E]">PDF · ${escapeHtml(media.size)}</p>
                        </div>
                        <button type="button" class="focus-ring rounded-2xl bg-white px-4 py-2.5 text-[10px] font-black  tracking-wider text-[#A41034] transition hover:bg-[#fff7ed]">View</button>
                    </div>
                `;
            }

            if (media.type === 'video') {
                return `
                    <div class="relative mt-5 overflow-hidden rounded-3xl bg-[#1C1917]">
                        <img src="${escapeHtml(media.thumbnail)}" alt="${escapeHtml(media.alt || '')}" class="h-72 w-full object-cover opacity-80">
                        <button type="button" class="focus-ring absolute inset-0 grid place-items-center" aria-label="Play video">
                            <span class="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-[#A41034] shadow-2xl">
                                <i data-lucide="play" class="h-7 w-7 fill-current"></i>
                            </span>
                        </button>
                    </div>
                `;
            }

            return '';
        }

        function renderReactions(announcement) {
            return Object.entries(announcement.reactions).map(([emoji, count]) => {
                const active = announcement.myReactions.has(emoji);
                return `
                    <button type="button" class="reaction-button focus-ring rounded-xl px-3 py-2 text-xs font-bold transition ${active ? 'bg-[#fff7ed] text-[#A41034] ring-1 ring-[#f59138]/30' : 'bg-[#F5F5F4] text-[#78716C] hover:bg-[#fff7ed] hover:text-[#A41034]'}" data-post-id="${announcement.id}" data-emoji="${escapeHtml(emoji)}">
                        <span aria-hidden="true">${emoji}</span>
                        <span>${count + (active ? 1 : 0)}</span>
                    </button>
                `;
            }).join('');
        }

        function renderAnnouncementCard(announcement) {
            const avatar = escapeHtml(initialsFromName(announcement.author));

            return `
                <article class="rounded-3xl bg-white p-5 ring-1 ring-[#E7E5E4]/80 transition-colors hover:ring-[#D8D2CC] sm:p-6">
                    <div class="mb-4 flex items-start justify-between gap-4">
                        <div class="flex min-w-0 items-center gap-4">
                            <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A41034] text-sm font-bold tracking-normal text-white">${avatar}</div>
                            <div class="min-w-0">
                                <h2 class="truncate text-[15px] font-semibold text-[#1C1917]">${escapeHtml(announcement.author)}</h2>
                                <p class="mt-0.5 text-xs font-medium text-[#78716C]">${escapeHtml(announcement.role)} · ${escapeHtml(announcement.timestamp)}</p>
                            </div>
                        </div>
                        <span class="shrink-0 rounded-full bg-[#F5F5F4] px-3 py-1 text-xs font-semibold text-[#78716C]">${escapeHtml(announcement.audience)}</span>
                    </div>
                    <div class="space-y-3 text-[#2E2A28]">${renderAnnouncementText(announcement.text)}</div>
                    ${renderAnnouncementMedia(announcement.media)}
                    <div class="mt-4 flex flex-wrap gap-2 border-t border-[#F0EEEC] pt-4">${renderReactions(announcement)}</div>
                </article>
            `;
        }

        function updateCommunicationActions() {
            const actionButtons = document.getElementById('newAnnouncementButton')?.parentElement;
            actionButtons?.classList.toggle('hidden', false);
        }

        function renderCommunicationComposer() {
            const compose = document.getElementById('communicationModalRoot');
            if (!compose) return;

            updateCommunicationActions();
            if (communicationModal !== 'compose-announcement') {
                if (!communicationModal) compose.innerHTML = '';
                return;
            }

            compose.innerHTML = `
                <div class="fixed inset-0 z-[120] flex items-center justify-center bg-[#1C1917]/50 px-4 backdrop-blur-sm">
                    <div class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-[#E7E5E4] bg-white shadow-[0_24px_80px_rgba(28,25,23,0.18)]">
                        <div class="flex shrink-0 items-center justify-between border-b border-[#F5F5F4] px-8 pb-5 pt-8">
                            <div class="flex items-center gap-2">
                                <h3 class="communication-card-title text-[#1C1917]">New Announcement</h3>
                            </div>
                            <button type="button" id="closeComposeButton" class="focus-ring grid h-8 w-8 place-items-center rounded-xl bg-[#F5F5F4] text-[#78716C] transition-colors hover:bg-[#E7E5E4]" aria-label="Close announcement form">
                                <i data-lucide="x" class="h-4 w-4"></i>
                            </button>
                        </div>
                        <form id="announcementForm" class="flex min-h-0 flex-1 flex-col">
                            <div class="flex-1 overflow-y-auto px-8 py-6">
                                <div class="mb-5">
                                    <label class="mb-2 block text-[10px] font-bold uppercase tracking-wide text-[#A8A29E]">Group</label>
                                    <div class="flex items-center gap-2">
                                        <select id="announcementAudience" class="h-12 flex-1 cursor-pointer rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-4 text-[13px] font-bold text-[#1C1917] outline-none transition-colors hover:border-[#A41034]/20">
                                            <optgroup label="Default">
                                                ${communicationGradeFilters.map((audience) => `<option ${audience === announcementDraftAudience ? 'selected' : ''}>${escapeHtml(audience)}</option>`).join('')}
                                            </optgroup>
                                            ${communicationGroups.length ? `
                                                <optgroup label="My Groups">
                                                    ${communicationGroups.map((group) => `<option ${group.name === announcementDraftAudience ? 'selected' : ''}>${escapeHtml(group.name)}</option>`).join('')}
                                                </optgroup>
                                            ` : ''}
                                        </select>
                                        <button type="button" id="openGroupCreateButton" class="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#A41034] text-white transition-colors hover:bg-[#7a0c26]" aria-label="Create group">
                                            <i data-lucide="plus" class="h-4 w-4"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="mb-5">
                                    <label class="mb-2 block text-[10px] font-bold uppercase tracking-wide text-[#A8A29E]">Message</label>
                                    <textarea id="announcementText" rows="5" placeholder="Write your announcement here..." class="w-full resize-none rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-5 py-4 text-[14px] font-medium text-[#1C1917] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#A41034]/30">${escapeHtml(announcementDraftText)}</textarea>
                                </div>
                                <div>
                                    <label class="mb-2 block text-[10px] font-bold uppercase tracking-wide text-[#A8A29E]">Attachment</label>
                                    <label id="announcementDropzone" class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D6D3D1] bg-[#F5F5F4] py-6 text-center transition-all hover:border-[#A41034]/30 hover:bg-[#A41034]/[0.03]">
                                        <input id="announcementFile" type="file" accept="image/*,video/*,.pdf" class="hidden">
                                        <span class="grid h-10 w-10 place-items-center rounded-2xl border border-[#E7E5E4] bg-white text-[#A8A29E]">
                                            <i data-lucide="upload" class="h-4 w-4"></i>
                                        </span>
                                        <span id="announcementFileLabel" class="text-[12px] font-bold text-[#78716C]">Drag & drop or <span class="text-[#A41034]">browse</span></span>
                                        <span class="text-[10px] font-bold text-[#A8A29E]">Images, Videos, PDFs</span>
                                    </label>
                                </div>
                            </div>
                            <div class="flex shrink-0 items-center justify-end gap-3 border-t border-[#F5F5F4] px-8 py-5">
                                <button type="button" id="discardAnnouncementButton" class="focus-ring rounded-2xl px-6 py-3 text-[11px] font-bold text-[#78716C] transition-colors hover:bg-[#F5F5F4]">Discard</button>
                                <button type="submit" id="publishAnnouncementButton" disabled class="focus-ring rounded-2xl bg-[#A8A29E] px-8 py-3 text-[11px] font-bold text-white transition-all active:scale-95">Publish Announcement</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            const textInput = compose.querySelector('#announcementText');
            const audienceSelect = compose.querySelector('#announcementAudience');
            const publishButton = compose.querySelector('#publishAnnouncementButton');
            const fileInput = compose.querySelector('#announcementFile');
            const fileLabel = compose.querySelector('#announcementFileLabel');
            const dropzone = compose.querySelector('#announcementDropzone');
            const updatePublishButton = () => {
                const ready = textInput.value.trim().length > 0;
                publishButton.disabled = !ready;
                publishButton.className = `focus-ring rounded-2xl px-8 py-3 text-[11px] font-bold text-white transition-all active:scale-95 ${ready ? 'bg-[#A41034] hover:bg-[#7a0c26]' : 'cursor-not-allowed bg-[#A8A29E]'}`;
            };
            const updateFileLabel = () => {
                const file = fileInput.files?.[0];
                if (file) fileLabel.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
            };

            textInput.addEventListener('input', () => {
                announcementDraftText = textInput.value;
                updatePublishButton();
            });
            audienceSelect.addEventListener('change', () => {
                announcementDraftAudience = audienceSelect.value;
            });
            fileInput.addEventListener('change', updateFileLabel);
            dropzone.addEventListener('dragover', (event) => {
                event.preventDefault();
                dropzone.classList.add('border-[#A41034]', 'bg-[#A41034]/5');
            });
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('border-[#A41034]', 'bg-[#A41034]/5');
            });
            dropzone.addEventListener('drop', (event) => {
                event.preventDefault();
                dropzone.classList.remove('border-[#A41034]', 'bg-[#A41034]/5');
                if (!event.dataTransfer.files?.length) return;
                try {
                    fileInput.files = event.dataTransfer.files;
                    updateFileLabel();
                } catch (error) {
                    fileLabel.textContent = event.dataTransfer.files[0].name;
                }
            });
            compose.querySelector('#closeComposeButton')?.addEventListener('click', closeCommunicationComposer);
            compose.querySelector('#discardAnnouncementButton')?.addEventListener('click', closeCommunicationComposer);
            compose.querySelector('#openGroupCreateButton')?.addEventListener('click', () => openGroupModal('compose-announcement'));
            compose.querySelector('#announcementForm')?.addEventListener('submit', (event) => {
                event.preventDefault();
                const text = textInput.value.trim();
                if (!text) return;

                const file = fileInput.files?.[0];
                let media = null;
                if (file?.type.startsWith('image/')) {
                    media = { type: 'image', url: URL.createObjectURL(file), alt: file.name };
                } else if (file?.type.startsWith('video/')) {
                    media = { type: 'video', thumbnail: 'https://picsum.photos/seed/uservid/900/450', alt: file.name };
                } else if (file) {
                    media = { type: 'pdf', name: file.name, size: `${Math.round(file.size / 1024)} KB` };
                }

                initialAnnouncements.unshift({
                    id: Date.now(),
                    author: 'Ravi Sharma',
                    role: 'Admin',
                    timestamp: 'Just now',
                    audience: audienceSelect?.value || 'All Grades',
                    text,
                    media,
                    reactions: { '👍': 0, '❤️': 0, '🎉': 0, '😊': 0, '🙏': 0 },
                    myReactions: new Set()
                });
                announcementDraftAudience = 'All Grades';
                announcementDraftText = '';
                closeCommunicationComposer();
                renderCommunicationFeed();
                lucide.createIcons();
            });

            lucide.createIcons();
            updatePublishButton();
        }

        function closeCommunicationComposer() {
            communicationComposing = false;
            communicationModal = null;
            announcementDraftAudience = 'All Grades';
            announcementDraftText = '';
            renderCommunicationComposer();
        }

        function studentInitials(student) {
            return initialsFromName(student.name);
        }

        function renderGroupModal(focusId = '') {
            const root = document.getElementById('communicationModalRoot');
            if (!root) return;

            if (communicationModal !== 'create-group') {
                root.innerHTML = '';
                return;
            }

            const grades = [...new Set(ALL_STUDENTS.map((student) => student.grade))].sort();
            const query = groupDraftSearch.trim().toLowerCase();
            const filtered = ALL_STUDENTS.filter((student) => !query || student.name.toLowerCase().includes(query) || student.grade.toLowerCase().includes(query));

            root.innerHTML = `
                <div class="fixed inset-0 z-[120] flex items-center justify-center bg-[#1C1917]/50 px-4 backdrop-blur-sm">
                    <div class="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-[#E7E5E4] bg-white shadow-[0_24px_80px_rgba(28,25,23,0.18)]">
                        <div class="flex shrink-0 items-center justify-between border-b border-[#F5F5F4] px-8 pb-5 pt-8">
                            <div class="flex items-center gap-2">
                                <div class="h-6 w-1.5 rounded-full bg-[#A41034]"></div>
                                <h3 class="communication-card-title text-[#1C1917]">New Group</h3>
                            </div>
                            <button type="button" class="close-modal focus-ring grid h-8 w-8 place-items-center rounded-xl bg-[#F5F5F4] text-[#78716C] transition-colors hover:bg-[#E7E5E4]" aria-label="Close group form">
                                <i data-lucide="x" class="h-4 w-4"></i>
                            </button>
                        </div>
                        <div class="shrink-0 px-8 py-5">
                            <input id="groupNameInput" value="${escapeHtml(groupDraftName)}" placeholder="Group name..." class="mb-4 w-full rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-4 py-3 text-[13px] font-bold text-[#1C1917] outline-none placeholder:text-[#A8A29E]">
                            <div class="relative">
                                <i data-lucide="search" class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]"></i>
                                <input id="groupSearchInput" value="${escapeHtml(groupDraftSearch)}" placeholder="Search students..." class="w-full rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] py-3 pl-10 pr-4 text-[12px] font-bold text-[#1C1917] outline-none placeholder:text-[#A8A29E]">
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto px-8 pb-5">
                            ${grades.map((grade) => {
                const gradeStudents = filtered.filter((student) => student.grade === grade);
                if (!gradeStudents.length) return '';
                const gradeIds = ALL_STUDENTS.filter((student) => student.grade === grade).map((student) => student.id);
                const allSelected = gradeIds.every((id) => groupDraftSelected.has(id));
                return `
                                    <div class="mb-4">
                                        <button type="button" class="toggle-grade mb-2 flex w-full items-center gap-2" data-grade="${escapeHtml(grade)}">
                                            <span class="grid h-4 w-4 place-items-center rounded-md border-2 ${allSelected ? 'border-[#A41034] bg-[#A41034] text-white' : 'border-[#D6D3D1]'}">${allSelected ? '<i data-lucide="check" class="h-2.5 w-2.5"></i>' : ''}</span>
                                            <span class="text-[10px] font-bold uppercase tracking-wide text-[#A8A29E]">${escapeHtml(grade)}</span>
                                        </button>
                                        <div class="space-y-1 pl-1">
                                            ${gradeStudents.map((student) => {
                    const selected = groupDraftSelected.has(student.id);
                    return `
                                                    <button type="button" class="toggle-student flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${selected ? 'border-[#A41034]/20 bg-[#A41034]/5' : 'border-transparent bg-[#F5F5F4] hover:border-[#E7E5E4]'}" data-student-id="${student.id}">
                                                        <span class="grid h-4 w-4 shrink-0 place-items-center rounded-md border-2 ${selected ? 'border-[#A41034] bg-[#A41034] text-white' : 'border-[#D6D3D1]'}">${selected ? '<i data-lucide="check" class="h-2.5 w-2.5"></i>' : ''}</span>
                                                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#A41034] text-[11px] font-bold text-white">${escapeHtml(studentInitials(student))}</span>
                                                        <span>
                                                            <span class="block text-[13px] font-bold leading-none text-[#1C1917]">${escapeHtml(student.name)}</span>
                                                            <span class="mt-0.5 block text-[10px] font-bold text-[#A8A29E]">${escapeHtml(student.grade)}</span>
                                                        </span>
                                                    </button>
                                                `;
                }).join('')}
                                        </div>
                                    </div>
                                `;
            }).join('')}
                        </div>
                        <div class="flex shrink-0 items-center justify-between border-t border-[#F5F5F4] px-8 py-5">
                            <span class="text-[11px] font-bold text-[#A8A29E]">${groupDraftSelected.size} selected</span>
                            <div class="flex items-center gap-3">
                                <button type="button" class="close-modal focus-ring rounded-2xl px-5 py-2.5 text-[11px] font-bold text-[#78716C] transition-colors hover:bg-[#F5F5F4]">Cancel</button>
                                <button type="button" id="createGroupButton" ${groupDraftName.trim() && groupDraftSelected.size ? '' : 'disabled'} class="focus-ring rounded-2xl px-6 py-2.5 text-[11px] font-bold text-white transition-all active:scale-95 ${groupDraftName.trim() && groupDraftSelected.size ? 'bg-[#A41034] hover:bg-[#7a0c26]' : 'cursor-not-allowed bg-[#A8A29E]'}">Create Group</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            bindGroupModalEvents(root);
            lucide.createIcons();
            if (focusId) {
                const focusedInput = root.querySelector(`#${focusId}`);
                focusedInput?.focus();
                if (typeof focusedInput?.setSelectionRange === 'function') {
                    const end = focusedInput.value.length;
                    focusedInput.setSelectionRange(end, end);
                }
            }
        }

        function bindGroupModalEvents(root) {
            root.querySelectorAll('.close-modal').forEach((button) => button.addEventListener('click', closeCommunicationModal));
            root.querySelector('#groupNameInput')?.addEventListener('input', (event) => {
                groupDraftName = event.target.value;
                renderGroupModal('groupNameInput');
            });
            root.querySelector('#groupSearchInput')?.addEventListener('input', (event) => {
                groupDraftSearch = event.target.value;
                renderGroupModal('groupSearchInput');
            });
            root.querySelectorAll('.toggle-student').forEach((button) => {
                button.addEventListener('click', () => {
                    const id = Number(button.dataset.studentId);
                    if (groupDraftSelected.has(id)) groupDraftSelected.delete(id);
                    else groupDraftSelected.add(id);
                    renderGroupModal();
                });
            });
            root.querySelectorAll('.toggle-grade').forEach((button) => {
                button.addEventListener('click', () => {
                    const gradeIds = ALL_STUDENTS.filter((student) => student.grade === button.dataset.grade).map((student) => student.id);
                    const allSelected = gradeIds.every((id) => groupDraftSelected.has(id));
                    gradeIds.forEach((id) => allSelected ? groupDraftSelected.delete(id) : groupDraftSelected.add(id));
                    renderGroupModal();
                });
            });
            root.querySelector('#createGroupButton')?.addEventListener('click', () => {
                if (!groupDraftName.trim() || !groupDraftSelected.size) return;
                communicationGroups.push({
                    name: groupDraftName.trim(),
                    members: ALL_STUDENTS.filter((student) => groupDraftSelected.has(student.id))
                });
                if (communicationReturnModal === 'compose-announcement') {
                    communicationReturnModal = null;
                    communicationModal = 'compose-announcement';
                    renderCommunicationComposer();
                } else {
                    closeCommunicationModal();
                    renderCommunicationComposer();
                }
            });
        }

        function openGroupModal(returnModal = null) {
            groupDraftName = '';
            groupDraftSearch = '';
            groupDraftSelected = new Set();
            communicationReturnModal = returnModal;
            communicationModal = 'create-group';
            renderGroupModal();
        }

        function closeCommunicationModal() {
            if (communicationModal === 'create-group' && communicationReturnModal === 'compose-announcement') {
                communicationReturnModal = null;
                communicationModal = 'compose-announcement';
                renderCommunicationComposer();
                return;
            }
            communicationModal = null;
            communicationReturnModal = null;
            manageExpandedGroup = null;
            manageConfirmDelete = null;
            renderGroupModal();
            renderManageGroupsModal();
        }

        function renderManageGroupsModal() {
            const root = document.getElementById('communicationModalRoot');
            if (!root) return;

            if (communicationModal !== 'manage-groups') {
                if (communicationModal !== 'create-group') root.innerHTML = '';
                return;
            }

            root.innerHTML = `
                <div class="fixed inset-0 z-[120] flex items-center justify-center bg-[#1C1917]/50 px-4 backdrop-blur-sm">
                    <div class="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-[#E7E5E4] bg-white shadow-[0_24px_80px_rgba(28,25,23,0.18)]">
                        <div class="flex shrink-0 items-center justify-between border-b border-[#F5F5F4] px-8 pb-5 pt-8">
                            <div class="flex items-center gap-2">
                                <h3 class="communication-card-title text-[#1C1917]">Groups</h3>
                            </div>
                            <div class="flex items-center gap-2">
                                <button type="button" id="manageNewGroupButton" class="focus-ring flex items-center gap-2 rounded-2xl bg-[#A41034] px-4 py-2 text-[10px] font-bold text-white transition-colors hover:bg-[#7a0c26]">
                                    <i data-lucide="plus" class="h-3 w-3"></i>
                                    New Group
                                </button>
                                <button type="button" class="close-modal focus-ring grid h-8 w-8 place-items-center rounded-xl bg-[#F5F5F4] text-[#78716C] transition-colors hover:bg-[#E7E5E4]" aria-label="Close manage groups">
                                    <i data-lucide="x" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto px-8 py-6">
                            ${communicationGroups.length ? `
                                <div class="space-y-3">
                                    ${communicationGroups.map((group) => `
                                        <div class="overflow-hidden rounded-2xl border border-[#E7E5E4]">
                                            <div class="flex items-center justify-between px-5 py-4">
                                                <button type="button" class="expand-group flex flex-1 items-center gap-3 text-left" data-group="${escapeHtml(group.name)}">
                                                    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#A41034] text-white"><i data-lucide="users" class="h-4 w-4"></i></span>
                                                    <span>
                                                        <span class="block text-[13px] font-bold text-[#1C1917]">${escapeHtml(group.name)}</span>
                                                        <span class="block text-[10px] font-bold text-[#A8A29E]">${group.members.length} members</span>
                                                    </span>
                                                    <i data-lucide="chevron-down" class="ml-2 h-4 w-4 text-[#A8A29E] transition-transform ${manageExpandedGroup === group.name ? 'rotate-180' : ''}"></i>
                                                </button>
                                                ${manageConfirmDelete === group.name ? `
                                                    <div class="ml-3 flex items-center gap-2">
                                                        <span class="text-[10px] font-bold text-[#78716C]">Delete?</span>
                                                        <button type="button" class="confirm-delete rounded-xl bg-red-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-red-600" data-group="${escapeHtml(group.name)}">Yes</button>
                                                        <button type="button" class="cancel-delete rounded-xl bg-[#F5F5F4] px-3 py-1.5 text-[10px] font-bold text-[#78716C] hover:bg-[#E7E5E4]">No</button>
                                                    </div>
                                                ` : `
                                                    <button type="button" class="delete-group ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[#A8A29E] transition-all hover:bg-red-50 hover:text-red-500" data-group="${escapeHtml(group.name)}" aria-label="Delete ${escapeHtml(group.name)}">
                                                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                                                    </button>
                                                `}
                                            </div>
                                            ${manageExpandedGroup === group.name ? `
                                                <div class="border-t border-[#F5F5F4] bg-[#FAFAF9] px-5 py-3">
                                                    <div class="space-y-2">
                                                        ${group.members.map((student) => `
                                                            <div class="flex items-center gap-3">
                                                                <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#A41034] text-[10px] font-bold text-white">${escapeHtml(studentInitials(student))}</span>
                                                                <span class="text-[12px] font-bold text-[#1C1917]">${escapeHtml(student.name)}</span>
                                                                <span class="ml-auto text-[10px] font-bold text-[#A8A29E]">${escapeHtml(student.grade)}</span>
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="flex flex-col items-center justify-center py-16 text-center">
                                    <div class="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] text-[#A8A29E]">
                                        <i data-lucide="users" class="h-6 w-6"></i>
                                    </div>
                                    <p class="mb-1 text-[14px] font-bold text-[#1C1917]">No groups yet</p>
                                    <p class="text-[12px] font-medium text-[#A8A29E]">Create a group from the New Announcement form.</p>
                                </div>
                            `}
                        </div>
                        <div class="flex shrink-0 justify-end border-t border-[#F5F5F4] px-8 py-5">
                            <button type="button" class="close-modal focus-ring rounded-2xl bg-[#F5F5F4] px-6 py-2.5 text-[11px] font-bold text-[#78716C] transition-colors hover:bg-[#E7E5E4]">Done</button>
                        </div>
                    </div>
                </div>
            `;

            root.querySelectorAll('.close-modal').forEach((button) => button.addEventListener('click', closeCommunicationModal));
            root.querySelector('#manageNewGroupButton')?.addEventListener('click', () => openGroupModal());
            root.querySelectorAll('.expand-group').forEach((button) => {
                button.addEventListener('click', () => {
                    manageExpandedGroup = manageExpandedGroup === button.dataset.group ? null : button.dataset.group;
                    renderManageGroupsModal();
                });
            });
            root.querySelectorAll('.delete-group').forEach((button) => {
                button.addEventListener('click', () => {
                    manageConfirmDelete = button.dataset.group;
                    renderManageGroupsModal();
                });
            });
            root.querySelectorAll('.cancel-delete').forEach((button) => {
                button.addEventListener('click', () => {
                    manageConfirmDelete = null;
                    renderManageGroupsModal();
                });
            });
            root.querySelectorAll('.confirm-delete').forEach((button) => {
                button.addEventListener('click', () => {
                    const index = communicationGroups.findIndex((group) => group.name === button.dataset.group);
                    if (index >= 0) communicationGroups.splice(index, 1);
                    manageExpandedGroup = null;
                    manageConfirmDelete = null;
                    renderManageGroupsModal();
                    renderCommunicationComposer();
                });
            });
            lucide.createIcons();
        }

        function renderCommunicationFeed() {
            const feed = document.getElementById('communicationFeed');
            const filter = communicationFilter;
            if (!feed) return;

            const query = communicationSearchQuery.trim().toLowerCase();
            const filtered = initialAnnouncements.filter((announcement) => {
                if (!audienceMatchesFilter(announcement, filter)) return false;
                if (!query) return true;
                return [
                    announcement.author,
                    announcement.role,
                    announcement.timestamp,
                    announcement.audience,
                    announcement.text
                ].some((value) => String(value || '').toLowerCase().includes(query));
            });
            feed.innerHTML = filtered.length
                ? filtered.map(renderAnnouncementCard).join('')
                : '<div class="rounded-3xl bg-white p-10 text-center text-sm font-semibold text-[#78716C] ring-1 ring-[#E7E5E4]/80">No announcements found.</div>';

            feed.querySelectorAll('.reaction-button').forEach((button) => {
                button.addEventListener('click', () => {
                    const post = initialAnnouncements.find((announcement) => announcement.id === Number(button.dataset.postId));
                    if (!post) return;
                    if (post.myReactions.has(button.dataset.emoji)) {
                        post.myReactions.delete(button.dataset.emoji);
                    } else {
                        post.myReactions.add(button.dataset.emoji);
                    }
                    renderCommunicationFeed();
                    lucide.createIcons();
                });
            });
            feed.querySelectorAll('[data-image-preview-src]').forEach((button) => {
                button.addEventListener('click', () => {
                    openImageLightbox(button.dataset.imagePreviewSrc, button.dataset.imagePreviewAlt || '');
                });
            });
        }

        function getCommunicationFilterLabel(filter) {
            if (filter === 'All Grades') return 'All';
            if (filter === 'Nursery') return 'NUR';
            const grade = filter.match(/Grade\s+(\d+)/i);
            return grade ? `G${grade[1]}` : filter;
        }

        function renderCommunicationFilterToolbar() {
            const toolbar = document.getElementById('communicationFilterToolbar');
            if (!toolbar) return;

            toolbar.classList.toggle('hidden', activeAppTab !== 'Communication');
            if (activeAppTab !== 'Communication') return;

            toolbar.innerHTML = `
                <nav class="mx-auto flex max-w-[min(28rem,calc(100vw-2rem))] flex-row flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-[#A41034]/10 bg-white/85 p-2.5 shadow-[0_18px_50px_rgba(123,3,35,0.12)] backdrop-blur-2xl lg:max-w-none lg:flex-col lg:gap-1 lg:p-2" aria-label="Filter announcements by grade">
                    ${communicationGradeFilters.map((filter) => `
                        <button type="button" class="communication-filter-button group/tip relative focus-ring grid h-9 min-w-9 place-items-center rounded-full px-2 text-[11px] font-bold text-[#A41034] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A41034]/5 hover:text-[#5a0219] focus:outline-none lg:h-7 lg:min-w-7 lg:px-1.5 lg:text-[10px] ${filter === communicationFilter ? 'bg-[#f59138]/15 ring-1 ring-[#f59138]/30' : ''}" data-communication-filter="${escapeHtml(filter)}" aria-label="Show ${escapeHtml(filter)} announcements">
                            <span>${escapeHtml(getCommunicationFilterLabel(filter))}</span>
                            <span class="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#A41034]/10 bg-[#fffaf3] px-2.5 py-1.5 text-[11px] font-semibold text-[#A41034] opacity-0 shadow-lg shadow-[#A41034]/10 transition-all duration-200 group-hover/tip:translate-x-0 group-hover/tip:opacity-100 group-focus-visible/tip:translate-x-0 group-focus-visible/tip:opacity-100 lg:block">${escapeHtml(filter)}</span>
                        </button>
                    `).join('')}
                </nav>
            `;

            toolbar.querySelectorAll('.communication-filter-button').forEach((button) => {
                button.addEventListener('click', () => {
                    communicationFilter = button.dataset.communicationFilter || 'All Grades';
                    renderCommunicationFilterToolbar();
                    renderCommunicationFeed();
                });
            });
            lucide.createIcons();
        }

        function bindCommunicationSearch() {
            const searchInput = document.getElementById('communicationSearchInput');
            if (!searchInput) return;
            searchInput.value = communicationSearchQuery;
            searchInput.addEventListener('input', () => {
                communicationSearchQuery = searchInput.value;
                renderCommunicationFeed();
            });
        }

        function openNewAnnouncement() {
            communicationFabOpen = false;
            communicationComposing = true;
            communicationModal = 'compose-announcement';
            renderCommunicationFab();
            renderCommunicationComposer();
        }

        function openManageGroups() {
            communicationFabOpen = false;
            communicationModal = 'manage-groups';
            renderCommunicationFab();
            renderManageGroupsModal();
        }

        function renderCommunicationFab() {
            const root = document.getElementById('communicationFabRoot');
            if (!root) return;

            root.classList.toggle('hidden', activeAppTab !== 'Communication');
            if (activeAppTab !== 'Communication') {
                root.innerHTML = '';
                return;
            }

            root.innerHTML = `
                <div class="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3">
                    <div class="${communicationFabOpen ? 'flex' : 'hidden'} flex-col gap-2 rounded-3xl bg-white p-2 ring-1 ring-[#E7E5E4]">
                        <button type="button" class="communication-fab-action focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F7F5F3] focus:outline-none" data-communication-action="new-announcement">
                            <i data-lucide="send" class="h-4 w-4 text-[#A41034]"></i>
                            <span>New Announcement</span>
                        </button>
                        <button type="button" class="communication-fab-action focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#1C1917] transition-colors hover:bg-[#F7F5F3] focus:outline-none" data-communication-action="manage-groups">
                            <i data-lucide="users" class="h-4 w-4 text-[#A41034]"></i>
                            <span>Groups</span>
                        </button>
                    </div>
                    <button type="button" id="communicationFabButton" class="focus-ring grid h-14 w-14 place-items-center rounded-full bg-[#A41034] text-white shadow-[0_14px_30px_rgba(164,16,52,0.24)] transition-colors hover:bg-[#7a0c26] focus:outline-none" aria-label="Open communication actions" aria-expanded="${communicationFabOpen}">
                        <i data-lucide="${communicationFabOpen ? 'x' : 'plus'}" class="h-6 w-6"></i>
                    </button>
                </div>
            `;

            root.querySelector('#communicationFabButton')?.addEventListener('click', (event) => {
                event.stopPropagation();
                communicationFabOpen = !communicationFabOpen;
                renderCommunicationFab();
            });

            root.querySelectorAll('[data-communication-action]').forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (button.dataset.communicationAction === 'new-announcement') openNewAnnouncement();
                    if (button.dataset.communicationAction === 'manage-groups') openManageGroups();
                });
            });

            lucide.createIcons();
        }

        const LEARNOMETER_TEST = {
            name: 'Mathematics Unit Assessment',
            subject: 'Mathematics',
            grade: 'Grade 4',
            block: 'Block 03 - Fractions',
            duration: 30
        };

        const LEARNOMETER_QUESTIONS = [
            { text: 'If 3 out of 8 equal parts of a shape are shaded, what fraction is shaded?', options: ['3/8', '5/8', '8/3', '1/3'], answer: 0 },
            { text: 'Which fraction is equivalent to 1/2?', options: ['2/4', '1/4', '3/4', '2/3'], answer: 0 },
            { text: 'What is 1/4 + 1/4?', options: ['2/4', '2/8', '1/8', '4/1'], answer: 0 },
            { text: 'Which of these fractions is the largest?', options: ['3/4', '1/2', '1/4', '2/5'], answer: 0 },
            { text: 'A pizza is cut into 6 equal slices. You eat 2. What fraction of the pizza remains?', options: ['4/6', '2/6', '6/4', '2/3'], answer: 0 },
            { text: 'What is 3/4 of 8?', options: ['6', '4', '3', '2'], answer: 0 },
            { text: 'Which of these is a proper fraction?', options: ['3/5', '5/3', '5/5', '6/3'], answer: 0 },
            { text: 'Simplify 4/8 to its lowest form.', options: ['1/2', '2/4', '4/8', '1/4'], answer: 0 },
            { text: 'What fraction of one hour is 15 minutes?', options: ['1/4', '1/2', '1/3', '3/4'], answer: 0 },
            { text: 'You have 2/5 of a ribbon. You add 1/5 more. What is the total?', options: ['3/5', '3/10', '2/10', '1/5'], answer: 0 }
        ];

        const learnometerState = {
            step: 'login',
            studentId: '',
            teacherCode: '',
            loginError: '',
            testType: null,
            currentQ: 0,
            selected: null,
            answers: [],
            timeLeft: 0,
            testDone: false,
            timer: null
        };

        function learnometerLogo(size = 26) {
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#f59138" stroke="#f59138" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>`;
        }

        function formatLearnometerTime(secs) {
            const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
            const seconds = (secs % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        }

        function stopLearnometerTimer() {
            if (learnometerState.timer) {
                clearInterval(learnometerState.timer);
                learnometerState.timer = null;
            }
        }

        function startLearnometerTimer() {
            stopLearnometerTimer();
            learnometerState.timer = setInterval(() => {
                if (learnometerState.step !== 'test' || learnometerState.testDone) {
                    stopLearnometerTimer();
                    return;
                }

                if (learnometerState.timeLeft <= 1) {
                    learnometerState.timeLeft = 0;
                    learnometerState.testDone = true;
                    stopLearnometerTimer();
                    renderLearnometer();
                    return;
                }

                learnometerState.timeLeft -= 1;
                const timerNode = document.getElementById('learnometerTimer');
                if (timerNode) timerNode.textContent = formatLearnometerTime(learnometerState.timeLeft);
            }, 1000);
        }

        function startLearnometerTest(type) {
            learnometerState.testType = type;
            learnometerState.currentQ = 0;
            learnometerState.selected = null;
            learnometerState.answers = [];
            learnometerState.timeLeft = LEARNOMETER_TEST.duration * 60;
            learnometerState.testDone = false;
            learnometerState.step = 'test';
            renderLearnometer();
            startLearnometerTimer();
        }

        function completeLearnometerQuestion() {
            learnometerState.answers[learnometerState.currentQ] = learnometerState.selected;

            if (learnometerState.currentQ + 1 >= LEARNOMETER_QUESTIONS.length) {
                learnometerState.testDone = true;
                stopLearnometerTimer();
            } else {
                learnometerState.currentQ += 1;
                learnometerState.selected = null;
            }

            renderLearnometer();
            if (learnometerState.step === 'test' && !learnometerState.testDone) startLearnometerTimer();
        }

        function resetLearnometer() {
            stopLearnometerTimer();
            learnometerState.step = 'login';
            learnometerState.studentId = '';
            learnometerState.teacherCode = '';
            learnometerState.loginError = '';
            learnometerState.testType = null;
            learnometerState.currentQ = 0;
            learnometerState.selected = null;
            learnometerState.answers = [];
            learnometerState.timeLeft = 0;
            learnometerState.testDone = false;
            renderLearnometer();
        }

        function renderLearnometerLogin() {
            const ready = learnometerState.studentId.trim() && learnometerState.teacherCode.trim();
            return `
                <section class="flex min-h-[calc(100vh-80px)] items-start justify-center pt-16 tab-content max-sm:pt-8">
                    <div class="w-full max-w-[460px]">
                        <div class="mb-7 flex flex-col items-center fade-in">
                            <h1 class="font-['Poppins'] text-[30px] font-semibold leading-9 tracking-[-0.3px] text-[#1C1917]">Learnometer</h1>
                            <p class="mt-1 text-sm font-normal leading-6 text-[#8B8B8B]">Sign in to access your test</p>
                        </div>
                        <form id="learnometerLoginForm" class="slide-up rounded-[20px] border border-[#ECE8E4] bg-white p-8 shadow-[0_20px_50px_rgba(28,25,23,0.08)] max-sm:p-6">
                            <div class="mb-6 space-y-5">
                                <div>
                                    <label class="mb-2 block text-xs font-medium leading-5 text-[#8B8B8B]">XSEED student ID</label>
                                    <span class="flex h-[52px] items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 transition-all focus-within:border-[#A41034] focus-within:shadow-[0_0_0_3px_rgba(164,16,52,0.10)]">
                                        <i data-lucide="id-card" class="h-4 w-4 shrink-0 text-[#A41034]"></i>
                                        <input id="learnometerStudentId" type="text" value="${escapeHtml(learnometerState.studentId)}" placeholder="e.g. XS-2026-04821" class="w-full bg-transparent text-sm font-medium text-[#1C1917] placeholder-[#B8B2AE] outline-none">
                                    </span>
                                </div>
                                <div>
                                    <label class="mb-2 block text-xs font-medium leading-5 text-[#8B8B8B]">Teacher code</label>
                                    <span class="flex h-[52px] items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 transition-all focus-within:border-[#A41034] focus-within:shadow-[0_0_0_3px_rgba(164,16,52,0.10)]">
                                        <i data-lucide="key-round" class="h-4 w-4 shrink-0 text-[#A41034]"></i>
                                        <input id="learnometerTeacherCode" type="text" value="${escapeHtml(learnometerState.teacherCode)}" placeholder="e.g. TCH-8842" class="w-full bg-transparent text-sm font-medium text-[#1C1917] placeholder-[#B8B2AE] outline-none">
                                    </span>
                                </div>
                            </div>
                            ${learnometerState.loginError ? `
                                <p class="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">
                                    <i data-lucide="circle-alert" class="h-3.5 w-3.5 shrink-0"></i>
                                    ${escapeHtml(learnometerState.loginError)}
                                </p>
                            ` : ''}
                            <button type="submit" id="learnometerSignInButton" ${ready ? '' : 'disabled'} class="focus-ring h-[52px] w-full rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] ${ready ? 'bg-[#A41034] text-white hover:-translate-y-0.5 hover:bg-[#7a0c26] hover:shadow-[0_14px_28px_rgba(164,16,52,0.22)]' : 'cursor-not-allowed bg-[#F2EFEC] text-[#9A928D]'}">
                                Sign in
                            </button>
                        </form>
                    </div>
                </section>
            `;
        }

        function updateLearnometerLoginButton() {
            const button = document.getElementById('learnometerSignInButton');
            if (!button) return;

            const ready = Boolean(learnometerState.studentId.trim() && learnometerState.teacherCode.trim());
            button.disabled = !ready;
            button.className = `focus-ring h-[52px] w-full rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] ${ready ? 'bg-[#A41034] text-white hover:-translate-y-0.5 hover:bg-[#7a0c26] hover:shadow-[0_14px_28px_rgba(164,16,52,0.22)]' : 'cursor-not-allowed bg-[#F2EFEC] text-[#9A928D]'}`;
        }

        function renderLearnometerSelect() {
            return `
                <section class="flex min-h-[calc(100vh-80px)] items-center justify-center tab-content">
                    <div class="w-full max-w-lg">
                        <div class="fade-in mb-8 text-center">
                            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-[#fff7ed] px-4 py-2">
                                <div class="flex h-5 w-5 items-center justify-center rounded-lg bg-[#A41034]">${learnometerLogo(11)}</div>
                                <span class="text-[11px] font-black text-amber-600">Student ID: ${escapeHtml(learnometerState.studentId)}</span>
                            </div>
                            <h1 class="text-3xl font-black tracking-tight text-[#1C1917]">Your Test is Ready</h1>
                            <p class="mt-1 text-[13px] font-medium text-[#A8A29E]">Review the details below before you begin</p>
                        </div>

                        <div class="slide-up overflow-hidden rounded-[2.5rem] border border-[#E7E5E4] bg-white">
                            <div class="bg-[#A41034] px-8 py-6">
                                <p class="mb-1 text-[10px] font-black  tracking-widest text-white/50">Assigned Test</p>
                                <h2 class="text-xl font-black leading-snug text-white">${escapeHtml(LEARNOMETER_TEST.name)}</h2>
                                <p class="mt-1 text-[12px] font-bold text-white/60">${escapeHtml(LEARNOMETER_TEST.grade)} · ${escapeHtml(LEARNOMETER_TEST.subject)}</p>
                            </div>
                            <div class="border-b border-[#F5F5F4] px-8 py-6">
                                <div class="grid grid-cols-3 gap-4">
                                    <div class="text-center"><i data-lucide="package" class="mx-auto mb-1 h-6 w-6 text-[#A41034]"></i><p class="mb-0.5 text-[10px] font-black  tracking-wider text-[#A8A29E]">Block</p><p class="text-[12px] font-black text-[#1C1917]">${escapeHtml(LEARNOMETER_TEST.block)}</p></div>
                                    <div class="text-center"><i data-lucide="circle-help" class="mx-auto mb-1 h-6 w-6 text-[#A41034]"></i><p class="mb-0.5 text-[10px] font-black  tracking-wider text-[#A8A29E]">Questions</p><p class="text-[12px] font-black text-[#1C1917]">${LEARNOMETER_QUESTIONS.length} questions</p></div>
                                    <div class="text-center"><i data-lucide="timer" class="mx-auto mb-1 h-6 w-6 text-[#A41034]"></i><p class="mb-0.5 text-[10px] font-black  tracking-wider text-[#A8A29E]">Duration</p><p class="text-[12px] font-black text-[#1C1917]">${LEARNOMETER_TEST.duration} minutes</p></div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-3 px-8 py-6">
                                <button type="button" class="learnometer-start-test focus-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-[#A41034] py-4 text-[12px] font-black  tracking-wider text-white transition-all hover:bg-[#7a0c26] active:scale-95" data-test-type="test">
                                    <i data-lucide="play" class="h-4 w-4 fill-current"></i>
                                    Start Test
                                </button>
                                <button type="button" class="learnometer-start-test focus-ring flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] py-4 text-[12px] font-black  tracking-wider text-[#1C1917] transition-all hover:bg-[#EEECEA] active:scale-95" data-test-type="practice">
                                    <i data-lucide="pencil" class="h-4 w-4"></i>
                                    Start Practice Test
                                </button>
                                <button type="button" id="learnometerSignOut" class="mt-1 text-center text-[11px] font-bold text-[#A8A29E] transition-colors hover:text-[#78716C]">
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        function renderLearnometerTest() {
            const question = LEARNOMETER_QUESTIONS[learnometerState.currentQ];
            const progress = (learnometerState.currentQ / LEARNOMETER_QUESTIONS.length) * 100;
            const warn = learnometerState.timeLeft < 60;
            const badgeClass = learnometerState.testType === 'practice'
                ? 'border border-amber-100 bg-amber-50 text-amber-600'
                : 'border border-[#A41034]/15 bg-[#A41034]/[0.08] text-[#A41034]';
            const options = question.options.map((option, index) => {
                const selected = learnometerState.selected === index;
                return `
                    <button type="button" class="learnometer-option focus-ring w-full rounded-2xl border-2 px-6 py-4 text-left text-[13px] font-bold transition-all active:scale-[0.99] ${selected ? 'border-[#A41034] bg-[#A41034]/[0.08] text-[#A41034]' : 'border-transparent bg-[#F5F5F4] text-[#44403C] hover:border-[#E7E5E4] hover:bg-white'}" data-option-index="${index}">
                        <span class="inline-flex items-center gap-3">
                            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-[10px] font-black transition-all ${selected ? 'border-[#A41034] bg-[#A41034] text-white' : 'border-[#D6D3D1] text-[#A8A29E]'}">${String.fromCharCode(65 + index)}</span>
                            ${escapeHtml(option)}
                        </span>
                    </button>
                `;
            }).join('');

            return `
                <section class="tab-content py-6">
                    <div class="fade-in mb-8 flex items-center justify-between">
                        <div>
                            <div class="mb-1 flex items-center gap-2">
                                <span class="rounded-full px-3 py-1 text-[9px] font-black  tracking-widest ${badgeClass}">
                                    ${learnometerState.testType === 'practice' ? 'Practice Test' : 'Official Test'}
                                </span>
                            </div>
                            <h1 class="text-2xl font-black leading-none tracking-tight text-[#1C1917]">${escapeHtml(LEARNOMETER_TEST.name)}</h1>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2 rounded-2xl border px-5 py-3 text-[13px] font-black transition-colors ${warn ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#E7E5E4] bg-[#F5F5F4] text-[#1C1917]'}">
                                <i data-lucide="clock" class="h-3.5 w-3.5"></i>
                                <span id="learnometerTimer">${formatLearnometerTime(learnometerState.timeLeft)}</span>
                            </div>
                            <button type="button" id="learnometerExitTest" class="focus-ring rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-5 py-3 text-[11px] font-black  tracking-wider text-[#78716C] transition-colors hover:bg-[#E7E5E4]">Exit</button>
                        </div>
                    </div>

                    <div class="mb-8">
                        <div class="mb-2 flex items-center justify-between">
                            <span class="text-[10px] font-black  tracking-widest text-[#A8A29E]">Question ${learnometerState.currentQ + 1} of ${LEARNOMETER_QUESTIONS.length}</span>
                            <span class="text-[10px] font-black  tracking-widest text-[#A41034]">${escapeHtml(LEARNOMETER_TEST.grade)} · ${escapeHtml(LEARNOMETER_TEST.subject)}</span>
                        </div>
                        <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#F5F5F4]">
                            <div class="h-full rounded-full bg-[#A41034] transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>

                    <div class="mx-auto max-w-2xl">
                        <div class="fade-in mb-6 rounded-[2.5rem] border border-[#E7E5E4] bg-white p-10">
                            <div class="mb-8 flex items-start gap-4">
                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#A41034] text-[13px] font-black text-white">${learnometerState.currentQ + 1}</div>
                                <p class="pt-1 text-[16px] font-bold leading-relaxed text-[#1C1917]">${escapeHtml(question.text)}</p>
                            </div>
                            <div class="space-y-3">${options}</div>
                        </div>
                        <div class="flex justify-end">
                            <button type="button" id="learnometerNext" ${learnometerState.selected === null ? 'disabled' : ''} class="focus-ring flex items-center gap-3 rounded-2xl px-8 py-4 text-[11px] font-black  tracking-wider transition-all active:scale-95 ${learnometerState.selected !== null ? 'bg-[#A41034] text-white hover:bg-[#7a0c26]' : 'cursor-not-allowed bg-[#E7E5E4] text-[#A8A29E]'}">
                                ${learnometerState.currentQ + 1 === LEARNOMETER_QUESTIONS.length ? 'Submit Test' : 'Next Question'}
                                <i data-lucide="chevron-right" class="h-3.5 w-3.5"></i>
                            </button>
                        </div>
                    </div>
                </section>
            `;
        }

        function renderLearnometerResults() {
            const score = learnometerState.answers.filter((answer, index) => answer === LEARNOMETER_QUESTIONS[index]?.answer).length;
            const pct = LEARNOMETER_QUESTIONS.length ? Math.round((score / LEARNOMETER_QUESTIONS.length) * 100) : 0;
            const passed = pct >= 60;
            const circumference = 2 * Math.PI * 52;
            const badgeClass = learnometerState.testType === 'practice'
                ? 'border border-amber-100 bg-amber-50 text-amber-600'
                : 'border border-[#A41034]/15 bg-[#A41034]/[0.08] text-[#A41034]';

            return `
                <section class="tab-content py-12">
                    <div class="mx-auto max-w-2xl">
                        <div class="fade-in rounded-[2.5rem] border border-[#E7E5E4] bg-white p-12 text-center">
                            <div class="mb-2 flex justify-center">
                                <span class="rounded-full px-3 py-1 text-[9px] font-black  tracking-widest ${badgeClass}">
                                    ${learnometerState.testType === 'practice' ? 'Practice Test Results' : 'Test Results'}
                                </span>
                            </div>
                            <div class="relative mx-auto my-8 h-36 w-36">
                                <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="#F5F5F4" stroke-width="10" />
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="${passed ? '#A41034' : '#f59138'}" stroke-width="10" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - pct / 100)}" stroke-linecap="round" style="transition: stroke-dashoffset 1.2s ease" />
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="text-3xl font-black text-[#1C1917]">${pct}%</span>
                                    <span class="text-[9px] font-black  tracking-widest text-[#A8A29E]">Score</span>
                                </div>
                            </div>
                            <h2 class="mb-1 text-3xl font-black tracking-tight text-[#1C1917]">${pct === 100 ? 'Perfect Score!' : passed ? 'Well Done!' : 'Keep Practising!'}</h2>
                            <p class="mb-1 text-[13px] font-medium text-[#78716C]">${score} of ${LEARNOMETER_QUESTIONS.length} correct</p>
                            <p class="mb-10 text-[10px] font-black  tracking-widest text-[#A8A29E]">${escapeHtml(LEARNOMETER_TEST.grade)} · ${escapeHtml(LEARNOMETER_TEST.subject)} · ${escapeHtml(LEARNOMETER_TEST.block)}</p>
                            <div class="mb-10 grid grid-cols-3 gap-4">
                                <div class="rounded-2xl bg-[#F5F5F4] py-5"><p class="text-2xl font-black text-[#4CAF50]">${score}</p><p class="mt-1 text-[10px] font-black  tracking-widest text-[#A8A29E]">Correct</p></div>
                                <div class="rounded-2xl bg-[#F5F5F4] py-5"><p class="text-2xl font-black text-[#f59138]">${LEARNOMETER_QUESTIONS.length - score}</p><p class="mt-1 text-[10px] font-black  tracking-widest text-[#A8A29E]">Incorrect</p></div>
                                <div class="rounded-2xl bg-[#F5F5F4] py-5"><p class="text-2xl font-black text-[#A8A29E]">${LEARNOMETER_QUESTIONS.length}</p><p class="mt-1 text-[10px] font-black  tracking-widest text-[#A8A29E]">Total</p></div>
                            </div>
                            <div class="flex items-center justify-center gap-3">
                                <button type="button" id="learnometerBackToTest" class="focus-ring rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-8 py-4 text-[11px] font-black  tracking-wider text-[#78716C] transition-colors hover:bg-[#E7E5E4]">Back to Test</button>
                                <button type="button" id="learnometerRetry" class="focus-ring rounded-2xl bg-[#A41034] px-8 py-4 text-[11px] font-black  tracking-wider text-white transition-all hover:bg-[#7a0c26] active:scale-95">
                                    ${learnometerState.testType === 'practice' ? 'Start Official Test' : 'Try Practice Again'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        function renderLearnometer() {
            const panel = document.getElementById('learnometerPanel');
            if (!panel) return;

            if (learnometerState.step === 'login') {
                panel.innerHTML = renderLearnometerLogin();
            } else if (learnometerState.step === 'select') {
                panel.innerHTML = renderLearnometerSelect();
            } else if (learnometerState.testDone || learnometerState.step === 'results') {
                panel.innerHTML = renderLearnometerResults();
            } else {
                panel.innerHTML = renderLearnometerTest();
            }

            bindLearnometerEvents();
            lucide.createIcons();
        }

        function bindLearnometerEvents() {
            const panel = document.getElementById('learnometerPanel');
            if (!panel) return;

            const studentInput = panel.querySelector('#learnometerStudentId');
            const teacherInput = panel.querySelector('#learnometerTeacherCode');
            studentInput?.addEventListener('input', (event) => {
                learnometerState.studentId = event.target.value;
                learnometerState.loginError = '';
                updateLearnometerLoginButton();
            });
            teacherInput?.addEventListener('input', (event) => {
                learnometerState.teacherCode = event.target.value;
                learnometerState.loginError = '';
                updateLearnometerLoginButton();
            });

            panel.querySelector('#learnometerLoginForm')?.addEventListener('submit', (event) => {
                event.preventDefault();
                learnometerState.studentId = document.getElementById('learnometerStudentId')?.value || '';
                learnometerState.teacherCode = document.getElementById('learnometerTeacherCode')?.value || '';
                if (learnometerState.studentId.trim() && learnometerState.teacherCode.trim()) {
                    learnometerState.step = 'select';
                    learnometerState.loginError = '';
                } else {
                    learnometerState.loginError = 'Please enter both your Student ID and Teacher Code.';
                }
                renderLearnometer();
            });

            panel.querySelectorAll('.learnometer-start-test').forEach((button) => {
                button.addEventListener('click', () => startLearnometerTest(button.dataset.testType));
            });
            panel.querySelector('#learnometerSignOut')?.addEventListener('click', resetLearnometer);
            panel.querySelector('#learnometerExitTest')?.addEventListener('click', () => {
                stopLearnometerTimer();
                learnometerState.step = 'select';
                learnometerState.testDone = false;
                renderLearnometer();
            });
            panel.querySelectorAll('.learnometer-option').forEach((button) => {
                button.addEventListener('click', () => {
                    learnometerState.selected = Number(button.dataset.optionIndex);
                    renderLearnometer();
                    if (learnometerState.step === 'test' && !learnometerState.testDone) startLearnometerTimer();
                });
            });
            panel.querySelector('#learnometerNext')?.addEventListener('click', () => {
                if (learnometerState.selected !== null) completeLearnometerQuestion();
            });
            panel.querySelector('#learnometerBackToTest')?.addEventListener('click', () => {
                learnometerState.step = 'select';
                learnometerState.testDone = false;
                renderLearnometer();
            });
            panel.querySelector('#learnometerRetry')?.addEventListener('click', () => {
                startLearnometerTest(learnometerState.testType === 'practice' ? 'test' : 'practice');
            });
        }

        const GYM_GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
        const GYM_CURRICULUM = {
            'Grade 1': {
                English: ['Block 01: Families and Friends', 'Block 02: Animals Around Us', 'Block 03: My School Day', 'Block 04: Seasons and Weather'],
                Mathematics: ['Block 01: Numbers 1-20', 'Block 02: Addition Basics', 'Block 03: Subtraction Basics', 'Block 04: Shapes and Patterns'],
                'Environmental Science': ['Block 01: My Body', 'Block 02: Plants Around Us', 'Block 03: Water and Air', 'Block 04: Food We Eat']
            },
            'Grade 2': {
                English: ['Block 01: People Who Help Us', 'Block 02: Stories and Poems', 'Block 03: Transport', 'Block 04: Our Environment'],
                Mathematics: ['Block 01: Numbers up to 100', 'Block 02: Addition with Carry', 'Block 03: Subtraction with Borrow', 'Block 04: Multiplication Tables'],
                'Environmental Science': ['Block 01: Living and Non-Living', 'Block 02: Animal Habitats', 'Block 03: States of Matter', 'Block 04: Simple Machines']
            },
            'Grade 3': {
                English: ['Block 01: Nature and Science', 'Block 02: Community Helpers', 'Block 03: Festivals of India', 'Block 04: Adventure Stories'],
                Mathematics: ['Block 01: Large Numbers', 'Block 02: Multiplication', 'Block 03: Division', 'Block 04: Fractions Intro'],
                'Environmental Science': ['Block 01: Plants and Growth', 'Block 02: Food Chains', 'Block 03: Rocks and Soil', 'Block 04: Sun, Moon and Stars']
            },
            'Grade 4': {
                English: ['Block 01: Exploring Nature', 'Block 02: Folk Tales', 'Block 03: Communication', 'Block 04: Our Earth'],
                Mathematics: ['Block 01: Place Value', 'Block 02: Fractions', 'Block 03: Decimals Intro', 'Block 04: Geometry'],
                Science: ['Block 01: Light and Shadows', 'Block 02: Force and Motion', 'Block 03: Electricity Basics', 'Block 04: The Solar System']
            },
            'Grade 5': {
                English: ['Block 01: Mysteries and Puzzles', 'Block 02: World Cultures', 'Block 03: Space Exploration', 'Block 04: Environment'],
                Mathematics: ['Block 01: Decimals', 'Block 02: Percentages', 'Block 03: Ratios', 'Block 04: Area and Perimeter'],
                Science: ['Block 01: Microorganisms', 'Block 02: Human Body Systems', 'Block 03: Ecosystems', 'Block 04: Materials and Properties']
            },
            'Grade 6': {
                English: ['Block 01: Literature Classics', 'Block 02: Media and Communication', 'Block 03: Science Writing', 'Block 04: Persuasive Essays'],
                Mathematics: ['Block 01: Integers', 'Block 02: Algebra Intro', 'Block 03: Data Handling', 'Block 04: Mensuration'],
                Science: ['Block 01: Cell Biology', 'Block 02: Heat and Temperature', 'Block 03: Motion and Speed', 'Block 04: Chemical Reactions']
            },
            'Grade 7': {
                English: ['Block 01: Poetry Analysis', 'Block 02: Drama and Theatre', 'Block 03: Research Skills', 'Block 04: Debate Writing'],
                Mathematics: ['Block 01: Linear Equations', 'Block 02: Geometry Theorems', 'Block 03: Statistics', 'Block 04: Profit and Loss'],
                Science: ['Block 01: Reproduction in Plants', 'Block 02: Acids and Bases', 'Block 03: Light Optics', 'Block 04: Electromagnetic Spectrum']
            },
            'Grade 8': {
                English: ['Block 01: Novels and Narratives', 'Block 02: Critical Analysis', 'Block 03: Journalism', 'Block 04: Creative Writing'],
                Mathematics: ['Block 01: Quadratic Equations', 'Block 02: Trigonometry', 'Block 03: Probability', 'Block 04: Coordinate Geometry'],
                Science: ['Block 01: Atomic Structure', 'Block 02: Heredity and Evolution', 'Block 03: Gravitation', 'Block 04: Sound Waves']
            }
        };
        Object.values(GYM_CURRICULUM).forEach((subjects) => {
            subjects.Hindi = subjects.Hindi || ['Block 01: Path Bodh', 'Block 02: Vyakaran', 'Block 03: Shabdarth', 'Block 04: Lekhan'];
            subjects.EVS = subjects.EVS || subjects['Environmental Science'] || ['Block 01: Plants Around Us', 'Block 02: Water and Air', 'Block 03: Our Neighbourhood', 'Block 04: Safety and Health'];
            subjects['Computer Science'] = subjects['Computer Science'] || ['Block 01: Computer Basics', 'Block 02: Input Devices', 'Block 03: Internet Safety', 'Block 04: Algorithms'];
        });
        const GYM_DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
        const GYM_TIME_OPTIONS = [15, 20, 30, 45, 60];
        let practiceGymTimer = null;
        const practiceGymState = {
            mode: 'parent',
            grade: '',
            subject: '',
            block: '',
            difficulty: '',
            timeLimit: 30,
            testStarted: false,
            testDone: false,
            questions: [],
            currentQ: 0,
            selected: null,
            answers: [],
            timeLeft: 0,
            pdfGenerated: false,
            selectedReviewSubject: 'Mathematics',
            showSetupForm: false,
            showSetupPage: false,
            selectedCalendarDay: null,
            usageMetric: 'attempts'
        };

        const PRACTICE_REVIEW_SUBJECTS = ['Overall', 'English', 'Mathematics', 'Science', 'Hindi', 'EVS', 'Computer Science'];
        const PRACTICE_REVIEW_DATA = {
            summary: {
                totalPractice: 42,
                avgAccuracy: 74,
                currentStreak: 4,
                subjectsPracticed: 5,
                lastPracticedSubject: 'Mathematics'
            },
            subjects: {
                Overall: { lastPracticed: 'Yesterday', totalAttempts: 42, avgAccuracy: 74, weakTopics: [{ topic: 'Fractions', accuracy: 58 }, { topic: 'Multiplication', accuracy: 64 }, { topic: 'Word Problems', accuracy: 67 }] },
                English: { lastPracticed: 'Apr 28', totalAttempts: 7, avgAccuracy: 78, weakTopics: [{ topic: 'Comprehension', accuracy: 62 }, { topic: 'Grammar', accuracy: 68 }, { topic: 'Vocabulary', accuracy: 71 }] },
                Mathematics: { lastPracticed: 'Yesterday', totalAttempts: 12, avgAccuracy: 72, weakTopics: [{ topic: 'Fractions', accuracy: 58 }, { topic: 'Multiplication', accuracy: 64 }, { topic: 'Word Problems', accuracy: 67 }] },
                Science: { lastPracticed: 'Apr 29', totalAttempts: 8, avgAccuracy: 76, weakTopics: [{ topic: 'Food Chains', accuracy: 61 }, { topic: 'Light', accuracy: 66 }, { topic: 'Materials', accuracy: 69 }] },
                Hindi: { lastPracticed: 'Apr 24', totalAttempts: 6, avgAccuracy: 73, weakTopics: [{ topic: 'Vyakaran', accuracy: 60 }, { topic: 'Path Bodh', accuracy: 65 }, { topic: 'Shabdarth', accuracy: 70 }] },
                EVS: { lastPracticed: 'Apr 22', totalAttempts: 4, avgAccuracy: 81, weakTopics: [] },
                'Computer Science': { lastPracticed: 'Apr 25', totalAttempts: 5, avgAccuracy: 79, weakTopics: [{ topic: 'Algorithms', accuracy: 63 }, { topic: 'Internet Safety', accuracy: 70 }, { topic: 'Input Devices', accuracy: 72 }] }
            },
            streak: { current: 4, best: 9, week: 3 },
            calendar: [
                { day: 1, subjects: ['Science', 'English', 'Mathematics'], topic: 'Mixed Revision', score: 78, time: '28m', attempted: 30, completed: true },
                { day: 2, subjects: ['Mathematics'], topic: 'Fractions', score: 88, time: '18m', attempted: 20, completed: true, best: true }
            ],
            usage: [
                { day: 'Mon', attempts: 3, completed: 2, minutes: 34 },
                { day: 'Tue', attempts: 4, completed: 3, minutes: 42 },
                { day: 'Wed', attempts: 2, completed: 2, minutes: 24 },
                { day: 'Thu', attempts: 5, completed: 4, minutes: 55 },
                { day: 'Fri', attempts: 3, completed: 3, minutes: 37 },
                { day: 'Sat', attempts: 1, completed: 1, minutes: 18 },
                { day: 'Sun', attempts: 0, completed: 0, minutes: 0 }
            ],
            history: [
                { title: 'Fractions Practice', subject: 'Mathematics', topic: 'Fractions', date: 'Yesterday', score: 72, status: 'Completed', action: 'Review', icon: 'divide' },
                { title: 'Food Chains Quick Test', subject: 'Science', topic: 'Ecosystems', date: 'Apr 29', score: 69, status: 'Completed', action: 'Retry', icon: 'flask-conical' },
                { title: 'Comprehension Drill', subject: 'English', topic: 'Reading', date: 'Apr 28', score: 81, status: 'Completed', action: 'Review', icon: 'book-open' },
                { title: 'Algorithms Starter', subject: 'Computer Science', topic: 'Algorithms', date: 'Apr 25', score: 71, status: 'In Progress', action: 'Resume', icon: 'monitor' },
                { title: 'Vyakaran Practice', subject: 'Hindi', topic: 'Grammar', date: 'Apr 24', score: 76, status: 'Assigned', action: 'Review', icon: 'languages' }
            ]
        };

        function generatePracticeGymQuestions(grade, subject, block, difficulty) {
            const topic = block.includes(': ') ? block.split(': ')[1] : block;
            const sub = subject || 'Science';
            const gr = grade || 'Grade 4';
            const base = [
                {
                    text: `What is the main theme of "${topic}"?`,
                    options: [topic, 'Photosynthesis', 'Gravity', 'Magnetism'],
                    answer: 0
                },
                {
                    text: `"${topic}" is studied as part of which subject in ${gr}?`,
                    options: [sub, 'History', 'Art', 'Music'],
                    answer: 0
                },
                {
                    text: `Which habit helps students retain what they learn in "${topic}"?`,
                    options: ['Regular practice and review', 'Skipping revision', 'Only copying notes', 'Avoiding questions'],
                    answer: 0
                },
                {
                    text: `Which approach best supports learning "${topic}"?`,
                    options: ['Observation and inquiry', 'Memorising without context', 'Guessing answers', 'Ignoring examples'],
                    answer: 0
                },
                {
                    text: `What should a student do when a concept in "${topic}" is unclear?`,
                    options: ['Ask, discuss, and practise', 'Stop trying', 'Copy the answer only', 'Avoid the activity'],
                    answer: 0
                }
            ];
            if (difficulty === 'Hard') {
                base.push({
                    text: `Which best demonstrates mastery of "${topic}"?`,
                    options: ['Applying the idea to a new situation', 'Reading the title only', 'Memorising one phrase', 'Avoiding practice'],
                    answer: 0
                });
            }
            return base;
        }

        function stopPracticeGymTimer() {
            if (practiceGymTimer) {
                clearInterval(practiceGymTimer);
                practiceGymTimer = null;
            }
        }

        function startPracticeGymTimer() {
            stopPracticeGymTimer();
            practiceGymTimer = setInterval(() => {
                if (!practiceGymState.testStarted || practiceGymState.testDone) {
                    stopPracticeGymTimer();
                    return;
                }
                practiceGymState.timeLeft = Math.max(0, practiceGymState.timeLeft - 1);
                if (practiceGymState.timeLeft === 0) {
                    practiceGymState.testDone = true;
                    stopPracticeGymTimer();
                }
                renderPracticeGym();
            }, 1000);
        }

        function resetPracticeGymTest() {
            stopPracticeGymTimer();
            practiceGymState.testStarted = false;
            practiceGymState.testDone = false;
            practiceGymState.questions = [];
            practiceGymState.currentQ = 0;
            practiceGymState.selected = null;
            practiceGymState.answers = [];
            practiceGymState.timeLeft = 0;
            practiceGymState.showSetupPage = false;
        }

        function startPracticeGymTest() {
            practiceGymState.questions = generatePracticeGymQuestions(
                practiceGymState.grade,
                practiceGymState.subject,
                practiceGymState.block,
                practiceGymState.difficulty
            );
            practiceGymState.currentQ = 0;
            practiceGymState.selected = null;
            practiceGymState.answers = [];
            practiceGymState.timeLeft = practiceGymState.timeLimit * 60;
            practiceGymState.testStarted = true;
            practiceGymState.testDone = false;
            renderPracticeGym();
            startPracticeGymTimer();
        }

        function formatGymTime(seconds) {
            const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${minutes}:${secs}`;
        }

        function isPracticeGymReady() {
            return Boolean(practiceGymState.grade && practiceGymState.subject && practiceGymState.block && practiceGymState.difficulty);
        }

        function getGymFieldIcon(name) {
            return {
                grade: 'graduation-cap',
                subject: 'book-open',
                block: 'layers',
                difficulty: 'gauge'
            }[name] || 'circle';
        }

        function renderGymSelect(name, label, options, value, disabled = false) {
            return `
                <label class="block">
                    <span class="mb-2 block text-xs font-medium leading-5 text-[#8B8B8B]">${label}</span>
                    <span class="flex h-14 items-center gap-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 transition-all focus-within:border-[#A41034] focus-within:shadow-[0_0_0_3px_rgba(164,16,52,0.10)] ${disabled ? 'opacity-50' : ''}">
                        <i data-lucide="${getGymFieldIcon(name)}" class="h-4 w-4 shrink-0 text-[#A41034]"></i>
                        <select data-gym-field="${name}" ${disabled ? 'disabled' : ''} class="w-full cursor-pointer bg-transparent text-sm font-medium leading-6 text-[#1C1917] outline-none disabled:cursor-not-allowed">
                            <option value="">Select ${label.toLowerCase()}...</option>
                            ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
                        </select>
                    </span>
                </label>
            `;
        }

        function getPracticeSelectedSubject() {
            if (!practiceGymState.selectedReviewSubject) {
                practiceGymState.selectedReviewSubject = PRACTICE_REVIEW_DATA.summary.lastPracticedSubject || 'Mathematics';
            }
            return practiceGymState.selectedReviewSubject;
        }

        function getPracticeSubjectData() {
            return PRACTICE_REVIEW_DATA.subjects[getPracticeSelectedSubject()] || PRACTICE_REVIEW_DATA.subjects.Mathematics;
        }

        function getPracticeCalendarEntries() {
            const selected = getPracticeSelectedSubject();
            return PRACTICE_REVIEW_DATA.calendar.filter((entry) => selected === 'Overall' || entry.subjects.includes(selected));
        }

        function openPracticeSetup(subject = getPracticeSelectedSubject(), topic = '') {
            const effectiveSubject = !subject || subject === 'Overall' ? 'Mathematics' : subject;
            practiceGymState.showSetupForm = true;
            practiceGymState.showSetupPage = false;
            practiceGymState.mode = 'parent';
            practiceGymState.subject = effectiveSubject;
            if (!practiceGymState.grade) practiceGymState.grade = 'Grade 4';
            const blocks = practiceGymState.grade && practiceGymState.subject ? GYM_CURRICULUM[practiceGymState.grade]?.[practiceGymState.subject] || [] : [];
            if (topic && blocks.length) {
                practiceGymState.block = blocks.find((block) => block.toLowerCase().includes(topic.toLowerCase())) || blocks[0];
            } else if (!practiceGymState.block && blocks.length) {
                practiceGymState.block = blocks[0];
            }
            if (!practiceGymState.difficulty) practiceGymState.difficulty = 'Medium';
            renderPracticeGym();
        }

        function openPracticeSetupPage(subject = getPracticeSelectedSubject(), topic = '') {
            const effectiveSubject = !subject || subject === 'Overall' ? 'Mathematics' : subject;
            practiceGymState.showSetupForm = false;
            practiceGymState.showSetupPage = true;
            practiceGymState.mode = 'parent';
            practiceGymState.subject = effectiveSubject;
            if (!practiceGymState.grade) practiceGymState.grade = 'Grade 4';
            const blocks = practiceGymState.grade && practiceGymState.subject ? GYM_CURRICULUM[practiceGymState.grade]?.[practiceGymState.subject] || [] : [];
            if (topic && blocks.length) {
                practiceGymState.block = blocks.find((block) => block.toLowerCase().includes(topic.toLowerCase())) || blocks[0];
            } else if (!practiceGymState.block && blocks.length) {
                practiceGymState.block = blocks[0];
            }
            if (!practiceGymState.difficulty) practiceGymState.difficulty = 'Medium';
            renderPracticeGym();
        }

        function getPracticeSubjectForCurriculum(grade, subject) {
            const subjects = GYM_CURRICULUM[grade] || {};
            if (subjects[subject]) return subject;
            if (subject === 'Social Science' && subjects['Environmental Science']) return 'Environmental Science';
            if (subject === 'Environmental Science' && subjects.EVS) return 'EVS';
            return Object.keys(subjects)[0] || 'Mathematics';
        }

        function openSubjectPracticeGym(grade, subject, topic = '') {
            const safeGrade = GYM_CURRICULUM[grade] ? grade : 'Grade 1';
            const safeSubject = getPracticeSubjectForCurriculum(safeGrade, subject);
            practiceGymState.grade = safeGrade;
            practiceGymState.selectedReviewSubject = safeSubject;
            practiceGymState.block = '';
            practiceGymState.difficulty = practiceGymState.difficulty || 'Medium';
            setActiveNavTitle('Practice Test');
            showAppTab('Practice Test');
            openPracticeSetupPage(safeSubject, topic);
        }

        function renderPracticeSectionHeader(title, action = '') {
            return `
                <div class="mb-4 flex items-center justify-between gap-3">
                    <h2 class="text-[18px] font-semibold leading-6 text-[#1C1917]">${title}</h2>
                    ${action}
                </div>
            `;
        }

        function renderSubjectSelector() {
            const selected = getPracticeSelectedSubject();
            return `
                <div class="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                    <div class="flex w-max min-w-full gap-2">
                        ${PRACTICE_REVIEW_SUBJECTS.map((subject) => `
                            <button type="button" data-practice-subject="${escapeHtml(subject)}" class="focus-ring shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${subject === selected ? 'bg-[#A41034] text-white shadow-[0_10px_24px_rgba(164,16,52,0.18)]' : 'border border-[#EEE9E5] bg-white/80 text-[#6D5D5A] hover:border-[#A41034]/20 hover:text-[#A41034]'}">
                                ${escapeHtml(subject)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function getPracticeSubjectFilterLabel(subject) {
            return {
                Overall: 'All',
                English: 'Eng',
                Mathematics: 'Math',
                Science: 'Sci',
                Hindi: 'Hin',
                EVS: 'EVS',
                'Computer Science': 'CS'
            }[subject] || subject;
        }

        function renderPracticeSubjectFilterToolbar() {
            return '';
        }

        function renderPracticeHero() {
            const subject = getPracticeSelectedSubject();
            const data = getPracticeSubjectData();
            const weakTopic = data.weakTopics[0]?.topic || '';
            const heroStats = [
                { label: 'Total Practice', value: data.totalAttempts || PRACTICE_REVIEW_DATA.summary.totalPractice },
                { label: 'Avg Accuracy', value: `${data.avgAccuracy || PRACTICE_REVIEW_DATA.summary.avgAccuracy}%` },
                { label: 'Current Streak', value: `${PRACTICE_REVIEW_DATA.summary.currentStreak} days` },
                { label: 'Subjects Practiced', value: `${PRACTICE_REVIEW_DATA.summary.subjectsPracticed}/6` }
            ];
            return `
                <section class="overflow-hidden rounded-[24px] border border-[#F1EDEA] bg-white shadow-[0_18px_45px_rgba(28,25,23,0.045)]">
                    <div class="p-5 sm:p-7 lg:p-8">
                        <div class="mb-5 flex flex-wrap items-center gap-2">
                            <span class="inline-flex items-center gap-2 rounded-full bg-[#FAF8F6] px-3 py-1.5 text-[12px] font-semibold text-[#A41034]">
                                <i data-lucide="book-marked" class="h-3.5 w-3.5"></i>
                                ${escapeHtml(subject)}
                            </span>
                            <span class="inline-flex items-center gap-2 rounded-full bg-[#FAF8F6] px-3 py-1.5 text-[12px] font-medium text-[#7C706A]">
                                <i data-lucide="clock-3" class="h-3.5 w-3.5"></i>
                                Last practiced ${escapeHtml(data.lastPracticed)}
                            </span>
                        </div>
                        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <h1 class="whitespace-nowrap font-['Poppins'] text-[26px] font-semibold leading-8 text-[#1C1917] sm:text-[34px] sm:leading-10">Practice Test Review</h1>
                                ${weakTopic ? `<p class="mt-2 text-sm font-medium text-[#7C706A]">Next focus: <span class="font-semibold text-[#A41034]">${escapeHtml(weakTopic)}</span></p>` : ''}
                            </div>
                            <div class="flex flex-col gap-3 sm:flex-row xl:shrink-0">
                                <button type="button" data-practice-start class="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#A41034] px-5 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(164,16,52,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#7a0c26]">
                                    <i data-lucide="play" class="h-4 w-4 fill-current"></i>
                                    Start Practice
                                </button>
                                
                            </div>
                        </div>
                        <div class="mt-7 grid gap-0 overflow-hidden rounded-[20px] bg-[#FAF8F6] sm:grid-cols-4">
                            ${heroStats.map((item, index) => `
                                <div class="px-4 py-4 ${index ? 'border-t border-white sm:border-l sm:border-t-0' : ''}">
                                    <p class="text-[12px] font-medium leading-4 text-[#8B817B]">${item.label}</p>
                                    <p class="mt-1 text-[20px] font-semibold leading-7 text-[#1C1917]">${item.value}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `;
        }

        function renderThisWeekSummary() {
            const weekStats = [
                { label: 'Practiced', value: '4 days', icon: 'check-circle-2' },
                { label: 'Tests', value: '8', icon: 'clipboard-check' },
                { label: 'Best Score', value: '92%', icon: 'trending-up', accent: true }
            ];
            return `
                <section class="rounded-[22px] border border-[#F1EDEA] bg-white p-5 shadow-[0_14px_32px_rgba(28,25,23,0.04)]">
                    <div class="mb-4 flex items-center justify-between">
                        <h2 class="text-[18px] font-semibold leading-6 text-[#1C1917]">This Week</h2>
                        <span class="text-[12px] font-medium text-[#8B8B8B]">Summary</span>
                    </div>
                    <div class="divide-y divide-[#EEEAE7] rounded-[18px] bg-[#FAF8F6] px-4">
                        ${weekStats.map((item) => `
                            <div class="flex items-center justify-between gap-4 py-4">
                                <div class="flex min-w-0 items-center gap-3">
                                    <i data-lucide="${item.icon}" class="h-5 w-5 shrink-0 text-[#A41034]"></i>
                                    <span class="truncate text-sm font-semibold text-[#2B2522]">${item.label}</span>
                                </div>
                                <span class="shrink-0 text-[16px] font-semibold ${item.accent ? 'text-[#059669]' : 'text-[#1C1917]'}">${item.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        function renderPracticeCalendar() {
            const entries = getPracticeCalendarEntries();
            const entryByDay = new Map(entries.map((entry) => [entry.day, entry]));
            const streak = PRACTICE_REVIEW_DATA.streak;
            const today = 2;
            const days = Array.from({ length: 35 }, (_, index) => index < 2 ? null : index - 1);
            return `
                <section class="rounded-[24px] border border-[#F1EDEA] bg-white p-5 shadow-[0_14px_34px_rgba(28,25,23,0.04)]">
                    <div class="mb-5 rounded-[18px] bg-[#FAF8F6] p-4">
                        <div class="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A79F9A]">Habit Tracker</p>
                                <h2 class="mt-1 text-[18px] font-semibold leading-6 text-[#1C1917]">Start your streak!</h2>
                            </div>
                            <span class="grid h-9 w-9 place-items-center rounded-full bg-white text-[#F49138] shadow-[0_6px_14px_rgba(28,25,23,0.04)]">
                                <i data-lucide="flame" class="h-4 w-4"></i>
                            </span>
                        </div>
                        <div class="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3">
                            <div class="text-center">
                                <p class="text-[30px] font-semibold leading-none text-[#F49138]">${streak.current}</p>
                                <p class="mt-1.5 text-[10px] font-semibold uppercase text-[#A79F9A]">Current</p>
                            </div>
                            <div class="h-11 w-px bg-[#E9E1DB]"></div>
                            <div class="text-center">
                                <p class="text-[30px] font-semibold leading-none text-[#1C1917]">${streak.best}</p>
                                <p class="mt-1.5 text-[10px] font-semibold uppercase text-[#A79F9A]">Best</p>
                            </div>
                            <div class="h-11 w-px bg-[#E9E1DB]"></div>
                            <div class="text-center">
                                <p class="text-[30px] font-semibold leading-none text-[#1C1917]">${streak.week}/7</p>
                                <p class="mt-1.5 text-[10px] font-semibold uppercase text-[#A79F9A]">This Week</p>
                            </div>
                        </div>
                    </div>
                    <div class="mx-auto max-w-[430px]">
                    <div class="mb-3 flex items-center justify-between gap-4">
                        <h2 class="text-[18px] font-semibold leading-7 text-[#3A342F]">May 2026</h2>
                        <div class="flex items-center gap-1 text-[#CEC7C2]">
                            <button type="button" class="grid h-7 w-7 place-items-center rounded-full hover:bg-[#FAF8F6]" aria-label="Previous month">
                                <i data-lucide="chevron-left" class="h-4 w-4"></i>
                            </button>
                            <button type="button" class="grid h-7 w-7 place-items-center rounded-full hover:bg-[#FAF8F6]" aria-label="Next month">
                                <i data-lucide="chevron-right" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#A79F9A]">
                        ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => `<span class="py-1">${day}</span>`).join('')}
                    </div>
                    <div class="mt-2 grid grid-cols-7 gap-1">
                        ${days.map((day) => {
                if (!day || day > 31) return '<span class="h-9 rounded-xl"></span>';
                const entry = entryByDay.get(day);
                const future = day > today;
                return `
                                <button type="button" ${entry ? `data-calendar-day="${day}"` : ''} ${future ? 'disabled' : ''} class="relative h-9 rounded-xl text-[13px] font-medium transition-colors ${day === today ? 'bg-[#FFF0F2] text-[#A41034]' : future ? 'text-[#D4CDC8]' : 'text-[#2B2522] hover:bg-[#FAF8F6]'}">
                                    ${day}
                                    ${entry ? `<span class="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5">
                                        ${entry.best ? '<span class="h-1 w-1 rounded-full bg-[#A41034]"></span>' : `<span class="h-1 w-1 rounded-full ${entry.completed ? 'bg-[#F49138]' : 'bg-[#A41034]'}"></span>`}
                                        ${entry.subjects.length > 1 ? `<span class="text-[9px] font-semibold text-[#8B8B8B]">+${entry.subjects.length - 1}</span>` : ''}
                                    </span>` : ''}
                                </button>
                            `;
            }).join('')}
                    </div>
                    ${entries.length ? '' : '<div class="mt-4 rounded-2xl bg-[#FAF8F6] p-4 text-center text-sm text-[#6D5D5A]">No practice yet this month.</div>'}
                    </div>
                </section>
            `;
        }

        function renderWhereToImprove() {
            const weakTopics = getPracticeSubjectData().weakTopics.slice(0, 3);
            return `
                <section class="rounded-[22px] border border-[#F0E7DF] bg-white p-5 shadow-[0_14px_32px_rgba(28,25,23,0.045)]">
                    ${renderPracticeSectionHeader('Where to improve')}
                    ${weakTopics.length ? `<div class="space-y-4">
                        ${weakTopics.map((item) => `
                            <div class="grid grid-cols-[1fr_auto] items-center gap-3">
                                <div class="min-w-0">
                                    <div class="flex items-center justify-between gap-3">
                                        <p class="truncate text-sm font-semibold text-[#1C1917]">${escapeHtml(item.topic)}</p>
                                        <p class="text-sm font-semibold text-[#A41034]">${item.accuracy}%</p>
                                    </div>
                                    <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F2EEE9]"><div class="h-full rounded-full bg-[#A41034]" style="width: ${item.accuracy}%"></div></div>
                                </div>
                                <button type="button" data-practice-topic="${escapeHtml(item.topic)}" class="rounded-xl bg-[#F8F4F0] px-3 py-2 text-[12px] font-semibold text-[#A41034] hover:bg-[#FDF0F2]">Practice</button>
                            </div>
                        `).join('')}
                    </div>` : '<div class="rounded-2xl bg-[#FAF8F6] p-4 text-sm text-[#6D5D5A]">Great work! No weak areas found yet.</div>'}
                </section>
            `;
        }

        function renderUsageSummary() {
            const metric = practiceGymState.usageMetric === 'minutes' ? 'minutes' : 'attempts';
            const maxValue = Math.max(...PRACTICE_REVIEW_DATA.usage.map((item) => item[metric]), 1);
            return `
                <section class="rounded-[22px] border border-[#F0E7DF] bg-white p-5 shadow-[0_14px_32px_rgba(28,25,23,0.045)]">
                    ${renderPracticeSectionHeader('Usage', `
                        <div class="flex rounded-full bg-[#F8F4F0] p-1">
                            <button type="button" data-usage-metric="attempts" class="rounded-full px-3 py-1 text-[11px] font-semibold ${metric === 'attempts' ? 'bg-white text-[#A41034] shadow-sm' : 'text-[#8B8B8B]'}">Attempts</button>
                            <button type="button" data-usage-metric="minutes" class="rounded-full px-3 py-1 text-[11px] font-semibold ${metric === 'minutes' ? 'bg-white text-[#A41034] shadow-sm' : 'text-[#8B8B8B]'}">Time Spent</button>
                        </div>
                    `)}
                    <div class="flex h-44 items-end gap-3 border-b border-[#F0EEEC] pb-3">
                        ${PRACTICE_REVIEW_DATA.usage.map((item) => `
                            <div class="flex flex-1 flex-col items-center gap-2">
                                <div class="flex h-32 w-full items-end justify-center">
                                    <div class="w-full max-w-[30px] rounded-t-xl bg-[#A41034]" style="height: ${Math.max(8, (item[metric] / maxValue) * 100)}%"></div>
                                </div>
                                <span class="text-[11px] font-medium text-[#8B8B8B]">${item.day}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3 flex gap-5 text-[12px] text-[#6D5D5A]">
                        <span><strong class="text-[#1C1917]">18</strong> attempts</span>
                        <span><strong class="text-[#1C1917]">15</strong> completed</span>
                        <span><strong class="text-[#1C1917]">210m</strong> spent</span>
                    </div>
                </section>
            `;
        }

        function renderPracticeHistory() {
            const selected = getPracticeSelectedSubject();
            const rows = PRACTICE_REVIEW_DATA.history.filter((row) => selected === 'Overall' || row.subject === selected).slice(0, 5);
            return `
                <section class="rounded-[22px] border border-[#F0E7DF] bg-white p-5 shadow-[0_14px_32px_rgba(28,25,23,0.045)]">
                    ${renderPracticeSectionHeader('Practice History', '<button type="button" class="text-[12px] font-semibold text-[#A41034]">View all history</button>')}
                    <div class="divide-y divide-[#F0EEEC]">
                        ${(rows.length ? rows : PRACTICE_REVIEW_DATA.history.slice(0, 5)).map((row) => `
                            <div class="flex items-center gap-4 py-3">
                                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#F8F4F0] text-[#A41034]"><i data-lucide="${row.icon}" class="h-4 w-4"></i></span>
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-semibold text-[#1C1917]">${escapeHtml(row.title)}</p>
                                    <p class="mt-0.5 truncate text-[12px] text-[#7C706A]">${escapeHtml(row.subject)} · ${escapeHtml(row.date)} · ${escapeHtml(row.topic)}</p>
                                </div>
                                <div class="hidden text-right sm:block">
                                    <p class="text-sm font-semibold text-[#1C1917]">Score ${row.score}%</p>
                                    <p class="text-[12px] text-[#7C706A]">${escapeHtml(row.status)}</p>
                                </div>
                                <button type="button" data-history-action="${escapeHtml(row.action)}" class="rounded-xl bg-[#F8F4F0] px-3 py-2 text-[12px] font-semibold text-[#A41034] hover:bg-[#FDF0F2]">${escapeHtml(row.action)}</button>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        function renderCalendarDayDetailsSheet() {
            if (!practiceGymState.selectedCalendarDay) return '';
            const entry = getPracticeCalendarEntries().find((item) => item.day === Number(practiceGymState.selectedCalendarDay));
            if (!entry) return '';
            return `
                <div class="fixed inset-0 z-50 bg-black/20 px-4 py-5 backdrop-blur-sm sm:flex sm:items-end sm:justify-center" data-practice-overlay>
                    <section class="fixed bottom-4 left-4 right-4 rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(28,25,23,0.22)] sm:static sm:w-full sm:max-w-md">
                        <div class="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p class="text-[12px] font-semibold text-[#A41034]">May ${entry.day}, 2026</p>
                                <h3 class="mt-1 text-xl font-semibold text-[#1C1917]">${escapeHtml(entry.topic)}</h3>
                            </div>
                            <button type="button" data-close-day-sheet class="grid h-9 w-9 place-items-center rounded-full bg-[#F8F4F0] text-[#6D5D5A]"><i data-lucide="x" class="h-4 w-4"></i></button>
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="rounded-2xl bg-[#FAF8F6] p-3"><p class="text-[12px] text-[#8B8B8B]">Subject practiced</p><p class="mt-1 font-semibold text-[#1C1917]">${entry.subjects.join(', ')}</p></div>
                            <div class="rounded-2xl bg-[#FAF8F6] p-3"><p class="text-[12px] text-[#8B8B8B]">Score</p><p class="mt-1 font-semibold text-[#1C1917]">${entry.score}%</p></div>
                            <div class="rounded-2xl bg-[#FAF8F6] p-3"><p class="text-[12px] text-[#8B8B8B]">Time spent</p><p class="mt-1 font-semibold text-[#1C1917]">${entry.time}</p></div>
                            <div class="rounded-2xl bg-[#FAF8F6] p-3"><p class="text-[12px] text-[#8B8B8B]">Attempted</p><p class="mt-1 font-semibold text-[#1C1917]">${entry.attempted} questions</p></div>
                        </div>
                        <div class="mt-5 flex gap-3">
                            <button type="button" data-history-action="Review" class="flex-1 rounded-2xl border border-[#E8DDD5] px-4 py-3 text-sm font-semibold text-[#A41034]">Review</button>
                            <button type="button" data-practice-topic="${escapeHtml(entry.topic)}" class="flex-1 rounded-2xl bg-[#A41034] px-4 py-3 text-sm font-semibold text-white">Retry</button>
                        </div>
                    </section>
                </div>
            `;
        }

        function renderPracticeStat(label, value, tone = 'wine') {
            const color = tone === 'amber' ? '#f59138' : tone === 'green' ? '#2E7D32' : '#A41034';
            return `
                <div class="rounded-2xl border border-[#E7E5E4] bg-white p-4">
                    <p class="text-[12px] font-medium text-[#78716C]">${label}</p>
                    <p class="mt-1 text-2xl font-semibold" style="color: ${color};">${value}</p>
                </div>
            `;
        }

        function renderPracticeQuickCard(icon, title, description, difficulty, time, cta, action = '') {
            return `
                <article class="flex min-h-[174px] flex-col rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-[0_10px_28px_rgba(28,25,23,0.045)]">
                    <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#A41034]/8 text-[#A41034]">
                        <i data-lucide="${icon}" class="h-5 w-5"></i>
                    </div>
                    <h3 class="text-[15px] font-semibold text-[#1C1917]">${title}</h3>
                    <p class="mt-1.5 flex-1 text-sm leading-5 text-[#6D5D5A]">${description}</p>
                    <div class="mt-4 flex items-center justify-between gap-3 border-t border-[#F0EEEC] pt-3">
                        <span class="text-[11px] font-medium text-[#8B8B8B]">${difficulty} · ${time}</span>
                        <button type="button" ${action} class="rounded-lg bg-[#F7F5F3] px-3 py-2 text-[12px] font-semibold text-[#A41034] transition-colors hover:bg-[#A41034]/8">${cta}</button>
                    </div>
                </article>
            `;
        }

        function renderPracticeDemoScreens(mode) {
            const isTeacher = mode === 'teacher';
            return `
                <section class="grid gap-5 xl:grid-cols-2">
                    <article class="rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-[0_10px_28px_rgba(28,25,23,0.045)]">
                        <div class="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A41034]">Live Practice Preview</p>
                                <h3 class="mt-1 text-lg font-semibold text-[#1C1917]">Question 3 of 10</h3>
                            </div>
                            <span class="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#b75d13]">04:28</span>
                        </div>
                        <div class="mb-4 h-1.5 overflow-hidden rounded-full bg-[#F0EEEC]"><div class="h-full w-[30%] rounded-full bg-[#A41034]"></div></div>
                        <div class="rounded-2xl bg-[#FAFAFA] p-5">
                            <div class="mb-3 flex flex-wrap gap-2">
                                <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#A41034]">Equivalent Fractions</span>
                                <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#78716C]">Medium</span>
                            </div>
                            <p class="text-[15px] font-semibold leading-6 text-[#1C1917]">Which fraction is equivalent to 2/4?</p>
                            <div class="mt-4 grid gap-2 sm:grid-cols-2">
                                ${['1/2', '2/8', '3/4', '4/5'].map((option, index) => `<div class="rounded-xl border ${index === 0 ? 'border-[#2E7D32] bg-[#f2faf3] text-[#2E7D32]' : index === 1 ? 'border-[#f59138] bg-[#fff7ed] text-[#b75d13]' : 'border-[#E7E5E4] bg-white text-[#44403C]'} px-4 py-3 text-sm font-semibold">${option}</div>`).join('')}
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <button class="rounded-xl border border-[#E7E5E4] px-4 py-2 text-xs font-semibold text-[#78716C]">Hint used</button>
                                <button class="rounded-xl border border-[#E7E5E4] px-4 py-2 text-xs font-semibold text-[#78716C]">Skip</button>
                                <button class="rounded-xl bg-[#A41034] px-4 py-2 text-xs font-semibold text-white">Submit</button>
                            </div>
                        </div>
                    </article>
                    <article class="rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-[0_10px_28px_rgba(28,25,23,0.045)]">
                        <p class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A41034]">${isTeacher ? 'Teacher Result' : 'Child Result'}</p>
                        <h3 class="mt-1 text-lg font-semibold text-[#1C1917]">${isTeacher ? 'Class practice summary' : 'Great work, Aarav'}</h3>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            ${isTeacher ? `
                                ${renderPracticeStat('Class Avg Score', '71%')}
                                ${renderPracticeStat('Completed', '28/32', 'green')}
                                ${renderPracticeStat('Weak Questions', '4', 'amber')}
                                ${renderPracticeStat('Need Support', '6')}
                            ` : `
                                ${renderPracticeStat('Score', '8/10')}
                                ${renderPracticeStat('Accuracy', '80%', 'green')}
                                ${renderPracticeStat('Time Taken', '17m')}
                                ${renderPracticeStat('Badge', 'Fractions Star', 'amber')}
                            `}
                        </div>
                        <div class="mt-5 rounded-2xl bg-[#FAFAFA] p-4">
                            <p class="text-sm font-semibold text-[#1C1917]">${isTeacher ? 'Suggested next practice' : 'Growth message'}</p>
                            <p class="mt-1 text-sm leading-5 text-[#6D5D5A]">${isTeacher ? 'Assign follow-up on simplifying fractions to 6 students needing support.' : 'Aarav improved in equivalent fractions. Try word problems next.'}</p>
                        </div>
                    </article>
                </section>
            `;
        }

        function renderPracticeGymSetupForm() {
            const subjects = practiceGymState.grade ? Object.keys(GYM_CURRICULUM[practiceGymState.grade] || {}) : [];
            const blocks = practiceGymState.grade && practiceGymState.subject ? GYM_CURRICULUM[practiceGymState.grade][practiceGymState.subject] || [] : [];
            const ready = isPracticeGymReady();
            const timeIndex = GYM_TIME_OPTIONS.indexOf(practiceGymState.timeLimit);

            // <div class="inline-flex w-fit items-center gap-1 rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] p-1">
            //     <button type="button" data-gym-mode="teacher" class="h-9 rounded-lg px-5 text-[13px] font-semibold transition-all ${practiceGymState.mode === 'teacher' ? 'bg-white text-[#A41034] shadow-[0_4px_14px_rgba(28,25,23,0.08)]' : 'text-[#78716C] hover:text-[#1C1917]'}">Teacher</button>
            //     <button type="button" data-gym-mode="parent" class="h-9 rounded-lg px-5 text-[13px] font-semibold transition-all ${practiceGymState.mode === 'parent' ? 'bg-white text-[#A41034] shadow-[0_4px_14px_rgba(28,25,23,0.08)]' : 'text-[#78716C] hover:text-[#1C1917]'}">Parent</button>
            // </div>
            return `

                <section class="mx-auto flex max-w-4xl flex-col rounded-[24px] border border-[#E7E5E4] bg-white p-5 shadow-[0_18px_45px_rgba(28,25,23,0.07)] max-sm:max-w-none sm:p-7">
                    
                <section class="mb-5 flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 class="truncate font-['Poppins'] text-[24px] font-semibold leading-8 text-[#1C1917] tracking-[-0.3px]">Current Practice Form</h1>
                    </div>
                </section>
                    
                    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                        ${renderGymSelect('grade', 'Grade', GYM_GRADES, practiceGymState.grade)}
                        ${renderGymSelect('subject', 'Subject', subjects, practiceGymState.subject, !practiceGymState.grade)}
                    </div>
                    <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        ${renderGymSelect('block', 'Block', blocks, practiceGymState.block, !practiceGymState.subject)}
                        ${renderGymSelect('difficulty', 'Difficulty', GYM_DIFFICULTY_LEVELS, practiceGymState.difficulty)}
                    </div>
                    <div class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div class="rounded-xl border border-[#E7E5E4] bg-[#FAFAFA] px-3 py-2">
                            <div class="mb-1 flex items-center justify-between gap-3">
                                <span class="text-[11px] font-medium leading-4 text-[#8B8B8B]">Time Limit</span>
                                <span class="text-xs font-semibold text-[#1C1917]">${practiceGymState.timeLimit} min</span>
                            </div>
                            <div>
                                <input type="range" min="0" max="${GYM_TIME_OPTIONS.length - 1}" step="1" value="${timeIndex < 0 ? 2 : timeIndex}" data-gym-time class="h-1.5 w-full cursor-pointer accent-[#A41034]">
                                <div class="mt-1 flex justify-between text-[10px] font-medium leading-4 text-[#8B8B8B]">
                                    ${GYM_TIME_OPTIONS.map((time) => `<button type="button" data-gym-time-option="${time}" class="transition-colors ${practiceGymState.timeLimit === time ? 'font-semibold text-[#A41034]' : 'hover:text-[#1C1917]'}">${time}m</button>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-end justify-end">
                            ${practiceGymState.mode === 'teacher' ? (
                    practiceGymState.pdfGenerated ? `
                                    <div class="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#4CAF50]/20 bg-[#f2faf3] px-5 py-3">
                                        <i data-lucide="check" class="h-4 w-4 text-[#4CAF50]"></i>
                                        <div class="min-w-0 flex-1">
                                            <p class="text-[13px] font-semibold leading-5 text-[#1C1917]">PDF Ready</p>
                                            <button type="button" data-gym-generate-another class="text-xs font-medium leading-4 text-[#8B8B8B] transition-colors hover:text-[#A41034]">Generate another</button>
                                        </div>
                                    </div>
                                ` : `
                                    <button type="button" data-gym-download-pdf ${ready ? '' : 'disabled'} class="focus-ring flex h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-semibold tracking-[0.3px] transition-all active:scale-95 ${ready ? 'bg-[#A41034] text-white hover:-translate-y-0.5 hover:bg-[#7a0c26] hover:shadow-[0_12px_24px_rgba(164,16,52,0.22)]' : 'cursor-not-allowed bg-[#F5F5F4] text-[#B8B2AE]'}">
                                        <i data-lucide="download" class="h-4 w-4"></i>
                                        Generate & Download PDF
                                    </button>
                                `
                ) : `
                                <button type="button" data-gym-start-test ${ready ? '' : 'disabled'} class="focus-ring flex h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-semibold tracking-[0.3px] transition-all active:scale-95 ${ready ? 'bg-[#A41034] text-white hover:-translate-y-0.5 hover:bg-[#7a0c26] hover:shadow-[0_12px_24px_rgba(164,16,52,0.22)]' : 'cursor-not-allowed bg-[#F5F5F4] text-[#B8B2AE]'}">
                                    <i data-lucide="play" class="h-4 w-4 fill-current"></i>
                                    Start Test
                                </button>
                            `}
                        </div>
                    </div>
                </section>
            `;
        }

        function renderPracticeSetupSheet() {
            if (!practiceGymState.showSetupForm) return '';
            return `
                <div class="fixed inset-0 z-50 overflow-y-auto bg-black/20 px-4 py-6 backdrop-blur-sm" data-practice-overlay>
                    <div class="mx-auto flex min-h-full max-w-5xl items-end sm:items-center">
                        <div class="w-full">
                            <div class="mb-3 flex justify-end">
                                <button type="button" data-close-setup-form class="focus-ring grid h-11 w-11 place-items-center rounded-full bg-white text-[#6D5D5A] shadow-[0_14px_32px_rgba(28,25,23,0.16)]">
                                    <i data-lucide="x" class="h-5 w-5"></i>
                                </button>
                            </div>
                            ${renderPracticeGymSetupForm()}
                        </div>
                    </div>
                </div>
            `;
        }

        function renderPracticeGymSelection() {
            return `
                <section class="mx-auto max-w-[760px] space-y-5 pb-24">
                    ${renderPracticeHero()}
                    ${renderThisWeekSummary()}
                    ${renderPracticeCalendar()}
                    ${renderWhereToImprove()}
                    ${renderUsageSummary()}
                    ${renderPracticeHistory()}
                </section>
                ${renderPracticeSubjectFilterToolbar()}
                <button type="button" data-practice-start class="focus-ring fixed bottom-5 left-4 right-4 z-30 h-14 rounded-2xl bg-[#A41034] py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(164,16,52,0.22)] sm:hidden">Start Practice</button>
                ${renderPracticeSetupSheet()}
                ${renderCalendarDayDetailsSheet()}
            `;
        }

        function renderPracticeGymTest() {
            const question = practiceGymState.questions[practiceGymState.currentQ];
            const progress = (practiceGymState.currentQ / practiceGymState.questions.length) * 100;
            const answered = practiceGymState.selected !== null && practiceGymState.selected !== undefined;
            return `
                <section class="mb-8 flex items-center justify-between">
                    <div>
                        <p class="mb-1 text-[10px] font-black tracking-widest text-[#A8A29E]">${practiceGymState.grade} · ${practiceGymState.subject} · ${practiceGymState.block.split(': ')[0]}</p>
                        <h1 class="text-3xl font-black leading-none tracking-tight text-[#1C1917]">Practice Test</h1>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="rounded-2xl border ${practiceGymState.timeLeft < 60 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#E7E5E4] bg-[#F5F5F4] text-[#1C1917]'} px-5 py-3 text-[13px] font-black">${formatGymTime(practiceGymState.timeLeft)}</div>
                        <button type="button" data-gym-reset class="rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-5 py-3 text-[11px] font-black tracking-wider text-[#78716C] transition-colors hover:bg-[#E7E5E4]">Exit Test</button>
                    </div>
                </section>
                <section class="mx-auto max-w-2xl">
                    <div class="mb-8">
                        <div class="mb-2 flex items-center justify-between">
                            <span class="text-[10px] font-black tracking-widest text-[#A8A29E]">Question ${practiceGymState.currentQ + 1} of ${practiceGymState.questions.length}</span>
                            <span class="text-[10px] font-black tracking-widest text-[#A41034]">${practiceGymState.difficulty.toUpperCase()}</span>
                        </div>
                        <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#F5F5F4]">
                            <div class="h-full rounded-full bg-[#A41034] transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="mb-6 rounded-[2.5rem] border border-[#E7E5E4] bg-white p-10">
                        <div class="mb-8 flex items-start gap-4">
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#A41034] text-[13px] font-black text-white">${practiceGymState.currentQ + 1}</div>
                            <p class="flex-1 text-[16px] font-bold leading-relaxed text-[#1C1917]">${escapeHtml(question.text)}</p>
                        </div>
                        <div class="space-y-3">
                            ${question.options.map((option, index) => `
                                <button type="button" data-gym-answer="${index}" class="w-full rounded-2xl border-2 px-6 py-4 text-left text-[13px] font-bold transition-all active:scale-[0.99] ${practiceGymState.selected === index ? 'border-[#A41034] bg-[#A41034]/[0.08] text-[#A41034]' : 'border-transparent bg-[#F5F5F4] text-[#44403C] hover:border-[#E7E5E4] hover:bg-white'}">
                                    <span class="inline-flex items-center gap-3">
                                        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-[10px] font-black ${practiceGymState.selected === index ? 'border-[#A41034] bg-[#A41034] text-white' : 'border-[#D6D3D1] text-[#A8A29E]'}">${String.fromCharCode(65 + index)}</span>
                                        ${escapeHtml(option)}
                                    </span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" data-gym-next ${answered ? '' : 'disabled'} class="flex items-center gap-3 rounded-2xl px-8 py-4 text-[11px] font-black transition-all active:scale-95 ${answered ? 'bg-[#A41034] text-white hover:bg-[#7a0c26]' : 'cursor-not-allowed bg-[#E7E5E4] text-[#A8A29E]'}">
                            ${practiceGymState.currentQ + 1 === practiceGymState.questions.length ? 'Submit Test' : 'Next Question'}
                            <i data-lucide="chevron-right" class="h-4 w-4"></i>
                        </button>
                    </div>
                </section>
            `;
        }

        function renderPracticeGymResults() {
            const score = practiceGymState.answers.filter((answer, index) => answer === practiceGymState.questions[index]?.answer).length;
            const total = practiceGymState.questions.length;
            const percentage = total ? Math.round((score / total) * 100) : 0;
            const passed = percentage >= 60;
            return `
                <section class="mx-auto max-w-2xl py-6">
                    <div class="rounded-[2.5rem] border border-[#E7E5E4] bg-white p-12 text-center">
                        <div class="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center rounded-full border-[10px] ${passed ? 'border-[#A41034]' : 'border-[#f59138]'}">
                            <div>
                                <p class="text-3xl font-black text-[#1C1917]">${percentage}%</p>
                                <p class="text-[9px] font-black tracking-widest text-[#A8A29E]">Score</p>
                            </div>
                        </div>
                        <h2 class="mb-2 text-3xl font-black tracking-tight text-[#1C1917]">${percentage === 100 ? 'Perfect Score!' : passed ? 'Well Done!' : 'Keep Practising!'}</h2>
                        <p class="mb-1 text-[14px] font-medium text-[#78716C]">${score} of ${total} questions correct</p>
                        <p class="mb-10 text-[10px] font-black tracking-widest text-[#A8A29E]">${practiceGymState.grade} · ${practiceGymState.subject} · ${practiceGymState.block.split(': ')[0]} · ${practiceGymState.difficulty}</p>
                        <div class="mb-10 grid grid-cols-3 gap-4">
                            <div class="rounded-2xl bg-[#F5F5F4] py-5"><p class="text-2xl font-black text-[#4CAF50]">${score}</p><p class="mt-1 text-[10px] font-black tracking-widest text-[#A8A29E]">Correct</p></div>
                            <div class="rounded-2xl bg-[#F5F5F4] py-5"><p class="text-2xl font-black text-[#f59138]">${total - score}</p><p class="mt-1 text-[10px] font-black tracking-widest text-[#A8A29E]">Incorrect</p></div>
                            <div class="rounded-2xl bg-[#F5F5F4] py-5"><p class="text-2xl font-black text-[#A8A29E]">${total}</p><p class="mt-1 text-[10px] font-black tracking-widest text-[#A8A29E]">Total</p></div>
                        </div>
                        <div class="flex items-center justify-center gap-3">
                            <button type="button" data-gym-reset class="rounded-2xl border border-[#E7E5E4] bg-[#F5F5F4] px-8 py-4 text-[11px] font-black tracking-wider text-[#78716C] transition-colors hover:bg-[#E7E5E4]">Back to Gym</button>
                            <button type="button" data-gym-start-test class="rounded-2xl bg-[#A41034] px-8 py-4 text-[11px] font-black tracking-wider text-white transition-all hover:bg-[#7a0c26] active:scale-95">Try Again</button>
                        </div>
                    </div>
                </section>
            `;
        }

        function renderPracticeGym() {
            const root = document.getElementById('practiceGymRoot');
            if (!root) return;
            if (practiceGymState.testStarted && !practiceGymState.testDone) {
                root.innerHTML = renderPracticeGymTest();
            } else if (practiceGymState.testDone) {
                root.innerHTML = renderPracticeGymResults();
            } else if (practiceGymState.showSetupPage) {
                root.innerHTML = `<section class="mx-auto max-w-[760px] py-2">${renderPracticeGymSetupForm()}</section>`;
            } else {
                root.innerHTML = renderPracticeGymSelection();
            }
            bindPracticeGymEvents();
            lucide.createIcons();
        }

        function renderPracticeGymGlobalFab() {
            const root = document.getElementById('practiceGymGlobalFabRoot');
            if (!root) return;
            root.innerHTML = '';
        }

        function bindPracticeGymEvents() {
            const root = document.getElementById('practiceGymRoot');
            if (!root) return;
            root.querySelectorAll('[data-practice-subject]').forEach((button) => {
                button.addEventListener('click', () => {
                    practiceGymState.selectedReviewSubject = button.dataset.practiceSubject || 'Mathematics';
                    practiceGymState.selectedCalendarDay = null;
                    renderPracticeGym();
                });
            });
            root.querySelectorAll('[data-practice-start]').forEach((button) => {
                button.addEventListener('click', () => {
                    const weakTopic = getPracticeSubjectData().weakTopics[0]?.topic || '';
                    openPracticeSetup(getPracticeSelectedSubject(), weakTopic);
                });
            });
            root.querySelectorAll('[data-practice-topic]').forEach((button) => {
                button.addEventListener('click', () => {
                    openPracticeSetup(getPracticeSelectedSubject(), button.dataset.practiceTopic || '');
                });
            });
            root.querySelector('[data-open-setup-form]')?.addEventListener('click', () => {
                openPracticeSetup();
            });
            root.querySelector('[data-close-setup-form]')?.addEventListener('click', () => {
                practiceGymState.showSetupForm = false;
                renderPracticeGym();
            });
            root.querySelectorAll('[data-calendar-day]').forEach((button) => {
                button.addEventListener('click', () => {
                    practiceGymState.selectedCalendarDay = Number(button.dataset.calendarDay);
                    renderPracticeGym();
                });
            });
            root.querySelector('[data-close-day-sheet]')?.addEventListener('click', () => {
                practiceGymState.selectedCalendarDay = null;
                renderPracticeGym();
            });
            root.querySelectorAll('[data-usage-metric]').forEach((button) => {
                button.addEventListener('click', () => {
                    practiceGymState.usageMetric = button.dataset.usageMetric === 'minutes' ? 'minutes' : 'attempts';
                    renderPracticeGym();
                });
            });
            root.querySelector('[data-practice-review-mistakes]')?.addEventListener('click', () => {
                showAppToast('Latest mistakes are ready to review.');
            });
            root.querySelectorAll('[data-history-action]').forEach((button) => {
                button.addEventListener('click', () => {
                    const action = button.dataset.historyAction || 'Review';
                    if (action === 'Resume') {
                        openPracticeSetup(getPracticeSelectedSubject());
                    } else {
                        showAppToast(`${action} opened for ${getPracticeSelectedSubject()}.`);
                    }
                });
            });
            root.querySelectorAll('[data-gym-mode]').forEach((button) => {
                button.addEventListener('click', () => {
                    practiceGymState.mode = button.dataset.gymMode;
                    practiceGymState.pdfGenerated = false;
                    resetPracticeGymTest();
                    renderPracticeGym();
                });
            });
            root.querySelectorAll('[data-gym-field]').forEach((select) => {
                select.addEventListener('change', () => {
                    const field = select.dataset.gymField;
                    practiceGymState[field] = select.value;
                    practiceGymState.pdfGenerated = false;
                    if (field === 'grade') {
                        practiceGymState.subject = '';
                        practiceGymState.block = '';
                    }
                    if (field === 'subject') {
                        practiceGymState.block = '';
                    }
                    renderPracticeGym();
                });
            });
            root.querySelector('[data-gym-time]')?.addEventListener('input', (event) => {
                practiceGymState.timeLimit = GYM_TIME_OPTIONS[Number(event.target.value)] || 30;
                renderPracticeGym();
            });
            root.querySelectorAll('[data-gym-time-option]').forEach((button) => {
                button.addEventListener('click', () => {
                    practiceGymState.timeLimit = Number(button.dataset.gymTimeOption);
                    renderPracticeGym();
                });
            });
            root.querySelector('[data-gym-download-pdf]')?.addEventListener('click', () => {
                practiceGymState.pdfGenerated = true;
                renderPracticeGym();
            });
            root.querySelector('[data-gym-generate-another]')?.addEventListener('click', () => {
                practiceGymState.pdfGenerated = false;
                renderPracticeGym();
            });
            root.querySelectorAll('[data-gym-start-test]').forEach((button) => {
                button.addEventListener('click', () => {
                    if (isPracticeGymReady()) {
                        practiceGymState.showSetupForm = false;
                        startPracticeGymTest();
                    }
                });
            });
            root.querySelectorAll('[data-gym-answer]').forEach((button) => {
                button.addEventListener('click', () => {
                    practiceGymState.selected = Number(button.dataset.gymAnswer);
                    renderPracticeGym();
                    if (practiceGymState.testStarted && !practiceGymState.testDone) startPracticeGymTimer();
                });
            });
            root.querySelector('[data-gym-next]')?.addEventListener('click', () => {
                if (practiceGymState.selected === null || practiceGymState.selected === undefined) return;
                practiceGymState.answers.push(practiceGymState.selected);
                if (practiceGymState.currentQ + 1 >= practiceGymState.questions.length) {
                    practiceGymState.testDone = true;
                    stopPracticeGymTimer();
                } else {
                    practiceGymState.currentQ += 1;
                    practiceGymState.selected = null;
                }
                renderPracticeGym();
                if (practiceGymState.testStarted && !practiceGymState.testDone) startPracticeGymTimer();
            });
            root.querySelectorAll('[data-gym-reset]').forEach((button) => {
                button.addEventListener('click', () => {
                    resetPracticeGymTest();
                    renderPracticeGym();
                });
            });
        }

        const subjectLibrary = {
            earlyChildhood: {
                name: 'Early Childhood',
                subtitle: 'Foundation Plan',
                teacher: 'Ms. Nisha Mehta',
                progress: 40,
                icon: 'early'
            },
            english: {
                name: 'English',
                subtitle: 'Curriculum Plan',
                teacher: 'Ms. Ananya Rao',
                progress: 65,
                icon: 'book'
            },
            computerScience: {
                name: 'Computer',
                subtitle: 'Curriculum Plan',
                teacher: 'Mr. Rohan Kapoor',
                progress: 48,
                icon: 'monitor'
            },
            mathematics: {
                name: 'Mathematics',
                subtitle: 'Curriculum Plan',
                teacher: 'Ms. Priya Sharma',
                progress: 30,
                icon: 'math'
            },
            science: {
                name: 'Science',
                subtitle: 'Curriculum Plan',
                teacher: 'Mr. Arjun Menon',
                progress: 45,
                icon: 'flask'
            },
            evs: {
                name: 'EVS',
                subtitle: 'Curriculum Plan',
                teacher: 'Ms. Kavya Iyer',
                progress: 10,
                icon: 'globe'
            },
            social: {
                name: 'Soc.Science',
                subtitle: 'Curriculum Plan',
                teacher: 'Mr. Vivek Nair',
                progress: 36,
                icon: 'landmark'
            },
            hindi: {
                name: 'Hindi',
                subtitle: 'Curriculum Plan',
                teacher: 'Ms. Pooja Verma',
                progress: 58,
                icon: 'hindi'
            }
        };

        const primarySubjects = [
            subjectLibrary.english,
            subjectLibrary.mathematics,
            subjectLibrary.science,
            subjectLibrary.hindi,
            subjectLibrary.evs,
            subjectLibrary.computerScience,
            // subjectLibrary.social,
        ];

        function renderIcon(iconName) {
            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    ${iconPaths[iconName]}
                </svg>
            `;
        }

        function renderWatermarkIcon(iconName) {
            return `
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    ${iconPaths[iconName]}
                </svg>
            `;
        }
        const subjectThemes = {
            Mathematics: {
                accent: '#2563EB', // Royal Blue
                accentSoft: 'rgba(37, 99, 235, 0.08)',
                accentTrack: 'rgba(37, 99, 235, 0.14)',
                glow: 'rgba(37, 99, 235, 0.12)',
                gradientColor: '#DBEAFE',
                illustration: 'math',
                icon: 'icons/maths.png'
            },

            Science: {
                accent: '#16A34A', // Emerald Green
                accentSoft: 'rgba(22, 163, 74, 0.08)',
                accentTrack: 'rgba(22, 163, 74, 0.14)',
                glow: 'rgba(22, 163, 74, 0.12)',
                gradientColor: '#DCFCE7',
                illustration: 'science',
                icon: 'icons/science.png'
            },

            English: {
                accent: '#C0265C', // Rose Crimson
                accentSoft: 'rgba(192, 38, 92, 0.07)',
                accentTrack: 'rgba(192, 38, 92, 0.14)',
                glow: 'rgba(192, 38, 92, 0.12)',
                gradientColor: '#FCE7F3',
                illustration: 'english',
                icon: 'icons/eng.png'
            },

            Hindi: {
                accent: '#EA580C', // Deep Orange
                accentSoft: 'rgba(234, 88, 12, 0.07)',
                accentTrack: 'rgba(234, 88, 12, 0.14)',
                glow: 'rgba(234, 88, 12, 0.12)',
                gradientColor: '#FED7AA',
                illustration: 'hindi',
                icon: 'icons/hindi.png'
            },

            'Computer': {
                accent: '#7C3AED', // Violet
                accentSoft: 'rgba(124, 58, 237, 0.08)',
                accentTrack: 'rgba(124, 58, 237, 0.15)',
                glow: 'rgba(124, 58, 237, 0.12)',
                gradientColor: '#EDE9FE',
                illustration: 'computer',
                icon: 'icons/CS.png'
            },

            'EVS': {
                accent: '#0891B2', // Cyan Teal
                accentSoft: 'rgba(8, 145, 178, 0.08)',
                accentTrack: 'rgba(8, 145, 178, 0.14)',
                glow: 'rgba(8, 145, 178, 0.12)',
                gradientColor: '#CFFAFE',
                illustration: 'evs',
                icon: 'icons/EVS.png'
            },

            'Social Science': {
                accent: '#92400E', // Earth Brown
                accentSoft: 'rgba(146, 64, 14, 0.07)',
                accentTrack: 'rgba(146, 64, 14, 0.14)',
                glow: 'rgba(146, 64, 14, 0.12)',
                gradientColor: '#FDE7C7',
                illustration: 'social',
                icon: 'icons/social.png'
            },

            'EVS': {
                accent: '#DB2777', // Playful Pink
                accentSoft: 'rgba(219, 39, 119, 0.07)',
                accentTrack: 'rgba(219, 39, 119, 0.14)',
                glow: 'rgba(219, 39, 119, 0.12)',
                gradientColor: '#FCE7F3',
                illustration: 'early',
                icon: 'icons/early.png'
            }
        };

        function getSubjectTheme(subjectName = '') {
            return subjectThemes[subjectName] || {
                accent: '#A41034',
                accentSoft: 'rgba(164, 16, 52, 0.045)',
                accentTrack: 'rgba(164, 16, 52, 0.12)',
                glow: 'rgba(164, 16, 52, 0.10)',
                illustration: 'default',
                icon: 'icons/eng.png'
            };
        }

        function getSubjectBackground(subjectName = '') {
            const backgrounds = {
                English: 'assets/subjects/english_bg.png',
                Mathematics: 'assets/subjects/mathematics_bg.png',
                Science: 'assets/subjects/science_bg.png',
                Hindi: 'assets/subjects/hindi_bg.png',
                'Social Science': 'assets/subjects/social_science_bg.png',
                'Environmental Science': 'assets/subjects/environmental_science_bg.png',
                'Computer': 'assets/subjects/computer_science_g1_g2_bg.png',
                'Early Childhood': 'assets/subjects/early_childhood_bg.png'
            };

            return backgrounds[subjectName] || backgrounds.English;
        }

        function renderSubjectImage(subject, theme) {
            return `
                <img src="${theme.icon}" alt="" class="subject-icon-image pointer-events-none absolute right-5 top-7 z-10 h-[104px] w-[132px] object-contain object-center opacity-40 transition-all duration-200 group-hover:scale-[1.02] group-hover:opacity-40 max-sm:right-4 max-sm:top-12 max-sm:h-[92px] max-sm:w-[112px]" aria-hidden="true">
            `;
        }

        function renderSubjectLinearProgress(value, theme) {
            const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
            return `
                <div class="relative h-1.5 w-full overflow-hidden rounded-full" style="background: ${theme.accentTrack};">
                    <div class="h-full rounded-full" style="width: ${safeValue}%; background: ${theme.accent};"></div>
                </div>
            `;
        }

        function renderSubjectIllustration(subjectName, theme) {
            const type = theme.illustration;
            const base = `opacity=".72"`;
            const common = `class="subject-illustration absolute right-4 top-5 h-28 w-28 transition-transform duration-200 group-hover:scale-[1.03] sm:right-5" aria-hidden="true"`;
            const accent = theme.accent;
            const soft = theme.accentTrack;

            const illustrations = {
                math: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="48" r="40" fill="${soft}" />
                        <rect x="44" y="28" width="44" height="62" rx="12" fill="white" stroke="${accent}" stroke-opacity=".28" stroke-width="2" ${base}/>
                        <rect x="52" y="38" width="28" height="11" rx="4" fill="${accent}" fill-opacity=".16"/>
                        <circle cx="56" cy="62" r="4" fill="${accent}" fill-opacity=".38"/><circle cx="68" cy="62" r="4" fill="${accent}" fill-opacity=".28"/><circle cx="80" cy="62" r="4" fill="${accent}" fill-opacity=".38"/>
                        <path d="M31 36h18M40 27v18M86 82l13 13M99 82 86 95" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-opacity=".35"/>
                        <path d="M28 76h22" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-opacity=".22"/>
                    </svg>`,
                science: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="42" fill="${soft}" />
                        <path d="M64 26v35c0 13-9 23-21 23h-3" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-opacity=".34"/>
                        <rect x="52" y="21" width="21" height="13" rx="5" fill="white" stroke="${accent}" stroke-opacity=".28" stroke-width="2"/>
                        <circle cx="49" cy="58" r="12" fill="white" stroke="${accent}" stroke-opacity=".28" stroke-width="2"/>
                        <path d="M36 91h52M50 83l-7 8M70 63l18 28" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-opacity=".28"/>
                        <path d="M82 36c13 4 17 15 11 29-14-3-20-14-11-29Z" fill="${accent}" fill-opacity=".20"/>
                    </svg>`,
                english: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="41" fill="${soft}" />
                        <path d="M31 41c17-8 30-4 38 8v42c-9-10-22-13-38-6V41Z" fill="white" stroke="${accent}" stroke-opacity=".25" stroke-width="2"/>
                        <path d="M69 49c9-10 22-12 36-5v41c-15-6-27-3-36 6V49Z" fill="white" stroke="${accent}" stroke-opacity=".25" stroke-width="2"/>
                        <path d="M42 57h16M42 68h14M81 57h13M81 68h10" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-opacity=".27"/>
                        <path d="M78 31c17-14 28-11 30-9-4 1-7 5-9 10-4 11-11 16-25 18 6-5 6-12 4-19Z" fill="${accent}" fill-opacity=".18"/>
                    </svg>`,
                hindi: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="41" fill="${soft}" />
                        <rect x="32" y="34" width="58" height="50" rx="14" fill="white" stroke="${accent}" stroke-opacity=".24" stroke-width="2"/>
                        <path d="M44 49h37M52 49v23M52 61h12c7 0 11-4 11-10M81 49v23" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".38"/>
                        <circle cx="90" cy="80" r="14" fill="${accent}" fill-opacity=".13"/>
                        <path d="M86 81h9M90.5 76.5v9" stroke="${accent}" stroke-width="3" stroke-linecap="round" stroke-opacity=".35"/>
                    </svg>`,
                computer: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="41" fill="${soft}" />
                        <rect x="28" y="35" width="68" height="44" rx="12" fill="white" stroke="${accent}" stroke-opacity=".25" stroke-width="2"/>
                        <path d="M42 51h20M42 63h12M70 52l8 7-8 7" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".34"/>
                        <path d="M56 79h13l3 13H53l3-13Z" fill="${accent}" fill-opacity=".14"/>
                        <path d="M46 94h34" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-opacity=".25"/>
                    </svg>`,
                evs: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="41" fill="${soft}" />
                        <path d="M57 89c0-23 8-39 27-53" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-opacity=".33"/>
                        <path d="M78 38c17-6 27 0 31 5-7 12-20 19-38 13 0-7 2-13 7-18Z" fill="white" stroke="${accent}" stroke-opacity=".25" stroke-width="2"/>
                        <path d="M55 58c-16-9-27-5-34 2 4 14 18 22 37 19 2-8 1-15-3-21Z" fill="white" stroke="${accent}" stroke-opacity=".25" stroke-width="2"/>
                        <circle cx="46" cy="92" r="13" fill="${accent}" fill-opacity=".15"/>
                    </svg>`,
                social: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="41" fill="${soft}" />
                        <path d="M61 25 96 45H26l35-20Z" fill="white" stroke="${accent}" stroke-opacity=".24" stroke-width="2"/>
                        <path d="M35 51v30M52 51v30M70 51v30M87 51v30M28 88h68" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-opacity=".30"/>
                        <circle cx="61" cy="40" r="5" fill="${accent}" fill-opacity=".28"/>
                    </svg>`,
                early: `
                    <svg ${common} viewBox="0 0 120 120" fill="none">
                        <circle cx="70" cy="50" r="41" fill="${soft}" />
                        <path d="m61 25 9 18 20 3-14 14 3 20-18-9-18 9 3-20-14-14 20-3 9-18Z" fill="white" stroke="${accent}" stroke-opacity=".25" stroke-width="2"/>
                        <path d="M43 91c9-9 26-11 39 0" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-opacity=".24"/>
                        <circle cx="92" cy="36" r="8" fill="${accent}" fill-opacity=".16"/>
                    </svg>`
            };

            return illustrations[type] || illustrations.english;
        }

        const blockImageKeywords = {
            // Computer Science
            'Digital Basics': 'digital,technology,computer',
            'Parts of a Computer': 'computer,hardware,keyboard',
            'Using the Keyboard': 'keyboard,typing,hands',
            'Mouse Skills': 'computer,mouse,desk',
            'File and Folder Basics': 'folder,organize,documents',
            'Drawing with Shapes': 'shapes,drawing,colorful',
            'Internet Safety': 'internet,safety,shield',
            'Sequencing Steps': 'steps,flowchart,order',
            'Pattern Logic': 'pattern,puzzle,logic',
            'Simple Algorithms': 'algorithm,code,programming',
            'Creative Coding': 'coding,creative,screen',
            'Debugging Basics': 'debug,magnify,code',
            'Data Around Us': 'data,chart,information',
            'Presentation Skills': 'presentation,speaking,screen',
            'Digital Citizenship': 'digital,community,network',
            // Environmental Science
            'My Surroundings': 'nature,surroundings,park',
            'My Family': 'family,home,together',
            'Food We Eat': 'food,vegetables,healthy',
            'Water Around Us': 'water,river,nature',
            'Plants Near Us': 'plant,green,garden',
            'Animals Around Us': 'animals,wildlife,nature',
            'Our Body': 'body,health,children',
            'Good Habits': 'healthy,morning,routine',
            'Weather Around Us': 'weather,clouds,sky',
            'Homes and Shelter': 'home,house,shelter',
            'People Who Help Us': 'community,helpers,doctor',
            'Festivals and Places': 'festival,celebration,culture',
            'Travel and Transport': 'transport,travel,vehicle',
            'Keeping Clean': 'clean,hygiene,soap',
            'Caring for Nature': 'nature,environment,conservation',
            // English
            'The Alphabet Song': 'alphabet,letters,children',
            'Letter Sounds': 'letters,phonics,reading',
            'Sight Words': 'reading,words,book',
            'Reading Fluency': 'reading,book,library',
            'Rhyming Words': 'poetry,rhyme,words',
            'Nouns Around Us': 'objects,classroom,learning',
            'Action Words': 'movement,action,active',
            'Describing Words': 'colorful,describe,vivid',
            'Sentence Builders': 'writing,sentence,notebook',
            'Listening for Details': 'listening,attention,classroom',
            'Story Characters': 'story,characters,books',
            'Story Setting': 'landscape,setting,scene',
            'Picture Reading': 'illustration,picture,reading',
            'Writing Workshop': 'writing,pen,notebook',
            'Speaking with Confidence': 'speaking,confidence,stage',
            // Science
            'Light and Shadows': 'light,shadow,sun',
            'Changes in the Sky': 'sky,clouds,astronomy',
            'Materials Around Us': 'materials,science,objects',
            'Solids and Liquids': 'water,liquid,solid',
            'Plants Grow': 'plant,growth,seeds',
            'Animal Needs': 'animals,wildlife,nature',
            'Human Body': 'body,anatomy,health',
            'Healthy Habits': 'healthy,exercise,nutrition',
            'Forces and Motion': 'motion,speed,movement',
            'Sound Around Us': 'sound,music,wave',
            'Water Cycle Basics': 'water,rain,cycle',
            'Weather Watch': 'weather,storm,lightning',
            'Magnets': 'magnet,metal,science',
            'Simple Machines': 'machine,gear,mechanics',
            'Observing Like Scientists': 'microscope,science,laboratory',
            // Social Science
            'My Community': 'community,neighborhood,people',
            'My School': 'school,classroom,education',
            'Rules and Responsibilities': 'rules,community,teamwork',
            'Maps and Places': 'map,geography,world',
            'Directions Around Us': 'compass,direction,navigate',
            'Our Neighborhood': 'neighborhood,street,community',
            'Helpers at Work': 'profession,doctor,worker',
            'Culture and Heritage': 'culture,heritage,tradition',
            'Festivals We Celebrate': 'festival,celebration,lights',
            'Food and Clothing': 'food,clothing,culture',
            'Transport and Travel': 'transport,vehicle,travel',
            'Public Places': 'city,park,public',
            'Our Country': 'country,flag,landscape',
            'Good Citizenship': 'community,volunteer,citizen',
            'Saving Resources': 'environment,conservation,green',
            // Mathematics
            'Numbers and Patterns': 'numbers,math,pattern',
            'Counting Forward': 'counting,numbers,children',
            'Comparing Numbers': 'comparison,numbers,math',
            'Place Value': 'numbers,digit,math',
            'Addition Stories': 'math,addition,classroom',
            'Subtraction Stories': 'math,classroom,learning',
            'Shapes Around Us': 'shapes,geometry,colorful',
            'Geometry in Life': 'geometry,architecture,shapes',
            'Measurement': 'measurement,ruler,science',
            'Time of Day': 'clock,time,sunrise',
            'Money Basics': 'coins,money,market',
            'Data and Pictures': 'chart,graph,data',
            'Patterns in Nature': 'pattern,nature,symmetry',
            'Fractions as Parts': 'fractions,math,divide',
            'Problem Solving': 'thinking,puzzle,solution',
            // Hindi
            'Swar Pehchan': 'language,letters,learning',
            'Vyanjan Pehchan': 'alphabet,language,script',
            'Matra Abhyas': 'writing,practice,notebook',
            'Pathan Kaushal': 'reading,book,study',
            'Shabd Nirman': 'words,language,build',
            'Vakya Rachna': 'sentence,writing,compose',
            'Vyakaran': 'grammar,language,study',
            'Kahani Pathan': 'story,book,reading',
            'Kavita Pathan': 'poetry,poem,literature',
            'Shravan Kaushal': 'listening,classroom,learning',
            'Baatcheet': 'conversation,friends,speaking',
            'Chitra Varnan': 'picture,describe,illustration',
            'Rachnatmak Lekhan': 'creative,writing,notebook',
            'Muhavare': 'language,phrases,words',
            'Punravartan': 'revision,study,books',
            // Early Childhood
            'Stories and Sounds': 'story,children,book',
            'Colors Around Me': 'colors,rainbow,paint',
            'Numbers and Shapes': 'numbers,shapes,toys',
            'Fine Motor Fun': 'craft,hands,children',
            'Big and Small': 'size,toys,comparison',
            'My Body': 'children,body,healthy',
            'Animals and Sounds': 'animals,sound,kids',
            'Fruits and Vegetables': 'fruits,vegetables,colorful',
            'Weather Play': 'rain,children,outdoor',
            'Sharing and Caring': 'sharing,friends,children',
            'Music and Movement': 'music,dance,children',
            'World Around Me': 'world,explore,nature',
            'Creative Play': 'play,art,creative'
        };

        function strToSeed(str) {
            let h = 0;
            for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
            return Math.abs(h) % 10000;
        }

        const blockImages = {
            // Computer Science
            'Digital Basics': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
            'Parts of a Computer': 'https://images.unsplash.com/photo-1518770660439-4636190af475',
            'Using the Keyboard': 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
            'Mouse Skills': 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931',
            'File and Folder Basics': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
            'Drawing with Shapes': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
            'Internet Safety': 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
            'Sequencing Steps': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
            'Pattern Logic': 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
            'Simple Algorithms': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
            'Creative Coding': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
            'Debugging Basics': 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
            'Data Around Us': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            'Presentation Skills': 'https://images.unsplash.com/photo-1552664730-d307ca884978',
            'Digital Citizenship': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',

            // Environmental Science
            'My Surroundings': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            'My Family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300',
            'Food We Eat': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
            'Water Around Us': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
            'Plants Near Us': 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735',
            'Animals Around Us': 'https://images.unsplash.com/photo-1474511320723-9a56873867b5',
            'Our Body': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6',
            'Good Habits': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
            'Weather Around Us': 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
            'Homes and Shelter': 'https://images.unsplash.com/photo-1460317442991-0ec209397118',
            'People Who Help Us': 'https://images.unsplash.com/photo-1584515933487-779824d29309',
            'Festivals and Places': 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
            'Travel and Transport': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            'Keeping Clean': 'https://images.unsplash.com/photo-1588776814546-ec7e4c6c5b1b',
            'Caring for Nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',

            // English
            'The Alphabet Song': 'https://images.unsplash.com/photo-1513258496099-48168024aec0',
            'Letter Sounds': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Sight Words': 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
            'Reading Fluency': 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6',
            'Rhyming Words': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Nouns Around Us': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
            'Action Words': 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
            'Describing Words': 'https://images.unsplash.com/photo-1500534623283-312aade485b7',
            'Sentence Builders': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Listening for Details': 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
            'Story Characters': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Story Setting': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            'Picture Reading': 'https://images.unsplash.com/photo-1516542076529-1ea3854896e1',
            'Writing Workshop': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Speaking with Confidence': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',

            // Science
            'Light and Shadows': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
            'Changes in the Sky': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            'Materials Around Us': 'https://images.unsplash.com/photo-1518770660439-4636190af475',
            'Solids and Liquids': 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
            'Plants Grow': 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735',
            'Animal Needs': 'https://images.unsplash.com/photo-1474511320723-9a56873867b5',
            'Human Body': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6',
            'Healthy Habits': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
            'Forces and Motion': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            'Sound Around Us': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
            'Water Cycle Basics': 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
            'Weather Watch': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b',
            'Magnets': 'https://images.unsplash.com/photo-1518770660439-4636190af475',
            'Simple Machines': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
            'Observing Like Scientists': 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e',

            // Social Science
            'My Community': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
            'My School': 'https://images.unsplash.com/photo-1509062522246-3755977927d7',
            'Rules and Responsibilities': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
            'Maps and Places': 'https://images.unsplash.com/photo-1524661135-423995f22d0b',
            'Directions Around Us': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2',
            'Our Neighborhood': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
            'Helpers at Work': 'https://images.unsplash.com/photo-1584515933487-779824d29309',
            'Culture and Heritage': 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
            'Festivals We Celebrate': 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
            'Food and Clothing': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
            'Transport and Travel': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            'Public Places': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
            'Our Country': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
            'Good Citizenship': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
            'Saving Resources': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',

            // Mathematics
            'Numbers and Patterns': 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
            'Counting Forward': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
            'Comparing Numbers': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
            'Place Value': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
            'Addition Stories': 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
            'Subtraction Stories': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
            'Shapes Around Us': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
            'Geometry in Life': 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2',
            'Measurement': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
            'Time of Day': 'https://images.unsplash.com/photo-1501139083538-0139583c060f',
            'Money Basics': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e',
            'Data and Pictures': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            'Patterns in Nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
            'Fractions as Parts': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
            'Problem Solving': 'https://images.unsplash.com/photo-1509228468518-180dd4864904',

            // Hindi
            'Swar Pehchan': 'https://images.unsplash.com/photo-1513258496099-48168024aec0',
            'Vyanjan Pehchan': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Matra Abhyas': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Pathan Kaushal': 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6',
            'Shabd Nirman': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Vakya Rachna': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Vyakaran': 'https://images.unsplash.com/photo-1513258496099-48168024aec0',
            'Kahani Pathan': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Kavita Pathan': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Shravan Kaushal': 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
            'Baatcheet': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
            'Chitra Varnan': 'https://images.unsplash.com/photo-1516542076529-1ea3854896e1',
            'Rachnatmak Lekhan': 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            'Muhavare': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Punravartan': 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6',

            // Early Childhood
            'Stories and Sounds': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353',
            'Colors Around Me': 'https://images.unsplash.com/photo-1494256997604-768d1f608cac',
            'Numbers and Shapes': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
            'Fine Motor Fun': 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
            'Big and Small': 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
            'My Body': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6',
            'Animals and Sounds': 'https://images.unsplash.com/photo-1474511320723-9a56873867b5',
            'Fruits and Vegetables': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
            'Weather Play': 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21',
            'Sharing and Caring': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
            'Music and Movement': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
            'World Around Me': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            'Creative Play': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
            fallback: 'https://images.unsplash.com/photo-1509062522246-3755977927d7'
        };

        const lessonStageImageKeywords = {
            warm: 'curiosity,wonder,sunrise',
            explore: 'explore,discovery,investigate',
            practice: 'practice,classroom,learning',
            apply: 'apply,real-world,action',
            reflect: 'reflection,thinking,journal'
        };

        function getContentImageUrl(blockTitle, lessonStage) {
            const blockKw = blockImageKeywords[blockTitle];
            const stageKw = lessonStage ? lessonStageImageKeywords[lessonStage] : null;
            const keywords = stageKw
                ? `${blockKw ? blockKw.split(',')[0] : 'education'},${stageKw}`
                : (blockKw || 'education,classroom,learning');
            return `https://loremflickr.com/400/300/${keywords}?lock=${strToSeed(keywords)}`;
        }

        const blockTitleLibrary = {
            'Computer Science': ['Digital Basics', 'Parts of a Computer', 'Using the Keyboard', 'Mouse Skills', 'File and Folder Basics', 'Drawing with Shapes', 'Internet Safety', 'Sequencing Steps', 'Pattern Logic', 'Simple Algorithms', 'Creative Coding', 'Debugging Basics', 'Data Around Us', 'Presentation Skills', 'Digital Citizenship'],
            'Environmental Science': ['My Surroundings', 'My Family', 'Food We Eat', 'Water Around Us', 'Plants Near Us', 'Animals Around Us', 'Our Body', 'Good Habits', 'Weather Around Us', 'Homes and Shelter', 'People Who Help Us', 'Festivals and Places', 'Travel and Transport', 'Keeping Clean', 'Caring for Nature'],
            English: ['The Alphabet Song', 'Letter Sounds', 'Sight Words', 'Reading Fluency', 'Rhyming Words', 'Nouns Around Us', 'Action Words', 'Describing Words', 'Sentence Builders', 'Listening for Details', 'Story Characters', 'Story Setting', 'Picture Reading', 'Writing Workshop', 'Speaking with Confidence'],
            Science: ['Light and Shadows', 'Changes in the Sky', 'Materials Around Us', 'Solids and Liquids', 'Plants Grow', 'Animal Needs', 'Human Body', 'Healthy Habits', 'Forces and Motion', 'Sound Around Us', 'Water Cycle Basics', 'Weather Watch', 'Magnets', 'Simple Machines', 'Observing Like Scientists'],
            'Social Science': ['My Community', 'My School', 'Rules and Responsibilities', 'Maps and Places', 'Directions Around Us', 'Our Neighborhood', 'Helpers at Work', 'Culture and Heritage', 'Festivals We Celebrate', 'Food and Clothing', 'Transport and Travel', 'Public Places', 'Our Country', 'Good Citizenship', 'Saving Resources'],
            Mathematics: ['Numbers and Patterns', 'Counting Forward', 'Comparing Numbers', 'Place Value', 'Addition Stories', 'Subtraction Stories', 'Shapes Around Us', 'Geometry in Life', 'Measurement', 'Time of Day', 'Money Basics', 'Data and Pictures', 'Patterns in Nature', 'Fractions as Parts', 'Problem Solving'],
            Hindi: ['Swar Pehchan', 'Vyanjan Pehchan', 'Matra Abhyas', 'Pathan Kaushal', 'Shabd Nirman', 'Vakya Rachna', 'Vyakaran', 'Kahani Pathan', 'Kavita Pathan', 'Shravan Kaushal', 'Baatcheet', 'Chitra Varnan', 'Rachnatmak Lekhan', 'Muhavare', 'Punravartan'],
            'Early Childhood': ['Stories and Sounds', 'Colors Around Me', 'Numbers and Shapes', 'Fine Motor Fun', 'Big and Small', 'My Body', 'My Family', 'Animals and Sounds', 'Fruits and Vegetables', 'Weather Play', 'Good Habits', 'Sharing and Caring', 'Music and Movement', 'World Around Me', 'Creative Play']
        };

        const lessonTypes = [
            {
                title: 'Warm Up',
                duration: '20 min',
                stage: 'warm',
                icon: 'sun',
                image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7',
                description: (topic) => `Activate prior ideas and invite quick observations about ${topic.toLowerCase()}.`
            },
            {
                title: 'Explore',
                duration: '35 min',
                stage: 'explore',
                icon: 'search',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
                description: (topic) => `Students investigate examples and notice patterns before formal naming.`
            },
            {
                title: 'Teacher Model',
                duration: '30 min',
                stage: 'practice',
                icon: 'presentation',
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                description: (topic) => `Model the thinking moves students need for ${topic.toLowerCase()}.`
            },
            {
                title: 'Guided Practice',
                duration: '40 min',
                stage: 'practice',
                icon: 'pencil-ruler',
                image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
                description: () => 'Practice together with prompts, checks, and visible teacher support.'
            },
            {
                title: 'Activity Lab',
                duration: '35 min',
                stage: 'practice',
                icon: 'flask-conical',
                image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e',
                description: () => 'Hands-on task that turns the idea into observable classroom evidence.'
            },
            {
                title: 'Check Understanding',
                duration: '25 min',
                stage: 'explore',
                icon: 'list-checks',
                image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
                description: () => 'Quick check for misconceptions before students move to independent work.'
            },
            {
                title: 'Apply',
                duration: '30 min',
                stage: 'apply',
                icon: 'arrow-up-right',
                image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
                description: () => 'Use the idea in a fresh situation with a clear success target.'
            },
            {
                title: 'Reflect',
                duration: '20 min',
                stage: 'reflect',
                icon: 'sparkles',
                image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6',
                description: () => 'Close the learning loop with evidence, explanation, and next steps.'
            }
        ];

        function getStatus(progress) {
            if (progress >= 90) return 'Completed';
            if (progress > 0) return 'In Progress';
            return 'Not Started';
        }

        function getStatusClass(status) {
            if (status === 'Completed') return 'bg-[#4CAF50]/10 text-[#2E7D32] border-[#4CAF50]/20';
            if (status === 'In Progress') return 'bg-[#f59138]/10 text-[#b75d13] border-[#f59138]/20';
            return 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]';
        }

        function getSequentialLessonProgress(blockProgress, lessonIndex, lessonCount) {
            const safeProgress = Math.max(0, Math.min(100, Number(blockProgress) || 0));
            const lessonStep = 100 / lessonCount;
            const completedLessons = Math.min(lessonCount, Math.floor(safeProgress / lessonStep));

            if (lessonIndex < completedLessons) {
                return { progress: 100, status: 'Completed' };
            }

            if (safeProgress > 0 && safeProgress < 100 && lessonIndex === completedLessons) {
                const progressIntoLesson = Math.round(((safeProgress - (completedLessons * lessonStep)) / lessonStep) * 100);
                return { progress: Math.max(1, Math.min(99, progressIntoLesson)), status: 'In Progress' };
            }

            return { progress: 0, status: 'Not Started' };
        }

        function getDistributedBlockProgress(subjectProgress, blockIndex, blockCount) {
            const safeProgress = Math.max(0, Math.min(100, Number(subjectProgress) || 0));
            if (safeProgress <= 0) return 0;
            if (safeProgress >= 100) return 100;

            const blockStart = (blockIndex / blockCount) * 100;
            const blockEnd = ((blockIndex + 1) / blockCount) * 100;

            if (safeProgress >= blockEnd) return 100;
            if (safeProgress <= blockStart) return 0;

            return Math.round(((safeProgress - blockStart) / (blockEnd - blockStart)) * 100);
        }

        function getSubjectBlocks(subject, gradeIndex, subjectIndex) {
            const titles = blockTitleLibrary[subject.name] || Array.from({ length: 15 }, (_, index) => `${subject.name} Block ${index + 1}`);
            return titles.slice(0, 15).map((title, blockIndex) => {
                const progress = getDistributedBlockProgress(subject.progress, blockIndex, titles.length);
                const lessons = lessonTypes.map((lesson, lessonIndex) => {
                    const lessonState = getSequentialLessonProgress(progress, lessonIndex, lessonTypes.length);
                    return {
                        id: `lesson-${lessonIndex + 1}`,
                        title: lesson.title,
                        description: lesson.description(title),
                        duration: lesson.duration,
                        stage: lesson.stage,
                        icon: lesson.icon,
                        imageUrl: lesson.image || getContentImageUrl(title, lesson.stage),
                        progress: lessonState.progress,
                        status: lessonState.status
                    };
                });
                return {
                    id: `block-${blockIndex + 1}`,
                    title,
                    imageUrl: blockImages[title] || blockImages['fallback'],
                    progress,
                    status: getStatus(progress),
                    lessons
                };
            });
        }

        function getSubjectSummary(subject) {
            const blocks = subject.blocks || [];
            const lessons = blocks.flatMap((block) => block.lessons.map((lesson, lessonIndex) => ({
                ...lesson,
                lessonNumber: lessonIndex + 1,
                blockId: block.id,
                blockTitle: block.title
            })));
            const completedLessons = lessons.filter((lesson) => lesson.status === 'Completed').length;

            return {
                totalBlocks: blocks.length,
                totalLessons: lessons.length,
                completedLessons,
                status: getStatus(subject.progress)
            };
        }

        function getDemoSubjectProgress(gradeIndex, subjectIndex, baseProgress) {
            const preschoolProgress = [0, 18, 100];
            const primaryProgressByGrade = [
                [45, 23, 100, 48, 0, 72],
                [100, 0, 36, 58, 18, 100],
                [25, 100, 0, 64, 42, 88],
                [40, 0, 76, 100, 55, 22],
                [100, 68, 0, 84, 35, 100],
                [92, 100, 38, 0, 100, 61],
                [0, 44, 100, 72, 18, 100],
                [100, 56, 0, 96, 77, 100]
            ];

            if (gradeIndex < preschoolProgress.length) return preschoolProgress[gradeIndex];

            const gradeProgress = primaryProgressByGrade[gradeIndex - preschoolProgress.length];
            return gradeProgress ? gradeProgress[subjectIndex % gradeProgress.length] : baseProgress;
        }

        function buildGrade(id, title, sourceSubjects, gradeIndex) {
            return {
                id,
                title,
                subjects: sourceSubjects.map((subject, subjectIndex) => {
                    const progress = getDemoSubjectProgress(gradeIndex, subjectIndex, subject.progress);
                    const subjectWithProgress = { ...subject, progress };
                    return {
                        ...subjectWithProgress,
                        id: subject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        grade: title,
                        blocks: getSubjectBlocks(subjectWithProgress, gradeIndex, subjectIndex)
                    };
                })
            };
        }

        const curriculumByGrade = [
            ...Array.from({ length: 8 }, (_, index) => buildGrade(`grade-${index + 1}`, `Grade ${index + 1}`, primarySubjects, index + 3))
        ];
        curriculumByGrade.forEach((grade) => expandedGradeIds.add(grade.id));

        function findGrade(gradeId) {
            return curriculumByGrade.find((grade) => grade.id === gradeId);
        }

        function getLessonPlanGrades() {
            if (activeAppTab === 'Parent Lesson Plan') {
                const gradeOne = findGrade('grade-1');
                return gradeOne ? [gradeOne] : [];
            }

            return curriculumByGrade;
        }

        function findSubject(gradeId, subjectId) {
            const grade = findGrade(gradeId);
            return grade ? grade.subjects.find((subject) => subject.id === subjectId) : null;
        }

        function findBlock(gradeId, subjectId, blockId) {
            const subject = findSubject(gradeId, subjectId);
            return subject ? subject.blocks.find((block) => block.id === blockId) : null;
        }

        function getBlocksRouteKey(gradeId, subjectId) {
            return `${gradeId || ''}:${subjectId || ''}`;
        }

        function getBlockKey(gradeId, subjectId, blockId) {
            return `${gradeId}:${subjectId}:${blockId}`;
        }

        function getInProgressBlockKey(grade, subject) {
            const inProgressBlock = subject?.blocks.find((block) => block.status === 'In Progress' || (block.progress > 0 && block.progress < 100));
            const fallbackBlock = inProgressBlock || subject?.blocks.find((block) => block.status !== 'Completed') || subject?.blocks[0];
            return fallbackBlock ? getBlockKey(grade.id, subject.id, fallbackBlock.id) : '';
        }

        function getInProgressLessonKey(grade, subject) {
            const block = subject?.blocks.find((item) => item.status === 'In Progress' || (item.progress > 0 && item.progress < 100));
            if (!block) return '';
            const lesson = block.lessons.find((item) => item.status === 'In Progress') || block.lessons.find((item) => item.status !== 'Completed');
            return lesson ? `${getBlockKey(grade.id, subject.id, block.id)}:${lesson.id}` : '';
        }

        function initializeCollapsedBlocksPage(grade, subject) {
            const routeKey = getBlocksRouteKey(grade.id, subject.id);
            if (initializedCollapsedBlockRoutes.has(routeKey)) return;

            const inProgressBlockKey = getInProgressBlockKey(grade, subject);
            subject.blocks.forEach((block) => collapsedBlockIds.add(getBlockKey(grade.id, subject.id, block.id)));
            if (inProgressBlockKey) collapsedBlockIds.delete(inProgressBlockKey);
            initializedCollapsedBlockRoutes.add(routeKey);
        }

        function scrollToInProgressBlock(grade, subject, routeKey) {
            const blockKey = getInProgressBlockKey(grade, subject);
            if (!blockKey) return;
            const lessonKey = getInProgressLessonKey(grade, subject);

            activeBlockKey = blockKey;
            programmaticBlockScrollTarget = blockKey;
            if (programmaticBlockScrollTimer) clearTimeout(programmaticBlockScrollTimer);
            programmaticBlockScrollTimer = setTimeout(() => {
                programmaticBlockScrollTarget = '';
                programmaticBlockScrollTimer = null;
            }, 900);

            requestAnimationFrame(() => {
                const target = lessonKey ? document.getElementById(`lesson-session-${lessonKey}`) : null;
                (target || document.getElementById(`block-section-${blockKey}`))?.scrollIntoView({
                    behavior: 'smooth',
                    block: target ? 'center' : 'start'
                });
                renderGradeToolbar('blocks', new URLSearchParams(window.location.hash.replace(/^#/, '')));
                lastAutoScrolledBlocksRoute = routeKey;
            });
        }

        function renderProgress(value, color = 'var(--wine-red)', trackClass = 'bg-white') {
            const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
            return `
                <div class="h-1.5 w-full ${trackClass} rounded-full overflow-hidden" role="progressbar" aria-valuenow="${safeValue}" aria-valuemin="0" aria-valuemax="100" aria-label="${safeValue}% complete">
                    <div class="h-full rounded-full" style="width: ${safeValue}%; background: ${color};"></div>
                </div>
            `;
        }

        function renderHeroProgress(value) {
            const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
            return `
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#F0E7E4] shadow-inner" role="progressbar" aria-valuenow="${safeValue}" aria-valuemin="0" aria-valuemax="100" aria-label="${safeValue}% complete">
                    <div class="h-full rounded-full shadow-[0_4px_14px_rgba(177,15,58,0.24)]" style="width: ${safeValue}%; background: linear-gradient(90deg, #8F0B2E 0%, #B10F3A 58%, #D65A70 100%);"></div>
                </div>
            `;
        }

        function getStageStyle(stage) {
            const styles = {
                warm: {
                    badge: 'bg-amber-50 text-amber-700 border-amber-100',
                    icon: 'bg-amber-100 text-amber-700',
                    ring: 'group-hover:border-amber-200'
                },
                explore: {
                    badge: 'bg-sky-50 text-sky-700 border-sky-100',
                    icon: 'bg-sky-100 text-sky-700',
                    ring: 'group-hover:border-sky-200'
                },
                practice: {
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: 'bg-emerald-100 text-emerald-700',
                    ring: 'group-hover:border-emerald-200'
                },
                apply: {
                    badge: 'bg-violet-50 text-violet-700 border-violet-100',
                    icon: 'bg-violet-100 text-violet-700',
                    ring: 'group-hover:border-violet-200'
                },
                reflect: {
                    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
                    icon: 'bg-fuchsia-100 text-fuchsia-700',
                    ring: 'group-hover:border-fuchsia-200'
                }
            };
            return styles[stage] || styles.practice;
        }

        function getNextLessonTarget(subject) {
            const block = subject?.blocks.find((item) => item.status === 'In Progress' || (item.progress > 0 && item.progress < 100))
                || subject?.blocks.find((item) => item.status !== 'Completed')
                || subject?.blocks[0];
            if (!block) return null;

            const lesson = block.lessons.find((item) => item.status === 'In Progress')
                || block.lessons.find((item) => item.status !== 'Completed')
                || block.lessons[0];
            if (!lesson) return null;

            return { block, lesson };
        }

        function getRoleForTab(title = activeAppTab) {
            if (title === 'Teacher Lesson Plan') return 'teacher';
            if (title === 'Parent Lesson Plan') return 'parent';
            if (title === 'Profile') return 'teacher';
            if (title === 'Front Office') return 'principle';
            return 'principle';
        }

        function renderSubjectMeta(subject, grade, theme) {
            if (currentRole === 'principle') {
                return `
                <div class="my-2 flex max-w-full flex-col gap-1">
                    <p class="inline-flex max-w-full items-center gap-1.5 text-[10px] font-medium leading-none text-[#6F625F]">
                        <span class="truncate">${escapeHtml(subject.teacher || 'Class Teacher')}</span>
                    </p>
                </div>
                `;
            }

            if (currentRole === 'parent') {
                const pendingLessons = Math.max(0, (subject.blocks || []).flatMap((block) => block.lessons || []).filter((lesson) => lesson.status !== 'Completed').length);
                return `
                <div class="my-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#FFF7F4] px-2 py-1 text-[10px] font-semibold leading-none text-[#8A4B3A] ring-1 ring-[#F2D8CF]">
                    <i data-lucide="home" class="h-3 w-3 shrink-0" style="color: ${theme.accent};"></i>
                    <span class="truncate">${pendingLessons} lessons left</span>
                </div>
                `;
            }

            const target = getNextLessonTarget(subject);
            if (!target) return '';

            const href = getViewHref('lessons', {
                gradeId: grade.id,
                subjectId: subject.id,
                blockId: target.block.id,
                lessonId: target.lesson.id
            });
            return `
                <div class="mt-0.5 flex max-w-full flex-col gap-1">
                   
                    <a href="${href}" class="inline-flex my-2 max-w-full items-center gap-1.5 text-[10px] font-bold leading-none transition hover:underline"
                        style="color: ${theme.accent};"
                        data-view="lessons" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${target.block.id}" data-lesson-id="${target.lesson.id}"
                        aria-label="Open next lesson: ${escapeHtml(target.lesson.title)}">
                        <span class="shrink-0">Next Lesson:</span>
                        <span class="truncate">${escapeHtml(target.lesson.title)}</span>
                        <i data-lucide="arrow-right" class="h-3 w-3 shrink-0"></i>
                    </a>
                </div>
            `;
        }


        function getParentSubjectMoments(subject) {
            const blocks = subject.blocks || [];
            const currentBlock = blocks.find((item) => item.status === 'In Progress' || (item.progress > 0 && item.progress < 100))
                || blocks.find((item) => item.status !== 'Completed')
                || blocks[0];
            const currentIndex = currentBlock ? Math.max(0, blocks.findIndex((item) => item.id === currentBlock.id)) : 0;
            const lastCompleted = blocks.slice(0, currentIndex).reverse().find((item) => item.status === 'Completed')
                || blocks.find((item) => item.status === 'Completed');
            const upNext = blocks.slice(currentIndex + 1).find((item) => item.status !== 'Completed');
            const currentLessons = currentBlock?.lessons || [];
            const currentDone = currentLessons.filter((lesson) => lesson.status === 'Completed').length;

            return {
                currentBlock,
                currentIndex,
                currentDone,
                currentTotal: currentLessons.length,
                lastCompleted,
                upNext
            };
        }

        function getParentSubjectCard(subject, grade) {
            const summary = getSubjectSummary(subject);
            const theme = getSubjectTheme(subject.name);
            const progress = Math.max(0, Math.min(100, Number(subject.progress) || 0));
            const target = getNextLessonTarget(subject);
            const block = target?.block || subject.blocks?.[0];
            const lesson = target?.lesson || block?.lessons?.[0];
            const blockIndex = block ? Math.max(0, subject.blocks.findIndex((item) => item.id === block.id)) : 0;
            const lessonIndex = block && lesson ? Math.max(0, block.lessons.findIndex((item) => item.id === lesson.id)) : 0;
            const blockName = block?.title || null;
            const lessonName = lesson?.title || null;
            const blockLessons = block?.lessons?.length || 0;
            const completedBlockLessons = block?.lessons?.filter(l => l.status === 'Completed').length || 0;

            return `
                <article class="subject-card focus-ring group relative flex cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[#E9DDD9] p-4 focus:outline-none"
                    style="--subject-accent: ${theme.accent}; --subject-bg: url('${getSubjectBackground(subject.name)}');"
                    data-view="blocks" data-grade-id="${grade.id}" data-subject-id="${subject.id}"
                    role="button" tabindex="0" aria-label="View ${escapeHtml(subject.name)} blocks for ${escapeHtml(grade.title)}">

                    <!-- Accent gradient over entire card -->
                    <div class="pointer-events-none absolute inset-0 z-10 rounded-[10px]" aria-hidden="true"
                        style="background: linear-gradient(to bottom, color-mix(in srgb, var(--subject-accent) 10%, white) 0%, transparent 100%);"></div>

                    <!-- Grade + Subject name row -->
                    <div class="relative z-20 flex items-start justify-between gap-2">
                        <div class="min-w-0 flex-1">
                            <p class="text-[11px] font-medium text-[#A9A19C] leading-none mb-1">${escapeHtml(grade.title)}</p>
                            <h4 class="truncate text-[18px] font-bold leading-tight text-[#1C1917]">${escapeHtml(subject.name)}</h4>
                        </div>
                    <span class="absolute right-3 top-3 z-30" style="color: ${theme.accent}; opacity: 0.7;" aria-hidden="true">
                        <i data-lucide="chevron-right" class="h-4 w-4"></i>
                    </span>
                    </div>

                    <!-- Current learning lesson -->
                    <div class="relative z-20 mt-4 min-w-0">
                        <div class="flex items-start gap-2.5">
                            <div class="min-w-0 flex-1">
                                <span class="mb-1 block text-[9px] font-bold uppercase tracking-widest" style="color: var(--subject-accent);">Now Learning</span>
                                <p class="truncate text-[13px] font-semibold leading-snug text-[#1C1917]">${escapeHtml(blockName || lessonName || subject.name)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Progress -->
                    <div class="relative z-20 mt-auto pt-4">
                        <div class="mb-1.5 flex items-center justify-between gap-2">
                            <span class="text-[11px] font-medium text-[#78716C]">${completedBlockLessons} / ${blockLessons} Lessons</span>
                            <span class="text-[11px] font-bold tabular-nums" style="color: ${theme.accent};">${progress}%</span>
                        </div>
                        <div class="h-1 overflow-hidden rounded-full" style="background: ${theme.accentTrack};"
                            role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(subject.name)} progress">
                            <div class="h-full rounded-full transition-all duration-300" style="width: ${progress}%; background: ${theme.accent};"></div>
                        </div>
                    </div>

                    <!-- Practice Gym -->
                    <div class="relative z-20 mt-3 flex items-center justify-end">
                        <button type="button"
                            data-open-practice-gym-page
                            class="focus-ring group/gym inline-flex items-center gap-1 text-[11px] font-medium text-[#A9A19C] transition-colors hover:text-[#78716C] focus:outline-none"
                            aria-label="Open Practice Gym for ${escapeHtml(subject.name)}">
                            <i data-lucide="dumbbell" class="h-3 w-3 transition-colors"></i>
                            <span class="underline-offset-2 group-hover/gym:underline">Practice Gym</span>
                        </button>
                    </div>
                </article>
            `;
        }

        function renderSubjectCardv1(subject, grade) {
            const summary = getSubjectSummary(subject);
            const theme = getSubjectTheme(subject.name);
            const progress = Math.max(0, Math.min(100, Number(subject.progress) || 0));

            return `
                <article class="subject-card focus-ring group relative flex min-h-[40px] max-h-[120px] cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[#E9DDD9] p-3 focus:outline-none"
                    style="--subject-accent: ${theme.accent};--subject-bg: url('${getSubjectBackground(subject.name)}');"
                    data-view="blocks" data-grade-id="${grade.id}" data-subject-id="${subject.id}"
                    role="button" tabindex="0" aria-label="View ${escapeHtml(subject.name)} blocks for ${escapeHtml(grade.title)}">

                    <span class="subject-card-arrow absolute right-3 top-3 z-30 grid h-7 w-7 place-items-center rounded-full" aria-hidden="true">
                        <i data-lucide="chevron-right" class="h-4 w-4"></i>
                    </span>

                    <div class="relative z-20 max-w-[calc(100%-2.5rem)]">
                        <h4 class="text-[1rem] font-bold leading-tight text-[#252221]">${escapeHtml(subject.name)}</h4>
                        ${renderSubjectMeta(subject, grade, theme)}
                    </div>

                    <div class="relative z-20 mt-auto pt-0">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-right text-[10px] font-medium text-[#78716C]">${summary.completedLessons}/${summary.totalLessons} Lessons</p>
                            <span class="text-[10px] font-black tabular-nums" style="color: ${theme.accent};">${progress}%</span>
                        </div>
                        <div class="mt-2">
                            <div class="h-1 overflow-hidden rounded-full bg-[#ecececb3]" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(subject.name)} progress ${progress}%">
                                <div class="h-full rounded-full" style="width: ${progress}%; background: ${theme.accent};"></div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }

        function renderSubjectCardv2(subject, grade) {
            const summary = getSubjectSummary(subject);
            const theme = getSubjectTheme(subject.name);
            const progress = Math.max(0, Math.min(100, Number(subject.progress) || 0));

            return `
                <article class="subject-card focus-ring group relative flex min-h-[40px] max-h-[120px] cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[#E9DDD9] p-3 focus:outline-none"
                    style="--subject-accent: ${theme.accent};--subject-bg: url('${getSubjectBackground(subject.name)}');"
                    data-view="blocks" data-grade-id="${grade.id}" data-subject-id="${subject.id}"
                    role="button" tabindex="0" aria-label="View ${escapeHtml(subject.name)} blocks for ${escapeHtml(grade.title)}">

                    <span class="absolute right-3 top-3 z-30" style="color: ${theme.accent}; opacity: 0.7;" aria-hidden="true">
                        <i data-lucide="chevron-right" class="h-4 w-4"></i>
                    </span>
                    
                    <div class="relative z-20 max-w-[calc(100%-2.5rem)]">
                        <h4 class="text-[1rem] font-bold leading-tight text-[#252221]">${escapeHtml(subject.name)}</h4>
                    </div>

                    <div class="relative z-20 mt-auto pt-0">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-right text-[10px] font-medium text-[#78716C]">${summary.completedLessons}/${summary.totalLessons} Lessons</p>
                            <span class="text-[11px] font-black tabular-nums" style="color: ${theme.accent};">${progress}%</span>
                        </div>
                        <div class="mt-2">
                            <div class="h-1 overflow-hidden rounded-full bg-[#ecececb3]" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(subject.name)} progress ${progress}%">
                                <div class="h-full rounded-full" style="width: ${progress}%; background: ${theme.accent};"></div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }

        function renderSubjectCardv3(subject, grade) {
            const summary = getSubjectSummary(subject);
            const theme = getSubjectTheme(subject.name);
            const progress = Math.max(0, Math.min(100, Number(subject.progress) || 0));

            return `
                <article class="subject-card focus-ring group relative flex flex-1 min-w-[150px] lg:min-w-[140px] min-h-[80px] max-h-[140px] lg:max-h-[150px] cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[#E9DDD9] p-3 focus:outline-none"
                    style="--subject-accent: ${theme.accent};--subject-bg: url('${getSubjectBackground(subject.name)}');"
                    data-view="blocks" data-grade-id="${grade.id}" data-subject-id="${subject.id}"
                    role="button" tabindex="0" aria-label="View ${escapeHtml(subject.name)} blocks for ${escapeHtml(grade.title)}">

                    <div class="pointer-events-none absolute inset-0 z-10 rounded-[10px]" aria-hidden="true"
                        style="background: linear-gradient(to bottom, color-mix(in srgb, var(--subject-accent) 4%, white) 0%, transparent 100%);"></div>

                    <span class="absolute right-3 top-3 z-30" style="color: ${theme.accent}; opacity: 0.7;" aria-hidden="true">
                        <i data-lucide="chevron-right" class="h-4 w-4"></i>
                    </span>

                    <div class="relative z-20 max-w-[calc(100%-2.5rem)]">
                        <h4 class="text-[1rem] font-bold leading-tight text-[#252221]">${escapeHtml(subject.name)}</h4>
                    </div>

                    <div class="relative z-20 pt-0 mt-2">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-right text-[10px] font-medium text-[#78716C]">${summary.completedLessons}/${summary.totalLessons} Lessons</p>
                            <span class="text-[11px] font-black tabular-nums" style="color: ${theme.accent};">${progress}%</span>
                        </div>
                        <div class="mt-2">
                            <div class="h-0.5 overflow-hidden rounded-full bg-[#ecececb3]" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(subject.name)} progress ${progress}%">
                                <div class="h-full rounded-full" style="width: ${progress}%; background: ${theme.accent};"></div>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }

        function getGradeSummary(grade) {
            const subjects = grade.subjects || [];
            const progress = subjects.length
                ? Math.round(subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length)
                : 0;

            return {
                subjectsCount: subjects.length,
                progress: grade.id === 'grade-1' ? 41 : progress
            };
        }

        function getGradeBadgeLabel(grade) {
            if (grade.id === 'nursery') return 'NUR';
            if (grade.id === 'lkg') return 'LKG';
            if (grade.id === 'ukg') return 'UKG';

            const gradeNumber = grade.id.match(/^grade-(\d+)$/)?.[1];
            return gradeNumber ? `G${gradeNumber}` : grade.title;
        }

        function renderGradeSection(grade) {
            const summary = getGradeSummary(grade);
            const isParentTab = getRoleForTab() === 'parent';

            if (isParentTab) {
                const attentionSubject = (grade.subjects || []).find((subject) => subject.progress > 0 && subject.progress < 30);
                return `
                    <section id="grade-section-${grade.id}" class="scroll-mt-28 mb-5" data-grade-section="${grade.id}">
                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 class="text-[26px] font-bold tracking-tight text-[#16120F]">All subjects</h2>
                        </div>
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            ${(grade.subjects || []).map(subject => getParentSubjectCard(subject, grade)).join('')}
                        </div>
                    </section>
                `;
            }

            // Grade-level SVG donut ring
            const gr = 18, gradeCirc = +(2 * Math.PI * gr).toFixed(1);
            const gradeDash = +((summary.progress / 100) * gradeCirc).toFixed(1);
            const gradeRing = `<svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true" class="shrink-0">
                <circle cx="24" cy="24" r="${gr}" stroke="rgba(189,23,64,0.10)" stroke-width="2"/>
                <circle cx="24" cy="24" r="${gr}" stroke="#BD1740" stroke-width="2" stroke-linecap="round"
                    stroke-dasharray="${gradeDash} ${gradeCirc}" transform="rotate(-90 24 24)"/>
                <text x="24" y="28" text-anchor="middle" font-size="10" font-weight="800" fill="#BD1740" font-family="Inter,sans-serif">${summary.progress}%</text>
            </svg>`;

            return `
                <div class="relative mb-8 scroll-mt-28" id="grade-section-${grade.id}" data-grade-section="${grade.id}">
                    <span class="pointer-events-none absolute -top-[11px] left-5 z-10 select-none rounded-full border border-[#EDE0DB] bg-white px-3 py-0.5 text-[11px] font-black uppercase tracking-widest text-[#a40c2e]">${escapeHtml(grade.title)}</span>
                    <section class="overflow-hidden rounded-[16px] border border-[#EDE0DB] bg-white/50 shadow-[0_6px_40px_rgba(28,25,23,0.05)] backdrop-blur-sm">
                        <div class="subjects-row-wrapper px-6 py-6 lg:px-6 lg:py-6" data-grade-id="${grade.id}">
                            <div class="subjects-row flex flex-wrap gap-3">
                                
                                ${(grade.subjects || []).map(subject => renderSubjectCardv3(subject, grade)).join('')}
                            </div>
                        </div>
                    </section>
                </div>
            `;
        }

                            // <div class="subjects-row flex flex-wrap gap-3 after:flex-auto after:content-[''] after:min-w-[150px] lg:after:min-w-[140px]">
        // ${(grade.subjects || []).map(subject => renderSubjectCardv1(subject, grade)).join('')}

        function renderBlocksPage(gradeId, subjectId) {
            const grade = findGrade(gradeId);
            const subject = findSubject(gradeId, subjectId);
            if (!grade || !subject) return renderHome();

            const theme = getSubjectTheme(subject.name);
            const totalSessions = subject.blocks.reduce((sum, block) => sum + block.lessons.length, 0);
            const progress = Math.max(0, Math.min(100, Number(subject.progress) || 0));
            const completedSessions = subject.blocks.reduce((sum, block) => sum + block.lessons.filter(l => l.status === 'Completed').length, 0);

            if (activeAppTab === 'Parent Lesson Plan') {
                return `
                    <div class="relative mx-auto max-w-[1180px]">
                        <div class="px-1 py-1">
                            <h1 class="truncate text-xl font-bold text-[#1C1917] md:text-2xl">${escapeHtml(grade.title)} &middot; ${escapeHtml(subject.name)}</h1>
                        </div>
                    </div>
                    <section class="lesson-journey-shell -mx-6 -mt-2 px-6 pb-16 pt-0 md:-mx-12 md:px-12">
                        <div class="mx-auto max-w-[1180px] space-y-6 pt-4">
                            ${subject.blocks.map((block, index) => {
                    const firstLesson = block.lessons?.[0];
                    const canOpen = Boolean(firstLesson);
                    return `
                                    <article class="focus-ring rounded-[30px] border border-[#EDE0DB] bg-white p-4 shadow-[0_12px_30px_rgba(28,25,23,0.05)] transition-all duration-200 md:p-6 ${canOpen ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(28,25,23,0.08)]' : ''}"
                                        ${canOpen ? `data-view="lessons" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${block.id}" data-lesson-id="${firstLesson.id}" role="button" tabindex="0" aria-label="Open ${escapeHtml(block.title)}"` : ''}>
                                        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                                                ${renderBlockImageBadge(block, index, theme, subject.name)}
                                                <div class="min-w-0">
                                                    <div class="flex flex-wrap items-center gap-2">
                                                        <p class="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A41034] ring-1 ring-[#E9DDD9]/80">Block ${index + 1}</p>
                                                    </div>
                                                    <h2 class="mt-3 text-1xl font-bold leading-tight text-[#1C1917] md:text-[1.3rem]">${escapeHtml(block.title)}</h2>
                                                    <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#6F625F]">${escapeHtml(getParentBlockDescription(block.title))}</p>
                                                </div>
                                            </div>
                                            ${canOpen ? `
                                                <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFF7F4] text-[#B10F3A] shadow-[0_10px_24px_rgba(28,25,23,0.07)] ring-1 ring-[#E9DDD9]/75 transition-all duration-200">
                                                    <i data-lucide="chevron-right" class="h-4 w-4"></i>
                                                </span>
                                            ` : ''}
                                        </div>
                                    </article>
                                `;
                }).join('')}
                        </div>
                    </section>
                `;
            }

            initializeCollapsedBlocksPage(grade, subject);

            return `
                <div class="relative mx-auto max-w-[1180px]">
                    <div class="px-1 py-1">
                        <h1 class="truncate text-xl font-bold text-[#1C1917] md:text-2xl">${escapeHtml(grade.title)} &middot; ${escapeHtml(subject.name)}</h1>
                    </div>
                </div>
                <section class="lesson-journey-shell -mx-6 -mt-2 px-6 pb-16 pt-0 md:-mx-12 md:px-12">

                    <div class="mx-auto max-w-[1180px] space-y-8 pt-4">
                        ${subject.blocks.map((block, index) => renderBlockSection(block, index, grade, subject)).join('')}
                    </div>
                </section>
            `;
        }

        function getLessonDisplayStatus(lesson) {
            return lesson.status;
        }

        function getLessonStatusClass(status) {
            if (status === 'Completed') return 'bg-[#A41034]/5 text-[#A41034]';
            if (status === 'In Progress') return 'bg-[#f59138]/15 text-[#A41034]';
            return 'bg-[#F5F5F4] text-[#78716C]';
        }

        function renderStatusMark(status) {
            if (status === 'Completed') {
                return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
            }
            return '';
        }

        function renderTimelineNode(status) {
            if (status === 'Completed') {
                return `
                    <span class="timeline-node completed" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                `;
            }

            if (status === 'In Progress') {
                return '<span class="timeline-node progress" aria-hidden="true"></span>';
            }

            return '<span class="timeline-node not-started" aria-hidden="true"></span>';
        }

        function getLessonSessionTitle(lesson, lessonIndex) {
            return `Session ${lessonIndex + 1} : ${lesson.title}`;
        }

        function getLessonSessionLabel(lessonIndex) {
            return `Session ${lessonIndex + 1}`;
        }

        function getLessonCompletionKey(gradeId, subjectId, blockId, lessonId) {
            return [gradeId, subjectId, blockId, lessonId].join(':');
        }

        function getLessonNoteStorageKey(gradeId, subjectId, blockId, lessonId, sectionId) {
            return `edge-note:${gradeId}:${subjectId}:${blockId}:${lessonId}:${sectionId}`;
        }

        function extractLessonMinutes(detail) {
            return {
                aim: '5 min',
                action: `${detail.flow?.[1]?.title?.match(/(\d+)\s*minutes?/i)?.[1] || '15'} min`,
                analysis: `${detail.flow?.[2]?.title?.match(/(\d+)\s*minutes?/i)?.[1] || '10'} min`,
                application: '5 min',
                assessment: '5 min'
            };
        }

        function renderLessonTags(lesson) {
            const stageTagMap = {
                warm: ['Observation', 'Activity'],
                explore: ['Observation', 'Practice'],
                practice: ['Practice', 'Activity'],
                apply: ['Practice', 'Quiz'],
                reflect: ['Observation', 'Quiz']
            };
            const tags = stageTagMap[lesson.stage] || ['Activity', 'Practice'];
            return tags.map((tag) => `<span class="rounded-full bg-[#F7EFEC] px-3 py-1 text-[11px] font-semibold text-[#7B5E58] ring-1 ring-[#E9DDD9]/70">${tag}</span>`).join('');
        }

        const lessonFlowLabels = ['AIM', 'ACTION', 'ANALYSIS', 'APPLICATION', 'ASSESSMENT'];

        function getLessonDetailContent(lesson, lessonIndex, block, grade, subject) {
            const lessonImage = lesson.imageUrl || lesson.image || getContentImageUrl(block.title, lesson.stage);
            const isLightAndShadows = subject.name === 'Science' && block.title === 'Light and Shadows';
            if (isLightAndShadows) {
                return {
                    heroImage: lessonImage,
                    supportImage: lessonImage,
                    actionImage: lessonImage,
                    analysisImage: lessonImage,
                    applicationImage: lessonImage,
                    sessionTitle: lesson.title,
                    aim: 'Explain why the Sun appears to move in the sky and how its position changes the length and direction of shadows during the day.',
                    bigQuestion: 'If the Sun is never in the same spot, what changes can students observe in the sky and on the ground?',
                    hotQuestion: 'How would you explain the pattern of shadows to someone who missed the lesson?',
                    hotAnswer: 'A strong answer names the Sun position, light direction, and how the change in angle affects the shadow length.',
                    teacherPrompt: 'Start with a quick observation: ask students where they saw the Sun in the morning and where they expect it to be in the evening. Then guide them to connect Sun position, light direction, and shadow length using a simple Sun-Earth model.',
                    vocab: [
                        { word: 'Shadow', definition: 'A dark shape formed when light is blocked by an object.' },
                        { word: 'Direction', definition: 'The way something points or moves.' },
                        { word: 'Rotate', definition: 'To turn around a fixed point.' }
                    ],
                    resources: ['Notebook or worksheet', 'Pencil', 'Flashlight or model', 'Worksheets and mastery book'],
                    keyPoints: [
                        'Shadows change when the direction of light changes.',
                        'The Sun appears highest around noon, so shadows are shortest then.',
                        'Earth rotates, which makes the Sun seem to move across the sky.'
                    ],
                    diffHelp: [
                        'Use sentence starters for observations.',
                        'Point to the morning, noon, and evening examples while students answer.',
                        'Work through one example together before independent work.'
                    ],
                    diffChallenge: [
                        'Ask students to justify their answer with one observation.',
                        'Invite them to predict what a sunset shadow would look like.',
                        'Have them explain the model without saying the Sun is moving.'
                    ],
                    flow: [
                        {
                            label: 'AIM',
                            title: 'Set the learning target',
                            text: 'Students notice that the Sun appears to move across the sky and predict how this affects daylight and shadows.'
                        },
                        {
                            label: 'ACTION',
                            title: 'Build and test a model',
                            text: 'Use a flashlight as the Sun, a ball as Earth, and a sticker as the observer. Keep the flashlight still while students rotate the ball slowly from west to east.'
                        },
                        {
                            label: 'ANALYSIS',
                            title: 'Discuss observations',
                            text: 'Ask what happens when the sticker faces the light, moves out of the light, and sits in darkness. Capture the link between light direction and time of day.'
                        },
                        {
                            label: 'APPLICATION',
                            title: 'Transfer to real scenes',
                            text: 'Students compare morning, noon, and evening images, then explain why shadows are long, short, or hard to see at different times.'
                        },
                        {
                            label: 'ASSESSMENT',
                            title: 'Check for mastery',
                            text: 'Use a quick quiz and a notebook response: explain why the Sun seems to rise in the East and set in the West even though Earth is rotating.'
                        }
                    ],
                    sections: [
                        {
                            kicker: 'Teacher Setup',
                            title: 'Before Class',
                            image: lessonImage,
                            bullets: [
                                'Keep one flashlight, one ball, and one sticker ready for each group.',
                                'Draw East, Noon, and West positions on the board before the activity.',
                                'Prepare three observation prompts: Where is the Sun? How long is the shadow? Which way does the shadow point?'
                            ]
                        },
                        {
                            kicker: 'Classroom Flow',
                            title: 'Teach the Idea Clearly',
                            image: lessonImage,
                            bullets: [
                                'Begin with students describing the sky at morning, noon, and evening.',
                                'Demonstrate that the flashlight stays still while Earth rotates.',
                                'Pause at each position so students can record what they observe before you explain.'
                            ]
                        },
                        {
                            kicker: 'Student Task',
                            title: 'Observe, Record, Explain',
                            image: lessonImage,
                            bullets: [
                                'Students sketch the model and label Sun, Earth, observer, light, and darkness.',
                                'They write one sentence explaining morning, noon, evening, and night.',
                                'Pairs compare answers and correct any shadow-direction misconceptions.'
                            ]
                        }
                    ],
                    checks: [
                        'What evidence shows that the Sun appears to move during the day?',
                        'Why is the shadow shorter around noon than in the morning?',
                        'If your sticker moves out of the light, what time of day does that represent?',
                        'How can the Sun seem to move if Earth is the object rotating?'
                    ]
                };
            }

            const title = getLessonSessionTitle(lesson, lessonIndex);
            return {
                heroImage: lessonImage,
                supportImage: lessonImage,
                actionImage: lessonImage,
                analysisImage: lessonImage,
                applicationImage: lessonImage,
                sessionTitle: lesson.title,
                aim: lesson.description,
                bigQuestion: `How can students use evidence to understand ${block.title.toLowerCase()}?`,
                hotQuestion: `How would you explain ${block.title.toLowerCase()} to someone who missed the lesson?`,
                hotAnswer: 'A strong answer names the main idea, gives one clear example, and explains why that example matters.',
                teacherPrompt: `Guide students through ${title.toLowerCase()} with a short observation, a concrete classroom action, a discussion of evidence, and one independent application task.`,
                vocab: [
                    { word: 'Observe', definition: 'To look carefully and notice what is happening.' },
                    { word: 'Evidence', definition: 'Information that supports an idea or answer.' },
                    { word: 'Explain', definition: 'To tell how or why something happens.' }
                ],
                resources: ['This lesson plan', 'Observation prompt', 'Notebook', 'Teacher toolkit'],
                keyPoints: [
                    `Students identify the main idea from ${title.toLowerCase()}.`,
                    'They use one observation as evidence for their explanation.',
                    'They apply the same idea in a fresh example independently.'
                ],
                diffHelp: [
                    'Read the task aloud and underline the key word together.',
                    'Model one example before students begin alone.',
                    'Let partners compare their first answer before sharing.'
                ],
                diffChallenge: [
                    'Ask students to justify their answer with stronger evidence.',
                    'Invite students to create a new example using the same idea.',
                    'Have students explain why a common wrong answer is incorrect.'
                ],
                flow: lessonFlowLabels.map((label, index) => ({
                    label,
                    title: ['Introduce', 'Do', 'Discuss', 'Apply', 'Check'][index],
                    text: [
                        `State the target for ${title} and connect it to what students already know.`,
                        'Run the short activity or model while students record one visible observation.',
                        'Ask students to explain what changed, what stayed the same, and why it matters.',
                        'Give a fresh example so students transfer the idea beyond the first model.',
                        'Use a quick oral or written response to confirm readiness for the next session.'
                    ][index]
                })),
                sections: [
                    {
                        kicker: 'Teacher Setup',
                        title: 'Prepare the Lesson',
                        image: lessonImage,
                        bullets: ['Review the session aim.', 'Keep one visual example ready.', 'Plan one misconception question before class.']
                    },
                    {
                        kicker: 'Classroom Flow',
                        title: 'Teach With Evidence',
                        image: lessonImage,
                        bullets: ['Open with observation.', 'Let students describe before naming.', 'Record class evidence in simple words.']
                    },
                    {
                        kicker: 'Student Task',
                        title: 'Practice and Explain',
                        image: lessonImage,
                        bullets: ['Students complete the practice prompt.', 'Pairs compare explanations.', 'Teacher checks for a clear reason, not only the answer.']
                    }
                ],
                checks: ['What did you observe?', 'What changed?', 'Why did it change?', 'Where else can this idea be used?']
            };
        }

        function renderBlockImageBadge(block, blockIndex, subjectTheme, subjectName) {
            const imageUrl = block?.imageUrl || block?.bannerUrl || block?.banner || block?.thumbnailUrl || block?.thumbnail || subjectTheme.icon || 'assets/light-shadow-lesson.png';
            const altText = block?.title ? `${block.title} block image` : `Block ${blockIndex + 1} ${subjectName}`;
            return `
                <span class="block-image-badge relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-lg lg:h-[100px] lg:w-[100px]" style="--block-accent: ${subjectTheme.accent}; --block-accent-soft: ${subjectTheme.accentSoft};">
                    <span class="absolute inset-0 overflow-hidden rounded-[inherit]">
                        <img src="${imageUrl}" alt="${escapeHtml(altText)}" loading="lazy" decoding="async" sizes="(max-width: 640px) 96px, 128px" class="absolute inset-0 h-full w-full object-cover">
                    </span>
                </span>
            `;
        }

        function getParentBlockDescription(blockTitle) {
            return `Explore key ideas, examples, and activities for ${blockTitle.toLowerCase()}.`;
        }

        function renderBlockSection(block, blockIndex, grade, subject) {
            const blockKey = `${grade.id}:${subject.id}:${block.id}`;
            const isExpanded = !collapsedBlockIds.has(blockKey);
            const subjectTheme = getSubjectTheme(subject.name);
            const progressState = block.progress >= 100 ? 'Complete' : block.progress > 0 ? 'In progress' : 'Not started';
            const completedLessons = block.lessons.filter((lesson) => lesson.status === 'Completed').length;
            const isComplete = block.progress >= 100;
            const timelineProgress = block.lessons.length > 1
                ? Math.max(0, Math.min(100, block.progress))
                : block.progress >= 100 ? 100 : 0;
            const blockHeaderInner = `
                        <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                            ${renderBlockImageBadge(block, blockIndex, subjectTheme, subject.name)}
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2">
                                    <p class="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A41034] ring-1 ring-[#E9DDD9]/80">Block ${blockIndex + 1}</p>
                                </div>
                                <h2 class="mt-3 text-1xl font-bold leading-tight text-[#1C1917] md:text-[1.3rem]">${block.title}</h2>
                                <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#6F625F]">${isComplete ? `All ${block.lessons.length} sessions completed` : `${progressState} • ${completedLessons}/${block.lessons.length} sessions complete`}</p>
                            </div>
                        </div>
                        <div class="block-header-control">
                            <div class="block-header-actions">
                                <div class="mb-2 flex items-center justify-between gap-3">
                                    <span class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A08E8A]">Progress</span>
                                    <span class="shrink-0 text-xs font-bold text-[#B10F3A]">${Math.round(block.progress)}%</span>
                                </div>
                                ${renderHeroProgress(block.progress)}
                            </div>
                            <span class="block-toggle-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
                        </div>`;
            const blockHeader = `<button type="button" class="block-header-sticky focus-ring relative flex w-full cursor-pointer flex-col gap-5 text-left focus:outline-none sm:flex-row sm:items-center sm:justify-between" data-view="toggle-block" data-block-key="${blockKey}" aria-expanded="${isExpanded}" aria-label="${isExpanded ? 'Collapse' : 'Expand'} ${escapeHtml(block.title)}">${blockHeaderInner}</button>`;
            return `
                <section id="block-section-${blockKey}" class="block-card ${isExpanded ? '' : 'is-collapsed'} mx-auto w-full max-w-[1180px] scroll-mt-56 rounded-[30px] p-4 md:p-6" data-block-section="${blockKey}" style="scroll-margin-top: 13rem;">
                    ${blockHeader}
                    ${isExpanded ? `
                        <div class="lesson-block relative mt-8 space-y-7 pl-14 md:space-y-8 md:pl-16" style="--timeline-progress: ${timelineProgress}%;">
                            ${block.lessons.map((lesson, lessonIndex) => renderLessonCard(lesson, lessonIndex, block, grade, subject)).join('')}
                        </div>
                    ` : ''}
                </section>
            `;
        }

        function renderLessonCard(lesson, lessonIndex, block, grade, subject) {
            const displayStatus = getLessonDisplayStatus(lesson);
            const lessonSessionLabel = getLessonSessionLabel(lessonIndex);
            const isActive = displayStatus === 'In Progress';
            const lessonKey = `${getBlockKey(grade.id, subject.id, block.id)}:${lesson.id}`;
            return `
                <article id="lesson-session-${lessonKey}" class="lesson-session ${isActive ? 'is-active' : ''} focus-ring group relative grid cursor-pointer gap-4 scroll-mt-52 transition-all duration-200 focus:outline-none md:grid-cols-[128px_minmax(0,1fr)_48px] md:items-center md:gap-6" style="animation-delay: ${lessonIndex * 70}ms;" data-view="lessons" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${block.id}" data-lesson-id="${lesson.id}" role="button" tabindex="0" aria-label="Open ${lessonSessionLabel}: ${escapeHtml(lesson.title)}">
                    <div class="timeline-node-wrap">
                        ${renderTimelineNode(displayStatus)}
                    </div>
                    <div class="lesson-image-wrap relative h-[100px] overflow-hidden rounded-[22px] bg-[#fffaf3] md:h-[100px] md:w-[100px]">
                        <img src="${lesson.imageUrl || 'assets/light-shadow-lesson.png'}" alt="${lessonSessionLabel}: ${lesson.title}" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06] group-hover:brightness-105">
                    </div>
                    <div class="min-w-0 py-1 md:pr-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="rounded-full bg-white/78 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8C1635] ring-1 ring-[#E9DDD9]/75">
                                ${lessonSessionLabel}
                            </span>
                            <span class="rounded-full bg-[#F6F1EE] px-3 py-1 text-[11px] font-semibold text-[#7C706C]">${lesson.duration}</span>
                            <span class="inline-flex items-center gap-1.5 rounded-full ${getLessonStatusClass(displayStatus)} px-3 py-1 text-[11px] font-semibold">
                                ${renderStatusMark(displayStatus)}
                                ${displayStatus}
                            </span>
                        </div>
                        
                        <h3 class="mt-3 text-1xl font-bold text-[#1C1917] md:text-[1.3rem] leading-7 text-[#1C1917] transition-colors duration-200 group-hover:text-[#B10F3A]">${lesson.title}</h3>
                        <p class="mt-2 line-clamp-2 max-w-2xl text-[14px] font-normal leading-6 text-[#756A66]">${lesson.description}</p>
                    </div>
                    <button type="button" class="focus-ring ml-auto grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-[#FFFDFC] text-[#B10F3A] shadow-[0_10px_24px_rgba(28,25,23,0.07)] ring-1 ring-[#E9DDD9]/75 transition-all duration-200 hover:scale-110 hover:bg-[#B10F3A] hover:text-white hover:shadow-[0_14px_30px_rgba(177,15,58,0.18)] focus:outline-none md:ml-0" data-view="lessons" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${block.id}" data-lesson-id="${lesson.id}" aria-label="Open ${lessonSessionLabel}: ${escapeHtml(lesson.title)}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="lesson-action-arrow h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
                    </button>
                </article>
            `;
        }

        function renderLessonsPage(gradeId, subjectId, blockId, lessonId = '') {
            const grade = findGrade(gradeId);
            const subject = findSubject(gradeId, subjectId);
            const block = findBlock(gradeId, subjectId, blockId);
            if (!grade || !subject || !block) return renderHome();
            const lessonIndex = Math.max(0, block.lessons.findIndex((item) => item.id === lessonId));
            const lesson = block.lessons[lessonIndex] || block.lessons[0];
            const detail = getLessonDetailContent(lesson, lessonIndex, block, grade, subject);
            const nextLesson = block.lessons[lessonIndex + 1];
            const lessonCompletionKey = getLessonCompletionKey(grade.id, subject.id, block.id, lesson.id);
            const isLessonComplete = completedLessonKeys.has(lessonCompletionKey);
            const sectionMinutes = extractLessonMinutes(detail);
            const noteIds = ['aim', 'action', 'analysis', 'application', 'assessment'];
            noteIds.forEach((sectionId) => {
                if (lessonNotesState[sectionId]) return;
                try {
                    const raw = window.localStorage.getItem(getLessonNoteStorageKey(grade.id, subject.id, block.id, lesson.id, sectionId));
                    lessonNotesState[sectionId] = raw ? JSON.parse(raw) : { text: '', savedAt: '' };
                } catch {
                    lessonNotesState[sectionId] = { text: '', savedAt: '' };
                }
            });

            return `
                <section class="lesson-detail-shell -mx-6 mt-0 px-0 pb-16 pt-4 md:-mx-12">
                    <div class="lp-title-strip">
                        <div class="lp-title-strip-inner">
                            <div>
                                <div class="lp-eyebrow">${escapeHtml(subject.name)} · ${escapeHtml(grade.title)} · Block ${block.order || lessonIndex + 1} · Session ${lesson.order || lessonIndex + 1}</div>
                                <div class="lp-title">${escapeHtml(detail.sessionTitle || block.title)}</div>
                            </div>
                            <div class="lp-chips">
                                <span class="lp-chip">${escapeHtml(lesson.duration || '10 min')}</span>
                                <button type="button" class="focus-ring lp-projector-trigger">
                                    <i data-lucide="monitor-up" class="h-4 w-4"></i>
                                    <span>Projector Mode</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    ${(detail.heroImage || detail.supportImage) ? `
                        <figure class="lp-hero-figure">
                            <img src="${detail.heroImage || detail.supportImage}" alt="${escapeHtml(detail.sessionTitle || block.title)} banner image" loading="lazy" decoding="async">
                        </figure>
                    ` : ''}

                    <div class="mx-auto max-w-[1040px] px-6 pb-8 pt-6 md:px-8">
                        <button type="button" class="focus-ring mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E7D6CF] bg-white px-4 py-2.5 text-[11px] font-bold tracking-wide text-[#3A071A] transition-all hover:border-[#A41034]/30 hover:bg-[#A41034]/5 focus:outline-none" data-view="blocks" data-grade-id="${grade.id}" data-subject-id="${subject.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            <span>Back to Blocks</span>
                        </button>

                        <div class="lp-lesson-layout">
                            <div class="lp-section-flow">
                                <section class="lp-section-stack scroll-mt-40">
                                    <div class="lp-section-heading"><div class="lp-section-heading-copy"><div class="lp-sec-heading-line"><div class="lp-sec-title">Aim</div><div class="lp-sec-rule"></div><div class="lp-sec-meta-actions"><div class="lp-sec-meta">${sectionMinutes.aim}</div><button type="button" class="focus-ring lp-notes-trigger ${lessonNotesState.aim?.text ? 'has-note' : ''}"><span class="lp-notes-dot" aria-hidden="true"></span><span>Notes</span></button></div></div></div></div>
                                    <div class="lp-section-body">
                                        <div class="lp-aim-statement">${escapeHtml(detail.aim)}</div>
                                        <div class="lp-aim-context">${escapeHtml(detail.flow?.[0]?.text || '')}</div>
                                        <div class="lp-aim-support-grid">
                                            <div>
                                                <div class="lp-sub-lbl">New Words</div>
                                                <div class="lp-vocab-shell">
                                                    <div class="lp-vocab-list">
                                                        ${(detail.vocab || []).map((item, index) => `<button type="button" class="lp-vocab-trigger ${index === 0 ? 'is-active' : ''}" data-vocab-trigger data-vocab-definition="${escapeHtml(item.definition)}">${escapeHtml(item.word)}</button>`).join('')}
                                                    </div>
                                                    <div class="lp-vocab-panel"><div class="lp-vocab-definition" data-vocab-definition-panel>${escapeHtml(detail.vocab?.[0]?.definition || '')}</div></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="lp-sub-lbl">Resources</div>
                                                <div class="lp-resource-list">
                                                    ${(detail.resources || []).map((resource, index) => `<div class="lp-resource-row"><div class="lp-res-index">${index + 1}.</div>${escapeHtml(resource)}</div>`).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section class="lp-section-stack scroll-mt-40">
                                    <div class="lp-section-heading"><div class="lp-section-heading-copy"><div class="lp-sec-heading-line"><div class="lp-sec-title">Action</div><div class="lp-sec-rule"></div><div class="lp-sec-meta-actions"><div class="lp-sec-meta">${sectionMinutes.action}</div><button type="button" class="focus-ring lp-notes-trigger ${lessonNotesState.action?.text ? 'has-note' : ''}"><span class="lp-notes-dot" aria-hidden="true"></span><span>Notes</span></button></div></div></div></div>
                                    <div class="lp-section-body">
                                        <div class="lp-sub-lbl lp-action-kicker">${escapeHtml(detail.flow?.[1]?.title || 'Activity')}</div>
                                        <div class="lp-steps">
                                            ${(detail.sections || []).map((section, index) => `
                                                <div class="lp-step-row">
                                                    <div class="lp-step-big-num" aria-hidden="true">0${index + 1}</div>
                                                    <div>
                                                        <div class="lp-step-label">${escapeHtml(section.kicker)}</div>
                                                        <div class="lp-step-text">${escapeHtml(section.title)}</div>
                                                        ${detail.actionImage && index === 1 ? `<figure class="lp-inline-figure" style="margin-top:14px;"><img src="${detail.actionImage}" alt="Action activity illustration" loading="lazy" decoding="async"></figure>` : ''}
                                                        ${detail.teacherPrompt && index === 2 ? `<div class="lp-tip-box"><div><div class="lp-tip-lbl">Teacher Tip</div><div class="lp-tip-txt">${escapeHtml(detail.teacherPrompt)}</div></div></div>` : ''}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </section>

                                <section class="lp-section-stack scroll-mt-40">
                                    <div class="lp-section-heading"><div class="lp-section-heading-copy"><div class="lp-sec-heading-line"><div class="lp-sec-title">Analysis</div><div class="lp-sec-rule"></div><div class="lp-sec-meta-actions"><div class="lp-sec-meta">${sectionMinutes.analysis}</div><button type="button" class="focus-ring lp-notes-trigger ${lessonNotesState.analysis?.text ? 'has-note' : ''}"><span class="lp-notes-dot" aria-hidden="true"></span><span>Notes</span></button></div></div></div></div>
                                    <div class="lp-section-body">
                                        <div class="lp-analysis-layout">
                                            <div class="lp-analysis-stack">
                                                <div>
                                                    <div class="lp-sub-lbl accent">Generalised Discussion</div>
                                                    <div class="lp-analysis-question"><div class="lp-analysis-question-lbl">Question</div><div class="lp-analysis-question-text">${escapeHtml(detail.bigQuestion)}</div></div>
                                                    <div class="lp-analysis-answer">${(detail.keyPoints || []).map((point) => `<p>${escapeHtml(point)}</p>`).join('')}</div>
                                                </div>
                                                <div>
                                                    <div class="lp-sub-lbl accent">Higher Order Thinking</div>
                                                    <div class="lp-analysis-question"><div class="lp-analysis-question-lbl">Question</div><div class="lp-analysis-question-text">${escapeHtml(detail.hotQuestion || detail.flow?.[2]?.title || '')}</div></div>
                                                    <div class="lp-analysis-answer"><p>${escapeHtml(detail.hotAnswer || detail.flow?.[2]?.text || '')}</p></div>
                                                </div>
                                            </div>
                                            ${detail.analysisImage ? `<figure class="lp-inline-figure" style="margin:0;"><img src="${detail.analysisImage}" alt="Analysis discussion illustration" loading="lazy" decoding="async"></figure>` : ''}
                                        </div>
                                    </div>
                                </section>

                                <section class="lp-section-stack scroll-mt-40">
                                    <div class="lp-section-heading"><div class="lp-section-heading-copy"><div class="lp-sec-heading-line"><div class="lp-sec-title">Application</div><div class="lp-sec-rule"></div><div class="lp-sec-meta-actions"><div class="lp-sec-meta">${sectionMinutes.application}</div><button type="button" class="focus-ring lp-notes-trigger ${lessonNotesState.application?.text ? 'has-note' : ''}"><span class="lp-notes-dot" aria-hidden="true"></span><span>Notes</span></button></div></div></div></div>
                                    <div class="lp-section-body">
                                        <div class="lp-sub-lbl accent">Independent Practice</div>
                                        <p class="lp-practice-intro">${escapeHtml(detail.flow?.[3]?.text || lesson.description)}</p>
                                        ${detail.applicationImage ? `<figure class="lp-inline-figure" style="margin-top:0;margin-bottom:18px;"><img src="${detail.applicationImage}" alt="Application practice illustration" loading="lazy" decoding="async"></figure>` : ''}
                                        <div class="lp-divider"></div>
                                        <div class="lp-sub-lbl">Differentiation</div>
                                        <div class="lp-diff-cols">
                                            <div><div class="lp-diff-col-lbl">Needs Help</div><div class="lp-diff-items">${(detail.diffHelp || []).map((tip) => `<div class="lp-diff-item"><div class="lp-diff-dot"></div><span>${escapeHtml(tip)}</span></div>`).join('')}</div></div>
                                            <div><div class="lp-diff-col-lbl">Needs a Challenge</div><div class="lp-diff-items">${(detail.diffChallenge || []).map((tip) => `<div class="lp-diff-item"><div class="lp-diff-dot"></div><span>${escapeHtml(tip)}</span></div>`).join('')}</div></div>
                                        </div>
                                        <div class="lp-divider"></div>
                                        <div class="lp-sub-lbl">Homework</div>
                                        <p class="lp-practice-intro" style="margin-bottom:0;">Answer <strong>Quick Quiz 1-4</strong> in the Mastery Book.</p>
                                    </div>
                                </section>

                                <section class="lp-section-stack scroll-mt-40">
                                    <div class="lp-section-heading"><div class="lp-section-heading-copy"><div class="lp-sec-heading-line"><div class="lp-sec-title">Assessment</div><div class="lp-sec-rule"></div><div class="lp-sec-meta-actions"><div class="lp-sec-meta">${sectionMinutes.assessment}</div><button type="button" class="focus-ring lp-notes-trigger ${lessonNotesState.assessment?.text ? 'has-note' : ''}"><span class="lp-notes-dot" aria-hidden="true"></span><span>Notes</span></button></div></div></div></div>
                                    <div class="lp-section-body">
                                        <div class="lp-sub-lbl accent">Learning Outcomes</div>
                                        <div class="lp-outcomes-grid">
                                            <div class="lp-outcome-card approaching"><div class="lp-outcome-level">Approaching</div><div class="lp-outcome-text">${escapeHtml(detail.checks?.[0] || '')}</div></div>
                                            <div class="lp-outcome-card meeting"><div class="lp-outcome-level">Meeting</div><div class="lp-outcome-text">${escapeHtml(detail.checks?.[1] || detail.aim)}</div></div>
                                            <div class="lp-outcome-card exceeding"><div class="lp-outcome-level">Exceeding</div><div class="lp-outcome-text">${escapeHtml(detail.checks?.[2] || '')}</div></div>
                                        </div>
                                    </div>
                                </section>

                                <div class="lp-complete-wrap">
                                    <div class="lp-complete-card">
                                        <div class="lp-complete-title">Complete this lesson plan</div>
                                        <div class="mt-3 flex flex-col items-center gap-3">
                                            <button type="button" class="lesson-complete-button focus-ring inline-flex min-w-[260px] items-center justify-center rounded-full px-6 py-3 text-[12px] font-black transition focus:outline-none ${isLessonComplete ? 'bg-[#f6e7ea] text-[#a41034]' : 'bg-[#A41034] text-white hover:bg-[#7f0f31]'}" data-action="${isLessonComplete ? 'undo-complete-lesson' : 'complete-lesson'}" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${block.id}" data-lesson-id="${lesson.id}">
                                                ${isLessonComplete ? 'Lesson Completed' : 'Complete Lesson'}
                                            </button>
                                            ${isLessonComplete ? `<button type="button" class="focus-ring inline-flex items-center justify-center rounded-full border border-[#e8d7d2] bg-white px-5 py-2.5 text-[11px] font-bold text-[#7a2d36] transition hover:border-[#A41034]/25 hover:bg-[#fff8f8] focus:outline-none" data-action="undo-complete-lesson" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${block.id}" data-lesson-id="${lesson.id}">Undo</button>` : ''}
                                        </div>
                                    </div>
                                </div>

                                ${nextLesson ? `<div class="mt-6 flex justify-end"><button type="button" class="focus-ring inline-flex items-center justify-center rounded-2xl bg-[#A41034] px-6 py-3 text-[12px] font-bold tracking-wide text-white transition-all hover:bg-[#7a0c26] focus:outline-none" data-view="lessons" data-grade-id="${grade.id}" data-subject-id="${subject.id}" data-block-id="${block.id}" data-lesson-id="${nextLesson.id}">Open Next Lesson</button></div>` : ''}
                            </div>
                        </div>
                </section>
            `;
        }

        function renderLessonRow(lesson, index) {
            const actionLabel = lesson.status === 'Completed' ? 'Review' : lesson.status === 'In Progress' ? 'Continue' : 'Start';
            const lessonPlanTitle = getLessonSessionTitle(lesson, index);
            return `
                <article class="grid gap-5 rounded-[2rem] border border-[#E7E5E4] bg-white p-5 transition-all hover:shadow-xl hover:shadow-black/5 md:grid-cols-[auto_1fr_auto] md:items-center md:p-6">
                    <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[#A41034]/5 text-sm font-bold text-[#A41034]">${index + 1}</div>
                    <div>
                        <div class="flex flex-wrap items-center gap-3">
                            <h2 class="text-xl font-semibold text-[#1C1917]">${lessonPlanTitle}</h2>
                            <span class="rounded-full border px-3 py-1 text-[10px] font-semibold  tracking-wide ${getStatusClass(lesson.status)}">${lesson.status}</span>
                        </div>
                        <div class="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                            ${renderProgress(lesson.progress)}
                            <span class="text-sm font-bold text-[#78716C]">${lesson.duration}</span>
                        </div>
                    </div>
                    <button type="button" class="focus-ring cursor-pointer rounded-2xl bg-[#A41034] px-6 py-4 text-[11px] font-bold  tracking-wide text-white transition-all hover:bg-[#5a0219] focus:outline-none">${actionLabel}</button>
                </article>
            `;
        }

        function renderParentContinueLessonSection() {
            const continueLessonType = lessonTypes[0];
            const continueLessonImage = continueLessonType?.image || 'assets/light-shadow-lesson.png';
            return `
                <!-- Updated Continue Lesson Section -->
                <section class="mb-10 today-fade-in">
                    <section class="relative rounded-[3rem] overflow-hidden card-shadow group h-[420px]">
                        <!-- Background Image Covering Entire Card with Top Alignment -->
                        <img
                            src="assets/light-shadow.jpeg"
                            class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                            alt="${escapeHtml(continueLessonType?.title || 'Lesson')} image"
                        />

                        <!-- Dark Gradient Overlay for Readability -->
                        <div class="absolute inset-0 hero-gradient-overlay"></div>

                        <div class="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div class="max-w-2xl">
                                    <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--amber-orange)] text-white rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-xl mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="play-circle" aria-hidden="true" class="lucide lucide-play-circle w-3.5 h-3.5"><path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"></path><circle cx="12" cy="12" r="10"></circle></svg>
                                Science. Grade 4 - Block 01
                            </span>
                                    <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                                        Light and <br/>Shadows
                                    </h1>
                                    <div class="max-w-2xl space-y-2 text-white/85">
                                        <p class="text-base md:text-lg font-semibold">
                                            Changes in the Sky Across the Day
                                        </p>
                                        <p class="max-w-xl text-sm md:text-base font-medium leading-6 text-white/75">
                                            Explain why the Sun appears to move in the sky and how it affects the length and rhythm of a day.
                                        </p>
                                    </div>
                                </div>

                                <!-- Action Row -->
                                <div class="flex flex-col items-end gap-5">
                                    <div class="flex items-center gap-4 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                                        <div class="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" aria-label="Lesson progress 45% complete">
                                            <div class="h-full bg-[#f59138] rounded-full shadow-[0_0_10px_#f59138]" style="width: 45%"></div>
                                        </div>
                                        <span class="text-[10px] font-bold text-white tracking-wide ">45% Progress</span>
                                    </div>

                                    <a
                                        href="${getViewHref('lessons', { gradeId: 'grade-4', subjectId: 'science', blockId: 'block-1', lessonId: 'lesson-1' })}"
                                        data-view="lessons"
                                        data-grade-id="grade-4"
                                        data-subject-id="science"
                                        data-block-id="block-1"
                                        data-lesson-id="lesson-1"
                                        class="focus-ring bg-white text-[#1C1917] px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-2xl hover:bg-[#f59138] hover:text-white hover:-translate-y-1 active:scale-95"
                                    >
                                        Continue Lesson
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </section>
            `;
        }

        function renderParentLearningSection() {
            if (activeAppTab !== 'Parent Lesson Plan') return '';

            const subjects = [
                {
                    name: 'Mathematics', topic: 'Fractions — Comparing Fractions',
                    color: '#6559D6', soft: '#F4F1FF', askBg: 'linear-gradient(135deg, rgba(101,89,214,0.08), rgba(101,89,214,0.03))', askColor: '#17156E',
                    icon: 'calculator',
                    learned: ['Comparing fraction sizes', 'Finding common denominators'],
                    ask: 'Why is 3/4 bigger than 2/3?',
                    weekTopics: ['Comparing fractions', 'Understanding decimals'],
                    weekProgress: 70, weekProgressColor: '#6559D6',
                },
                {
                    name: 'Science', topic: 'Plant Systems',
                    color: '#5A9258', soft: '#F5F6EE', askBg: 'linear-gradient(135deg, rgba(90,146,88,0.10), rgba(90,146,88,0.03))', askColor: '#1F6A2E',
                    icon: 'leaf',
                    learned: ['Parts of a plant', 'How plants make food'],
                    ask: 'Why do plants need sunlight?',
                    weekTopics: ['Parts of a plant', 'How plants make food'],
                    weekProgress: 80, weekProgressColor: '#5A9258',
                },
                {
                    name: 'English', topic: 'Descriptive Writing',
                    color: '#FF4F2F', soft: '#FFF4EF', askBg: 'linear-gradient(135deg, rgba(255,79,47,0.10), rgba(255,79,47,0.03))', askColor: '#B62012',
                    icon: 'book-open',
                    learned: ['Using sensory words', 'Writing clear descriptions'],
                    ask: 'Can you describe your favourite place?',
                    weekTopics: ['Using sensory words', 'Writing clear descriptions'],
                    weekProgress: 75, weekProgressColor: '#FF4F2F',
                },
            ];

            const weekSubjects = [
                ...subjects,
                {
                    name: 'Environmental Science', topic: 'Our Environment',
                    color: '#8F8D1C', soft: '#F8F6E9',
                    icon: 'globe-2',
                    weekTopics: ['Natural resources', 'Ways to conserve them'],
                    weekProgress: 65, weekProgressColor: '#8B9B5A',
                    ask: 'How can we save natural resources?',
                },
                {
                    name: 'Computer Science', topic: 'Sequences & Patterns',
                    color: '#2F67B5', soft: '#EEF5FF',
                    icon: 'monitor',
                    weekTopics: ['Identifying patterns', 'Creating simple sequences'],
                    weekProgress: 60, weekProgressColor: '#2F67B5',
                    ask: 'What patterns did you create this week?',
                },
            ];

            function circleProgress(pct, color) {
                const r = 17.5, circ = 2 * Math.PI * r;
                const offset = circ * (1 - pct / 100);
                return `
                    <svg width="48" height="48" viewBox="0 0 48 48" class="shrink-0 drop-shadow-[0_4px_10px_rgba(28,25,23,0.05)]">
                        <circle cx="24" cy="24" r="${r}" fill="#FFFFFF" stroke="#EFECEA" stroke-width="2"/>
                        <circle cx="24" cy="24" r="${r}" fill="none" stroke="${color}" stroke-width="2"
                            stroke-linecap="round" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
                            transform="rotate(-90 24 24)"/>
                        <text x="24" y="27" text-anchor="middle" font-size="10" font-weight="800" fill="#292321">${pct}%</text>
                    </svg>
                `;
            }

            const learningTabs = `
                <div class="flex h-[38px] w-full max-w-[220px] items-center rounded-full border border-[#E3DBD6] bg-[#FFFCFA] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:w-[220px]">
                    <button type="button" data-learning-tab="today"
                        class="focus-ring h-full flex-1 rounded-full text-[13px] font-medium transition focus:outline-none ${parentLearningView === 'today' ? 'bg-[#8D1230] text-white shadow-[inset_0_2px_4px_rgba(58,0,15,0.20),0_4px_10px_rgba(125,20,46,0.16)]' : 'text-[#3F3734] hover:bg-[#F8F2EF]'}">
                        Today
                    </button>
                    <button type="button" data-learning-tab="weekly"
                        class="focus-ring h-full flex-1 rounded-full text-[13px] font-medium transition focus:outline-none ${parentLearningView === 'weekly' ? 'bg-[#8D1230] text-white shadow-[inset_0_2px_4px_rgba(58,0,15,0.20),0_4px_10px_rgba(125,20,46,0.16)]' : 'text-[#3F3734] hover:bg-[#F8F2EF]'}">
                        Weekly
                    </button>
                </div>
            `;

            const todayView = `
                <div class="grid gap-4 md:grid-cols-3 md:gap-5">
                    ${subjects.map(s => `
                        <article class="parent-learning-card-shell flex flex-col rounded-[18px] border border-[#EFE5DF] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(69,36,21,0.05)]">
                            <div class="flex items-start gap-3">
                                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-white shadow-[0_4px_12px_rgba(28,25,23,0.12)]" style="background:${s.color}">
                                    <i data-lucide="${s.icon}" class="h-5 w-5"></i>
                                </span>
                                <div class="min-w-0 pt-0.5">
                                    <p class="text-[15px] font-semibold leading-snug text-[#1C1917]">${s.name}</p>
                                    <p class="mt-1 text-[12px] font-normal leading-[1.5] text-[#78716C]">${s.topic}</p>
                                </div>
                            </div>
                            <div class="mt-4 flex-1">
                                <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A0948E]">Aarav learned</p>
                                <ul class="mt-2.5 space-y-2">
                                    ${s.learned.map(l => `
                                        <li class="flex items-start gap-3 text-[13px] font-normal leading-[1.5] text-[#3D3734]">
                                            <span class="mt-[6px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#B8AEA8]"></span>
                                            ${l}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div class="mt-4 flex items-start gap-3 rounded-[12px] border border-white/60 px-4 py-3.5" style="background:${s.askBg}">
                                <i data-lucide="message-circle" class="mt-px h-4 w-4 shrink-0" style="color:${s.askColor}"></i>
                                <div class="min-w-0">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.08em]" style="color:${s.askColor}">Ask your child</p>
                                    <p class="mt-1.5 text-[13px] font-normal leading-[1.6] text-[#3D3734]">"${s.ask}"</p>
                                </div>
                            </div>
                        </article>
                    `).join('')}
                </div>
            `;

            const weeklyView1 = `
                <div class="rounded-[26px] border border-[#E8DFDA] bg-white px-[30px] py-[21px] shadow-[0_18px_38px_rgba(69,36,21,0.07)]">
                    <div class="flex flex-col gap-[22px] lg:grid lg:grid-cols-[1fr_315px]">
                        <div class="min-w-0 lg:border-r lg:border-[#E8E0DA] lg:pr-[19px]">
                            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p class="text-[17px] font-semibold leading-snug text-[#8D1230]">A Week of Growth and Discovery</p>
                                    <p class="mt-1 text-[13px] font-normal leading-[1.5] text-[#78716C]">Here's what Aarav explored this week across subjects.</p>
                                </div>
                                <div class="flex shrink-0 items-center gap-3 pt-1 text-[#3D3734]">
                                    <i data-lucide="calendar-days" class="h-4 w-4 text-[#A0948E]"></i>
                                    <span class="text-[12px] font-medium text-[#78716C]">20 – 26 May, 2024</span>
                                    <button class="focus-ring grid h-6 w-6 place-items-center rounded-full text-[#3D3734] hover:bg-[#F5F0ED] focus:outline-none" aria-label="Previous week">
                                        <i data-lucide="chevron-left" class="h-4 w-4"></i>
                                    </button>
                                    <button class="focus-ring grid h-6 w-6 place-items-center rounded-full text-[#3D3734] hover:bg-[#F5F0ED] focus:outline-none" aria-label="Next week">
                                        <i data-lucide="chevron-right" class="h-4 w-4"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="mt-4 divide-y divide-[#EEE9E5] border-t border-[#E8E0DA]">
                                ${weekSubjects.map(s => `
                                    <div class="grid min-h-[68px] grid-cols-[40px_minmax(130px,195px)_1fr_52px] items-center gap-3 py-3 max-md:grid-cols-[40px_1fr_52px]">
                                        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-white shadow-[0_4px_10px_rgba(28,25,23,0.10)]" style="background:${s.color}">
                                            <i data-lucide="${s.icon}" class="h-5 w-5"></i>
                                        </span>
                                        <div class="min-w-0">
                                            <p class="text-[14px] font-semibold leading-snug text-[#1C1917]">${s.name}</p>
                                            <p class="mt-0.5 text-[12px] font-normal leading-[1.4] text-[#78716C]">${s.topic}</p>
                                        </div>
                                        <ul class="space-y-1.5 max-md:hidden">
                                            ${s.weekTopics.map(t => `
                                                <li class="flex items-start gap-3 text-[12px] font-normal leading-[1.5] text-[#3D3734]">
                                                    <span class="mt-[5px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#B8AEA8]"></span>${t}
                                                </li>
                                            `).join('')}
                                        </ul>
                                        <div class="flex shrink-0 flex-col items-center">
                                            ${circleProgress(s.weekProgress, s.weekProgressColor)}
                                            <p class="-mt-[2px] text-[9px] font-medium leading-[12px] text-[#A0948E]">Lessons</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="flex flex-col gap-3 lg:pt-[56px]">
                            <div class="rounded-[12px] border border-[#ECE8DD] bg-[linear-gradient(135deg,#F1F6E9,#FAF9F3)] px-4 py-4">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex items-start gap-3">
                                        <span class="grid h-9 w-9 place-items-center rounded-[10px] bg-[#5A9258] text-white">
                                            <i data-lucide="star" class="h-4 w-4 fill-current"></i>
                                        </span>
                                        <div>
                                            <p class="text-[11px] font-medium leading-tight text-[#267233]">Strongest Engagement</p>
                                            <p class="mt-1 text-[15px] font-semibold leading-snug text-[#1C1917]">Science</p>
                                        </div>
                                    </div>
                                    <i data-lucide="trending-up" class="h-5 w-5 shrink-0 text-[#5A9258]"></i>
                                </div>
                                <p class="mt-3 text-[12px] font-normal leading-[1.6] text-[#2D3F2E]">Aarav showed great curiosity and participation in Science this week.</p>
                            </div>
                            <div class="rounded-[12px] border border-[#F2E5D9] bg-[linear-gradient(135deg,#FFF2E9,#FFF8F2)] px-4 py-4">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="flex items-start gap-3">
                                        <span class="grid h-9 w-9 place-items-center rounded-[10px] bg-[#FF941E] text-white">
                                            <i data-lucide="target" class="h-4 w-4"></i>
                                        </span>
                                        <div>
                                            <p class="text-[11px] font-medium leading-tight text-[#C86408]">Focus Area</p>
                                            <p class="mt-1 text-[15px] font-semibold leading-snug text-[#1C1917]">Mathematics</p>
                                        </div>
                                    </div>
                                    <i data-lucide="trending-up" class="h-5 w-5 shrink-0 text-[#FF941E]"></i>
                                </div>
                                <p class="mt-3 text-[12px] font-normal leading-[1.6] text-[#3D2B22]">A little extra practice will help build more confidence.</p>
                            </div>
                            <div class="rounded-[12px] border border-[#E8E0F3] bg-[linear-gradient(135deg,#F4F3FF,#F8F4FB)] px-4 py-4">
                                <p class="text-[12px] font-semibold leading-snug text-[#17156E]">Weekly Progress Overview</p>
                                <p class="mt-2.5 text-[13px] font-normal leading-snug text-[#1C1917]">7 of 10 lessons completed</p>
                                <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#C7C1EA]">
                                    <div class="h-full rounded-full bg-[#4F32D4]" style="width:82%"></div>
                                </div>
                                <p class="mt-2.5 text-[12px] font-normal leading-[1.5] text-[#5A5662]">Keep it up! Consistency brings growth.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const weeklyView2 = `
                <div class="rounded-[26px] border border-[#E8DFDA] bg-white px-[30px] py-[24px] shadow-[0_18px_38px_rgba(69,36,21,0.07)]">
                    <div class="flex flex-col gap-[22px] lg:grid lg:grid-cols-[1fr_290px]">
                        <!-- Left: subject list -->
                        <div class="min-w-0 lg:border-r lg:border-[#E8E0DA] lg:pr-[24px]">
                            <div class="divide-y divide-[#EEE9E5]">
                                ${weekSubjects.map(s => `
                                    <div class="grid items-center gap-x-4 gap-y-2 py-[14px]" style="grid-template-columns:44px minmax(120px,175px) 1fr 145px">
                                        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-[#EAEAEA] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                                            <i data-lucide="${s.icon}" class="h-5 w-5" style="color:${s.color}"></i>
                                        </span>
                                        <div class="min-w-0">
                                            <p class="text-[14px] font-semibold leading-snug text-[#1C1917]">${s.name}</p>
                                            <p class="mt-0.5 text-[12px] font-normal leading-[1.4] text-[#78716C]">${s.topic}</p>
                                        </div>
                                        <ul class="space-y-1.5 max-md:hidden">
                                            ${s.weekTopics.map(t => `
                                                <li class="flex items-start gap-2 text-[12px] font-normal leading-[1.5] text-[#3D3734]">
                                                    <span class="mt-[6px] h-[4px] w-[4px] shrink-0 rounded-full" style="background:${s.weekProgressColor}"></span>${t}
                                                </li>
                                            `).join('')}
                                        </ul>
                                        <div class="flex shrink-0 flex-col gap-[6px]">
                                            <div class="flex items-baseline gap-2">
                                                <span class="text-[10px] font-semibold uppercase tracking-wide" style="color:${s.weekProgressColor}">Covered</span>
                                                <span class="text-[12px] font-bold leading-none" style="color:${s.weekProgressColor}">${s.weekProgress}%</span>
                                            </div>
                                            <div class="h-[3px] w-full overflow-hidden rounded-full bg-[#EBEBEB]">
                                                <div class="h-full rounded-full" style="width:${s.weekProgress}%;background:${s.weekProgressColor}"></div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <!-- Right: Ask Your Child -->
                        <div class="flex flex-col rounded-[18px] border border-[#E3DEFF] bg-[#F8F7FF] px-5 py-5">
                            <div class="flex items-start gap-3 pb-4 border-b border-[#E3DEFF]">
                                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EDE9FF]">
                                    <i data-lucide="message-circle-more" class="h-5 w-5 text-[#5A4FD9]"></i>
                                </span>
                                <div>
                                    <p class="text-[15px] font-bold leading-snug text-[#4833C2]">Ask Your Child</p>
                                    <p class="mt-0.5 text-[12px] font-normal leading-[1.5] text-[#78716C]">Have simple conversations about their learning.</p>
                                </div>
                            </div>
                            <div class="divide-y divide-[#E8E3F5] mt-1">
                                ${weekSubjects.map(s => `
                                    <div class="flex cursor-pointer items-center gap-3 py-[11px] group">
                                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-[#E3E3E3] bg-white">
                                            <i data-lucide="${s.icon}" class="h-4 w-4" style="color:${s.color}"></i>
                                        </span>
                                        <p class="flex-1 text-[12.5px] font-medium leading-[1.4] text-[#1C1917]">${s.ask}</p>
                                        <i data-lucide="chevron-right" class="h-4 w-4 shrink-0 text-[#C4BBB5] transition-colors group-hover:text-[#5A4FD9]"></i>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            return `
                <section class="today-fade-in mb-6 mt-10">
                    <div class="mb-[18px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-[18px]">
                            <h2 class="text-[26px] font-bold tracking-tight text-[#16120F]">${parentLearningView === 'today' ? "Today's Learning" : "This Week's Learning"}</h2>
                        </div>
                    </div>
                    ${parentLearningView === 'today' ? todayView : weeklyView2}
                </section>
            `;
        }

        function renderParentTodayTipSection() {
            if (activeAppTab !== 'Parent Lesson Plan' || parentTipDismissed) return '';

            return `
                <section id="parentTodayTip" class="today-fade-in mb-4 rounded-[16px] border border-amber-200/70 bg-[#FFF8EA] px-4 py-3 shadow-[0_10px_28px_rgba(120,78,20,0.045)] sm:px-5">
                    <div class="flex items-start gap-3">
                        <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-amber-100 text-amber-700">
                            <i data-lucide="lightbulb" class="h-4 w-4"></i>
                        </span>
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <h2 class="text-[14px] font-bold text-[#3A2D25]">Today's Tip</h2>
                                <button type="button" data-dismiss-parent-tip class="focus-ring inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-[#8A5A15] transition hover:bg-amber-100/80 focus:outline-none" aria-label="Dismiss today's tip">
                                    <span>Dismiss</span>
                                    <i data-lucide="x" class="h-3.5 w-3.5"></i>
                                </button>
                            </div>
                            <p class="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-[#4A3A31]">Ask Arjun why shadows change length during the day.</p>
                            <p class="mt-1 text-[11px] font-bold text-[#9A6A22]">Science &bull; Block 01</p>
                        </div>
                    </div>
                </section>
            `;
        }


        function renderPracticeGymSection() {
            if (activeAppTab !== 'Parent Lesson Plan') return '';
            return `
                <section class="today-fade-in mb-6">
                    <div style="
                      min-height:140px;
                      width:100%;
                      box-sizing:border-box;
                      display:flex;
                      align-items:center;
                      justify-content:space-between;
                      gap:28px;
                      padding:28px 48px 28px 30px;
                      border:1.5px solid #e7def8;
                      border-radius:34px;
                      background:linear-gradient(100deg, #f6f1ff 0%, #fbf8ff 45%, #f6f0ff 100%);
                      box-shadow:0 8px 22px rgba(84, 67, 140, 0.08);
                      overflow:hidden;
                    ">
                      <div style="display:flex; align-items:center; gap:28px; min-width:0;">
                        <div style="
                          width:104px; height:104px; min-width:104px;
                          border-radius:999px;
                          display:flex; align-items:center; justify-content:center;
                          background:linear-gradient(145deg, #7466cf 0%, #4b3fa6 100%);
                          box-shadow:0 8px 16px rgba(46, 36, 128, 0.20), inset 0 1px 0 rgba(255,255,255,0.20);
                        ">
                          <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect x="19" y="11" width="8" height="42" rx="4" fill="white"/>
                            <rect x="37" y="11" width="8" height="42" rx="4" fill="white"/>
                            <rect x="28.5" y="29" width="7" height="6" rx="3" fill="white"/>
                            <rect x="8" y="24" width="7" height="16" rx="3.5" fill="white"/>
                            <rect x="49" y="24" width="7" height="16" rx="3.5" fill="white"/>
                            <rect x="13" y="29" width="7" height="6" rx="3" fill="white"/>
                            <rect x="44" y="29" width="7" height="6" rx="3" fill="white"/>
                          </svg>
                        </div>
                        <div style="width:54px; min-width:54px; height:86px; position:relative;">
                          <svg style="position:absolute; top:5px; left:6px;" width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M24 3L28.8 18.9L45 24L28.8 29.1L24 45L19.2 29.1L3 24L19.2 18.9L24 3Z" fill="#8877D8"/>
                          </svg>
                          <svg style="position:absolute; bottom:3px; left:0;" width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M24 3L28.8 18.9L45 24L28.8 29.1L24 45L19.2 29.1L3 24L19.2 18.9L24 3Z" fill="#8877D8"/>
                          </svg>
                        </div>
                        <div style="min-width:0; padding-top:2px;">
                          <p style="margin:0; color:#07127d; font-size:19px; line-height:1; font-weight:800; letter-spacing:0.07em; text-transform:uppercase;">Practice Gym</p>
                          <h2 style="margin:18px 0 0; color:#080808; font-family:Georgia, 'Times New Roman', serif; font-size:36px; line-height:1.05; font-weight:500; letter-spacing:-0.035em;">Mathematics needs more practice</h2>
                          <p style="margin:13px 0 0; color:#2b2525; font-size:22px; line-height:1.15; font-weight:400; letter-spacing:-0.02em;">2 recommended activities to build confidence.</p>
                        </div>
                      </div>
                      <a href="#" style="
                        flex:0 0 auto;
                        display:inline-flex; align-items:center; justify-content:center;
                        gap:20px;
                        min-width:256px; height:70px;
                        padding:0 30px; box-sizing:border-box;
                        border:1.8px solid #d4c9ef;
                        border-radius:999px;
                        color:#07127d;
                        background:rgba(255,255,255,0.40);
                        box-shadow:0 7px 13px rgba(81, 62, 146, 0.12);
                        text-decoration:none;
                        font-size:25px; line-height:1; font-weight:700; letter-spacing:-0.03em;
                      ">
                        <span>Start Practice</span>
                        <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M8 20H31" stroke="#07127d" stroke-width="3.5" stroke-linecap="round"/>
                          <path d="M22 10L32 20L22 30" stroke="#07127d" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </a>
                    </div>
                </section>
            `;
        }

        function renderHome() {
            const visibleGrades = getLessonPlanGrades();
            const showHeading = activeAppTab !== 'Parent Lesson Plan';
            return `
                ${renderParentContinueLessonSection()}

                <div class="mx-auto max-w-[1320px] mt-0" ${showHeading ? 'style="margin-top: 1rem;"' : ''}>
                    ${visibleGrades.map(renderGradeSection).join('')}
                </div>

                ${renderParentLearningSection()}
            `;
        }

        function getPageForRoute(tab, view) {
            if (tab === 'Teacher Lesson Plan') {
                if (view === 'blocks') return appPages.teacherBlocks;
                if (view === 'lessons') return appPages.teacherLessonDetail;
                return appPages.home;
            }

            if (tab === 'Parent Lesson Plan') {
                if (view === 'blocks') return appPages.parentBlocks;
                return appPages.parentLessonPlan;
            }

            if (tab === 'Communication') return appPages.communication;
            if (tab === 'Learnometer') return appPages.learnometer;
            if (tab === 'Profile') return appPages.profile;
            if (tab === 'Front Office') return appPages.frontOffice;
            if (tab === 'Practice Test') return appPages.practiceGym;
            return appPages.home;
        }

        function navigateToView(view, data = {}) {
            const page = getPageForRoute(activeAppTab, view);
            let nextHash = '';

            if (view === 'blocks') {
                nextHash = `view=blocks&grade=${data.gradeId}&subject=${data.subjectId}`;
            } else if (view === 'lessons') {
                const lessonPart = data.lessonId ? `&lesson=${data.lessonId}` : '';
                nextHash = `view=lessons&grade=${data.gradeId}&subject=${data.subjectId}&block=${data.blockId}${lessonPart}`;
            }

            const targetUrl = `${page}${nextHash ? `#${nextHash}` : ''}`;
            const currentUrl = `${window.location.pathname.split('/').pop() || appPages.home}${window.location.hash}`;

            if (currentUrl === targetUrl) return;
            window.location.href = targetUrl;
        }

        function getViewHref(view, data = {}) {
            const page = getPageForRoute(activeAppTab, view);
            if (view === 'blocks') {
                return `${page}#view=blocks&grade=${data.gradeId}&subject=${data.subjectId}`;
            }

            if (view === 'lessons') {
                const lessonPart = data.lessonId ? `&lesson=${data.lessonId}` : '';
                return `${page}#view=lessons&grade=${data.gradeId}&subject=${data.subjectId}&block=${data.blockId}${lessonPart}`;
            }

            return page;
        }

        function isDesktopToolbar() {
            return window.matchMedia('(min-width: 1024px)').matches;
        }

        function updateToolbarVisibility() {
            const toolbar = document.getElementById('gradeToolbar');
            const toggle = document.getElementById('toolbarToggle');
            const hasToolbar = currentToolbarView === 'home' || currentToolbarView === 'blocks';

            if (!toolbar || !toggle) return;

            if (!hasToolbar || (activeAppTab === 'Parent Lesson Plan' && currentToolbarView === 'home') || (activeAppTab !== 'Teacher Lesson Plan' && activeAppTab !== 'Parent Lesson Plan')) {
                toolbar.classList.add('hidden');
                toggle.classList.add('hidden');
                toggle.classList.remove('grid');
                toggle.setAttribute('aria-expanded', 'false');
                return;
            }

            toggle.classList.toggle('hidden', isDesktopToolbar());
            toggle.classList.toggle('grid', !isDesktopToolbar());
            toolbar.classList.toggle('hidden', !isDesktopToolbar() && !toolbarOpen);
            toggle.setAttribute('aria-expanded', String(toolbarOpen));
        }

        function renderGradeToolbar(view, params = new URLSearchParams()) {
            const toolbar = document.getElementById('gradeToolbar');
            if (!toolbar) return;
            currentToolbarView = view;

            if (view !== 'home' && view !== 'blocks') {
                toolbar.innerHTML = '';
                toolbarOpen = false;
                updateToolbarVisibility();
                return;
            }

            if (activeAppTab === 'Parent Lesson Plan' && view === 'home') {
                toolbar.innerHTML = '';
                toolbarOpen = false;
                updateToolbarVisibility();
                return;
            }

            if (view === 'blocks') {
                const grade = findGrade(params.get('grade'));
                const subject = findSubject(params.get('grade'), params.get('subject'));

                if (!grade || !subject) {
                    toolbar.innerHTML = '';
                    toolbarOpen = false;
                    updateToolbarVisibility();
                    return;
                }

                if (!activeBlockKey || !subject.blocks.some((block) => `${grade.id}:${subject.id}:${block.id}` === activeBlockKey)) {
                    activeBlockKey = `${grade.id}:${subject.id}:${subject.blocks[0]?.id || ''}`;
                }

                toolbar.innerHTML = `
                    <nav class="mx-auto flex max-w-[min(28rem,calc(100vw-2rem))] flex-row flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-[#A41034]/10 bg-white/85 p-2.5 shadow-[0_18px_50px_rgba(123,3,35,0.12)] backdrop-blur-2xl lg:max-w-none lg:flex-col lg:gap-1 lg:p-2" aria-label="Jump to block">
                        ${subject.blocks.map((block, index) => {
                    const blockKey = `${grade.id}:${subject.id}:${block.id}`;
                    return `
                                <button type="button" class="group/tip relative focus-ring grid h-9 min-w-9 place-items-center rounded-full px-2 text-[11px] font-bold text-[#A41034] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A41034]/5 hover:text-[#5a0219] focus:outline-none lg:h-7 lg:min-w-7 lg:px-1.5 lg:text-[10px] ${blockKey === activeBlockKey ? 'bg-[#f59138]/15 ring-1 ring-[#f59138]/30' : ''}" data-view="jump-block" data-block-key="${blockKey}" aria-label="Jump to Block ${index + 1}">
                                    <span>B${index + 1}</span>
                                    <span class="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#A41034]/10 bg-[#fffaf3] px-2.5 py-1.5 text-[11px] font-semibold text-[#A41034] opacity-0 shadow-lg shadow-[#A41034]/10 transition-all duration-200 group-hover/tip:translate-x-0 group-hover/tip:opacity-100 group-focus-visible/tip:translate-x-0 group-focus-visible/tip:opacity-100 lg:block">Block ${index + 1}</span>
                                </button>
                            `;
                }).join('')}
                    </nav>
                `;
                updateToolbarVisibility();
                return;
            }

            toolbar.innerHTML = `
                <nav class="mx-auto flex max-w-[min(28rem,calc(100vw-2rem))] flex-row flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-[#E9C9CD] bg-white/85 p-2.5 shadow-[0_18px_50px_rgba(123,3,35,0.08)] backdrop-blur-2xl lg:max-w-none lg:flex-col lg:gap-1 lg:p-2" aria-label="Jump to grade">
                    ${getLessonPlanGrades().map((grade) => `
                        <button type="button" class="group/tip relative focus-ring grid h-9 min-w-9 place-items-center rounded-full px-2 text-[12px] font-bold text-[#BD1740] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#BD1740]/5 hover:text-[#8a0f2e] focus:outline-none lg:h-9 lg:min-w-9 lg:px-2 ${grade.id === activeGradeId ? 'bg-[#BD1740]/10' : ''}" data-view="jump-grade" data-grade-id="${grade.id}" aria-label="Jump to ${grade.title}">
                            <span>${getGradeBadgeLabel(grade)}</span>
                            <span class="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#A41034]/10 bg-[#fffaf3] px-2.5 py-1.5 text-[11px] font-semibold text-[#A41034] opacity-0 shadow-lg shadow-[#A41034]/10 transition-all duration-200 group-hover/tip:translate-x-0 group-hover/tip:opacity-100 group-focus-visible/tip:translate-x-0 group-focus-visible/tip:opacity-100 lg:block">${grade.title}</span>
                        </button>
                    `).join('')}
                </nav>
            `;
            updateToolbarVisibility();
        }

        function initSubjectOverflow() {
            document.querySelectorAll('.subjects-row-wrapper').forEach(wrapper => {
                const row = wrapper.querySelector('.subjects-row');
                if (!row) return;
                row.querySelectorAll('.subjects-overflow-btn').forEach(b => b.remove());

                const cards = Array.from(row.querySelectorAll('.subject-card'));
                if (cards.length === 0) return;

                // Reset to flexible so browser can compute the natural first-row width
                cards.forEach(c => { c.style.flex = '1 1 180px'; });

                requestAnimationFrame(() => {
                    // All first-row cards are equal width with flex-1 — measure any one of them
                    const refWidth = cards[0].getBoundingClientRect().width;
                    // Lock every card to that width so wrapped rows match the first row
                    cards.forEach(c => { c.style.flex = `0 0 ${refWidth}px`; });
                });
            });
        }

        function renderRoute() {
            const outlet = document.getElementById('curriculum-sections');
            const hash = window.location.hash.replace(/^#/, '');
            const params = new URLSearchParams(hash);
            const view = params.get('view') || 'home';

            if (view === 'blocks') {
                const grade = findGrade(params.get('grade'));
                const subject = findSubject(params.get('grade'), params.get('subject'));
                const routeKey = grade && subject ? getBlocksRouteKey(grade.id, subject.id) : '';
                outlet.innerHTML = renderBlocksPage(params.get('grade'), params.get('subject'));
                renderGradeToolbar(view, params);
                if (grade && subject && (scrollToTopOnRender || lastAutoScrolledBlocksRoute !== routeKey)) {
                    scrollToTopOnRender = false;
                    scrollToInProgressBlock(grade, subject, routeKey);
                }
            } else if (view === 'lessons') {
                outlet.innerHTML = renderLessonsPage(params.get('grade'), params.get('subject'), params.get('block'), params.get('lesson'));
                renderGradeToolbar(view, params);
                scrollToTopOnRender = false;
                window.scrollTo({ top: 0, behavior: 'instant' });
            } else {
                outlet.innerHTML = renderHome();
                renderGradeToolbar(view, params);
            }
            lucide.createIcons();
            initSubjectOverflow();
        }

        document.addEventListener('click', (event) => {
            const learningTab = event.target.closest('[data-learning-tab]');
            if (learningTab) {
                parentLearningView = learningTab.dataset.learningTab;
                renderRoute();
                return;
            }

            const dismissTip = event.target.closest('[data-dismiss-parent-tip]');
            if (dismissTip) {
                parentTipDismissed = true;
                document.getElementById('parentTodayTip')?.remove();
                return;
            }

            const practiceTarget = event.target.closest('[data-open-practice-gym]');
            if (practiceTarget) {
                event.preventDefault();
                event.stopPropagation();
                openSubjectPracticeGym(
                    practiceTarget.dataset.practiceGrade || 'Grade 1',
                    practiceTarget.dataset.practiceSubject || 'Mathematics',
                    practiceTarget.dataset.practiceTopic || ''
                );
                return;
            }

            const practicePageTarget = event.target.closest('[data-open-practice-gym-page]');
            if (practicePageTarget) {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = appPages.practiceGym;
                return;
            }

            const lessonActionTarget = event.target.closest('[data-action]');
            if (lessonActionTarget) {
                const lessonKey = getLessonCompletionKey(
                    lessonActionTarget.dataset.gradeId,
                    lessonActionTarget.dataset.subjectId,
                    lessonActionTarget.dataset.blockId,
                    lessonActionTarget.dataset.lessonId
                );

                if (lessonActionTarget.dataset.action === 'complete-lesson') {
                    completedLessonKeys.add(lessonKey);
                    renderRoute();
                    showAppToast('Lesson marked complete.');
                    return;
                }

                if (lessonActionTarget.dataset.action === 'undo-complete-lesson') {
                    completedLessonKeys.delete(lessonKey);
                    renderRoute();
                    showAppToast('Lesson completion undone.');
                    return;
                }
            }

            const target = event.target.closest('[data-view]');
            if (!target) return;

            if (target.dataset.view === 'jump-grade') {
                const gradeId = target.dataset.gradeId;
                activeGradeId = gradeId;
                toolbarOpen = false;
                if (!expandedGradeIds.has(gradeId)) {
                    expandedGradeIds.add(gradeId);
                }
                renderRoute();

                requestAnimationFrame(() => {
                    document.getElementById(`grade-section-${gradeId}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
                return;
            }

            if (target.dataset.view === 'jump-block') {
                const blockKey = target.dataset.blockKey;
                activeBlockKey = blockKey;
                toolbarOpen = false;
                programmaticBlockScrollTarget = blockKey;
                if (programmaticBlockScrollTimer) {
                    clearTimeout(programmaticBlockScrollTimer);
                }
                programmaticBlockScrollTimer = setTimeout(() => {
                    programmaticBlockScrollTarget = '';
                    programmaticBlockScrollTimer = null;
                }, 900);
                if (collapsedBlockIds.has(blockKey)) {
                    collapsedBlockIds.delete(blockKey);
                    renderRoute();
                } else {
                    renderGradeToolbar('blocks', new URLSearchParams(window.location.hash.replace(/^#/, '')));
                }

                requestAnimationFrame(() => {
                    document.getElementById(`block-section-${blockKey}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
                return;
            }

            if (target.dataset.view === 'toggle-block') {
                const blockKey = target.dataset.blockKey;
                if (collapsedBlockIds.has(blockKey)) {
                    collapsedBlockIds.delete(blockKey);
                } else {
                    collapsedBlockIds.add(blockKey);
                }
                renderRoute();
                return;
            }

            if (target.dataset.view === 'home') {
                navigateToView('home');
                return;
            }

            if (target.dataset.view === 'blocks') {
                scrollToTopOnRender = true;
                navigateToView('blocks', target.dataset);
                return;
            }

            if (target.dataset.view === 'lessons') {
                scrollToTopOnRender = true;
                navigateToView('lessons', target.dataset);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (event.target.closest('[data-open-practice-gym]')) return;
            const target = event.target.closest('[data-view]');
            if (!target) return;
            event.preventDefault();
            target.click();
        });

        let scrollSyncFrame = null;
        function getActiveSection(sections, anchorY) {
            return sections.reduce((current, section) => {
                const top = section.getBoundingClientRect().top;
                if (top <= anchorY) return section;
                return current;
            }, sections[0]);
        }

        function syncActiveToolbarFromScroll() {
            const hash = window.location.hash.replace(/^#/, '');
            const params = new URLSearchParams(hash);
            const view = params.get('view') || 'home';

            if (view === 'blocks') {
                const sections = Array.from(document.querySelectorAll('[data-block-section]'));
                if (!sections.length) return;

                if (programmaticBlockScrollTarget) {
                    const targetSection = document.getElementById(`block-section-${programmaticBlockScrollTarget}`);
                    if (targetSection && Math.abs(targetSection.getBoundingClientRect().top - 208) > 24) {
                        return;
                    }
                    programmaticBlockScrollTarget = '';
                    if (programmaticBlockScrollTimer) {
                        clearTimeout(programmaticBlockScrollTimer);
                        programmaticBlockScrollTimer = null;
                    }
                }

                const activeSection = getActiveSection(sections, 220);
                const nextBlockKey = activeSection.dataset.blockSection;

                if (nextBlockKey && nextBlockKey !== activeBlockKey) {
                    activeBlockKey = nextBlockKey;
                    renderGradeToolbar('blocks', params);
                }
                return;
            }

            if (view === 'home') {
                const sections = Array.from(document.querySelectorAll('[data-grade-section]'));
                if (!sections.length) return;

                const activeSection = getActiveSection(sections, 170);
                const nextGradeId = activeSection.dataset.gradeSection;

                if (nextGradeId && nextGradeId !== activeGradeId) {
                    activeGradeId = nextGradeId;
                    renderGradeToolbar('home', params);
                }
            }
        }

        window.addEventListener('scroll', () => {
            if (scrollSyncFrame) return;
            scrollSyncFrame = requestAnimationFrame(() => {
                scrollSyncFrame = null;
                syncActiveToolbarFromScroll();
            });
        }, { passive: true });

        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        menuToggle?.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu?.classList.toggle('hidden', isExpanded);
        });

        const navButtons = Array.from(document.querySelectorAll('.nav-button[data-nav-title]'));
        const tabPanels = Array.from(document.querySelectorAll('.tab-panel[data-tab-panel]'));
        const practiceGymHeaderButton = document.getElementById('practiceGymHeaderButton');

        function showAppTab(title, options = {}) {
            activeAppTab = title;
            currentRole = getRoleForTab(title);
            const preserveHash = Boolean(options.preserveHash);
            const visiblePanel = title === 'Parent Lesson Plan' ? 'Teacher Lesson Plan' : title;
            practiceGymHeaderButton?.classList.toggle('border-[#BD1740]/30', title === 'Practice Test');
            practiceGymHeaderButton?.classList.toggle('bg-[#FFF7F4]', title === 'Practice Test');
            practiceGymHeaderButton?.classList.toggle('text-[#BD1740]', title === 'Practice Test');
            practiceGymHeaderButton?.classList.toggle('shadow-[0_10px_24px_rgba(189,23,64,0.12)]', title === 'Practice Test');
            if (title === 'Practice Test') {
                practiceGymHeaderButton?.setAttribute('aria-current', 'page');
            } else {
                practiceGymHeaderButton?.removeAttribute('aria-current');
            }
            tabPanels.forEach((panel) => {
                panel.classList.toggle('hidden', panel.dataset.tabPanel !== visiblePanel);
            });

            if (visiblePanel !== 'Learnometer') {
                stopLearnometerTimer();
            }
            if (visiblePanel !== 'Practice Test') {
                stopPracticeGymTimer();
            }

            if (visiblePanel === 'Teacher Lesson Plan') {
                renderCommunicationFilterToolbar();
                bindCommunicationSearch();
                renderCommunicationFab();
                if (window.location.hash && !preserveHash) {
                    window.location.hash = '';
                }
                renderRoute();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                if (visiblePanel === 'Communication') {
                    renderCommunicationFilterToolbar();
                    bindCommunicationSearch();
                    renderCommunicationFeed();
                    renderCommunicationFab();
                    lucide.createIcons();
                } else {
                    renderCommunicationFilterToolbar();
                    bindCommunicationSearch();
                    renderCommunicationFab();
                }
                if (visiblePanel === 'Learnometer') {
                    renderLearnometer();
                    if (learnometerState.step === 'test' && !learnometerState.testDone) startLearnometerTimer();
                }
                if (visiblePanel === 'Practice Test') {
                    renderPracticeGym();
                    if (practiceGymState.testStarted && !practiceGymState.testDone) startPracticeGymTimer();
                }
                if (visiblePanel === 'Profile') {
                    renderProfileScreen();
                }
                if (visiblePanel === 'Front Office') {
                    renderFrontOffice();
                }
                toolbarOpen = false;
                updateToolbarVisibility();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function setActiveNavTitle(title) {
            navButtons.forEach((button) => {
                const isActive = button.dataset.navTitle === title;
                button.classList.toggle('active', isActive);
                button.classList.toggle('text-[#6D5D5A]', !isActive);
                if (isActive) {
                    button.setAttribute('aria-current', 'page');
                } else {
                    button.removeAttribute('aria-current');
                }
            });
        }

        navButtons.forEach((button) => {
            button.addEventListener('click', () => {
                if (button.tagName === 'A' && button.getAttribute('href')) {
                    return;
                }
                const title = button.dataset.navTitle;
                if (title === 'Practice Test') {
                    practiceGymState.showSetupPage = false;
                    practiceGymState.showSetupForm = false;
                }
                setActiveNavTitle(title);
                showAppTab(title);
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    menuToggle?.setAttribute('aria-expanded', 'false');
                }
            });
        });

        practiceGymHeaderButton?.addEventListener('click', (event) => {
            if (practiceGymHeaderButton.tagName === 'A' && practiceGymHeaderButton.getAttribute('href')) {
                return;
            }
            event.stopPropagation();
            practiceGymState.showSetupPage = false;
            practiceGymState.showSetupForm = false;
            setActiveNavTitle('Practice Test');
            showAppTab('Practice Test');
            openPracticeSetupPage();
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                menuToggle?.setAttribute('aria-expanded', 'false');
            }
        });

        const profileToggle = document.getElementById('profileToggle');
        const profileMenu = document.getElementById('profileMenu');
        const profileMenuProfileButton = document.getElementById('profileMenuProfileButton');
        const profileMenuFrontOfficeButton = document.getElementById('profileMenuFrontOfficeButton');

        function setProfileMenuOpen(isOpen) {
            profileToggle?.setAttribute('aria-expanded', String(isOpen));
            profileMenu?.classList.toggle('hidden', !isOpen);
        }

        profileToggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = profileToggle.getAttribute('aria-expanded') === 'true';
            setProfileMenuOpen(!isExpanded);
        });

        profileMenu?.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        profileMenuProfileButton?.addEventListener('click', () => {
            if (profileMenuProfileButton.tagName === 'A' && profileMenuProfileButton.getAttribute('href')) {
                return;
            }
            setProfileMenuOpen(false);
            setActiveNavTitle('');
            showAppTab('Profile');
        });

        profileMenuFrontOfficeButton?.addEventListener('click', () => {
            if (profileMenuFrontOfficeButton.tagName === 'A' && profileMenuFrontOfficeButton.getAttribute('href')) {
                return;
            }
            setProfileMenuOpen(false);
            setActiveNavTitle('');
            showAppTab('Front Office');
        });

        document.addEventListener('click', () => {
            setProfileMenuOpen(false);
            if (communicationFabOpen) {
                communicationFabOpen = false;
                renderCommunicationFab();
            }
        });

        const toolbarToggle = document.getElementById('toolbarToggle');
        toolbarToggle?.addEventListener('click', () => {
            toolbarOpen = !toolbarOpen;
            updateToolbarVisibility();
        });

        document.getElementById('newAnnouncementButton')?.addEventListener('click', openNewAnnouncement);
        document.getElementById('manageGroupsButton')?.addEventListener('click', openManageGroups);

        window.addEventListener('resize', updateToolbarVisibility);
        window.addEventListener('hashchange', renderRoute);
        renderRoute();
        renderCommunicationComposer();
        renderCommunicationFeed();
        renderCommunicationFilterToolbar();
        bindCommunicationSearch();
        renderCommunicationFab();
        renderLearnometer();
        renderPracticeGym();
        renderProfileScreen();
        renderFrontOffice();
        renderPracticeGymGlobalFab();
        showAppTab(activeAppTab, { preserveHash: true });
        lucide.createIcons();
