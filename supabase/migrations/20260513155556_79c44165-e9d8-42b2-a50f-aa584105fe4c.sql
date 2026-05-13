
-- 1) New benefits
INSERT INTO public.benefits (slug, name, category, description, url) VALUES
  ('pressreader',       'PressReader',           'news',      'Thousands of newspapers and magazines from around the world', 'https://www.pressreader.com'),
  ('ancestry-library',  'Ancestry Library',      'research',  'Genealogy and family history database (often in-library only)', 'https://www.ancestrylibrary.com'),
  ('creativebug',       'Creativebug',           'learning',  'Streaming online art, craft and DIY classes', 'https://www.creativebug.com'),
  ('tumblebooks',       'TumbleBook Library',    'ebooks',    'Animated, talking picture books for young children', 'https://www.tumblebooklibrary.com'),
  ('naxos',             'Naxos Music Library',   'streaming', 'Streaming classical, jazz, folk and world music', 'https://www.naxosmusiclibrary.com'),
  ('coursera',          'Coursera',              'learning',  'Online courses and certificates from top universities', 'https://www.coursera.org'),
  ('oreilly',           'O''Reilly for Public Libraries', 'learning', 'Tech and business ebooks, videos and tutorials', 'https://www.oreilly.com'),
  ('heritagequest',     'HeritageQuest Online',  'research',  'U.S. census and family history records', 'https://www.proquest.com/heritagequest'),
  ('morningstar',       'Morningstar',           'research',  'Investment research on stocks, mutual funds and ETFs', 'https://www.morningstar.com'),
  ('flipster',          'Flipster',              'news',      'Digital editions of popular magazines', 'https://www.ebsco.com/products/flipster'),
  ('wsj',               'Wall Street Journal',   'news',      'Digital access to the Wall Street Journal', 'https://www.wsj.com'),
  ('getsetup',          'GetSetUp',              'learning',  'Live interactive online classes for adults 50+', 'https://www.getsetup.io'),
  ('bookflix',          'BookFlix',              'ebooks',    'Paired fiction/nonfiction video storybooks for kids', 'https://www.scholastic.com/bookflixfreetrial'),
  ('learningexpress',   'LearningExpress Library', 'career',  'Test prep, skill-building courses and career resources', 'https://www.ebsco.com/products/learningexpress-library'),
  ('value-line',        'Value Line',            'research',  'Investment research on stocks, industries and markets', 'https://www.valueline.com'),
  ('alexander-street',  'Alexander Street',      'streaming', 'Streaming academic video, documentary, music and audio', 'https://alexanderstreet.com'),
  ('gale-courses',      'Gale Courses',          'learning',  'Instructor-led online professional development courses', 'https://education.gale.com/l-libcourses'),
  ('freegal',           'Freegal Music',         'streaming', 'Stream and download music from Sony Music', 'https://freegalmusic.com'),
  ('washington-post',   'Washington Post',       'news',      'Digital access to the Washington Post', 'https://www.washingtonpost.com'),
  ('jstor',             'JSTOR',                 'research',  'Digital library of academic journals and books', 'https://www.jstor.org'),
  ('comics-plus',       'Comics Plus',           'ebooks',    'Thousands of digital comics, graphic novels and manga', 'https://library.comicsplusapp.com'),
  ('enki',              'Enki Library',          'ebooks',    'California shared collection of ebooks', 'https://enkilibrary.org'),
  ('vetnow',            'VetNow',                'career',    'Career and benefits assistance for military veterans', 'https://www.brainfuse.com/jsp/alc/home.jsp?ts=vetnow'),
  ('driving-tests',     'Driving-Tests.org',     'learning',  'California DMV permit practice tests and manuals', 'https://driving-tests.org'),
  ('bay-beats',         'Bay Beats',             'streaming', 'Stream and download music from local Bay Area artists', 'https://baybeats.sfpl.org')
ON CONFLICT (slug) DO NOTHING;

-- 2) Library ↔ benefit links (idempotent via NOT EXISTS)
WITH ls AS (SELECT id, slug FROM public.library_systems),
     b  AS (SELECT id, slug FROM public.benefits),
     pairs(lib_slug, ben_slug, limit_text) AS (VALUES
       -- PressReader (all 14)
       ('aclibrary','pressreader',NULL),('berkeley','pressreader',NULL),('ccclib','pressreader',NULL),
       ('la-county','pressreader',NULL),('lapl','pressreader',NULL),('napa','pressreader',NULL),
       ('oakland','pressreader',NULL),('pasadena','pressreader',NULL),('sacramento','pressreader',NULL),
       ('sandiego','pressreader',NULL),('sfpl','pressreader',NULL),('sjpl','pressreader',NULL),
       ('sccl','pressreader',NULL),('solano','pressreader',NULL),
       -- Ancestry Library
       ('aclibrary','ancestry-library','In-library use only'),('berkeley','ancestry-library','In-library use only'),
       ('ccclib','ancestry-library','In-library use only'),('lapl','ancestry-library','In-library use only'),
       ('napa','ancestry-library','In-library use only'),('oakland','ancestry-library','In-library use only'),
       ('pasadena','ancestry-library','In-library use only'),('sacramento','ancestry-library','In-library use only'),
       ('sandiego','ancestry-library','In-library use only'),('sfpl','ancestry-library','In-library use only'),
       ('sjpl','ancestry-library','In-library use only'),('sccl','ancestry-library','In-library use only'),
       ('solano','ancestry-library','In-library use only'),
       -- Creativebug
       ('aclibrary','creativebug',NULL),('berkeley','creativebug',NULL),('ccclib','creativebug',NULL),
       ('lapl','creativebug',NULL),('napa','creativebug',NULL),('oakland','creativebug',NULL),
       ('sacramento','creativebug',NULL),('sandiego','creativebug',NULL),('sfpl','creativebug',NULL),
       ('sjpl','creativebug',NULL),('sccl','creativebug',NULL),
       -- TumbleBooks
       ('aclibrary','tumblebooks',NULL),('ccclib','tumblebooks',NULL),('la-county','tumblebooks',NULL),
       ('lapl','tumblebooks',NULL),('napa','tumblebooks',NULL),('oakland','tumblebooks',NULL),
       ('pasadena','tumblebooks',NULL),('sacramento','tumblebooks',NULL),('sjpl','tumblebooks',NULL),
       ('sccl','tumblebooks',NULL),('solano','tumblebooks',NULL),
       -- Naxos
       ('berkeley','naxos',NULL),('ccclib','naxos',NULL),('la-county','naxos',NULL),('lapl','naxos',NULL),
       ('oakland','naxos',NULL),('pasadena','naxos',NULL),('sandiego','naxos',NULL),
       ('sfpl','naxos','25 simultaneous users'),('sjpl','naxos',NULL),('sccl','naxos',NULL),
       -- Coursera
       ('aclibrary','coursera','Limited sponsored seats'),('ccclib','coursera',NULL),
       ('la-county','coursera','Limited; may have waitlist'),('lapl','coursera','One course at a time'),
       ('pasadena','coursera','Waitlist for access'),('sacramento','coursera',NULL),
       ('sandiego','coursera','Limited; may have waitlist'),('sjpl','coursera','1 certificate/year'),
       ('sccl','coursera',NULL),
       -- O'Reilly
       ('aclibrary','oreilly',NULL),('berkeley','oreilly',NULL),('lapl','oreilly',NULL),('napa','oreilly',NULL),
       ('pasadena','oreilly',NULL),('sfpl','oreilly',NULL),('sjpl','oreilly',NULL),('sccl','oreilly',NULL),
       ('solano','oreilly',NULL),
       -- HeritageQuest
       ('berkeley','heritagequest',NULL),('la-county','heritagequest',NULL),('lapl','heritagequest',NULL),
       ('napa','heritagequest',NULL),('sacramento','heritagequest',NULL),('sandiego','heritagequest',NULL),
       ('sfpl','heritagequest',NULL),('sccl','heritagequest',NULL),('solano','heritagequest',NULL),
       -- Morningstar
       ('aclibrary','morningstar',NULL),('berkeley','morningstar',NULL),('ccclib','morningstar',NULL),
       ('lapl','morningstar',NULL),('oakland','morningstar',NULL),('sandiego','morningstar',NULL),
       ('sfpl','morningstar',NULL),('sjpl','morningstar',NULL),('sccl','morningstar',NULL),
       -- Flipster
       ('ccclib','flipster',NULL),('lapl','flipster',NULL),('oakland','flipster',NULL),
       ('sacramento','flipster',NULL),('sfpl','flipster',NULL),('sjpl','flipster',NULL),('sccl','flipster',NULL),
       -- WSJ
       ('aclibrary','wsj','3-day access pass'),('berkeley','wsj','3-day access pass'),
       ('ccclib','wsj','72-hour access pass'),('la-county','wsj','72-hour pass, renewable'),
       ('lapl','wsj',NULL),('pasadena','wsj','72-hour access pass'),
       ('sacramento','wsj','3-day pass, renewable'),('sandiego','wsj','3-day pass, renewable'),
       ('sfpl','wsj',NULL),('sjpl','wsj',NULL),('sccl','wsj','72-hour pass, renewable'),
       -- GetSetUp
       ('aclibrary','getsetup',NULL),('la-county','getsetup',NULL),('pasadena','getsetup',NULL),
       ('sacramento','getsetup',NULL),('sjpl','getsetup',NULL),('sccl','getsetup',NULL),
       -- BookFlix
       ('aclibrary','bookflix',NULL),('berkeley','bookflix',NULL),('ccclib','bookflix',NULL),
       ('la-county','bookflix',NULL),('lapl','bookflix',NULL),('oakland','bookflix',NULL),
       -- LearningExpress
       ('ccclib','learningexpress',NULL),('la-county','learningexpress',NULL),('napa','learningexpress',NULL),
       ('oakland','learningexpress',NULL),('pasadena','learningexpress',NULL),('sccl','learningexpress',NULL),
       -- Value Line
       ('aclibrary','value-line',NULL),('ccclib','value-line',NULL),('lapl','value-line',NULL),
       ('oakland','value-line',NULL),('sandiego','value-line',NULL),('sfpl','value-line','5 simultaneous users'),
       ('sjpl','value-line',NULL),('sccl','value-line',NULL),
       -- Alexander Street
       ('aclibrary','alexander-street',NULL),('berkeley','alexander-street',NULL),
       ('ccclib','alexander-street',NULL),('lapl','alexander-street',NULL),('sfpl','alexander-street',NULL),
       -- Gale Courses
       ('ccclib','gale-courses','6-week courses, monthly start'),('lapl','gale-courses',NULL),
       ('napa','gale-courses',NULL),('sfpl','gale-courses',NULL),('sjpl','gale-courses',NULL),
       -- Freegal
       ('la-county','freegal','5 downloads/wk; unlimited streaming'),
       ('pasadena','freegal','5 downloads/wk; 3 hrs stream/day'),
       ('sacramento','freegal','5 downloads/week'),
       ('sandiego','freegal','5 downloads/wk; 3 hrs stream/day'),
       ('sjpl','freegal','5 downloads/week'),
       -- Washington Post
       ('berkeley','washington-post','7-day access pass'),('la-county','washington-post','7-day pass, renewable'),
       -- JSTOR
       ('berkeley','jstor','In-library use only'),('sfpl','jstor',NULL),
       -- Comics Plus
       ('napa','comics-plus',NULL),('sandiego','comics-plus',NULL),
       -- Enki
       ('aclibrary','enki',NULL),('solano','enki',NULL),
       -- VetNow
       ('sfpl','vetnow',NULL),('sjpl','vetnow',NULL),
       -- Driving-Tests.org
       ('la-county','driving-tests',NULL),('napa','driving-tests',NULL),('solano','driving-tests',NULL),
       -- Bay Beats (SFPL only)
       ('sfpl','bay-beats',NULL)
     )
INSERT INTO public.library_benefits (library_system_id, benefit_id, limit_text)
SELECT ls.id, b.id, p.limit_text
FROM pairs p
JOIN ls ON ls.slug = p.lib_slug
JOIN b  ON b.slug  = p.ben_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.library_benefits lb
  WHERE lb.library_system_id = ls.id AND lb.benefit_id = b.id
);
