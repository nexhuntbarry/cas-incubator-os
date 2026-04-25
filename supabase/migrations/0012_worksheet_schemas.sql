-- ============================================================
-- CAS Incubator OS — Migration 0012
-- Populate worksheet_templates with real form schemas from
-- curriculum-part1-worksheets-v2.docx
-- Generated: 2026-04-25
-- Idempotent: UPDATE-only, safe to re-run
-- ============================================================

-- Worksheet 1: Personal Interests and Goals Reflection
UPDATE worksheet_templates
SET instructions = $ws_1_inst$Complete this page thoughtfully. Your answers will help you identify a project direction that is meaningful, sustainable, and useful for future development.$ws_1_inst$,
    fields_schema = $ws_1_schema$[
  {
    "key": "interests_list",
    "label": "Topics, problems, communities, or fields I care about",
    "type": "textarea",
    "helpText": "List one idea per line",
    "required": true
  },
  {
    "key": "academic_subjects",
    "label": "Academic subjects I enjoy",
    "type": "text",
    "required": false
  },
  {
    "key": "activities_clubs",
    "label": "Activities / clubs / competitions I am involved in",
    "type": "text",
    "required": false
  },
  {
    "key": "skills_already_have",
    "label": "Skills I already have",
    "type": "text",
    "required": false
  },
  {
    "key": "tools_technologies",
    "label": "Tools or technologies I have used before",
    "type": "text",
    "required": false
  },
  {
    "key": "college_application_angle",
    "label": "College application angle",
    "type": "text",
    "required": false
  },
  {
    "key": "competition_portfolio_use",
    "label": "Competition / fair / portfolio use",
    "type": "text",
    "required": false
  },
  {
    "key": "future_major_career",
    "label": "Future major or career interest",
    "type": "text",
    "required": false
  },
  {
    "key": "personal_growth_goal",
    "label": "Personal growth goal",
    "type": "text",
    "required": false
  },
  {
    "key": "project_reflection",
    "label": "A project I would be excited to keep working on for several weeks would probably involve",
    "type": "textarea",
    "required": true
  }
]$ws_1_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 1:%' OR title LIKE 'Worksheet 1 –%' OR title LIKE 'Worksheet 1 -%';

-- Worksheet 2: Problem Statement Sheet
UPDATE worksheet_templates
SET instructions = $ws_2_inst$Focus on real problems, not just interesting features. The strongest projects begin with a meaningful need.$ws_2_inst$,
    fields_schema = $ws_2_schema$[
  {
    "key": "problems_noticed",
    "label": "Problems, frustrations, inefficiencies, or unmet needs I notice in school, daily life, clubs, research, family life, business, or society",
    "type": "textarea",
    "helpText": "List one problem per line",
    "required": true
  },
  {
    "key": "chosen_problem",
    "label": "The problem I want to explore further is",
    "type": "textarea",
    "required": true
  },
  {
    "key": "why_problem_matters",
    "label": "This problem matters because",
    "type": "textarea",
    "required": true
  },
  {
    "key": "problem_statement_user",
    "label": "I want to design a project for (who?)",
    "type": "text",
    "helpText": "Describe the target user",
    "required": true
  },
  {
    "key": "problem_statement_need",
    "label": "Who struggles with / needs",
    "type": "text",
    "required": true
  },
  {
    "key": "problem_statement_outcome",
    "label": "So that they can",
    "type": "text",
    "required": true
  },
  {
    "key": "existing_solutions_weakness",
    "label": "Right now, existing solutions are weak, unclear, expensive, incomplete, inconvenient, or missing because",
    "type": "textarea",
    "required": false
  }
]$ws_2_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 2:%' OR title LIKE 'Worksheet 2 –%' OR title LIKE 'Worksheet 2 -%';

-- Worksheet 3: Opportunity Areas Map
UPDATE worksheet_templates
SET instructions = $ws_3_inst$This page helps you connect what you care about to where you may be able to create value. Connect your interests to real-world opportunities. Write in each box.$ws_3_inst$,
    fields_schema = $ws_3_schema$[
  {
    "key": "topics_i_care_about",
    "label": "Topics I care about",
    "type": "textarea",
    "helpText": "List one per line",
    "required": true
  },
  {
    "key": "people_i_want_to_help",
    "label": "People I want to help",
    "type": "textarea",
    "helpText": "List one per line",
    "required": true
  },
  {
    "key": "problems_worth_solving",
    "label": "Problems worth solving",
    "type": "textarea",
    "helpText": "List one per line",
    "required": true
  },
  {
    "key": "skills_strengths",
    "label": "Skills / strengths I can bring",
    "type": "textarea",
    "helpText": "List one per line",
    "required": false
  },
  {
    "key": "why_it_matters_for_future",
    "label": "Why this could matter for my future",
    "type": "textarea",
    "required": false
  },
  {
    "key": "top_3_directions",
    "label": "My Top 3 Project Directions",
    "type": "textarea",
    "helpText": "List three directions, one per line",
    "required": true
  },
  {
    "key": "best_direction",
    "label": "The direction I want to continue exploring is",
    "type": "textarea",
    "required": true
  },
  {
    "key": "best_direction_reason",
    "label": "Because",
    "type": "textarea",
    "required": false
  }
]$ws_3_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 3:%' OR title LIKE 'Worksheet 3 –%' OR title LIKE 'Worksheet 3 -%';

-- Worksheet 4: User Persona Template
UPDATE worksheet_templates
SET instructions = $ws_4_inst$Be specific. Do not write "everyone" as your user. The clearer your user is, the stronger your project direction will become.$ws_4_inst$,
    fields_schema = $ws_4_schema$[
  {
    "key": "persona_name",
    "label": "User name (fictional or representative)",
    "type": "text",
    "required": true
  },
  {
    "key": "persona_age_role",
    "label": "Age / role",
    "type": "text",
    "required": true
  },
  {
    "key": "persona_context",
    "label": "Context",
    "type": "text",
    "required": true
  },
  {
    "key": "user_needs_help_with",
    "label": "This user needs help with",
    "type": "textarea",
    "required": true
  },
  {
    "key": "user_gets_frustrated",
    "label": "Gets frustrated when",
    "type": "textarea",
    "required": false
  },
  {
    "key": "user_currently_uses",
    "label": "Currently uses",
    "type": "text",
    "required": false
  },
  {
    "key": "user_wishes",
    "label": "Wishes there were a better way to",
    "type": "textarea",
    "required": false
  },
  {
    "key": "user_cares_most_about",
    "label": "Would care most about",
    "type": "textarea",
    "required": false
  },
  {
    "key": "user_quote",
    "label": "One sentence your user might realistically say",
    "type": "text",
    "helpText": "Write it as a direct quote",
    "required": true
  }
]$ws_4_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 4:%' OR title LIKE 'Worksheet 4 –%' OR title LIKE 'Worksheet 4 -%';

-- Worksheet 5: Stakeholder and Context Map
UPDATE worksheet_templates
SET instructions = $ws_5_inst$Think beyond the main user. Many projects affect other people, settings, or systems.$ws_5_inst$,
    fields_schema = $ws_5_schema$[
  {
    "key": "primary_user",
    "label": "Primary user — who directly uses the project?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "stakeholder_parent_family",
    "label": "Parent / family stakeholder",
    "type": "text",
    "required": false
  },
  {
    "key": "stakeholder_teacher_mentor",
    "label": "Teacher / mentor / coach stakeholder",
    "type": "text",
    "required": false
  },
  {
    "key": "stakeholder_school_org",
    "label": "School / organization / community stakeholder",
    "type": "text",
    "required": false
  },
  {
    "key": "stakeholder_other",
    "label": "Other stakeholders",
    "type": "text",
    "required": false
  },
  {
    "key": "context_place",
    "label": "Place — where would the project be used?",
    "type": "text",
    "required": true
  },
  {
    "key": "context_time_frequency",
    "label": "Time / frequency — when would it be used?",
    "type": "text",
    "required": false
  },
  {
    "key": "context_situation",
    "label": "Situation",
    "type": "text",
    "required": false
  },
  {
    "key": "use_scenario",
    "label": "Use scenario — write a 3–5 sentence scenario showing how a user would experience the project",
    "type": "textarea",
    "required": true
  }
]$ws_5_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 5:%' OR title LIKE 'Worksheet 5 –%' OR title LIKE 'Worksheet 5 -%';

-- Worksheet 6: Existing Solutions Comparison Chart
UPDATE worksheet_templates
SET instructions = $ws_6_inst$You do not need to invent something that has never existed before. But you do need to understand what already exists and how your project might add value. Research 2–4 existing solutions.$ws_6_inst$,
    fields_schema = $ws_6_schema$[
  {
    "key": "solution_1_name",
    "label": "Existing solution 1 — tool / app / workflow name",
    "type": "text",
    "required": true
  },
  {
    "key": "solution_1_who_for",
    "label": "Solution 1 — who is it for?",
    "type": "text",
    "required": false
  },
  {
    "key": "solution_1_does_well",
    "label": "Solution 1 — what does it do well?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_1_weakness",
    "label": "Solution 1 — what is weak / unclear / missing?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_1_lesson",
    "label": "Solution 1 — what can I learn from it?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_2_name",
    "label": "Existing solution 2 — tool / app / workflow name",
    "type": "text",
    "required": false
  },
  {
    "key": "solution_2_who_for",
    "label": "Solution 2 — who is it for?",
    "type": "text",
    "required": false
  },
  {
    "key": "solution_2_does_well",
    "label": "Solution 2 — what does it do well?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_2_weakness",
    "label": "Solution 2 — what is weak / unclear / missing?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_2_lesson",
    "label": "Solution 2 — what can I learn from it?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_3_name",
    "label": "Existing solution 3 — tool / app / workflow name",
    "type": "text",
    "required": false
  },
  {
    "key": "solution_3_does_well",
    "label": "Solution 3 — what does it do well?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "solution_3_weakness",
    "label": "Solution 3 — what is weak / unclear / missing?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "strongest_solution",
    "label": "Which current solution seems strongest?",
    "type": "text",
    "required": true
  },
  {
    "key": "most_interesting_weakness",
    "label": "Which weakness appears most interesting to address?",
    "type": "textarea",
    "required": true
  }
]$ws_6_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 6:%' OR title LIKE 'Worksheet 6 –%' OR title LIKE 'Worksheet 6 -%';

-- Worksheet 7: Gap and Insight Notes
UPDATE worksheet_templates
SET instructions = $ws_7_inst$This page is for turning research into insight. Strong projects are built on what you notice, not just what you collect.$ws_7_inst$,
    fields_schema = $ws_7_schema$[
  {
    "key": "repeated_strength",
    "label": "A repeated strength in existing solutions is",
    "type": "textarea",
    "required": true
  },
  {
    "key": "repeated_weakness",
    "label": "A repeated weakness in existing solutions is",
    "type": "textarea",
    "required": true
  },
  {
    "key": "users_still_struggle",
    "label": "Users may still struggle because",
    "type": "textarea",
    "required": true
  },
  {
    "key": "underserved_angle",
    "label": "An underserved angle or opportunity might be",
    "type": "textarea",
    "required": true
  },
  {
    "key": "insight_statement",
    "label": "My project may be valuable because it could improve / simplify / personalize / strengthen",
    "type": "textarea",
    "required": true
  }
]$ws_7_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 7:%' OR title LIKE 'Worksheet 7 –%' OR title LIKE 'Worksheet 7 -%';

-- Worksheet 8: Value Proposition Template
UPDATE worksheet_templates
SET instructions = $ws_8_inst$Your project should be explainable in one clear sentence. If you cannot explain it simply, the idea may still be too vague.$ws_8_inst$,
    fields_schema = $ws_8_schema$[
  {
    "key": "positioning_for",
    "label": "For (who?)",
    "type": "text",
    "helpText": "Target user group",
    "required": true
  },
  {
    "key": "positioning_who_need",
    "label": "Who need",
    "type": "text",
    "required": true
  },
  {
    "key": "positioning_helps",
    "label": "This project helps",
    "type": "text",
    "required": true
  },
  {
    "key": "positioning_by",
    "label": "By",
    "type": "text",
    "required": true
  },
  {
    "key": "designed_for",
    "label": "My project is designed for",
    "type": "textarea",
    "required": false
  },
  {
    "key": "main_problem_addressed",
    "label": "The main problem it addresses is",
    "type": "textarea",
    "required": false
  },
  {
    "key": "value_created",
    "label": "The value it creates is",
    "type": "textarea",
    "required": false
  },
  {
    "key": "differentiation",
    "label": "It is different because",
    "type": "textarea",
    "required": false
  },
  {
    "key": "elevator_pitch",
    "label": "Elevator pitch (3–4 sentences)",
    "type": "textarea",
    "required": true
  }
]$ws_8_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 8:%' OR title LIKE 'Worksheet 8 –%' OR title LIKE 'Worksheet 8 -%';

-- Worksheet 9: Feature Dump and MVP Matrix
UPDATE worksheet_templates
SET instructions = $ws_9_inst$Put every idea down first. Then reduce the project to a realistic and meaningful Version 1.$ws_9_inst$,
    fields_schema = $ws_9_schema$[
  {
    "key": "all_features",
    "label": "Everything I want my project to do — list all possible features, tools, pages, workflows, or functions",
    "type": "textarea",
    "helpText": "List one idea per line — don't filter yet",
    "required": true
  },
  {
    "key": "must_have_v1",
    "label": "Must have for Version 1",
    "type": "textarea",
    "helpText": "List one per line",
    "required": true
  },
  {
    "key": "helpful_not_required",
    "label": "Helpful but not required yet",
    "type": "textarea",
    "helpText": "List one per line",
    "required": false
  },
  {
    "key": "later_future",
    "label": "Later / future version",
    "type": "textarea",
    "helpText": "List one per line",
    "required": false
  },
  {
    "key": "mvp_definition",
    "label": "My Version 1 will be successful if it can clearly show",
    "type": "textarea",
    "required": true
  }
]$ws_9_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 9:%' OR title LIKE 'Worksheet 9 –%' OR title LIKE 'Worksheet 9 -%';

-- Worksheet 10: Prompt Builder for Serious Project Work
UPDATE worksheet_templates
SET instructions = $ws_10_inst$Do not prompt randomly. Plan first, then prompt with purpose. A strong project prompt usually includes: role/context, target user, goal, constraints, desired output format, and tone/complexity/platform needs if relevant.$ws_10_inst$,
    fields_schema = $ws_10_schema$[
  {
    "key": "task_for_ai",
    "label": "What task do I need AI to help with?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "context_for_ai",
    "label": "What context does AI need?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "what_ai_should_avoid",
    "label": "What should AI avoid?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "output_format",
    "label": "What output format do I want?",
    "type": "text",
    "required": false
  },
  {
    "key": "draft_prompt",
    "label": "My draft prompt",
    "type": "textarea",
    "required": true
  },
  {
    "key": "revision_notes",
    "label": "What would make this prompt clearer or more efficient?",
    "type": "textarea",
    "required": false
  }
]$ws_10_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 10:%' OR title LIKE 'Worksheet 10 –%' OR title LIKE 'Worksheet 10 -%';

-- Worksheet 11: User Flow Diagram Sheet
UPDATE worksheet_templates
SET instructions = $ws_11_inst$Focus on how the user moves from beginning to outcome. A strong flow makes the project easier to understand and build.$ws_11_inst$,
    fields_schema = $ws_11_schema$[
  {
    "key": "entry_point",
    "label": "Entry point — how does the user begin?",
    "type": "text",
    "required": true
  },
  {
    "key": "step_1",
    "label": "Step 1",
    "type": "textarea",
    "required": true
  },
  {
    "key": "step_2",
    "label": "Step 2",
    "type": "textarea",
    "required": false
  },
  {
    "key": "step_3",
    "label": "Step 3",
    "type": "textarea",
    "required": false
  },
  {
    "key": "decision_branch",
    "label": "Decision / branch point",
    "type": "textarea",
    "helpText": "Describe any forks in the user journey",
    "required": false
  },
  {
    "key": "final_outcome",
    "label": "Final outcome",
    "type": "textarea",
    "required": true
  },
  {
    "key": "confusion_point",
    "label": "A user may get confused if",
    "type": "textarea",
    "required": false
  },
  {
    "key": "most_important_action",
    "label": "The most important action in this flow is",
    "type": "text",
    "required": false
  }
]$ws_11_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 11:%' OR title LIKE 'Worksheet 11 –%' OR title LIKE 'Worksheet 11 -%';

-- Worksheet 12: Wireframe / Architecture Planning Page
UPDATE worksheet_templates
SET instructions = $ws_12_inst$Keep this low-fidelity. This page is for structure and clarity, not visual perfection. My structure should match my MVP, not all future ideas.$ws_12_inst$,
    fields_schema = $ws_12_schema$[
  {
    "key": "major_screens",
    "label": "Major screens or views (if my project has screens / pages)",
    "type": "textarea",
    "helpText": "List one screen per line",
    "required": false
  },
  {
    "key": "screen_1_purpose",
    "label": "Screen 1 — what it should do",
    "type": "text",
    "required": false
  },
  {
    "key": "screen_2_purpose",
    "label": "Screen 2 — what it should do",
    "type": "text",
    "required": false
  },
  {
    "key": "screen_3_purpose",
    "label": "Screen 3 — what it should do",
    "type": "text",
    "required": false
  },
  {
    "key": "screen_4_purpose",
    "label": "Screen 4 — what it should do",
    "type": "text",
    "required": false
  },
  {
    "key": "screen_5_purpose",
    "label": "Screen 5 — what it should do",
    "type": "text",
    "required": false
  },
  {
    "key": "major_components",
    "label": "Major components or modules (if my project is more like a system / workflow)",
    "type": "textarea",
    "helpText": "List one component per line",
    "required": false
  }
]$ws_12_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 12:%' OR title LIKE 'Worksheet 12 –%' OR title LIKE 'Worksheet 12 -%';

-- Worksheet 13: Build Sprint 1 Checklist
UPDATE worksheet_templates
SET instructions = $ws_13_inst$Before you build, make sure your logic is clear. Better planning usually leads to better output and lower token waste.$ws_13_inst$,
    fields_schema = $ws_13_schema$[
  {
    "key": "pre_build_checklist",
    "label": "Before I build — check all that apply",
    "type": "multi_select",
    "options": [
      "My user is clear",
      "My problem is clear",
      "My MVP is realistic",
      "My user flow is mapped",
      "I know what I want AI to help with",
      "I have one clear build target for today"
    ],
    "required": true
  },
  {
    "key": "build_goal",
    "label": "My build goal — today I want to generate / build / test",
    "type": "textarea",
    "required": true
  },
  {
    "key": "what_worked",
    "label": "During build — what worked well?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "what_incomplete",
    "label": "During build — what was incomplete?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "what_surprised",
    "label": "During build — what surprised me?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "v1_strongest_in",
    "label": "Version 1 is strongest in",
    "type": "textarea",
    "required": true
  },
  {
    "key": "v1_needs_work_in",
    "label": "Version 1 still needs work in",
    "type": "textarea",
    "required": true
  }
]$ws_13_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 13:%' OR title LIKE 'Worksheet 13 –%' OR title LIKE 'Worksheet 13 -%';

-- Worksheet 14: Self-Test and Issue Log
UPDATE worksheet_templates
SET instructions = $ws_14_inst$Be specific. Writing "it doesn't work" is not enough. Strong project builders can describe what is wrong and why it matters.$ws_14_inst$,
    fields_schema = $ws_14_schema$[
  {
    "key": "did_not_work",
    "label": "Something that did not work",
    "type": "textarea",
    "required": true
  },
  {
    "key": "unclear_confusing",
    "label": "Something that was unclear or confusing",
    "type": "textarea",
    "required": true
  },
  {
    "key": "worked_better_than_expected",
    "label": "Something that worked better than expected",
    "type": "textarea",
    "required": false
  },
  {
    "key": "feels_unfinished",
    "label": "Something that feels unfinished",
    "type": "textarea",
    "required": false
  },
  {
    "key": "issue_categories",
    "label": "Issue categories — mark each issue as one or more of these",
    "type": "multi_select",
    "options": [
      "Bug",
      "Missing feature",
      "Unclear instructions",
      "Weak user flow",
      "Weak design / UX",
      "Wrong scope / too large"
    ],
    "required": false
  },
  {
    "key": "top_priority_fixes",
    "label": "My top priority fixes",
    "type": "textarea",
    "helpText": "List one fix per line in priority order",
    "required": true
  }
]$ws_14_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 14:%' OR title LIKE 'Worksheet 14 –%' OR title LIKE 'Worksheet 14 -%';

-- Worksheet 15: Peer Review Form
UPDATE worksheet_templates
SET instructions = $ws_15_inst$Instructions for Reviewers: Focus on clarity, usefulness, and user experience. Give feedback that is specific, respectful, and actionable.$ws_15_inst$,
    fields_schema = $ws_15_schema$[
  {
    "key": "project_reviewed",
    "label": "Project reviewed",
    "type": "text",
    "required": true
  },
  {
    "key": "creator_name",
    "label": "Creator name",
    "type": "text",
    "required": true
  },
  {
    "key": "i_understood",
    "label": "I understood — what is this project trying to do?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "i_liked",
    "label": "I liked — what felt strong, useful, interesting, or clear?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "i_got_confused",
    "label": "I got confused when",
    "type": "textarea",
    "required": false
  },
  {
    "key": "user_may_need",
    "label": "I think the user may need",
    "type": "textarea",
    "required": false
  },
  {
    "key": "improvement_suggestion",
    "label": "One important improvement suggestion",
    "type": "textarea",
    "required": true
  },
  {
    "key": "feedback_sentence",
    "label": "This project becomes stronger if _______ because _______",
    "type": "textarea",
    "helpText": "Complete the feedback sentence starter",
    "required": false
  }
]$ws_15_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 15:%' OR title LIKE 'Worksheet 15 –%' OR title LIKE 'Worksheet 15 -%';

-- Worksheet 16: Revision Planning Sheet
UPDATE worksheet_templates
SET instructions = $ws_16_inst$Not all feedback is equally important. Use this page to decide what deserves immediate attention.$ws_16_inst$,
    fields_schema = $ws_16_schema$[
  {
    "key": "feedback_repeated",
    "label": "What feedback came up more than once?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "must_fix_now",
    "label": "Must fix now",
    "type": "textarea",
    "helpText": "List one item per line",
    "required": true
  },
  {
    "key": "important_can_wait",
    "label": "Important but can wait",
    "type": "textarea",
    "helpText": "List one item per line",
    "required": false
  },
  {
    "key": "interesting_optional",
    "label": "Interesting but optional",
    "type": "textarea",
    "helpText": "List one item per line",
    "required": false
  },
  {
    "key": "revision_goal",
    "label": "My next build should focus on",
    "type": "textarea",
    "required": true
  },
  {
    "key": "revision_prompt",
    "label": "My new revision prompt or task instruction",
    "type": "textarea",
    "required": false
  }
]$ws_16_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 16:%' OR title LIKE 'Worksheet 16 –%' OR title LIKE 'Worksheet 16 -%';

-- Worksheet 17: Change Log Template
UPDATE worksheet_templates
SET instructions = $ws_17_inst$This page helps you show growth, revision, and evidence of improvement.$ws_17_inst$,
    fields_schema = $ws_17_schema$[
  {
    "key": "what_changed",
    "label": "What did I change?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "why_changed",
    "label": "Why did I change it?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "what_became_stronger",
    "label": "What became stronger after the change?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "still_needs_improvement",
    "label": "What still needs improvement?",
    "type": "textarea",
    "required": false
  },
  {
    "key": "old_version_issue",
    "label": "Old version issue",
    "type": "text",
    "required": false
  },
  {
    "key": "new_version_improvement",
    "label": "New version improvement",
    "type": "text",
    "required": false
  },
  {
    "key": "user_experience_impact",
    "label": "User experience impact",
    "type": "text",
    "required": false
  }
]$ws_17_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 17:%' OR title LIKE 'Worksheet 17 –%' OR title LIKE 'Worksheet 17 -%';

-- Worksheet 18: Token and AI Efficiency Reflection
UPDATE worksheet_templates
SET instructions = $ws_18_inst$The goal is not only to use AI, but to use it strategically and efficiently. Wasteful habits include: unclear prompting, repeated retries with no strategy, asking for too many things at once, polishing too early.$ws_18_inst$,
    fields_schema = $ws_18_schema$[
  {
    "key": "wasteful_habit",
    "label": "One wasteful AI habit I noticed in my own process",
    "type": "textarea",
    "required": true
  },
  {
    "key": "what_helped_use_ai_better",
    "label": "What helped me use AI better?",
    "type": "textarea",
    "required": true
  },
  {
    "key": "prompt_worked_better_when",
    "label": "A prompt worked better when I",
    "type": "textarea",
    "required": false
  },
  {
    "key": "prompt_worked_worse_when",
    "label": "A prompt worked worse when I",
    "type": "textarea",
    "required": false
  },
  {
    "key": "personal_smart_ai_rules",
    "label": "My personal smart AI rules",
    "type": "textarea",
    "helpText": "List one rule per line",
    "required": false
  }
]$ws_18_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 18:%' OR title LIKE 'Worksheet 18 –%' OR title LIKE 'Worksheet 18 -%';

-- Worksheet 19: Final Build Checklist
UPDATE worksheet_templates
SET instructions = $ws_19_inst$Use this page before your final presentation or mentor review. Check for clarity, logic, and readiness.$ws_19_inst$,
    fields_schema = $ws_19_schema$[
  {
    "key": "final_checklist",
    "label": "Before final presentation, I checked",
    "type": "multi_select",
    "options": [
      "The purpose of my project is clear",
      "The target user is clear",
      "The main function works or is clearly demonstrated",
      "My project is understandable to a first-time viewer",
      "My project shows a real idea, not just random generation",
      "I can explain what AI helped with",
      "I can explain what decisions I made myself",
      "I am ready to present the project story"
    ],
    "required": true
  },
  {
    "key": "strongest_part",
    "label": "The strongest part of my project is",
    "type": "textarea",
    "required": true
  },
  {
    "key": "most_proud_of",
    "label": "The part I am most proud of is",
    "type": "textarea",
    "required": true
  },
  {
    "key": "next_improvement",
    "label": "The next improvement I would make with more time is",
    "type": "textarea",
    "required": false
  }
]$ws_19_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 19:%' OR title LIKE 'Worksheet 19 –%' OR title LIKE 'Worksheet 19 -%';

-- Worksheet 20: Project Story Presentation Template
UPDATE worksheet_templates
SET instructions = $ws_20_inst$A strong project presentation explains the problem, user, process, revision, and value — not just the final screen.$ws_20_inst$,
    fields_schema = $ws_20_schema$[
  {
    "key": "story_problem",
    "label": "1. The problem I designed for",
    "type": "textarea",
    "required": true
  },
  {
    "key": "story_user",
    "label": "2. The user I had in mind",
    "type": "textarea",
    "required": true
  },
  {
    "key": "story_solution",
    "label": "3. My solution / project idea",
    "type": "textarea",
    "required": true
  },
  {
    "key": "story_built_and_improved",
    "label": "4. What I built first and what I improved",
    "type": "textarea",
    "required": true
  },
  {
    "key": "story_why_it_matters",
    "label": "5. Why this project matters",
    "type": "textarea",
    "required": true
  },
  {
    "key": "closing_sentence_helps",
    "label": "I hope this project can help (who?)",
    "type": "text",
    "required": false
  },
  {
    "key": "closing_sentence_by",
    "label": "By (how?)",
    "type": "text",
    "required": false
  }
]$ws_20_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 20:%' OR title LIKE 'Worksheet 20 –%' OR title LIKE 'Worksheet 20 -%';

-- Worksheet 21: Rehearsal Feedback Sheet
UPDATE worksheet_templates
SET instructions = $ws_21_inst$Instructions for Reviewers: Help the presenter understand what is already clear and what still needs better explanation.$ws_21_inst$,
    fields_schema = $ws_21_schema$[
  {
    "key": "presenter_name",
    "label": "Presenter name",
    "type": "text",
    "required": true
  },
  {
    "key": "i_understood",
    "label": "I understood…",
    "type": "textarea",
    "required": true
  },
  {
    "key": "strong_part",
    "label": "One strong part of the presentation was…",
    "type": "textarea",
    "required": true
  },
  {
    "key": "should_be_clearer",
    "label": "One part that should be clearer is…",
    "type": "textarea",
    "required": false
  },
  {
    "key": "question_i_still_have",
    "label": "One question I still have is…",
    "type": "textarea",
    "required": false
  },
  {
    "key": "final_suggestion",
    "label": "Final suggestion before showcase",
    "type": "textarea",
    "required": false
  }
]$ws_21_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 21:%' OR title LIKE 'Worksheet 21 –%' OR title LIKE 'Worksheet 21 -%';

-- Worksheet 22: Final Reflection and Portfolio Framing Sheet
UPDATE worksheet_templates
SET instructions = $ws_22_inst$This final page helps you explain your project in a way that may later support applications, interviews, competitions, or portfolio use.$ws_22_inst$,
    fields_schema = $ws_22_schema$[
  {
    "key": "learned_ai_building",
    "label": "One thing I learned about AI-assisted project building",
    "type": "textarea",
    "required": true
  },
  {
    "key": "learned_design_thinking",
    "label": "One thing I learned about design thinking",
    "type": "textarea",
    "required": true
  },
  {
    "key": "learned_working_style",
    "label": "One thing I learned about my own working style",
    "type": "textarea",
    "required": true
  },
  {
    "key": "improved_during_program",
    "label": "One thing I improved during this program",
    "type": "textarea",
    "required": false
  },
  {
    "key": "proud_of",
    "label": "One thing I am proud of",
    "type": "textarea",
    "required": true
  },
  {
    "key": "would_continue_by",
    "label": "If I had more time, I would continue by",
    "type": "textarea",
    "required": false
  },
  {
    "key": "portfolio_project_addressed",
    "label": "This project was designed to address",
    "type": "textarea",
    "required": true
  },
  {
    "key": "portfolio_target_user",
    "label": "The target user or context was",
    "type": "textarea",
    "required": false
  },
  {
    "key": "portfolio_developed_by",
    "label": "I developed the project by",
    "type": "textarea",
    "required": false
  },
  {
    "key": "portfolio_challenge",
    "label": "One major challenge I worked through was",
    "type": "textarea",
    "required": false
  },
  {
    "key": "portfolio_meaningful_result",
    "label": "The most meaningful result of this project was",
    "type": "textarea",
    "required": false
  },
  {
    "key": "portfolio_why_it_matters",
    "label": "This project matters to me because",
    "type": "textarea",
    "required": false
  }
]$ws_22_schema$::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet 22:%' OR title LIKE 'Worksheet 22 –%' OR title LIKE 'Worksheet 22 -%';
