
const SKIP_KEYS = new Set(["brief", "assetId", "types", "time", "_id", "Youtube", "question", "type", "teacher_tip"]);

/**
 * Retrieves the lesson plan content for a given lesson plan ID.
 * @param {number} lessonPlanId The ID of the lesson plan.
 * @returns {Promise<string>} The extracted lesson plan content as a paragraph string, or an empty string if not found.
 */
export async function getLessonPlanContent() {
    // const lessonPlan = await db.lessonPlans.findOne({ "libraryId": lessonPlanId }, { projection: { data: 1 } });

    // --- Lesson Plan Content (extracted from your previous input) ---
    const lessonPlan = {
        "_id": { "$oid": "5fec79b9c56b260011128ab0" },
        "name": "Words to Learn",
        "status": "completed",
        "data": {
        "analysis": {
            "activity_discussion": {
            "explanations": [
                {
                "_id": { "$oid": "5fec79b9c56b260011128aa6" },
                "description": "",
                "brief": { "assetId": "6053ac67070767005e1c2c09", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "assetId": { "$oid": "636a5d297d48f500206c49ca" }
                }
            ],
            "key_question": "What do you think the words *furry *and *jiggles* mean?",
            "key_question_guide": "Let's hear from at least 3 students!",
            "instructions": [
                { "_id": { "$oid": "5fec79b9c56b260011128aa7" }, "description": "The word *furry* means something with hair on it. For example, the fox's legs are *furry* in the song." },
                { "_id": { "$oid": "5fec79b9c56b260011128aa8" }, "description": "The word *jiggles* means something that moves like jelly or jam. For example, Iggy's fish *jiggles* like jam in the song." }
            ],
            "teacher_tip": "",
            "key_question_assets": []
            },
            "generalized_discussion": {
            "explanations": [
                {
                "_id": { "$oid": "5fec79b9c56b260011128aa9" },
                "description": "",
                "brief": { "assetId": "6053ac67070767005e1c2c0b", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "assetId": { "$oid": "636a5d29bef5da00252aecd7" }
                }
            ],
            "key_question": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"What helped you to find the meanings of the words?\"}]}]}",
            "key_question_guide": "Let's hear from at least 4 students!",
            "instructions": [
                { "_id": { "$oid": "5fec79b9c56b260011128aaa" }, "description": "The pictures helped us guess the meanings of the words." },
                { "_id": { "$oid": "5fec79b9c56b260011128aab" }, "description": "We could also find the meanings of the words in the Words to Learn section." }
            ],
            "teacher_tip": "",
            "key_question_assets": []
            },
            "higher_order_thinking": {
            "explanations": [],
            "key_question": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"We saw that the word \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"bat\"},{\"type\":\"text\",\"text\":\" has two meanings: a flying animal and something we hit a ball with. Can you think of any other words with two meanings?\"}]}]}",
            "key_question_guide": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Let's hear from at least 3 students!\"}]}]}",
            "teacher_tip": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"You can give hints here to guide students to common words that they would know, such as: \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"ring\"},{\"type\":\"text\",\"text\":\",\"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\" band\"},{\"type\":\"text\",\"text\":\", \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"match\"},{\"type\":\"text\",\"text\":\", \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"sink, right\"},{\"type\":\"text\",\"text\":\", or \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"left\"},{\"type\":\"text\",\"text\":\".\"}]}]}",
            "instructions": [
                { "_id": { "$oid": "5fec79b9c56b260011128aac" }, "description": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"We all use words that have more than one meaning. \"}]}]}" },
                { "_id": { "$oid": "5fec79b9c56b260011128aad" }, "description": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"The word \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"right\"},{\"type\":\"text\",\"text\":\" can mean correct OR the opposite of left. For example: Alexa always has the \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"right\"},{\"type\":\"text\",\"text\":\" answer. Eddie holds his pencil in his \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"right\"},{\"type\":\"text\",\"text\":\" hand.\"}]}]}" },
                { "_id": { "$oid": "636a5d28e645ce0014034936" }, "description": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"The word\"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\" ring\"},{\"type\":\"text\",\"text\":\" can be a sound like a bell OR a small metal band we put on our finger. For example: The bell will \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"ring\"},{\"type\":\"text\",\"text\":\" at the end of class. My mom wears a gold \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"ring\"},{\"type\":\"text\",\"text\":\" on her finger.\"}]}]}" }
            ],
            "key_question_assets": []
            },
            "types": ["class"],
            "summary": "What helped you to find the meanings of the words?",
            "time": "10 mins",
            "type": "class"
        },
        "action": {
            "types": ["pair"],
            "summary": "Guess the meanings of words in the song.",
            "time": "8 mins",
            "type": "pair",
            "instructions": [
            {
                "instructionBreak": true, "_id": { "$oid": "5fec79b9c56b260011128a97" },
                "description": "Let's get into pairs for today's activity.", "children": [], "assets": []
            },
            {
                "instructionBreak": null, "_id": { "$oid": "5fec79b9c56b260011128a98" },
                "description": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Let's open our Content Book to \"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"The Alphabet Song\"},{\"type\":\"text\",\"text\":\". Listen as I sing the song and follow the words silently in your books.\"}]}]}",
                "children": [{ "_id": { "$oid": "5fec79b9c56b260011128a99" }, "description": "Move your pointer finger along the words while listening." }],
                "assets": []
            },
            {
                "instructionBreak": null, "_id": { "$oid": "5fec79b9c56b260011128a9a" },
                "description": "Now, what do you think the word *catch* means?",
                "children": [
                { "_id": { "$oid": "5fec79b9c56b260011128a9b" }, "description": "Look at the picture and try to guess the meaning." },
                { "_id": { "$oid": "5fec79b9c56b260011128a9c" }, "description": "Tell your partner what you think it means." }
                ],
                "assets": [
                {
                    "_id": { "$oid": "5fec79b9c56b260011128a9d" },
                    "brief": { "assetId": { "$oid": "6053ac67070767005e1c2bf3" }, "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                    "assetId": { "$oid": "636a5d2a15635200219c9da3" },
                    "placeholder": { "assetId": "" }
                }
                ]
            },
            {
                "instructionBreak": null, "_id": { "$oid": "5fec79b9c56b260011128a9e" },
                "description": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"Catch\"},{\"type\":\"text\",\"text\":\" means to stop and hold something that was moving.\"}]}]}",
                "children": [{ "_id": { "$oid": "5fec79b9c56b260011128a9f" }, "description": "For example: The cat tries to *catch* the mouse." }],
                "assets": []
            },
            {
                "instructionBreak": null, "_id": { "$oid": "5fec79b9c56b260011128aa0" },
                "description": "Now, try to guess the meanings of the words *furry* and *jiggles*. Look at the pictures for help.",
                "children": [{ "_id": { "$oid": "5fec79b9c56b260011128aa1" }, "description": "Tell your partner what you think these words mean." }],
                "assets": []
            },
            {
                "instructionBreak": true, "_id": { "$oid": "5fec79b9c56b260011128aa2" },
                "description": "Let's check their meaning from the Words to Learn section in the Content Book.",
                "children": [], "assets": []
            },
            {
                "instructionBreak": null, "_id": { "$oid": "5fec79b9c56b260011128aa3" },
                "description": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Now, let's watch a video!\"}]}]}",
                "children": [],
                "assets": [
                {
                    "_id": { "$oid": "5fec79b9c56b260011128aa4" },
                    "brief": { "assetId": { "$oid": "60af909decd420001870215d" }, "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                    "assetId": { "$oid": "636a5d2a5216350020f47fd2" },
                    "placeholder": { "assetId": { "$oid": "636a5d29c51bef00216204ee" } }
                }
                ]
            }
            ],
            "teacher_tip": ""
        },
        "application": {
            "summaryData": { "classwork": " Worksheet 1.2 ", "homework": " Practice Questions 1–3" },
            "classwork": {
            "description": "1.2",
            "brief": { "assetId": { "$oid": "6053ac67070767005e1c2bf9" }, "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
            "assetId": { "$oid": "636a5d2930959b0020d18be3" },
            "placeholder": { "assetId": "636a5d326fe82c0023e02d7c" }
            },
            "homework": {
            "question": {
                "assetId": { "$oid": "636a5d293ceb440020207c36" },
                "brief": { "assetId": { "$oid": "620233ad0345660019e829de" }, "type": "pdf", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "placeholder": { "assetId": "636a5d326fe82c0023e02d7f" }
            },
            "Youtube": {
                "brief": { "type": "pdf" }, "assetId": { "$oid": "636a5d296e9afd001ffb5869" }, "type": "pdf",
                "placeholder": { "assetId": "636a5d2ee700920022bd2029" }
            },
            "description": "1–3"
            },
            "differentiation_tips": {
            "need_more_help": { "description": "Ask students to look at the pictures to guess the meanings. Ask: What jiggles in the song? Why does the kitten bring a hook? What is the use of a hook?" },
            "need_extra_challenge": { "description": "Make a sentence of your own with the word *furry* or *catch*." }
            },
            "types": ["individual"],
            "summary": "##Classwork:## Worksheet 1.2 ##Homework:## Practice Questions 1–3",
            "time": "10 mins",
            "type": "individual",
            "more_practice_time": "7 mins",
            "more_practice": [
            { "_id": { "$oid": "5fec79b9c56b260011128aae" }, "description": "Read the meanings of the words *jiggles* and *hook* from the Words to Learn once again. ", "assets": [] },
            { "_id": { "$oid": "5fec79b9b56b260011128aaf" }, "description": "Use these words to make 2 sentences of your own. ", "assets": [] }
            ]
        },
        "assessment": {
            "summaryData": { "approaching": " Identify meanings, using pictures. ", "meeting": " Find meanings from Words to Learn. ", "exceeding": " Use words in sentences." },
            "grade_template": {
            "approaching": { "description": "Students can identify the meanings of words, using pictures." },
            "meeting": { "description": "Students can find the meanings of words, using Words to Learn." },
            "exceeding": { "description": "Students can use new words in sentences, including those with multiple meanings. " }
            },
            "check": {
            "question": {
                "assetId": { "$oid": "636a5d293ceb440020207c34" },
                "brief": { "assetId": { "$oid": "6053ac67070767005e1c2bfd" }, "type": "", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "placeholder": { "assetId": "636a5d317d48f500206c49e4" }
            },
            "Youtube": {
                "brief": { "type": "" }, "assetId": { "$oid": "636a5d298dcfad0025c59fac" }, "type": "pdf",
                "placeholder": { "assetId": "636a5d31bef5da00252aecda" }
            },
            "description": "1.2"
            },
            "summary": "##A:## Identify meanings, using pictures. ##M:## Find meanings from Words to Learn. ##E:## Use words in sentences.",
            "teacher_tip": ""
        },
        "references": [],
        "_id": { "$oid": "636a5d28e645ce0014034918" },
        "time": "35 mins",
        "keywords": [
            { "_id": { "$oid": "5fec79b9c56b260011128a92" }, "keyword": "meanings", "description": "things or ideas that a word tells us about" },
            { "_id": { "$oid": "5fec79b9c56b260011128a93" }, "keyword": "catch", "description": "to stop and hold a moving object or a person" }
        ],
        "aim": {
            "summary": "To find meanings of words, using Words to Learn.",
            "description": "We have already read and sung the *The Alphabet Song* in the previous class. Today, we will find the meanings of new words in the song.",
            "teacher_tip": "",
            "resources": [
            {
                "_id": { "$oid": "5fec79b9c56b260011128a94" },
                "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Content Book (\"},{\"type\":\"text\",\"marks\":[{\"type\":\"italic\"}],\"text\":\"The Alphabet Song\"},{\"type\":\"text\",\"text\":\")\"}]}]}",
                "brief": { "assetId": "636a28935216350020f35ed7", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "assetId": { "$oid": "636a5d2aafc1eb00200c87a8" },
                "placeholder": { "assetId": "636a5d38d8ba7600214f7f19" }
            },
            {
                "_id": { "$oid": "5fec79b9c56b260011128a95" }, "text": "Worksheet 1.2",
                "brief": { "assetId": "6053ac67070767005e1c2c05", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "assetId": { "$oid": "636a5d298dcfad0025c59fae" },
                "placeholder": { "assetId": "636a5d31dc10ef00236c239a" }
            },
            {
                "_id": { "$oid": "5fec79b9c56b260011128a96" }, "text": "Notebook",
                "brief": { "assetId": "6053ac67070767005e1c2c07", "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
                "assetId": { "$oid": "636a5d293ceb440020207c38" }
            }
            ]
        },
        "brief": { "assetId": { "$oid": "6053ac67070767005e1c2c01" }, "text": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"F\"}]}]}" },
        "assetId": { "$oid": "636a5d293ceb440020207c3b" }
        },
        "library_id": 1330,
        "created_at": { "$date": { "$numberLong": "1609333177366" } },
        "updated_at": { "$date": { "$numberLong": "1667915048457" } },
        "__v": 11,
        "projectorModeAudio": {
        "aimAndResourcesSlide": "assets/lesson_plans/1330/projectorModeAudio/aimAndResourcesSlide.mp3",
        "keywordsSlide": "assets/lesson_plans/1330/projectorModeAudio/keywordsSlide.mp3",
        "actionSlide": "assets/lesson_plans/1330/projectorModeAudio/actionSlide.mp3",
        "activityDiscussionSlide": "assets/lesson_plans/1330/projectorModeAudio/activityDiscussionSlide.mp3",
        "activityExplanationSlide": "assets/lesson_plans/1330/projectorModeAudio/activityExplanationSlide.mp3",
        "generalizedDiscussionSlide": "assets/lesson_plans/1330/projectorModeAudio/generalizedDiscussionSlide.mp3",
        "generalizedExplanationSlide": "assets/lesson_plans/1330/projectorModeAudio/generalizedExplanationSlide.mp3",
        "hotsDiscussionSlide": "assets/lesson_plans/1330/projectorModeAudio/hotsDiscussionSlide.mp3",
        "hotsExplanationSlide": "assets/lesson_plans/1330/projectorModeAudio/hotsExplanationSlide.mp3",
        "classworkWorkbookSlide": "assets/lesson_plans/1330/projectorModeAudio/classworkWorkbookSlide.mp3",
        "classworkMorePracticeSlide": "assets/lesson_plans/1330/projectorModeAudio/classworkMorePracticeSlide.mp3",
        "homeworkSlide": "assets/lesson_plans/1330/projectorModeAudio/homeworkSlide.mp3",
        "haveAGoodDaySlide": "assets/lesson_plans/1330/projectorModeAudio/haveAGoodDaySlide.mp3"
        },
        "readerModeAudio": {
        "aim": "assets/lesson_plans/1330/readerModeAudio/aim.mp3",
        "action": "assets/lesson_plans/1330/readerModeAudio/action.mp3",
        "analysis": "assets/lesson_plans/1330/readerModeAudio/analysis.mp3",
        "application": "assets/lesson_plans/1330/readerModeAudio/application.mp3",
        "assessment": "assets/lesson_plans/1330/readerModeAudio/assessment.mp3"
        },
        "template": "standard",
        "type": "standard",
        "keywordsAudio": {
        "meanings": "assets/lesson_plans/1330/keywordsAudio/meanings.mp3",
        "catch": "assets/lesson_plans/1330/keywordsAudio/catch.mp3"
        },
        "audio": {
        "British": {
            "teacherPrepMode": {
            "aim": "published/assets/lesson_plans/1330/audio/British/teacherPrepMode/aim.mp3",
            "assessment": "published/assets/lesson_plans/1330/audio/British/teacherPrepMode/assessment.mp3",
            "action": "published/assets/lesson_plans/1330/audio/British/teacherPrepMode/action.mp3",
            "application": "published/assets/lesson_plans/1330/audio/British/teacherPrepMode/application.mp3",
            "analysis": "published/assets/lesson_plans/1330/audio/British/teacherPrepMode/analysis.mp3"
            },
            "projectorMode": {
            "commonSlides": { "greetings": "published/assets/lesson_plans/1330/audio/British/projectorMode/commonSlides/greetings.mp3" },
            "action": {
                "instructions3": "published/assets/lesson_plans/1330/audio/British/projectorMode/action/instructions3.mp3",
                "instructions1": "published/assets/lesson_plans/1330/audio/British/projectorMode/action/instructions1.mp3",
                "instructions2": "published/assets/lesson_plans/1330/audio/British/projectorMode/action/instructions2.mp3"
            },
            "analysis": {
                "generalizedExplanation": "published/assets/lesson_plans/1330/audio/British/projectorMode/analysis/generalizedExplanation.mp3",
                "activityDiscussion": "published/assets/lesson_plans/1330/audio/British/projectorMode/analysis/activityDiscussion.mp3",
                "generalizedDiscussion": "published/assets/lesson_plans/1330/audio/British/projectorMode/analysis/generalizedDiscussion.mp3",
                "activityDiscussionExplanation": "published/assets/lesson_plans/1330/audio/British/projectorMode/analysis/activityDiscussionExplanation.mp3",
                "hotsDiscussion": "published/assets/lesson_plans/1330/audio/British/projectorMode/analysis/hotsDiscussion.mp3",
                "hotsExplanation": "published/assets/lesson_plans/1330/audio/British/projectorMode/analysis/hotsExplanation.mp3"
            },
            "aim": {
                "aim": "published/assets/lesson_plans/1330/audio/British/projectorMode/aim/aim.mp3",
                "aimKeywords": "published/assets/lesson_plans/1330/audio/British/projectorMode/aim/aimKeywords.mp3"
            },
            "application": {
                "classwork": "published/assets/lesson_plans/1330/audio/British/projectorMode/application/classwork.mp3",
                "homeWork": "published/assets/lesson_plans/1330/audio/British/projectorMode/application/homeWork.mp3",
                "morePractice": "published/assets/lesson_plans/1330/audio/British/projectorMode/application/morePractice.mp3"
            }
            },
            "Indian": {
            "teacherPrepMode": {
                "assessment": "published/assets/lesson_plans/1330/audio/Indian/teacherPrepMode/assessment.mp3",
                "aim": "published/assets/lesson_plans/1330/audio/Indian/teacherPrepMode/aim.mp3",
                "action": "published/assets/lesson_plans/1330/audio/Indian/teacherPrepMode/action.mp3",
                "application": "published/assets/lesson_plans/1330/audio/Indian/teacherPrepMode/application/application.mp3",
                "analysis": "published/assets/lesson_plans/1330/audio/Indian/teacherPrepMode/analysis.mp3"
            },
            "projectorMode": {
                "commonSlides": { "greetings": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/commonSlides/greetings.mp3" },
                "action": {
                "instructions3": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/action/instructions3.mp3",
                "instructions1": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/action/instructions1.mp3",
                "instructions2": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/action/instructions2.mp3"
                },
                "analysis": {
                "generalizedExplanation": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/analysis/generalizedExplanation.mp3",
                "generalizedDiscussion": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/analysis/generalizedDiscussion.mp3",
                "activityDiscussionExplanation": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/analysis/activityDiscussionExplanation.mp3",
                "activityDiscussion": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/analysis/activityDiscussion.mp3",
                "hotsDiscussion": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/analysis/hotsDiscussion.mp3",
                "hotsExplanation": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/analysis/hotsExplanation.mp3"
                },
                "aim": {
                "aimKeywords": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/aim/aimKeywords.mp3",
                "aim": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/aim/aim.mp3"
                },
                "application": {
                "morePractice": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/application/morePractice.mp3",
                "homeWork": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/application/homeWork.mp3",
                "classwork": "published/assets/lesson_plans/1330/audio/Indian/projectorMode/application/classwork.mp3"
                }
            }
            ,
            "keywordsAudio": {
                "meanings": "published/assets/lesson_plans/1330/audio/Indian/keywordsAudio/meanings.mp3",
                "catch": "published/assets/lesson_plans/1330/audio/Indian/keywordsAudio/catch.mp3"
            }
            }
        },
        "pdfThumbnailsGenerated": true,
        "offlineZips": {
            "content": { "assetId": "636a5d528dcfad0025c59fb9" },
            "audio": {
            "British": { "assetId": "636a5d5015635200219c9ea9" },
            "Indian": { "assetId": "636a5d507d48f500206c4af6" }
            }
        }
        }
    };
    // --- End of Lesson Plan Content ---
  
    if (lessonPlan) {
        const lessonPlanData = lessonPlan.data || {};
        const lessonPlanDataMinimal = {
            "aim": lessonPlanData.aim || "",
            "analysis": lessonPlanData.analysis || "",
        };
        const lessonPlanParaText = getLessonPlanParagraphText(lessonPlanDataMinimal);
        return lessonPlanParaText.trim();
    }
    return "";
}

/**
 * Extracts paragraph text from a nested dictionary structure.
 * @param {object} data The input dictionary.
 * @returns {string} The extracted text joined by double newlines.
 */
function getLessonPlanParagraphText(data) {
    const paragraphs = [];

    function extractText(value, keyPath = "") {
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                const extracted = extractTextFromJson(parsed);
                if (extracted.trim()) {
                    paragraphs.push(`${keyPath}: ${extracted.trim()}`);
                }
            } catch (e) {
                // Not a valid JSON string
                if (value.trim()) {
                    paragraphs.push(`${keyPath}: ${value.trim()}`);
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    extractText(item, keyPath);
                }
            } else {
                for (const k in value) {
                    if (SKIP_KEYS.has(k)) {
                        continue;
                    }
                    const v = value[k];
                    const newKeyPath = keyPath ? `${keyPath}.${k}` : k;
                    extractText(v, newKeyPath);
                }
            }
        } else if (value !== null && value !== undefined && value !== "") {
            paragraphs.push(`${keyPath}: ${String(value).trim()}`);
        }
    }

    extractText(data);
    return paragraphs.join("\n\n");
}

/**
 * Extracts text from a JSON-like structure (parsed JSON or a plain object/array).
 * @param {*} jsonData The input JSON data (can be string, object, array, etc.).
 * @returns {string} The extracted text joined by double newlines.
 */
function extractTextFromJson(jsonData) {
    const data = [];

    function recurse(value) {
        if (typeof value === 'string') {
            data.push(value);
        } else if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    recurse(item);
                }
            } else {
                for (const k in value) {
                    recurse(value[k]);
                }
            }
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            data.push(String(value));
        }
    }

    recurse(jsonData);
    return data.join("\n\n");
}