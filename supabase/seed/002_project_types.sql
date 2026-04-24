-- ============================================================
-- Seed: project_type_definitions
-- 9 project type categories for CAS Incubator OS
-- ============================================================

INSERT INTO project_type_definitions
  (slug, name, description, examples)
VALUES

('productivity_tool',
 'Productivity Tool',
 'A digital or physical tool that helps people accomplish tasks more efficiently, reducing friction or wasted time in everyday workflows.',
 '[
   "Study schedule organizer app",
   "Homework tracking system",
   "Team task manager for student clubs"
 ]'),

('research_support_tool',
 'Research Support Tool',
 'A tool or system that helps users collect, organize, analyze, or share research and information more effectively.',
 '[
   "Literature review assistant",
   "Data collection form with auto-summary",
   "Citation organizer for academic papers"
 ]'),

('innovation_incubator',
 'Innovation Incubator',
 'A platform, process, or community that helps others develop and test new ideas — a meta-project that enables other builders.',
 '[
   "Student pitch competition platform",
   "Idea validation workshop curriculum",
   "Peer feedback network for side projects"
 ]'),

('decision_support_tool',
 'Decision Support Tool',
 'A tool that helps users make better decisions by structuring options, surfacing tradeoffs, or providing relevant information at the right moment.',
 '[
   "College major selector tool",
   "Budget planner for student events",
   "Club membership comparison guide"
 ]'),

('educational_tool',
 'Educational Tool',
 'A learning resource, curriculum module, or interactive tool designed to help others acquire a skill or understand a concept.',
 '[
   "Interactive math concept visualizer",
   "Language learning flashcard app",
   "Coding tutorial for beginners"
 ]'),

('portfolio_project',
 'Portfolio Project',
 'A project whose primary purpose is to demonstrate the student''s skills, creativity, or expertise — often used in college applications or career development.',
 '[
   "Personal website showcasing artwork",
   "Open-source code contribution",
   "Video documentary on a local issue"
 ]'),

('social_impact_tool',
 'Social Impact Tool',
 'A project designed to address a community challenge or create positive social change, often non-commercial in nature.',
 '[
   "Food waste reduction campaign website",
   "Mental health resource directory for teens",
   "Volunteer matching platform for NGOs"
 ]'),

('prototype_app',
 'Prototype App',
 'A functional software prototype — web, mobile, or desktop — that demonstrates a novel product concept and can be used by real users for testing.',
 '[
   "Mobile app prototype for peer tutoring",
   "Web app for tracking campus events",
   "Chrome extension for distraction blocking"
 ]'),

('other',
 'Other',
 'A project that does not fit neatly into the above categories. Students using this type should provide a clear description of their project''s purpose and format.',
 '[]');
