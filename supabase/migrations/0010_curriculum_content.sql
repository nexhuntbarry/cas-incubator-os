-- ============================================================
-- CAS Incubator OS — Migration 0010
-- Add content_md column to curriculum_assets + populate 20 lessons
-- Generated: 2026-04-20
-- Idempotent: safe to run multiple times
-- ============================================================

ALTER TABLE curriculum_assets ADD COLUMN IF NOT EXISTS content_md text;

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 1: Program Launch: What Makes a Strong Project?

> Phase: Phase 1 — Discover and Define

## Central Learning Focus

Students are introduced to the course challenge, the difference between a random idea and a meaningful project, and the overall expectation that they will build something with real purpose and ownership.

## Student Learning Objectives

- describe the overall goal of the program
- explain the difference between an idea, a project, and a portfolio-quality outcome
- identify qualities of a strong student project

## Materials

- Slides
- projector
- sample student-style projects
- reflection sheet
- notebook

## Lesson Timing and Activities

### 0–10 min · Welcome and Framing
Introduce the course structure, expectations, and final showcase outcome.

### 10–25 min · Mini Lesson
Teacher explains what makes a project valuable: purpose, user, evidence, execution, and communication.

### 25–45 min · Example Analysis
Students review 2–3 sample project types and discuss which feels stronger and why.

### 45–65 min · Personal Reflection
Students complete a reflection on interests, strengths, and why they may want to build something.

### 65–80 min · Discussion
Students share project types they admire or would be excited to pursue.

### 80–90 min · Exit Ticket
Students write: “A strong project is more than just ___ because ___.”

## Expected Student Output

- first reflection sheet
- exit ticket

## Assessment

Can the student describe what gives a project value beyond appearance?
Does the student understand that this course is outcome-based, not only activity-based?

## Teacher Notes

Do not let students rush into tools immediately. Set the standard that meaningful projects start with logic, not just excitement.
$lesson$
WHERE lesson_number = 1
  AND title LIKE 'Lesson 1:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 2: Design Thinking and Finding a Real Problem

> Phase: Phase 1 — Discover and Define

## Central Learning Focus

Students learn that stronger projects solve a real problem, improve an experience, or address a genuine need.

## Student Learning Objectives

- understand the concept of user-centered problem solving
- identify problem areas worth exploring
- draft a first problem statement

## Materials

- Problem statement worksheet
- sticky notes
- board
- sample problem prompts

## Lesson Timing and Activities

### 0–10 min · Warm-Up
What kinds of school, life, club, learning, or social experiences feel inefficient, confusing, or frustrating?

### 10–25 min · Mini Lesson
Teacher introduces design thinking in a project context.

### 25–45 min · Brainstorm Wall
Students list problems or needs they have noticed.

### 45–65 min · Cluster and Sort
Problems are grouped by themes such as education, productivity, wellness, accessibility, events, research, or communication.

### 65–80 min · Personal Drafting
Students write 2–3 problem statements.

### 80–90 min · Share-Out
Quick peer reaction on whether each problem sounds real, useful, and meaningful.

## Expected Student Output

- list of problem areas
- 2–3 draft problem statements

## Assessment

Does the student identify a real need instead of a random feature?
Can the student explain who is affected by the problem?

## Teacher Notes

Push students from “I want to build X” toward “I want to help Y solve Z.”
$lesson$
WHERE lesson_number = 2
  AND title LIKE 'Lesson 2:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 3: Interest Mapping and Opportunity Areas

> Phase: Phase 1 — Discover and Define

## Central Learning Focus

Students connect personal interests, academic goals, competitions, and future directions to possible project themes.

## Student Learning Objectives

- map interests to project opportunities
- identify where passion and usefulness overlap
- generate several project directions before choosing one

## Materials

- Interest map sheet
- opportunity matrix
- markers

## Lesson Timing and Activities

### 0–10 min · Review
Revisit problem statements from Lesson 2.

### 10–25 min · Mini Lesson
Teacher explains why strong projects often sit at the intersection of interest, skill, and real need.

### 25–50 min · Mapping
ActivityStudents map interests: school subjects, clubs, causes, hobbies, future majors, competitions.

### 50–70 min · Opportunity
MatchingStudents connect interest categories with user problems.

### 70–85 min · Narrowing
RoundStudents select their top 3 project directions.

### 85–90 min · Exit
Reflection

## Expected Student Output

- interest and opportunity map
- top 3 project directions

## Assessment

Are project ideas linked to real student interest or longer-term goals?
Can the student explain why a direction matters to them?

## Teacher Notes

This lesson is important for college-application value. A project tied to genuine interest is more defensible and more sustainable.
$lesson$
WHERE lesson_number = 3
  AND title LIKE 'Lesson 3:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 4: User, Stakeholder, and Context Definition

> Phase: Phase 1 — Discover and Define

## Central Learning Focus

Students define who their project is for, who is affected, and in what context the project would be used.

## Student Learning Objectives

- define a primary user
- identify stakeholders beyond the main user
- describe context of use

## Materials

- Persona template
- stakeholder map
- context-of-use worksheet

## Lesson Timing and Activities

### 0–10 min · Warm-Up
Who exactly is your project helping?

### 10–25 min · Mini Lesson
Teacher explains users vs stakeholders vs decision makers.

### 25–50 min · Persona
DraftingStudents create a detailed user persona.

### 50–70 min · Stakeholder
MappingStudents identify additional people affected by the solution.

### 70–85 min · Context
ScenarioStudents write a brief use-case scenario.

### 85–90 min
Share

## Expected Student Output

- user persona
- stakeholder map
- use-case scenario

## Assessment

Is the target user clearly defined?
Does the student understand where and how the project would be used?

## Teacher Notes

A vague user leads to a vague project. Do not allow “everyone” as a target audience.
PHASE 2 – RESEARCH AND SCOPE
$lesson$
WHERE lesson_number = 4
  AND title LIKE 'Lesson 4:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 5: Existing Solutions and Competitive Landscape

> Phase: Phase 2 — Research and Scope

## Central Learning Focus

Students study what already exists so they can avoid making something redundant or superficial.

## Student Learning Objectives

- identify existing tools, apps, workflows, or programs related to their idea
- analyze strengths and weaknesses of current solutions
- identify possible gaps or improvement opportunities

## Materials

- Competitive analysis sheet
- laptops
- research template

## Lesson Timing and Activities

### 0–10 min · Research
FramingWhy it matters to know what already exists.

### 10–25 min · Teacher
ModelingTeacher demonstrates how to compare existing solutions.

### 25–60 min · Student
Research BlockStudents identify 2–4 existing solutions or comparable models.

### 60–75 min · Compare and
RankStudents compare by user value, clarity, usability, accessibility, cost, or limitations.

### 75–90 min · Gap
SummaryStudents summarize what is missing in current solutions.

## Expected Student Output

- competitor / existing solution comparison chart
- gap statement

## Assessment

Can the student identify a meaningful difference between existing solutions?
Does the student see where their project might add value?

## Teacher Notes

Encourage honest research. Students do not need a completely original topic, but they do need a clear angle or value.
$lesson$
WHERE lesson_number = 5
  AND title LIKE 'Lesson 5:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 6: Value Proposition and Project Positioning

> Phase: Phase 2 — Research and Scope

## Central Learning Focus

Students learn how to clearly state what their project does, for whom, and why it matters.

## Student Learning Objectives

- write a concise project positioning statement
- articulate core value clearly
- connect value to user need and outcome

## Materials

- Positioning statement template
- examples
- revision sheet

## Lesson Timing and Activities

### 0–10 min · Warm-Up
If you had one sentence to explain your project, what would you say?

### 10–25 min · Mini Lesson
Teacher introduces the structure: For [user], who needs [problem solved], this project helps [result] by [approach].

### 25–50 min · Drafting
RoundStudents write first positioning statements.

### 50–70 min · Pair
FeedbackPeers test whether the statement is clear and specific.

### 70–85 min · Revision
Students improve clarity, specificity, and realism.

### 85–90 min · Exit Ticket

## Expected Student Output

- project positioning statement v1
- value proposition draft

## Assessment

Can the student explain the project without rambling?
Does the statement identify a clear user and benefit?

## Teacher Notes

If a student cannot explain the project clearly, the project is not yet conceptually strong enough.
$lesson$
WHERE lesson_number = 6
  AND title LIKE 'Lesson 6:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 7: From Big Idea to MVP

> Phase: Phase 2 — Research and Scope

## Central Learning Focus

Students learn how to reduce a broad idea into a manageable first version with realistic deliverables.

## Student Learning Objectives

- understand the meaning of MVP
- separate essential features from optional features
- define what success for version 1 looks like

## Materials

- MVP planning sheet
- feature priority matrix
- markers

## Lesson Timing and Activities

### 0–10 min · Mini
DiscussionWhy do student projects fail? Common answer: too big, too many features, no priority.

### 10–25 min · Mini Lesson
Teacher explains MVP using startup and product examples.

### 25–55 min · Feature
DumpStudents list all desired features.

### 55–75 min · Prioritization
RoundStudents sort features into must-have, helpful, later, and not-now.

### 75–90 min · MVP
SummaryStudents define their first build target.

## Expected Student Output

- feature list
- prioritized MVP plan

## Assessment

Is the student’s first version realistic for the program timeline?
Does the project still clearly demonstrate value even after being narrowed?

## Teacher Notes

This lesson often determines whether a project can become polished or stay permanently unfinished.
$lesson$
WHERE lesson_number = 7
  AND title LIKE 'Lesson 7:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 8: Prompting for Serious Project Work

> Phase: Phase 2 — Research and Scope

## Central Learning Focus

Students learn how to prompt AI for planning, logic, feature design, research structuring, and prototype support.

## Student Learning Objectives

- identify qualities of strong project prompts
- write prompts with context, constraints, and goals
- distinguish between vague prompting and productive prompting

## Materials

- Prompt comparison sheet
- prompt framework card
- bad-vs-good examples

## Lesson Timing and Activities

### 0–10 min · Prompt
Guessing GameWhich prompt is more likely to produce a useful project result?

### 10–25 min · Mini Lesson
Teacher explains prompt components: role, context, user, task, constraints, format.

### 25–45 min · Rewrite
PracticeStudents improve weak prompts.

### 45–65 min · Teacher
DemoCompare outputs from weak and strong prompts.

### 65–80 min · Project
Prompt DraftingStudents write 2–3 prompts related to their own project.

### 80–90 min · Peer Review

## Expected Student Output

- improved prompt examples
- project prompt set v1

## Assessment

Does the student’s prompt include clear task framing?
Can the student explain why one prompt is more useful than another?

## Teacher Notes

High school students can handle more open-ended prompting than younger students, but they still need structure if you want strong outcomes.
PHASE 3 – PLAN AND PROTOTYPE
$lesson$
WHERE lesson_number = 8
  AND title LIKE 'Lesson 8:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 9: User Flow and System Logic

> Phase: Phase 3 — Plan and Prototype

## Central Learning Focus

Students design how the user will move through the product and what sequence of actions or decisions the system must support.

## Student Learning Objectives

- map user flow from entry to outcome
- identify decision points and bottlenecks
- turn concept into sequence logic

## Materials

- Flowchart template
- sample user flow
- sticky arrows

## Lesson Timing and Activities

### 0–10 min · Review
MVPStudents restate the core function of their project.

### 10–25 min · Mini Lesson
Teacher explains user flow, friction points, and logic pathways.

### 25–55 min · Student
Mapping TimeStudents create a user flow for their project.

### 55–75 min · Partner
WalkthroughPeers test whether the sequence makes sense.

### 75–90 min · Revision and
Annotation

## Expected Student Output

- user flow diagram
- sequence notes

## Assessment

Can another person understand how the project works from the flow?
Does the sequence support the stated user goal?

## Teacher Notes

Students often realize here that their ideas are not as clear as they thought. That is productive.
$lesson$
WHERE lesson_number = 9
  AND title LIKE 'Lesson 9:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 10: Wireframe / Architecture Planning

> Phase: Phase 3 — Plan and Prototype

## Central Learning Focus

Students convert project logic into interface structure, workflow structure, or system architecture.

## Student Learning Objectives

- create a low-fidelity wireframe or architecture sketch
- identify major screens, modules, or project components
- align structure with user flow and MVP priorities

## Materials

- Wireframe templates
- architecture planning sheet
- pencils or digital whiteboard

## Lesson Timing and Activities

### 0–10 min · Mini
ReflectionWhich parts of your project need to be visible to the user?

### 10–25 min · Teacher
ModelingSample wireframe / module structure walkthrough.

### 25–60 min · Student
Work TimeStudents create wireframes or architecture diagrams.

### 60–75 min · Explain-
Back RoundPartners explain each other’s projects based on the plan.

### 75–90 min · Add
Notes for Build Sprint

## Expected Student Output

- wireframe or architecture plan
- annotated build notes

## Assessment

Are essential screens or modules identified?
Can the student explain how the structure supports the MVP?

## Teacher Notes

This should remain low fidelity. The purpose is clarity, not polished design.
$lesson$
WHERE lesson_number = 10
  AND title LIKE 'Lesson 10:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 11: CAS Build Sprint 1

> Phase: Phase 3 — Plan and Prototype

## Central Learning Focus

Students begin converting their plan into a first working prototype, assisted by CAS and their own AI workflows.

## Student Learning Objectives

- translate planning materials into build instructions
- complete a first generation or first structured version
- document what works and what is incomplete

## Materials

- Devices
- CAS workflow access
- build checklist
- change log template

## Lesson Timing and Activities

### 0–10 min · Setup
Students prepare assets, prompts, notes, and build targets.

### 10–20 min · Teacher
DemoDemonstrate a clean first-generation workflow.

### 20–65 min · Build
SprintStudents complete first build generation or first prototype assembly.

### 65–80 min · Self-Test
Students run through the output and document issues.

### 80–90 min · Quick
Reflection

## Expected Student Output

- prototype v1 or first functional build attempt
- initial change log entry

## Assessment

Did the student produce a first build attempt?
Can the student identify what matches and does not match the plan?

## Teacher Notes

This lesson is about momentum, not perfection. Ensure students document progress rather than only chasing visual impressiveness.
$lesson$
WHERE lesson_number = 11
  AND title LIKE 'Lesson 11:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 12: Self-Test, Debug, and Diagnose

> Phase: Phase 3 — Plan and Prototype

## Central Learning Focus

Students learn how to identify bugs, logic gaps, UX problems, and incomplete features in their own work.

## Student Learning Objectives

- distinguish between bug, missing feature, and unclear design
- document issues specifically
- prioritize what to fix first

## Materials

- Testing checklist
- issue log
- bug category sheet

## Lesson Timing and Activities

### 0–10 min · Mini Lesson
What counts as a bug? What counts as a design issue? What counts as scope drift?

### 10–35 min · Individual
TestingStudents test their own prototype using a checklist.

### 35–60 min · Guided
Diagnostic ReviewTeacher circulates and helps categorize issues.

### 60–80 min · Prioritization
Students rank top issues by severity and importance.

### 80–90 min · Fix
Plan Draft

## Expected Student Output

- issue log
- top 3–5 priority fixes

## Assessment

Can the student name specific issues instead of vague frustration?
Does the student prioritize intelligently?

## Teacher Notes

Students often want to fix everything. Force them to identify what most affects user experience and project credibility.
PHASE 4 – IMPROVE AND STRENGTHEN
$lesson$
WHERE lesson_number = 12
  AND title LIKE 'Lesson 12:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 13: Structured Peer Review

> Phase: Phase 4 — Improve and Strengthen

## Central Learning Focus

Students gather outside feedback through structured review rather than casual opinion-sharing.

## Student Learning Objectives

- present a prototype to peers
- collect targeted feedback on usefulness, clarity, and usability
- observe how others interpret the project

## Materials

- Peer review form
- testing protocol sheet
- observation notes

## Lesson Timing and Activities

### 0–10 min · Feedback
NormsReview how to give useful, respectful, evidence-based feedback.

### 10–25 min · Teacher
ModelingModel weak feedback vs strong feedback.

### 25–70 min · Peer Review
RotationsStudents review each other’s projects in small rounds.

### 70–85 min · Review
NotesStudents identify patterns across reviewers.

### 85–90 min · Reflection

## Expected Student Output

- peer feedback forms
- reviewer pattern summary

## Assessment

Did the student collect actionable feedback?
Can the student identify repeated confusion points or strengths?

## Teacher Notes

Students should ask reviewers to comment on clarity, usefulness, ease of navigation, and trustworthiness.
$lesson$
WHERE lesson_number = 13
  AND title LIKE 'Lesson 13:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 14: Turn Feedback into Revision Goals

> Phase: Phase 4 — Improve and Strengthen

## Central Learning Focus

Students convert feedback into specific revision priorities and a practical action plan.

## Student Learning Objectives

- sort feedback by importance
- identify must-fix vs nice-to-improve items
- write revision goals and prompts for the next build round

## Materials

- Revision plan template
- colored pens
- feedback sorting sheet

## Lesson Timing and Activities

### 0–10 min · Mini Lesson
Not every comment deserves equal weight.

### 10–35 min · Sort
FeedbackStudents cluster feedback into categories.

### 35–55 min · Choose
Revision PrioritiesStudents select 2–4 meaningful revisions.

### 55–75 min · Prompt /
Task WritingStudents turn revisions into build instructions.

### 75–90 min · Teacher
Review

## Expected Student Output

- revision plan
- revision prompt set v2

## Assessment

Are revision priorities realistic and strategic?
Does the student focus on improvements that strengthen overall project quality?

## Teacher Notes

Good revision discipline is one of the strongest signs of real project maturity.
$lesson$
WHERE lesson_number = 14
  AND title LIKE 'Lesson 14:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 15: CAS Build Sprint 2

> Phase: Phase 4 — Improve and Strengthen

## Central Learning Focus

Students implement their most important changes and create a stronger second version.

## Student Learning Objectives

- revise based on a plan rather than random changes
- compare version 1 and version 2
- strengthen the project’s core value or clarity

## Materials

- Devices
- build checklist
- change log
- revision plan

## Lesson Timing and Activities

### 0–10 min · Sprint
Goal ReviewStudents state the 2–4 improvements they will make.

### 10–20 min · Teacher
DemoModel how to revise one issue at a time.

### 20–65 min · Build
Sprint 2Students revise project logic, interface, copy, or features.

### 65–80 min · Compare
VersionsStudents document old vs new.

### 80–90 min · Reflection

## Expected Student Output

- prototype v2
- completed change log

## Assessment

Did the student make meaningful improvements, not just cosmetic changes?
Can the student explain why version 2 is stronger?

## Teacher Notes

Require students to describe improvement in terms of user experience, clarity, or goal alignment.
$lesson$
WHERE lesson_number = 15
  AND title LIKE 'Lesson 15:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 16: Token Strategy, AI Comparison, and Efficiency

> Phase: Phase 4 — Improve and Strengthen

## Central Learning Focus

Students build practical understanding of token usage, cost discipline, output comparison, and smart AI workflow habits.

## Student Learning Objectives

- explain why planning and clarity reduce waste
- compare AI outputs critically
- establish personal rules for efficient AI-assisted development

## Materials

- Token analogy worksheet
- AI comparison examples
- efficiency checklist

## Lesson Timing and Activities

### 0–10 min · Warm-Up
Where did you waste time or tokens in your last build round?

### 10–25 min · Mini Lesson
Teacher explains token efficiency, unnecessary prompt churn, and structured prompting.

### 25–45 min · AI
Comparison ActivityCompare different outputs for the same task.

### 45–65 min · Efficiency
AuditStudents analyze one of their own prompt chains.

### 65–80 min · Smart
Rules CardStudents write 5 personal AI efficiency rules.

### 80–90 min · Share-Out

## Expected Student Output

- token / efficiency reflection
- personal smart AI rules card

## Assessment

Can the student identify inefficient AI habits?
Can the student explain how to improve future prompt efficiency?

## Teacher Notes

This lesson helps students become more mature AI users and prepares them for independent post-course project work.
PHASE 5 – FINALIZE AND PRESENT
$lesson$
WHERE lesson_number = 16
  AND title LIKE 'Lesson 16:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 17: Strengthen Clarity, Feature Priorities, and UX

> Phase: Phase 5 — Finalize and Present

## Central Learning Focus

Students strengthen the project for first-time users or viewers by improving clarity, usability, and coherence.

## Student Learning Objectives

- improve the user-facing clarity of the project
- remove or de-emphasize weak features
- prepare the project for final demonstration

## Materials

- Final polish checklist
- UX review sheet
- devices

## Lesson Timing and Activities

### 0–10 min · Criteria
ReviewWhat makes a final project feel understandable and credible?

### 10–30 min · Self-
CheckStudents review their projects through a first-time user lens.

### 30–65 min · Final
Improvement BlockStudents revise key clarity, structure, or UX elements.

### 65–80 min · Retest
Quick retest with a partner.

### 80–90 min · Save
Final Build Candidate

## Expected Student Output

- final build candidate
- completed clarity / usability checklist

## Assessment

Can a first-time viewer understand the project quickly?
Does the project still align with the student’s original value proposition?

## Teacher Notes

Students often try to add instead of refine. Emphasize coherence over feature accumulation.
$lesson$
WHERE lesson_number = 17
  AND title LIKE 'Lesson 17:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 18: Build the Project Story

> Phase: Phase 5 — Finalize and Present

## Central Learning Focus

Students organize the logic of their journey so they can communicate their project clearly to parents, mentors, judges, or admissions readers.

## Student Learning Objectives

- explain the problem, audience, solution, and iterations
- create a clear project presentation structure
- frame the project as a meaningful process, not just a final artifact

## Materials

- Presentation template
- sample deck
- storytelling guide
- slide outline

## Lesson Timing and Activities

### 0–10 min · Teacher
ModelShow a strong project story structure.

### 10–25 min · Mini Lesson
Teach a simple 5-part structure: problem, user, solution, process, result.

### 25–60 min · Slide /
Poster BuildStudents begin building their presentation assets.

### 60–80 min · Partner
Explain-BackPeer listens and identifies unclear parts.

### 80–90 min · Revise
Storyline

## Expected Student Output

- project slide deck or presentation outline
- speaker notes draft

## Assessment

Can the student explain the project journey, not just show the final screen?
Does the presentation reveal real thinking and ownership?

## Teacher Notes

This lesson is highly relevant to college application value. The project becomes much stronger when the process is clearly articulated.
$lesson$
WHERE lesson_number = 18
  AND title LIKE 'Lesson 18:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 19: Rehearsal, Reflection, and Portfolio Framing

> Phase: Phase 5 — Finalize and Present

## Central Learning Focus

Students rehearse presentation delivery and begin framing how the project could appear in a portfolio, application, competition, or mentorship context.

## Student Learning Objectives

- present clearly and confidently
- reflect on what they learned and what they would improve next
- identify how the project could be described in future settings

## Materials

- Rehearsal rubric
- reflection sheet
- portfolio framing guide

## Lesson Timing and Activities

### 0–10 min · Rehearsal
Expectations

### 10–50 min · Presentation
RehearsalsStudents present in small groups.

### 50–70 min · Feedback
RoundPeers and teacher give focused presentation feedback.

### 70–80 min · Reflection
WritingStudents write what they learned, what changed, and what is still unfinished.

### 80–90 min · Portfolio
Framing PromptStudents draft 3–5 sentences explaining the project’s significance.

## Expected Student Output

- rehearsal feedback sheet
- reflection sheet
- short portfolio framing paragraph

## Assessment

Is the student able to present with clarity and logic?
Can the student reflect honestly on both strengths and limitations?

## Teacher Notes

Reflection is part of project maturity. Avoid scripting students into sounding artificial.
$lesson$
WHERE lesson_number = 19
  AND title LIKE 'Lesson 19:%';

UPDATE curriculum_assets
SET content_md = $lesson$# Lesson 20: Showcase and Mentor Review

> Phase: Phase 5 — Finalize and Present

## Central Learning Focus

Students present their final work, receive mentor-style feedback, and recognize the project as part of a larger growth journey.

## Student Learning Objectives

- present a finished or meaningfully advanced project
- explain the reasoning, process, and value behind the work
- receive final feedback and identify next steps

## Materials

- Showcase setup
- presentation equipment
- mentor review sheet
- certificate or completion sheet

## Lesson Timing and Activities

### 0–15 min · Setup
Students prepare devices, slides, and demo order.

### 15–50 min · Student
PresentationsStudents present their project story and demo.

### 50–75 min · Mentor /
Audience ReviewReviewers ask questions and give feedback.

### 75–85 min · Final
Reflection / Recognition

### 85–90 min · Closing
Students write one next step for continued development.

## Expected Student Output

- final presentation
- final demo
- mentor review notes
- next-step statement

## Assessment

Did the student present a coherent project with ownership?
Can the student explain what they built, why it matters, and what comes next?

## Teacher Notes

Not every project needs to be fully “finished.” A strong, meaningful, well-explained prototype can still be an excellent outcome.
10. Suggested Student Work Products
By the end of the program, each student should ideally have:
personal interest reflection
problem statement set
user persona
stakeholder map
context scenario
competitive analysis chart
value proposition statement
MVP plan
project prompt set
user flow diagram
wireframe or architecture plan
prototype v1
issue log
peer review notes
revision plan
prototype v2
efficiency / token reflection
final build candidate
presentation slides or poster
reflection and portfolio framing paragraph
11. Differentiation Suggestions
For Students Needing More Support
provide structured templates rather than blank pages
reduce scope more aggressively
provide sentence starters for problem statement and value proposition
allow verbal explanation before written formalization
use mentor checkpoints more frequently
focus on one strong workflow instead of multiple tools
For Students Ready for More Challenge
require stronger research depth
add user interviews or survey input
include more complex logic or multi-step workflows
require stronger documentation of tradeoffs and iteration
add competition or startup-style pitch framing
ask for a roadmap beyond version 1
12. Safety, Ethics, and Responsible AI Use
Teachers should explicitly address:
do not share private or sensitive personal data in prompts
do not copy another student’s project direction without permission
do not treat AI output as automatically correct or trustworthy
verify claims, logic, and generated code before adopting them
be honest about what was created by the student vs supported by AI
build projects that are ethical, respectful, and safe for users
avoid creating tools that are harmful, deceptive, invasive, or manipulative
Students should also understand that responsible AI use is part of project credibility. A mature project owner can explain both the power and the limitations of AI support.
13. Positioning Statement
This program helps students move beyond “using AI” into building with purpose.
Students do not simply generate content. They learn how to identify real problems, design meaningful solutions, prototype with structure, revise based on evidence, and present their work with clarity.
The result is not only a stronger project, but a stronger student creator — one who can think, build, explain, and improve.
14. Suggested Worksheet / Template Packet
The following printable or digital templates are recommended to align with the 20-lesson sequence:
Personal Interests and Goals Reflection
Problem Statement Sheet
User Persona Template
Stakeholder Map
Context-of-Use Scenario Sheet
Existing Solutions Comparison Chart
Value Proposition Template
Feature Dump and MVP Matrix
Prompt Builder Card
User Flow Diagram Sheet
Wireframe / Architecture Planning Page
Build Sprint Checklist
Bug / Issue Log
Peer Review Form
Revision Planning Sheet
Change Log Template
Token / Efficiency Reflection Sheet
Final Build Checklist
Project Story Presentation Template
Final Reflection and Portfolio Framing Sheet
15. Suggested Teacher Use of the Templates
Teachers may:
print as individual lesson handouts
combine into a student project workbook
turn into Google Docs / Slides / Sheets versions
use selected sheets only, depending on class level and student independence
require templates as checkpoint evidence before students move to the next build stage
Templates are especially useful for:
controlling scope
reducing wasted token usage
keeping student thinking visible
helping mentors give more structured feedback
16. Connection to Part 2
Part 1 is the core curriculum and lesson plan document. It explains what students are learning and what teachers are guiding in each lesson.
Part 2 should include the operational layer, such as:
mentor / instructor responsibilities
account and token management expectations
project checkpoint system
class pacing adjustments
sample rubrics
showcase logistics
post-program advisory / mentorship continuation model
guidance for supporting students building competition or college-application extensions
Part 1 Summary
The purpose of Part 1 is to ensure that the high school version of CAS is not treated like a casual enrichment class.
It is a serious project incubator that helps students:
think more deeply
build more strategically
use AI more intelligently
document more clearly
present more convincingly
That is what gives the final project stronger meaning — and stronger value for competitions, applications, portfolios, and future development.
$lesson$
WHERE lesson_number = 20
  AND title LIKE 'Lesson 20:%';
