-- ============================================================
-- Seed: method_stage_definitions
-- Based on CAS Incubator OS Curriculum Part 1 (10 stages)
-- ============================================================

INSERT INTO method_stage_definitions
  (stage_number, name, description, expected_outputs_json, guiding_questions, sort_order)
VALUES

(1, 'Interest Discovery',
 'Students explore their personal interests, passions, and domains of curiosity. The goal is to identify a broad area they care enough about to sustain a multi-week project.',
 '[
   "Personal interest map or list",
   "Top 3 interest domains ranked by passion",
   "Initial free-write journal entry"
 ]',
 '[
   "What topics do you find yourself reading about without being asked?",
   "What problems in daily life bother you most?",
   "If you had unlimited time and resources, what would you build or fix?"
 ]',
 1),

(2, 'Problem Definition',
 'Students narrow from broad interest to a specific, concrete problem worth solving. They learn to distinguish symptoms from root causes and write a clear problem statement.',
 '[
   "One-sentence problem statement",
   "Problem evidence (observations, data points, or stories)",
   "Why this problem matters now"
 ]',
 '[
   "Who is suffering from this problem and how often?",
   "What happens if this problem is never solved?",
   "Can you restate the problem from the user''s point of view?"
 ]',
 2),

(3, 'Target User',
 'Students define a specific user persona — a real or composite person who experiences the problem most acutely. They practice empathy and avoid designing for everyone.',
 '[
   "User persona card (name, age, context, goals, frustrations)",
   "At least one real or hypothetical user quote",
   "User''s current workaround or coping behavior"
 ]',
 '[
   "Who would benefit most from solving this problem?",
   "What does a day in this person''s life look like?",
   "What do they already try to do to solve this problem?"
 ]',
 3),

(4, 'Existing Solutions',
 'Students research what already exists to address the problem. They analyze competitors, alternatives, and prior attempts — understanding why the gap still exists.',
 '[
   "List of 3–5 existing solutions or competitors",
   "Comparison table (features, price, limitations)",
   "Gap analysis: what none of them do well"
 ]',
 '[
   "What tools or services do people already use?",
   "Why haven''t these solutions fully solved the problem?",
   "What is the biggest weakness of the best existing solution?"
 ]',
 4),

(5, 'Value Proposition',
 'Students articulate what makes their approach uniquely valuable. They craft a value proposition statement that connects their solution to their target user''s unmet need.',
 '[
   "Value proposition statement (1–2 sentences)",
   "Differentiation from existing solutions",
   "Core benefit ranked by importance to the target user"
 ]',
 '[
   "What will your solution do that nothing else does?",
   "Why would your target user choose your solution over what they use now?",
   "What is the one thing your solution must do really well?"
 ]',
 5),

(6, 'MVP Scoping',
 'Students decide what the Minimum Viable Product includes — the smallest version of their solution that tests the core assumption. They practice cutting scope ruthlessly.',
 '[
   "MVP feature list (must-haves vs. nice-to-haves)",
   "One-sentence MVP hypothesis",
   "What success looks like for the MVP"
 ]',
 '[
   "What is the single most important thing your MVP must do?",
   "Which features can wait until after the first user test?",
   "What assumption are you testing with this MVP?"
 ]',
 6),

(7, 'Build Plan',
 'Students create a structured build plan: tasks, timeline, tools, and responsibilities. This stage bridges ideation and execution.',
 '[
   "Task list broken into weekly milestones",
   "Tool and technology choices (with rationale)",
   "Risk log: top 3 risks and mitigation strategies"
 ]',
 '[
   "What needs to happen in week 1 to stay on track?",
   "What tools do you need to learn or acquire?",
   "What could go wrong, and how will you handle it?"
 ]',
 7),

(8, 'Prototype Development',
 'Students build their first working prototype — a tangible, testable artifact. This may be a mockup, a coded app, a physical prototype, or a service blueprint depending on project type.',
 '[
   "Working prototype (link, file, or photos)",
   "Build log: key decisions made during construction",
   "Known limitations of the current prototype"
 ]',
 '[
   "Does your prototype demonstrate the core value proposition?",
   "What shortcuts did you take, and are they acceptable for now?",
   "What would a user actually do first when they see this?"
 ]',
 8),

(9, 'Testing & Revision',
 'Students conduct structured user tests, gather feedback, and iterate. They practice distinguishing useful criticism from noise and making evidence-based revisions.',
 '[
   "User test notes (at least 2 test sessions)",
   "Top 3 insights from testing",
   "Revision log: what changed and why"
 ]',
 '[
   "What surprised you most about how users reacted?",
   "Which feedback will you act on, and which will you ignore?",
   "What does your prototype do better now than before testing?"
 ]',
 9),

(10, 'Project Story',
 'Students craft the narrative of their project journey — from spark to solution. They prepare to present their work to peers, mentors, and parents in a compelling, honest story.',
 '[
   "Project story outline (problem → journey → solution → learning)",
   "3-minute verbal pitch or presentation",
   "One thing you would do differently if starting over"
 ]',
 '[
   "What was the hardest moment in this project, and how did you get through it?",
   "What would you tell a younger student starting a project like yours?",
   "What did you learn about yourself as a builder?"
 ]',
 10);
