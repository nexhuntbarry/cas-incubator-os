-- ============================================================
-- CAS Incubator OS — Migration 0007
-- Import Curriculum Part 1: 20 Lessons + Method Stage Enrichment + Worksheets
-- Source: curriculum-part1.docx + curriculum-part1-worksheets.docx
-- Generated: 2026-04-20
-- Idempotent: safe to run multiple times
-- ============================================================

-- ── 1. INSERT program (if not exists) ────────────────────────

INSERT INTO programs (
  name,
  description,
  duration_weeks,
  settings,
  is_active
)
SELECT
  $$CAS Incubator — High School Project Incubator (Part 1)$$,
  $$This program is the core teaching portion of the CAS High School Project Incubator. Designed for high school students, it guides learners through 20 lessons spanning 30 total hours across five phases: Discover and Define, Research and Scope, Plan and Prototype, Improve and Strengthen, and Finalize and Present. Students move from a vague idea to a polished, portfolio-quality project prototype using design thinking, AI-assisted development, structured iteration, and presentation skills. The goal is not only to help students make something, but to help them develop a project with stronger academic, portfolio, competition, and college application value.$$,
  -- 20 lessons × 1.5h = 30h; at ~1–2 lessons/week ≈ 10–20 weeks; store as 10
  10,
  $${
    "audience": "High school students",
    "total_lessons": 20,
    "total_hours": 30,
    "lesson_format": "20 lessons x 1.5 hours each",
    "class_type": "Project-based studio / incubator format",
    "recommended_class_size": "6-12 students",
    "ai_use_model": "Students use their own AI accounts and their own token usage",
    "expected_outcome": "One meaningful project prototype with process documentation and presentation assets",
    "source_document": "curriculum-part1.docx"
  }$$::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM programs
  WHERE name = $$CAS Incubator — High School Project Incubator (Part 1)$$
);


-- ── 2. UPDATE method_stage_definitions (enrich all 10 stages) ─

UPDATE method_stage_definitions SET
  description = $$Students explore their personal interests, passions, academic subjects, clubs, causes, hobbies, and future directions. The goal is to identify a broad area they care enough about to sustain a multi-week project. Students map where their interests intersect with real-world opportunities, generating several project directions before committing to one. This stage prioritises genuine personal motivation over random topic selection, since a project tied to real student interest is more defensible and more sustainable across the program.$$,
  expected_outputs_json = $$[
    "Personal interest map listing topics, problems, communities, or fields the student cares about",
    "Opportunity areas map connecting interests to potential project themes",
    "Top 3 project directions ranked by personal relevance and opportunity",
    "Reflection on academic strengths, activities, and bigger goals (college, competition, portfolio)"
  ]$$::jsonb,
  guiding_questions = $$[
    "What topics do you find yourself reading about without being asked?",
    "What school subjects, clubs, or causes energise you most?",
    "Where do your interests overlap with problems worth solving?",
    "Which project direction feels most meaningful to you — and why?",
    "If you had unlimited time and resources, what would you build or fix?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 1;

UPDATE method_stage_definitions SET
  description = $$Students narrow from a broad interest to a specific, concrete problem worth solving. They learn that stronger projects solve a real problem, improve a genuine experience, or address an authentic need — not just implement a cool feature. Students practice moving from "I want to build X" to "I want to help Y solve Z," drafting clear problem statements and identifying who is affected and why the problem matters. Evidence of a real need is prioritised over assumptions.$$,
  expected_outputs_json = $$[
    "List of problem areas observed in school, daily life, clubs, or society",
    "2-3 draft problem statements in the format: I want to design a project for [user] who struggles with [need] so that they can [outcome]",
    "Explanation of why the chosen problem matters and who is affected",
    "Identification of why existing approaches fall short"
  ]$$::jsonb,
  guiding_questions = $$[
    "What kinds of experiences feel inefficient, confusing, or frustrating to you or people you know?",
    "Who is suffering from this problem and how often?",
    "What happens if this problem is never solved?",
    "Can you restate the problem from the user's point of view?",
    "Is this a real need, or just an interesting idea?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 2;

UPDATE method_stage_definitions SET
  description = $$Students define who their project is actually for — a specific primary user whose problem the project will address. They create a detailed user persona and map out stakeholders beyond the main user, as well as the context and setting in which the project would be used. Vague users like "everyone" are not acceptable; the clearer the user definition, the stronger the project direction. Students also write a realistic use-case scenario to ground their design in a real situation.$$,
  expected_outputs_json = $$[
    "User persona card with name, age, role, context, goals, frustrations, and current workarounds",
    "At least one realistic quote the target user might say",
    "Stakeholder map identifying other people affected by the project (parents, teachers, schools, community)",
    "Use-case scenario (3-5 sentences showing how a user would experience the project)"
  ]$$::jsonb,
  guiding_questions = $$[
    "Who would benefit most from solving this problem?",
    "What does a day in this person's life look like?",
    "Where and when would they use this project?",
    "Who else is affected beyond the primary user?",
    "What do they already try to do to solve this problem?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 3;

UPDATE method_stage_definitions SET
  description = $$Students research what already exists to address their problem — tools, apps, workflows, programs, or informal solutions. The goal is to avoid building something redundant or superficial by genuinely understanding the competitive landscape. Students analyse strengths and weaknesses of current solutions and identify meaningful gaps or improvement opportunities. Honest research is required: students do not need a completely original topic, but they do need a clear angle or value.$$,
  expected_outputs_json = $$[
    "List of 2-4 existing solutions or comparable models",
    "Comparison chart evaluating each by user value, clarity, usability, accessibility, cost, and limitations",
    "Gap summary identifying what is missing or weak in current solutions",
    "Insight statement explaining why the student's project may add value"
  ]$$::jsonb,
  guiding_questions = $$[
    "What tools or services do people already use for this problem?",
    "Why haven't existing solutions fully solved the problem?",
    "What is the biggest weakness of the best current solution?",
    "What can you learn from what has been tried before?",
    "Which weakness is most interesting for your project to address?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 4;

UPDATE method_stage_definitions SET
  description = $$Students articulate what makes their approach uniquely valuable. They craft a value proposition statement that connects their solution clearly to their target user's unmet need, stating what the project does, for whom, and why it matters. If a student cannot explain the project in one clear sentence, the project concept is not yet strong enough. Students practice a simple positioning formula — For [user], who needs [problem solved], this project helps [result] by [approach] — and refine it through peer feedback.$$,
  expected_outputs_json = $$[
    "One-sentence value proposition / positioning statement",
    "Description of who the project is for, the main problem it addresses, the value it creates, and how it differs from existing solutions",
    "3-4 sentence elevator pitch",
    "Revised and peer-tested clarity of the project concept"
  ]$$::jsonb,
  guiding_questions = $$[
    "What will your solution do that nothing else does?",
    "Why would your target user choose your solution over what they use now?",
    "What is the one thing your solution must do really well?",
    "Can you explain your project clearly in one sentence?",
    "Does your statement identify a clear user and a clear benefit?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 5;

UPDATE method_stage_definitions SET
  description = $$Students learn how to reduce a broad idea into a manageable first version with realistic deliverables — the Minimum Viable Product. They practice cutting scope ruthlessly: listing all desired features, then sorting them into must-have, helpful-but-not-required, later, and not-now categories. This stage often determines whether a project becomes polished or stays permanently unfinished. The MVP hypothesis defines what the first build must clearly demonstrate, and success criteria are defined before building begins.$$,
  expected_outputs_json = $$[
    "Full feature dump listing all possible features, pages, workflows, or functions",
    "Prioritised MVP matrix sorted into must-have, helpful but not required, later, and not-now",
    "One-sentence MVP definition: the first build will be successful if it can clearly show [X]",
    "Realistic assessment of what is achievable within the program timeline"
  ]$$::jsonb,
  guiding_questions = $$[
    "What is the single most important thing your MVP must do?",
    "Which features can wait until after the first user test?",
    "What assumption are you testing with this MVP?",
    "Does the project still demonstrate clear value after being narrowed?",
    "Is the first version realistic given your time and skills?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 6;

UPDATE method_stage_definitions SET
  description = $$Students create a structured build plan that bridges ideation and execution: user flow diagrams, wireframes or architecture plans, task lists, tool choices, and annotated build notes. They map how the user will move through the product and what sequence of actions the system must support, identifying decision points and potential friction. Wireframes remain low-fidelity — the purpose is clarity, not polished design. This stage also includes prompting strategy: students learn to write project prompts with role, context, constraints, and desired output.$$,
  expected_outputs_json = $$[
    "User flow diagram showing entry point, key steps, decision branches, and final outcome",
    "Low-fidelity wireframe or architecture plan identifying major screens, modules, or components",
    "Annotated build notes connecting structure to MVP priorities",
    "Project prompt set (2-3 prompts) for first AI-assisted build round",
    "Task list broken into build targets with clear goals per session"
  ]$$::jsonb,
  guiding_questions = $$[
    "How does the user move from entry to a successful outcome?",
    "What are the most important decision points in the flow?",
    "Which parts of the project need to be visible to the user?",
    "What needs to happen in the first build session to stay on track?",
    "What could go wrong, and how will you handle it?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 7;

UPDATE method_stage_definitions SET
  description = $$Students build their first working prototype — a tangible, testable artifact that demonstrates the core value proposition. This may be a coded application, a workflow built with AI tools, a mockup, or a functional process depending on project type. The focus is on momentum and documentation, not visual polish. Students are expected to translate planning materials into build instructions, use AI tools strategically for generation and debugging, maintain a change log, and document what works and what remains incomplete after the sprint.$$,
  expected_outputs_json = $$[
    "Working prototype v1 (link, file, demo, or photos) demonstrating the core function",
    "Build log recording key decisions made during construction",
    "Change log entry tracking what was attempted and what resulted",
    "Self-test notes identifying what works, what is incomplete, and what surprised the student",
    "Known limitations of the current prototype"
  ]$$::jsonb,
  guiding_questions = $$[
    "Does your prototype demonstrate the core value proposition?",
    "What shortcuts did you take, and are they acceptable for now?",
    "What would a user actually do first when they see this?",
    "Did the student produce a first build attempt and document it?",
    "Can the student identify what matches and does not match the plan?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 8;

UPDATE method_stage_definitions SET
  description = $$Students conduct structured peer reviews and self-tests, gather targeted feedback on usefulness, clarity, and usability, and turn that feedback into a concrete revision plan. They learn to distinguish between bug, missing feature, and unclear design — and to prioritise fixes by impact on user experience and project credibility. Good revision discipline is one of the strongest signs of real project maturity. Students implement their most important changes in a second build sprint and document before-and-after comparisons.$$,
  expected_outputs_json = $$[
    "Peer review forms with feedback on clarity, usefulness, ease of navigation, and trustworthiness",
    "Issue log with specific descriptions of bugs, missing features, and UX problems",
    "Top 3-5 priority fixes ranked by severity and user impact",
    "Revision plan turning feedback into actionable build instructions",
    "Prototype v2 with completed change log comparing old vs new",
    "Description of why version 2 is stronger in terms of user experience or goal alignment"
  ]$$::jsonb,
  guiding_questions = $$[
    "What surprised you most about how users or peers reacted?",
    "Which feedback will you act on, and which will you ignore — and why?",
    "What does your prototype do better now than before testing?",
    "Are revision priorities realistic and strategic?",
    "Did the student make meaningful improvements, not just cosmetic changes?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 9;

UPDATE method_stage_definitions SET
  description = $$Students craft the narrative of their project journey — from spark to solution — and prepare to present their work clearly to parents, mentors, peers, judges, or admissions readers. They learn a five-part presentation structure: problem, user, solution, process, and result. The presentation should reveal real thinking and ownership, not just show the final screen. Students also rehearse delivery, reflect on what they learned, and frame the project in portfolio, competition, or college application terms.$$,
  expected_outputs_json = $$[
    "Project slide deck or presentation outline with speaker notes",
    "Five-part story structure: problem I designed for, user I had in mind, solution / project idea, what I built and improved, why this project matters",
    "Rehearsal feedback sheet from peers or teacher",
    "Final reflection covering what was learned about AI-assisted building, design thinking, and personal working style",
    "4-6 sentence portfolio framing paragraph suitable for college, competition, or portfolio use",
    "One next step for continued development beyond the program"
  ]$$::jsonb,
  guiding_questions = $$[
    "What was the hardest moment in this project, and how did you get through it?",
    "Can the student explain the project journey, not just show the final screen?",
    "Does the presentation reveal real thinking and ownership?",
    "What would you tell a younger student starting a project like yours?",
    "What did you learn about yourself as a builder?",
    "How would you describe this project in a college application or portfolio?"
  ]$$::jsonb,
  updated_at = NOW()
WHERE stage_number = 10;


-- ── 3. INSERT curriculum_assets (20 lessons) ─────────────────
-- Uses a CTE to look up program_id by name, then inserts all 20 lessons.
-- ON CONFLICT DO NOTHING — safe to re-run (no unique constraint exists on
-- lesson_number + program_id, so we guard with NOT EXISTS per lesson).

DO $$
DECLARE
  v_program_id UUID;
BEGIN
  SELECT id INTO v_program_id
  FROM programs
  WHERE name = 'CAS Incubator — High School Project Incubator (Part 1)'
  LIMIT 1;

  IF v_program_id IS NULL THEN
    RAISE EXCEPTION 'Program not found — ensure the INSERT above ran successfully.';
  END IF;

  -- Lesson 1
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 1,
    'Lesson 1: Program Launch — What Makes a Strong Project?',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students are introduced to the course challenge, the difference between a random idea and a meaningful project, and the overall expectation that they will build something with real purpose and ownership.',
    $${
      "phase": 1,
      "student_objectives": [
        "Describe the overall goal of the program",
        "Explain the difference between an idea, a project, and a portfolio-quality outcome",
        "Identify qualities of a strong student project"
      ],
      "materials": ["Slides", "projector", "sample student-style projects", "reflection sheet", "notebook"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Welcome and Framing", "description": "Introduce the course structure, expectations, and final showcase outcome."},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains what makes a project valuable: purpose, user, evidence, execution, and communication."},
        {"min_range": "25-45", "activity_name": "Example Analysis", "description": "Students review 2-3 sample project types and discuss which feels stronger and why."},
        {"min_range": "45-65", "activity_name": "Personal Reflection", "description": "Students complete a reflection on interests, strengths, and why they may want to build something."},
        {"min_range": "65-80", "activity_name": "Discussion", "description": "Students share project types they admire or would be excited to pursue."},
        {"min_range": "80-90", "activity_name": "Exit Ticket", "description": "Students write: A strong project is more than just ___ because ___."}
      ],
      "expected_output": "First reflection sheet and exit ticket",
      "assessment_questions": [
        "Can the student describe what gives a project value beyond appearance?",
        "Does the student understand that this course is outcome-based, not only activity-based?"
      ],
      "teacher_notes": "Do not let students rush into tools immediately. Set the standard that meaningful projects start with logic, not just excitement."
    }$$::jsonb,
    1, false, 1, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 1
  );

  -- Lesson 2
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 2,
    'Lesson 2: Design Thinking and Finding a Real Problem',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students learn that stronger projects solve a real problem, improve an experience, or address a genuine need.',
    $${
      "phase": 1,
      "student_objectives": [
        "Understand the concept of user-centered problem solving",
        "Identify problem areas worth exploring",
        "Draft a first problem statement"
      ],
      "materials": ["Problem statement worksheet", "sticky notes", "board", "sample problem prompts"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Warm-Up", "description": "What kinds of school, life, club, learning, or social experiences feel inefficient, confusing, or frustrating?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher introduces design thinking in a project context."},
        {"min_range": "25-45", "activity_name": "Brainstorm Wall", "description": "Students list problems or needs they have noticed."},
        {"min_range": "45-65", "activity_name": "Cluster and Sort", "description": "Problems are grouped by themes such as education, productivity, wellness, accessibility, events, research, or communication."},
        {"min_range": "65-80", "activity_name": "Personal Drafting", "description": "Students write 2-3 problem statements."},
        {"min_range": "80-90", "activity_name": "Share-Out", "description": "Quick peer reaction on whether each problem sounds real, useful, and meaningful."}
      ],
      "expected_output": "List of problem areas and 2-3 draft problem statements",
      "assessment_questions": [
        "Does the student identify a real need instead of a random feature?",
        "Can the student explain who is affected by the problem?"
      ],
      "teacher_notes": "Push students from I want to build X toward I want to help Y solve Z."
    }$$::jsonb,
    2, false, 2, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 2
  );

  -- Lesson 3
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 1,
    'Lesson 3: Interest Mapping and Opportunity Areas',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students connect personal interests, academic goals, competitions, and future directions to possible project themes.',
    $${
      "phase": 1,
      "student_objectives": [
        "Map interests to project opportunities",
        "Identify where passion and usefulness overlap",
        "Generate several project directions before choosing one"
      ],
      "materials": ["Interest map sheet", "opportunity matrix", "markers"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Review", "description": "Revisit problem statements from Lesson 2."},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains why strong projects often sit at the intersection of interest, skill, and real need."},
        {"min_range": "25-50", "activity_name": "Mapping Activity", "description": "Students map interests: school subjects, clubs, causes, hobbies, future majors, competitions."},
        {"min_range": "50-70", "activity_name": "Opportunity Matching", "description": "Students connect interest categories with user problems."},
        {"min_range": "70-85", "activity_name": "Narrowing Round", "description": "Students select their top 3 project directions."},
        {"min_range": "85-90", "activity_name": "Exit Reflection", "description": "Brief written reflection on chosen directions."}
      ],
      "expected_output": "Interest and opportunity map plus top 3 project directions",
      "assessment_questions": [
        "Are project ideas linked to real student interest or longer-term goals?",
        "Can the student explain why a direction matters to them?"
      ],
      "teacher_notes": "This lesson is important for college-application value. A project tied to genuine interest is more defensible and more sustainable."
    }$$::jsonb,
    3, false, 3, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 3
  );

  -- Lesson 4
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 3,
    'Lesson 4: User, Stakeholder, and Context Definition',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students define who their project is for, who is affected, and in what context the project would be used.',
    $${
      "phase": 1,
      "student_objectives": [
        "Define a primary user",
        "Identify stakeholders beyond the main user",
        "Describe context of use"
      ],
      "materials": ["Persona template", "stakeholder map", "context-of-use worksheet"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Warm-Up", "description": "Who exactly is your project helping?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains users vs stakeholders vs decision makers."},
        {"min_range": "25-50", "activity_name": "Persona Drafting", "description": "Students create a detailed user persona."},
        {"min_range": "50-70", "activity_name": "Stakeholder Mapping", "description": "Students identify additional people affected by the solution."},
        {"min_range": "70-85", "activity_name": "Context Scenario", "description": "Students write a brief use-case scenario."},
        {"min_range": "85-90", "activity_name": "Share", "description": "Quick share-out of personas and scenarios."}
      ],
      "expected_output": "User persona, stakeholder map, and use-case scenario",
      "assessment_questions": [
        "Is the target user clearly defined?",
        "Does the student understand where and how the project would be used?"
      ],
      "teacher_notes": "A vague user leads to a vague project. Do not allow everyone as a target audience."
    }$$::jsonb,
    4, false, 4, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 4
  );

  -- Lesson 5
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 4,
    'Lesson 5: Existing Solutions and Competitive Landscape',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students study what already exists so they can avoid making something redundant or superficial.',
    $${
      "phase": 2,
      "student_objectives": [
        "Identify existing tools, apps, workflows, or programs related to their idea",
        "Analyze strengths and weaknesses of current solutions",
        "Identify possible gaps or improvement opportunities"
      ],
      "materials": ["Competitive analysis sheet", "laptops", "research template"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Research Framing", "description": "Why it matters to know what already exists."},
        {"min_range": "10-25", "activity_name": "Teacher Modeling", "description": "Teacher demonstrates how to compare existing solutions."},
        {"min_range": "25-60", "activity_name": "Student Research Block", "description": "Students identify 2-4 existing solutions or comparable models."},
        {"min_range": "60-75", "activity_name": "Compare and Rank", "description": "Students compare by user value, clarity, usability, accessibility, cost, or limitations."},
        {"min_range": "75-90", "activity_name": "Gap Summary", "description": "Students summarize what is missing in current solutions."}
      ],
      "expected_output": "Competitor / existing solution comparison chart and gap statement",
      "assessment_questions": [
        "Can the student identify a meaningful difference between existing solutions?",
        "Does the student see where their project might add value?"
      ],
      "teacher_notes": "Encourage honest research. Students do not need a completely original topic, but they do need a clear angle or value."
    }$$::jsonb,
    5, false, 5, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 5
  );

  -- Lesson 6
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 5,
    'Lesson 6: Value Proposition and Project Positioning',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students learn how to clearly state what their project does, for whom, and why it matters.',
    $${
      "phase": 2,
      "student_objectives": [
        "Write a concise project positioning statement",
        "Articulate core value clearly",
        "Connect value to user need and outcome"
      ],
      "materials": ["Positioning statement template", "examples", "revision sheet"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Warm-Up", "description": "If you had one sentence to explain your project, what would you say?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher introduces the structure: For [user], who needs [problem solved], this project helps [result] by [approach]."},
        {"min_range": "25-50", "activity_name": "Drafting Round", "description": "Students write first positioning statements."},
        {"min_range": "50-70", "activity_name": "Pair Feedback", "description": "Peers test whether the statement is clear and specific."},
        {"min_range": "70-85", "activity_name": "Revision", "description": "Students improve clarity, specificity, and realism."},
        {"min_range": "85-90", "activity_name": "Exit Ticket", "description": "Final revised positioning statement submitted."}
      ],
      "expected_output": "Project positioning statement v1 and value proposition draft",
      "assessment_questions": [
        "Can the student explain the project without rambling?",
        "Does the statement identify a clear user and benefit?"
      ],
      "teacher_notes": "If a student cannot explain the project clearly, the project is not yet conceptually strong enough."
    }$$::jsonb,
    6, false, 6, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 6
  );

  -- Lesson 7
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 6,
    'Lesson 7: From Big Idea to MVP',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students learn how to reduce a broad idea into a manageable first version with realistic deliverables.',
    $${
      "phase": 2,
      "student_objectives": [
        "Understand the meaning of MVP",
        "Separate essential features from optional features",
        "Define what success for version 1 looks like"
      ],
      "materials": ["MVP planning sheet", "feature priority matrix", "markers"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Mini Discussion", "description": "Why do student projects fail? Common answer: too big, too many features, no priority."},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains MVP using startup and product examples."},
        {"min_range": "25-55", "activity_name": "Feature Dump", "description": "Students list all desired features."},
        {"min_range": "55-75", "activity_name": "Prioritization Round", "description": "Students sort features into must-have, helpful, later, and not-now."},
        {"min_range": "75-90", "activity_name": "MVP Summary", "description": "Students define their first build target."}
      ],
      "expected_output": "Feature list and prioritized MVP plan",
      "assessment_questions": [
        "Is the student's first version realistic for the program timeline?",
        "Does the project still clearly demonstrate value even after being narrowed?"
      ],
      "teacher_notes": "This lesson often determines whether a project can become polished or stay permanently unfinished."
    }$$::jsonb,
    7, false, 7, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 7
  );

  -- Lesson 8
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 7,
    'Lesson 8: Prompting for Serious Project Work',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students learn how to prompt AI for planning, logic, feature design, research structuring, and prototype support.',
    $${
      "phase": 2,
      "student_objectives": [
        "Identify qualities of strong project prompts",
        "Write prompts with context, constraints, and goals",
        "Distinguish between vague prompting and productive prompting"
      ],
      "materials": ["Prompt comparison sheet", "prompt framework card", "bad-vs-good examples"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Prompt Guessing Game", "description": "Which prompt is more likely to produce a useful project result?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains prompt components: role, context, user, task, constraints, format."},
        {"min_range": "25-45", "activity_name": "Rewrite Practice", "description": "Students improve weak prompts."},
        {"min_range": "45-65", "activity_name": "Teacher Demo", "description": "Compare outputs from weak and strong prompts."},
        {"min_range": "65-80", "activity_name": "Project Prompt Drafting", "description": "Students write 2-3 prompts related to their own project."},
        {"min_range": "80-90", "activity_name": "Peer Review", "description": "Peer review of draft prompts."}
      ],
      "expected_output": "Improved prompt examples and project prompt set v1",
      "assessment_questions": [
        "Does the student's prompt include clear task framing?",
        "Can the student explain why one prompt is more useful than another?"
      ],
      "teacher_notes": "High school students can handle more open-ended prompting than younger students, but they still need structure if you want strong outcomes."
    }$$::jsonb,
    8, false, 8, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 8
  );

  -- Lesson 9
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 7,
    'Lesson 9: User Flow and System Logic',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students design how the user will move through the product and what sequence of actions or decisions the system must support.',
    $${
      "phase": 3,
      "student_objectives": [
        "Map user flow from entry to outcome",
        "Identify decision points and bottlenecks",
        "Turn concept into sequence logic"
      ],
      "materials": ["Flowchart template", "sample user flow", "sticky arrows"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Review MVP", "description": "Students restate the core function of their project."},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains user flow, friction points, and logic pathways."},
        {"min_range": "25-55", "activity_name": "Student Mapping Time", "description": "Students create a user flow for their project."},
        {"min_range": "55-75", "activity_name": "Partner Walkthrough", "description": "Peers test whether the sequence makes sense."},
        {"min_range": "75-90", "activity_name": "Revision and Annotation", "description": "Students revise and annotate their flows."}
      ],
      "expected_output": "User flow diagram and sequence notes",
      "assessment_questions": [
        "Can another person understand how the project works from the flow?",
        "Does the sequence support the stated user goal?"
      ],
      "teacher_notes": "Students often realize here that their ideas are not as clear as they thought. That is productive."
    }$$::jsonb,
    9, false, 9, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 9
  );

  -- Lesson 10
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 7,
    'Lesson 10: Wireframe / Architecture Planning',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students convert project logic into interface structure, workflow structure, or system architecture.',
    $${
      "phase": 3,
      "student_objectives": [
        "Create a low-fidelity wireframe or architecture sketch",
        "Identify major screens, modules, or project components",
        "Align structure with user flow and MVP priorities"
      ],
      "materials": ["Wireframe templates", "architecture planning sheet", "pencils or digital whiteboard"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Mini Reflection", "description": "Which parts of your project need to be visible to the user?"},
        {"min_range": "10-25", "activity_name": "Teacher Modeling", "description": "Sample wireframe / module structure walkthrough."},
        {"min_range": "25-60", "activity_name": "Student Work Time", "description": "Students create wireframes or architecture diagrams."},
        {"min_range": "60-75", "activity_name": "Explain-Back Round", "description": "Partners explain each other's projects based on the plan."},
        {"min_range": "75-90", "activity_name": "Add Notes for Build Sprint", "description": "Students annotate plans with build notes."}
      ],
      "expected_output": "Wireframe or architecture plan and annotated build notes",
      "assessment_questions": [
        "Are essential screens or modules identified?",
        "Can the student explain how the structure supports the MVP?"
      ],
      "teacher_notes": "This should remain low fidelity. The purpose is clarity, not polished design."
    }$$::jsonb,
    10, false, 10, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 10
  );

  -- Lesson 11
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 8,
    'Lesson 11: CAS Build Sprint 1',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students begin converting their plan into a first working prototype, assisted by CAS and their own AI workflows.',
    $${
      "phase": 3,
      "student_objectives": [
        "Translate planning materials into build instructions",
        "Complete a first generation or first structured version",
        "Document what works and what is incomplete"
      ],
      "materials": ["Devices", "CAS workflow access", "build checklist", "change log template"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Setup", "description": "Students prepare assets, prompts, notes, and build targets."},
        {"min_range": "10-20", "activity_name": "Teacher Demo", "description": "Demonstrate a clean first-generation workflow."},
        {"min_range": "20-65", "activity_name": "Build Sprint", "description": "Students complete first build generation or first prototype assembly."},
        {"min_range": "65-80", "activity_name": "Self-Test", "description": "Students run through the output and document issues."},
        {"min_range": "80-90", "activity_name": "Quick Reflection", "description": "Brief reflection on sprint progress."}
      ],
      "expected_output": "Prototype v1 or first functional build attempt and initial change log entry",
      "assessment_questions": [
        "Did the student produce a first build attempt?",
        "Can the student identify what matches and does not match the plan?"
      ],
      "teacher_notes": "This lesson is about momentum, not perfection. Ensure students document progress rather than only chasing visual impressiveness."
    }$$::jsonb,
    11, false, 11, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 11
  );

  -- Lesson 12
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 8,
    'Lesson 12: Self-Test, Debug, and Diagnose',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students learn how to identify bugs, logic gaps, UX problems, and incomplete features in their own work.',
    $${
      "phase": 3,
      "student_objectives": [
        "Distinguish between bug, missing feature, and unclear design",
        "Document issues specifically",
        "Prioritize what to fix first"
      ],
      "materials": ["Testing checklist", "issue log", "bug category sheet"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Mini Lesson", "description": "What counts as a bug? What counts as a design issue? What counts as scope drift?"},
        {"min_range": "10-35", "activity_name": "Individual Testing", "description": "Students test their own prototype using a checklist."},
        {"min_range": "35-60", "activity_name": "Guided Diagnostic Review", "description": "Teacher circulates and helps categorize issues."},
        {"min_range": "60-80", "activity_name": "Prioritization", "description": "Students rank top issues by severity and importance."},
        {"min_range": "80-90", "activity_name": "Fix Plan Draft", "description": "Students draft a plan for addressing top priority issues."}
      ],
      "expected_output": "Issue log and top 3-5 priority fixes",
      "assessment_questions": [
        "Can the student name specific issues instead of vague frustration?",
        "Does the student prioritize intelligently?"
      ],
      "teacher_notes": "Students often want to fix everything. Force them to identify what most affects user experience and project credibility."
    }$$::jsonb,
    12, false, 12, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 12
  );

  -- Lesson 13
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 9,
    'Lesson 13: Structured Peer Review',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students gather outside feedback through structured review rather than casual opinion-sharing.',
    $${
      "phase": 4,
      "student_objectives": [
        "Present a prototype to peers",
        "Collect targeted feedback on usefulness, clarity, and usability",
        "Observe how others interpret the project"
      ],
      "materials": ["Peer review form", "testing protocol sheet", "observation notes"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Feedback Norms", "description": "Review how to give useful, respectful, evidence-based feedback."},
        {"min_range": "10-25", "activity_name": "Teacher Modeling", "description": "Model weak feedback vs strong feedback."},
        {"min_range": "25-70", "activity_name": "Peer Review Rotations", "description": "Students review each other's projects in small rounds."},
        {"min_range": "70-85", "activity_name": "Review Notes", "description": "Students identify patterns across reviewers."},
        {"min_range": "85-90", "activity_name": "Reflection", "description": "Brief reflection on what the feedback revealed."}
      ],
      "expected_output": "Peer feedback forms and reviewer pattern summary",
      "assessment_questions": [
        "Did the student collect actionable feedback?",
        "Can the student identify repeated confusion points or strengths?"
      ],
      "teacher_notes": "Students should ask reviewers to comment on clarity, usefulness, ease of navigation, and trustworthiness."
    }$$::jsonb,
    13, false, 13, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 13
  );

  -- Lesson 14
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 9,
    'Lesson 14: Turn Feedback into Revision Goals',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students convert feedback into specific revision priorities and a practical action plan.',
    $${
      "phase": 4,
      "student_objectives": [
        "Sort feedback by importance",
        "Identify must-fix vs nice-to-improve items",
        "Write revision goals and prompts for the next build round"
      ],
      "materials": ["Revision plan template", "colored pens", "feedback sorting sheet"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Mini Lesson", "description": "Not every comment deserves equal weight."},
        {"min_range": "10-35", "activity_name": "Sort Feedback", "description": "Students cluster feedback into categories."},
        {"min_range": "35-55", "activity_name": "Choose Revision Priorities", "description": "Students select 2-4 meaningful revisions."},
        {"min_range": "55-75", "activity_name": "Prompt / Task Writing", "description": "Students turn revisions into build instructions."},
        {"min_range": "75-90", "activity_name": "Teacher Review", "description": "Teacher reviews revision plans with each student."}
      ],
      "expected_output": "Revision plan and revision prompt set v2",
      "assessment_questions": [
        "Are revision priorities realistic and strategic?",
        "Does the student focus on improvements that strengthen overall project quality?"
      ],
      "teacher_notes": "Good revision discipline is one of the strongest signs of real project maturity."
    }$$::jsonb,
    14, false, 14, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 14
  );

  -- Lesson 15
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 9,
    'Lesson 15: CAS Build Sprint 2',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students implement their most important changes and create a stronger second version.',
    $${
      "phase": 4,
      "student_objectives": [
        "Revise based on a plan rather than random changes",
        "Compare version 1 and version 2",
        "Strengthen the project's core value or clarity"
      ],
      "materials": ["Devices", "build checklist", "change log", "revision plan"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Sprint Goal Review", "description": "Students state the 2-4 improvements they will make."},
        {"min_range": "10-20", "activity_name": "Teacher Demo", "description": "Model how to revise one issue at a time."},
        {"min_range": "20-65", "activity_name": "Build Sprint 2", "description": "Students revise project logic, interface, copy, or features."},
        {"min_range": "65-80", "activity_name": "Compare Versions", "description": "Students document old vs new."},
        {"min_range": "80-90", "activity_name": "Reflection", "description": "Brief reflection on what improved."}
      ],
      "expected_output": "Prototype v2 and completed change log",
      "assessment_questions": [
        "Did the student make meaningful improvements, not just cosmetic changes?",
        "Can the student explain why version 2 is stronger?"
      ],
      "teacher_notes": "Require students to describe improvement in terms of user experience, clarity, or goal alignment."
    }$$::jsonb,
    15, false, 15, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 15
  );

  -- Lesson 16
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 9,
    'Lesson 16: Token Strategy, AI Comparison, and Efficiency',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students build practical understanding of token usage, cost discipline, output comparison, and smart AI workflow habits.',
    $${
      "phase": 4,
      "student_objectives": [
        "Explain why planning and clarity reduce waste",
        "Compare AI outputs critically",
        "Establish personal rules for efficient AI-assisted development"
      ],
      "materials": ["Token analogy worksheet", "AI comparison examples", "efficiency checklist"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Warm-Up", "description": "Where did you waste time or tokens in your last build round?"},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teacher explains token efficiency, unnecessary prompt churn, and structured prompting."},
        {"min_range": "25-45", "activity_name": "AI Comparison Activity", "description": "Compare different outputs for the same task."},
        {"min_range": "45-65", "activity_name": "Efficiency Audit", "description": "Students analyze one of their own prompt chains."},
        {"min_range": "65-80", "activity_name": "Smart Rules Card", "description": "Students write 5 personal AI efficiency rules."},
        {"min_range": "80-90", "activity_name": "Share-Out", "description": "Share rules with the class."}
      ],
      "expected_output": "Token / efficiency reflection and personal smart AI rules card",
      "assessment_questions": [
        "Can the student identify inefficient AI habits?",
        "Can the student explain how to improve future prompt efficiency?"
      ],
      "teacher_notes": "This lesson helps students become more mature AI users and prepares them for independent post-course project work."
    }$$::jsonb,
    16, false, 16, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 16
  );

  -- Lesson 17
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 9,
    'Lesson 17: Strengthen Clarity, Feature Priorities, and UX',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students strengthen the project for first-time users or viewers by improving clarity, usability, and coherence.',
    $${
      "phase": 5,
      "student_objectives": [
        "Improve the user-facing clarity of the project",
        "Remove or de-emphasize weak features",
        "Prepare the project for final demonstration"
      ],
      "materials": ["Final polish checklist", "UX review sheet", "devices"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Criteria Review", "description": "What makes a final project feel understandable and credible?"},
        {"min_range": "10-30", "activity_name": "Self-Check", "description": "Students review their projects through a first-time user lens."},
        {"min_range": "30-65", "activity_name": "Final Improvement Block", "description": "Students revise key clarity, structure, or UX elements."},
        {"min_range": "65-80", "activity_name": "Retest", "description": "Quick retest with a partner."},
        {"min_range": "80-90", "activity_name": "Save Final Build Candidate", "description": "Students save and label their final build candidate."}
      ],
      "expected_output": "Final build candidate and completed clarity / usability checklist",
      "assessment_questions": [
        "Can a first-time viewer understand the project quickly?",
        "Does the project still align with the student's original value proposition?"
      ],
      "teacher_notes": "Students often try to add instead of refine. Emphasize coherence over feature accumulation."
    }$$::jsonb,
    17, false, 17, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 17
  );

  -- Lesson 18
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 10,
    'Lesson 18: Build the Project Story',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students organize the logic of their journey so they can communicate their project clearly to parents, mentors, judges, or admissions readers.',
    $${
      "phase": 5,
      "student_objectives": [
        "Explain the problem, audience, solution, and iterations",
        "Create a clear project presentation structure",
        "Frame the project as a meaningful process, not just a final artifact"
      ],
      "materials": ["Presentation template", "sample deck", "storytelling guide", "slide outline"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Teacher Model", "description": "Show a strong project story structure."},
        {"min_range": "10-25", "activity_name": "Mini Lesson", "description": "Teach a simple 5-part structure: problem, user, solution, process, result."},
        {"min_range": "25-60", "activity_name": "Slide / Poster Build", "description": "Students begin building their presentation assets."},
        {"min_range": "60-80", "activity_name": "Partner Explain-Back", "description": "Peer listens and identifies unclear parts."},
        {"min_range": "80-90", "activity_name": "Revise Storyline", "description": "Students revise based on partner feedback."}
      ],
      "expected_output": "Project slide deck or presentation outline and speaker notes draft",
      "assessment_questions": [
        "Can the student explain the project journey, not just show the final screen?",
        "Does the presentation reveal real thinking and ownership?"
      ],
      "teacher_notes": "This lesson is highly relevant to college application value. The project becomes much stronger when the process is clearly articulated."
    }$$::jsonb,
    18, false, 18, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 18
  );

  -- Lesson 19
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 10,
    'Lesson 19: Rehearsal, Reflection, and Portfolio Framing',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students rehearse presentation delivery and begin framing how the project could appear in a portfolio, application, competition, or mentorship context.',
    $${
      "phase": 5,
      "student_objectives": [
        "Present clearly and confidently",
        "Reflect on what they learned and what they would improve next",
        "Identify how the project could be described in future settings"
      ],
      "materials": ["Rehearsal rubric", "reflection sheet", "portfolio framing guide"],
      "activities": [
        {"min_range": "0-10", "activity_name": "Rehearsal Expectations", "description": "Review what a strong rehearsal looks like."},
        {"min_range": "10-50", "activity_name": "Presentation Rehearsals", "description": "Students present in small groups."},
        {"min_range": "50-70", "activity_name": "Feedback Round", "description": "Peers and teacher give focused presentation feedback."},
        {"min_range": "70-80", "activity_name": "Reflection Writing", "description": "Students write what they learned, what changed, and what is still unfinished."},
        {"min_range": "80-90", "activity_name": "Portfolio Framing Prompt", "description": "Students draft 3-5 sentences explaining the project's significance."}
      ],
      "expected_output": "Rehearsal feedback sheet, reflection sheet, and short portfolio framing paragraph",
      "assessment_questions": [
        "Is the student able to present with clarity and logic?",
        "Can the student reflect honestly on both strengths and limitations?"
      ],
      "teacher_notes": "Reflection is part of project maturity. Avoid scripting students into sounding artificial."
    }$$::jsonb,
    19, false, 19, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 19
  );

  -- Lesson 20
  INSERT INTO curriculum_assets (
    program_id, stage_number, title, asset_type, url, description, metadata, sort_order,
    is_public, lesson_number, visibility_scope
  )
  SELECT
    v_program_id, 10,
    'Lesson 20: Showcase and Mentor Review',
    'other'::asset_type,
    'https://github.com/nexhuntbarry/cas-incubator-os/blob/main/docs/brand/curriculum-part1.docx',
    'Students present their final work, receive mentor-style feedback, and recognize the project as part of a larger growth journey.',
    $${
      "phase": 5,
      "student_objectives": [
        "Present a finished or meaningfully advanced project",
        "Explain the reasoning, process, and value behind the work",
        "Receive final feedback and identify next steps"
      ],
      "materials": ["Showcase setup", "presentation equipment", "mentor review sheet", "certificate or completion sheet"],
      "activities": [
        {"min_range": "0-15", "activity_name": "Setup", "description": "Students prepare devices, slides, and demo order."},
        {"min_range": "15-50", "activity_name": "Student Presentations", "description": "Students present their project story and demo."},
        {"min_range": "50-75", "activity_name": "Mentor / Audience Review", "description": "Reviewers ask questions and give feedback."},
        {"min_range": "75-85", "activity_name": "Final Reflection / Recognition", "description": "Program recognition and final celebration."},
        {"min_range": "85-90", "activity_name": "Closing", "description": "Students write one next step for continued development."}
      ],
      "expected_output": "Final presentation, final demo, mentor review notes, and next-step statement",
      "assessment_questions": [
        "Did the student present a coherent project with ownership?",
        "Can the student explain what they built, why it matters, and what comes next?"
      ],
      "teacher_notes": "Not every project needs to be fully finished. A strong, meaningful, well-explained prototype can still be an excellent outcome."
    }$$::jsonb,
    20, false, 20, '["teacher","mentor"]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM curriculum_assets
    WHERE program_id = v_program_id AND lesson_number = 20
  );

END $$;


-- ── 4. INSERT worksheet_templates (22 worksheets) ────────────
-- Mapped to method_stage_definitions by stage_number.
-- linked_method_stage_id uses a subquery to find the UUID from stage_number.

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 1: Personal Interests and Goals Reflection',
  'Complete this page thoughtfully. Your answers will help you identify a project direction that is meaningful, sustainable, and useful for future development.',
  $$[
    {"key": "topics_of_interest", "type": "textarea", "label": "Part A: What Interests Me?", "helpText": "List topics, problems, communities, or fields you care about.", "required": true},
    {"key": "academic_subjects", "type": "text", "label": "Academic subjects I enjoy", "required": false},
    {"key": "activities_clubs", "type": "text", "label": "Activities / clubs / competitions I am involved in", "required": false},
    {"key": "existing_skills", "type": "text", "label": "Skills I already have", "required": false},
    {"key": "tools_used", "type": "text", "label": "Tools or technologies I have used before", "required": false},
    {"key": "college_application_angle", "type": "text", "label": "College application angle", "required": false},
    {"key": "competition_portfolio_use", "type": "text", "label": "Competition / fair / portfolio use", "required": false},
    {"key": "future_major_career", "type": "text", "label": "Future major or career interest", "required": false},
    {"key": "personal_growth_goal", "type": "text", "label": "Personal growth goal", "required": false},
    {"key": "sustained_project_reflection", "type": "textarea", "label": "Part D: A project I would be excited to keep working on for several weeks would probably involve...", "required": true}
  ]$$::jsonb,
  'none', 1,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 1 LIMIT 1),
  true, 'reflection', 'optional'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 1: Personal Interests and Goals Reflection'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 2: Problem Statement Sheet',
  'Focus on real problems, not just interesting features. The strongest projects begin with a meaningful need.',
  $$[
    {"key": "problems_noticed", "type": "textarea", "label": "Part A: Problems I Notice", "helpText": "What problems, frustrations, inefficiencies, or unmet needs do you notice in school, daily life, clubs, research, family life, business, or society?", "required": true},
    {"key": "chosen_direction", "type": "textarea", "label": "Part B: The problem I want to explore further", "required": true},
    {"key": "why_it_matters", "type": "textarea", "label": "This problem matters because...", "required": true},
    {"key": "draft_problem_statement", "type": "textarea", "label": "Part C: Draft Problem Statement", "helpText": "I want to design a project for [user] who struggles with / needs [need] so that they can [outcome].", "required": true},
    {"key": "existing_solutions_weakness", "type": "textarea", "label": "Part D: Why existing solutions fall short", "helpText": "Right now, existing solutions are weak, unclear, expensive, incomplete, inconvenient, or missing because...", "required": false}
  ]$$::jsonb,
  'none', 2,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 2 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 2: Problem Statement Sheet'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 3: Opportunity Areas Map',
  'Connect your interests to real-world opportunities. This page helps you connect what you care about to where you may be able to create value.',
  $$[
    {"key": "topics_care_about", "type": "textarea", "label": "Box 1: Topics I care about", "required": true},
    {"key": "people_to_help", "type": "textarea", "label": "Box 2: People I want to help", "required": true},
    {"key": "problems_worth_solving", "type": "textarea", "label": "Box 3: Problems worth solving", "required": true},
    {"key": "skills_strengths", "type": "textarea", "label": "Box 4: Skills / strengths I can bring", "required": true},
    {"key": "future_relevance", "type": "textarea", "label": "Box 5: Why this could matter for my future", "required": false},
    {"key": "top_3_directions", "type": "textarea", "label": "My Top 3 Project Directions", "required": true},
    {"key": "best_current_direction", "type": "textarea", "label": "The direction I want to continue exploring is...", "required": true},
    {"key": "why_best_direction", "type": "textarea", "label": "Because...", "required": true}
  ]$$::jsonb,
  'none', 3,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 1 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 3: Opportunity Areas Map'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 4: User Persona Template',
  'Be specific. Do not write "everyone" as your user. The clearer your user is, the stronger your project direction will become.',
  $$[
    {"key": "project_working_title", "type": "text", "label": "Project Working Title", "required": true},
    {"key": "user_name", "type": "text", "label": "Primary User Name (fictional or representative)", "required": true},
    {"key": "user_age_role", "type": "text", "label": "Age / role", "required": true},
    {"key": "user_context", "type": "text", "label": "Context", "required": true},
    {"key": "user_needs_help_with", "type": "textarea", "label": "This user needs help with...", "required": true},
    {"key": "user_gets_frustrated_when", "type": "textarea", "label": "Gets frustrated when...", "required": true},
    {"key": "user_currently_uses", "type": "text", "label": "Currently uses...", "required": false},
    {"key": "user_wishes", "type": "textarea", "label": "Wishes there were a better way to...", "required": true},
    {"key": "user_cares_most_about", "type": "textarea", "label": "Would care most about...", "required": true},
    {"key": "user_quote", "type": "text", "label": "User Quote (one realistic sentence)", "required": true}
  ]$$::jsonb,
  'none', 4,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 3 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 4: User Persona Template'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 5: Stakeholder and Context Map',
  'Think beyond the main user. Many projects affect other people, settings, or systems.',
  $$[
    {"key": "primary_user", "type": "textarea", "label": "Primary User: Who directly uses the project?", "required": true},
    {"key": "stakeholder_parent_family", "type": "text", "label": "Parent / family stakeholder", "required": false},
    {"key": "stakeholder_teacher_mentor", "type": "text", "label": "Teacher / mentor / coach stakeholder", "required": false},
    {"key": "stakeholder_school_org", "type": "text", "label": "School / organization / community stakeholder", "required": false},
    {"key": "stakeholder_other", "type": "text", "label": "Other stakeholder", "required": false},
    {"key": "context_place", "type": "text", "label": "Context of Use: Place", "required": true},
    {"key": "context_time_frequency", "type": "text", "label": "Time / frequency", "required": true},
    {"key": "context_situation", "type": "textarea", "label": "Situation", "required": true},
    {"key": "use_scenario", "type": "textarea", "label": "Use Scenario (3-5 sentences showing how a user would experience the project)", "required": true}
  ]$$::jsonb,
  'none', 4,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 3 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 5: Stakeholder and Context Map'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 6: Existing Solutions Comparison Chart',
  'You do not need to invent something that has never existed before. But you do need to understand what already exists and how your project might add value.',
  $$[
    {"key": "solution_1_name", "type": "text", "label": "Solution 1: Tool / app / workflow name", "required": true},
    {"key": "solution_1_audience", "type": "text", "label": "Solution 1: Who is it for?", "required": true},
    {"key": "solution_1_strengths", "type": "textarea", "label": "Solution 1: What does it do well?", "required": true},
    {"key": "solution_1_weaknesses", "type": "textarea", "label": "Solution 1: What is weak / unclear / missing?", "required": true},
    {"key": "solution_1_learning", "type": "textarea", "label": "Solution 1: What can I learn from it?", "required": false},
    {"key": "solution_2_name", "type": "text", "label": "Solution 2: Tool / app / workflow name", "required": false},
    {"key": "solution_2_audience", "type": "text", "label": "Solution 2: Who is it for?", "required": false},
    {"key": "solution_2_strengths", "type": "textarea", "label": "Solution 2: What does it do well?", "required": false},
    {"key": "solution_2_weaknesses", "type": "textarea", "label": "Solution 2: What is weak / unclear / missing?", "required": false},
    {"key": "solution_3_name", "type": "text", "label": "Solution 3: Tool / app / workflow name", "required": false},
    {"key": "solution_3_strengths", "type": "textarea", "label": "Solution 3: What does it do well?", "required": false},
    {"key": "solution_3_weaknesses", "type": "textarea", "label": "Solution 3: What is weak / unclear / missing?", "required": false},
    {"key": "strongest_solution", "type": "text", "label": "Which current solution seems strongest?", "required": true},
    {"key": "most_interesting_weakness", "type": "textarea", "label": "Which weakness appears most interesting to address?", "required": true}
  ]$$::jsonb,
  'none', 5,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 4 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 6: Existing Solutions Comparison Chart'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 7: Gap and Insight Notes',
  'This page is for turning research into insight. Strong projects are built on what you notice, not just what you collect.',
  $$[
    {"key": "repeated_strength", "type": "textarea", "label": "A repeated strength in existing solutions is...", "required": true},
    {"key": "repeated_weakness", "type": "textarea", "label": "A repeated weakness in existing solutions is...", "required": true},
    {"key": "users_still_struggle", "type": "textarea", "label": "Users may still struggle because...", "required": true},
    {"key": "underserved_opportunity", "type": "textarea", "label": "An underserved angle or opportunity might be...", "required": true},
    {"key": "insight_statement", "type": "textarea", "label": "My Insight Statement: My project may be valuable because it could improve / simplify / personalize / strengthen...", "required": true}
  ]$$::jsonb,
  'none', 5,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 4 LIMIT 1),
  true, 'planning', 'optional'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 7: Gap and Insight Notes'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 8: Value Proposition Template',
  'Your project should be explainable in one clear sentence. If you cannot explain it simply, the idea may still be too vague.',
  $$[
    {"key": "project_working_title", "type": "text", "label": "Project Working Title", "required": true},
    {"key": "positioning_statement", "type": "textarea", "label": "One-Sentence Positioning Statement", "helpText": "For [user] who need [need], this project helps [outcome] by [approach].", "required": true},
    {"key": "designed_for", "type": "text", "label": "My project is designed for...", "required": true},
    {"key": "main_problem", "type": "textarea", "label": "The main problem it addresses is...", "required": true},
    {"key": "value_created", "type": "textarea", "label": "The value it creates is...", "required": true},
    {"key": "differentiation", "type": "textarea", "label": "It is different because...", "required": true},
    {"key": "elevator_pitch", "type": "textarea", "label": "Elevator Pitch (3-4 sentences)", "required": true}
  ]$$::jsonb,
  'none', 6,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 5 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 8: Value Proposition Template'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 9: Feature Dump and MVP Matrix',
  'Put every idea down first. Then reduce the project to a realistic and meaningful Version 1.',
  $$[
    {"key": "all_features", "type": "textarea", "label": "Part A: Everything I Want My Project To Do", "helpText": "List all possible features, tools, pages, workflows, or functions.", "required": true},
    {"key": "must_have_v1", "type": "textarea", "label": "Must Have for Version 1", "required": true},
    {"key": "helpful_not_required", "type": "textarea", "label": "Helpful but Not Required Yet", "required": false},
    {"key": "later_future_version", "type": "textarea", "label": "Later / Future Version", "required": false},
    {"key": "mvp_definition", "type": "textarea", "label": "Part C: MVP Definition — My Version 1 will be successful if it can clearly show...", "required": true}
  ]$$::jsonb,
  'none', 7,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 6 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 9: Feature Dump and MVP Matrix'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 10: Prompt Builder for Serious Project Work',
  'Do not prompt randomly. Plan first, then prompt with purpose.',
  $$[
    {"key": "task_for_ai", "type": "textarea", "label": "What task do I need AI to help with?", "required": true},
    {"key": "context_for_ai", "type": "textarea", "label": "What context does AI need?", "required": true},
    {"key": "what_ai_should_avoid", "type": "textarea", "label": "What should AI avoid?", "required": false},
    {"key": "desired_output_format", "type": "text", "label": "What output format do I want?", "required": true},
    {"key": "draft_prompt", "type": "textarea", "label": "My Draft Prompt", "required": true},
    {"key": "revision_notes", "type": "textarea", "label": "Revision Notes: What would make this prompt clearer or more efficient?", "required": false}
  ]$$::jsonb,
  'none', 8,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 7 LIMIT 1),
  true, 'planning', 'optional'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 10: Prompt Builder for Serious Project Work'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 11: User Flow Diagram Sheet',
  'Focus on how the user moves from beginning to outcome. A strong flow makes the project easier to understand and build.',
  $$[
    {"key": "project_working_title", "type": "text", "label": "Project Working Title", "required": true},
    {"key": "entry_point", "type": "textarea", "label": "Entry Point: How does the user begin?", "required": true},
    {"key": "step_1", "type": "textarea", "label": "Step 1", "required": true},
    {"key": "step_2", "type": "textarea", "label": "Step 2", "required": true},
    {"key": "step_3", "type": "textarea", "label": "Step 3", "required": false},
    {"key": "decision_branch", "type": "textarea", "label": "Decision / Branch Point", "required": false},
    {"key": "final_outcome", "type": "textarea", "label": "Final Outcome", "required": true},
    {"key": "confusion_risk", "type": "text", "label": "A user may get confused if...", "required": false},
    {"key": "most_important_action", "type": "text", "label": "The most important action in this flow is...", "required": true}
  ]$$::jsonb,
  'none', 9,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 7 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 11: User Flow Diagram Sheet'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 12: Wireframe / Architecture Planning Page',
  'Keep this low-fidelity. This page is for structure and clarity, not visual perfection.',
  $$[
    {"key": "major_screens_or_views", "type": "textarea", "label": "If My Project Has Screens / Pages: List the major screens or views", "required": false},
    {"key": "screen_1_purpose", "type": "text", "label": "Screen 1 purpose", "required": false},
    {"key": "screen_2_purpose", "type": "text", "label": "Screen 2 purpose", "required": false},
    {"key": "screen_3_purpose", "type": "text", "label": "Screen 3 purpose", "required": false},
    {"key": "screen_4_purpose", "type": "text", "label": "Screen 4 purpose", "required": false},
    {"key": "screen_5_purpose", "type": "text", "label": "Screen 5 purpose", "required": false},
    {"key": "system_components", "type": "textarea", "label": "If My Project Is More Like a System / Workflow: List the major components or modules", "required": false},
    {"key": "build_reminder_confirmation", "type": "checkbox", "label": "My structure should match my MVP, not all future ideas", "required": false}
  ]$$::jsonb,
  'none', 10,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 7 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 12: Wireframe / Architecture Planning Page'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 13: Build Sprint 1 Checklist',
  'Before you build, make sure your logic is clear. Better planning usually leads to better output and lower token waste.',
  $$[
    {"key": "pre_build_user_clear", "type": "checkbox", "label": "My user is clear", "required": true},
    {"key": "pre_build_problem_clear", "type": "checkbox", "label": "My problem is clear", "required": true},
    {"key": "pre_build_mvp_realistic", "type": "checkbox", "label": "My MVP is realistic", "required": true},
    {"key": "pre_build_flow_mapped", "type": "checkbox", "label": "My user flow is mapped", "required": true},
    {"key": "pre_build_ai_task_clear", "type": "checkbox", "label": "I know what I want AI to help with", "required": true},
    {"key": "pre_build_clear_target", "type": "checkbox", "label": "I have one clear build target for today", "required": true},
    {"key": "build_goal", "type": "textarea", "label": "My Build Goal: Today I want to generate / build / test...", "required": true},
    {"key": "during_build_worked_well", "type": "textarea", "label": "What worked well?", "required": true},
    {"key": "during_build_incomplete", "type": "textarea", "label": "What was incomplete?", "required": true},
    {"key": "during_build_surprise", "type": "textarea", "label": "What surprised me?", "required": false},
    {"key": "sprint_reflection_strengths", "type": "textarea", "label": "Version 1 is strongest in...", "required": true},
    {"key": "sprint_reflection_needs_work", "type": "textarea", "label": "Version 1 still needs work in...", "required": true}
  ]$$::jsonb,
  'none', 11,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 8 LIMIT 1),
  true, 'checklist', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 13: Build Sprint 1 Checklist'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 14: Self-Test and Issue Log',
  'Be specific. Writing "it doesn''t work" is not enough. Strong project builders can describe what is wrong and why it matters.',
  $$[
    {"key": "did_not_work", "type": "textarea", "label": "Something that did not work", "required": true},
    {"key": "unclear_confusing", "type": "textarea", "label": "Something that was unclear or confusing", "required": true},
    {"key": "worked_better_than_expected", "type": "textarea", "label": "Something that worked better than expected", "required": false},
    {"key": "feels_unfinished", "type": "textarea", "label": "Something that feels unfinished", "required": true},
    {"key": "issue_categories", "type": "select", "label": "Issue Categories", "helpText": "Mark each issue as one or more types", "options": ["Bug", "Missing feature", "Unclear instructions", "Weak user flow", "Weak design / UX", "Wrong scope / too large"], "required": false},
    {"key": "top_priority_fixes", "type": "textarea", "label": "My Top Priority Fixes", "required": true}
  ]$$::jsonb,
  'none', 12,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 8 LIMIT 1),
  true, 'checklist', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 14: Self-Test and Issue Log'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 15: Peer Review Form',
  'Focus on clarity, usefulness, and user experience. Give feedback that is specific, respectful, and actionable.',
  $$[
    {"key": "reviewer_name", "type": "text", "label": "Reviewer Name", "required": true},
    {"key": "project_reviewed", "type": "text", "label": "Project Reviewed", "required": true},
    {"key": "creator_name", "type": "text", "label": "Creator Name", "required": true},
    {"key": "i_understood", "type": "textarea", "label": "I Understood: What is this project trying to do?", "required": true},
    {"key": "i_liked", "type": "textarea", "label": "I Liked: What felt strong, useful, interesting, or clear?", "required": true},
    {"key": "i_got_confused", "type": "textarea", "label": "I Got Confused When...", "required": true},
    {"key": "user_may_need", "type": "textarea", "label": "I Think the User May Need...", "required": false},
    {"key": "one_improvement", "type": "textarea", "label": "One Important Improvement Suggestion", "required": true},
    {"key": "feedback_sentence", "type": "textarea", "label": "Feedback: This project becomes stronger if ___ because ___.", "required": true}
  ]$$::jsonb,
  'none', 13,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 9 LIMIT 1),
  true, 'feedback', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 15: Peer Review Form'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 16: Revision Planning Sheet',
  'Not all feedback is equally important. Use this page to decide what deserves immediate attention.',
  $$[
    {"key": "repeated_feedback", "type": "textarea", "label": "What feedback came up more than once?", "required": true},
    {"key": "must_fix_now", "type": "textarea", "label": "Must Fix Now", "required": true},
    {"key": "important_can_wait", "type": "textarea", "label": "Important but Can Wait", "required": false},
    {"key": "interesting_optional", "type": "textarea", "label": "Interesting but Optional", "required": false},
    {"key": "revision_goal_next_build", "type": "textarea", "label": "Revision Goal for Next Build Round: My next build should focus on...", "required": true},
    {"key": "new_revision_prompt", "type": "textarea", "label": "My New Revision Prompt or Task Instruction", "required": true}
  ]$$::jsonb,
  'none', 14,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 9 LIMIT 1),
  true, 'planning', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 16: Revision Planning Sheet'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 17: Change Log Template',
  'This page helps you show growth, revision, and evidence of improvement.',
  $$[
    {"key": "project_title", "type": "text", "label": "Project Title", "required": true},
    {"key": "what_i_changed", "type": "textarea", "label": "What did I change?", "required": true},
    {"key": "why_i_changed_it", "type": "textarea", "label": "Why did I change it?", "required": true},
    {"key": "what_became_stronger", "type": "textarea", "label": "What became stronger after the change?", "required": true},
    {"key": "still_needs_improvement", "type": "textarea", "label": "What still needs improvement?", "required": false},
    {"key": "old_version_issue", "type": "text", "label": "Old version issue", "required": true},
    {"key": "new_version_improvement", "type": "text", "label": "New version improvement", "required": true},
    {"key": "user_experience_impact", "type": "textarea", "label": "User experience impact", "required": true}
  ]$$::jsonb,
  'none', 15,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 9 LIMIT 1),
  true, 'reflection', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 17: Change Log Template'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 18: Token and AI Efficiency Reflection',
  'The goal is not only to use AI, but to use it strategically and efficiently.',
  $$[
    {"key": "wasteful_habit_noticed", "type": "textarea", "label": "One wasteful AI habit I noticed in my own process", "required": true},
    {"key": "what_helped_use_ai_better", "type": "textarea", "label": "What Helped Me Use AI Better?", "required": true},
    {"key": "prompt_worked_better_when", "type": "text", "label": "A prompt worked better when I...", "required": true},
    {"key": "prompt_worked_worse_when", "type": "text", "label": "A prompt worked worse when I...", "required": true},
    {"key": "personal_smart_ai_rules", "type": "textarea", "label": "My Personal Smart AI Rules (5 rules)", "required": true}
  ]$$::jsonb,
  'none', 16,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 9 LIMIT 1),
  true, 'reflection', 'optional'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 18: Token and AI Efficiency Reflection'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 19: Final Build Checklist',
  'Use this page before your final presentation or mentor review. Check for clarity, logic, and readiness.',
  $$[
    {"key": "check_purpose_clear", "type": "checkbox", "label": "The purpose of my project is clear", "required": true},
    {"key": "check_target_user_clear", "type": "checkbox", "label": "The target user is clear", "required": true},
    {"key": "check_main_function_works", "type": "checkbox", "label": "The main function works or is clearly demonstrated", "required": true},
    {"key": "check_understandable", "type": "checkbox", "label": "My project is understandable to a first-time viewer", "required": true},
    {"key": "check_real_idea", "type": "checkbox", "label": "My project shows a real idea, not just random generation", "required": true},
    {"key": "check_can_explain_ai", "type": "checkbox", "label": "I can explain what AI helped with", "required": true},
    {"key": "check_own_decisions", "type": "checkbox", "label": "I can explain what decisions I made myself", "required": true},
    {"key": "check_ready_to_present", "type": "checkbox", "label": "I am ready to present the project story", "required": true},
    {"key": "strongest_part", "type": "textarea", "label": "The strongest part of my project is...", "required": true},
    {"key": "most_proud_of", "type": "textarea", "label": "The part I am most proud of is...", "required": true},
    {"key": "next_improvement", "type": "textarea", "label": "The next improvement I would make with more time is...", "required": true}
  ]$$::jsonb,
  'none', 17,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 9 LIMIT 1),
  true, 'checklist', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 19: Final Build Checklist'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 20: Project Story Presentation Template',
  'A strong project presentation explains the problem, user, process, revision, and value — not just the final screen.',
  $$[
    {"key": "presenter_name", "type": "text", "label": "Presenter Name", "required": true},
    {"key": "story_part_1_problem", "type": "textarea", "label": "1. The problem I designed for", "required": true},
    {"key": "story_part_2_user", "type": "textarea", "label": "2. The user I had in mind", "required": true},
    {"key": "story_part_3_solution", "type": "textarea", "label": "3. My solution / project idea", "required": true},
    {"key": "story_part_4_build_improve", "type": "textarea", "label": "4. What I built first and what I improved", "required": true},
    {"key": "story_part_5_why_matters", "type": "textarea", "label": "5. Why this project matters", "required": true},
    {"key": "closing_sentence", "type": "textarea", "label": "My Closing Sentence: I hope this project can help ___ by ___.", "required": true}
  ]$$::jsonb,
  'none', 18,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 10 LIMIT 1),
  true, 'presentation', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 20: Project Story Presentation Template'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 21: Rehearsal Feedback Sheet',
  'Help the presenter understand what is already clear and what still needs better explanation.',
  $$[
    {"key": "presenter_name", "type": "text", "label": "Presenter Name", "required": true},
    {"key": "reviewer_name", "type": "text", "label": "Reviewer Name", "required": true},
    {"key": "i_understood", "type": "textarea", "label": "I understood...", "required": true},
    {"key": "strong_part", "type": "textarea", "label": "One strong part of the presentation was...", "required": true},
    {"key": "should_be_clearer", "type": "textarea", "label": "One part that should be clearer is...", "required": true},
    {"key": "remaining_question", "type": "textarea", "label": "One question I still have is...", "required": false},
    {"key": "final_suggestion", "type": "textarea", "label": "Final suggestion before showcase", "required": false}
  ]$$::jsonb,
  'none', 19,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 10 LIMIT 1),
  true, 'feedback', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 21: Rehearsal Feedback Sheet'
);

INSERT INTO worksheet_templates (
  title, instructions, fields_schema, scoring_type, linked_lesson_number,
  linked_method_stage_id, is_active, template_type, required_status
)
SELECT
  'Worksheet 22: Final Reflection and Portfolio Framing Sheet',
  'This final page helps you explain your project in a way that may later support applications, interviews, competitions, or portfolio use.',
  $$[
    {"key": "learned_ai_building", "type": "textarea", "label": "One thing I learned about AI-assisted project building", "required": true},
    {"key": "learned_design_thinking", "type": "textarea", "label": "One thing I learned about design thinking", "required": true},
    {"key": "learned_working_style", "type": "textarea", "label": "One thing I learned about my own working style", "required": true},
    {"key": "one_thing_improved", "type": "textarea", "label": "One thing I improved during this program", "required": true},
    {"key": "one_thing_proud_of", "type": "textarea", "label": "One thing I am proud of", "required": true},
    {"key": "continue_by", "type": "textarea", "label": "If I had more time, I would continue by...", "required": false},
    {"key": "portfolio_paragraph_problem", "type": "textarea", "label": "This project was designed to address...", "required": true},
    {"key": "portfolio_paragraph_user", "type": "textarea", "label": "The target user or context was...", "required": true},
    {"key": "portfolio_paragraph_development", "type": "textarea", "label": "I developed the project by...", "required": true},
    {"key": "portfolio_paragraph_challenge", "type": "textarea", "label": "One major challenge I worked through was...", "required": true},
    {"key": "portfolio_paragraph_result", "type": "textarea", "label": "The most meaningful result of this project was...", "required": true},
    {"key": "portfolio_paragraph_personal_meaning", "type": "textarea", "label": "This project matters to me because...", "required": true}
  ]$$::jsonb,
  'none', 20,
  (SELECT id FROM method_stage_definitions WHERE stage_number = 10 LIMIT 1),
  true, 'reflection', 'required'
WHERE NOT EXISTS (
  SELECT 1 FROM worksheet_templates WHERE title = 'Worksheet 22: Final Reflection and Portfolio Framing Sheet'
);


-- ── End of migration 0007 ─────────────────────────────────────
-- Summary:
--   1 program inserted (CAS Incubator — High School Project Incubator Part 1)
--   10 method_stage_definitions updated with rich descriptions + outputs + questions
--   20 curriculum_assets inserted (one per lesson, phase 1-5)
--   22 worksheet_templates inserted (matching the worksheet packet)
