-- ============================================================
-- KWATHU FOODS — Mock Seed Data
-- ============================================================
-- Run this AFTER schema.sql and AFTER creating an admin user
-- (node backend/scripts/createAdmin.js), so created_by can be
-- attached to a real admin. If no admin exists yet, created_by
-- will just be left NULL — that's fine, it's nullable.
--
-- Usage (from the project root):
--   psql "$DATABASE_URL" -f seed-data.sql
-- ============================================================

-- Grab the first admin's id, if one exists
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;

    -- ------------------------------------------------------------
    -- PRODUCTS
    -- ------------------------------------------------------------
    INSERT INTO products (name, slug, description, price, category, image_url, is_organic, dietary_tags, nutrition_info, created_by)
    VALUES
    ('Grilled Chicken & Steamed Vegetables', 'grilled-chicken-steamed-vegetables',
     'Lean grilled chicken breast served with a colourful mix of steamed seasonal vegetables and brown rice.',
     4500, 'Weight Loss', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600',
     false, ARRAY['low-fat','high-protein'], '{"calories":420,"protein_g":38,"carbs_g":35,"sugar_g":4}',
     admin_id),

    ('Diabetic-Friendly Pumpkin & Groundnut Stew', 'diabetic-pumpkin-groundnut-stew',
     'A warming stew made with fresh pumpkin, groundnut flour, and low-GI vegetables — no added sugar.',
     3800, 'Diabetic-Friendly', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
     true, ARRAY['low-sugar','diabetic-friendly','organic'], '{"calories":310,"sugar_g":3,"fiber_g":8}',
     admin_id),

    ('Ulcer-Friendly Plain Porridge Bowl', 'ulcer-friendly-porridge-bowl',
     'Soft, gentle maize porridge with banana and a touch of honey — easy on the stomach.',
     2200, 'Ulcer-Friendly', 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=600',
     false, ARRAY['ulcer-friendly','low-salt'], '{"calories":250,"sugar_g":6}',
     admin_id),

    ('Organic Garden Salad with Avocado', 'organic-garden-salad-avocado',
     'Fresh farm greens, tomatoes, cucumber, and avocado tossed in a light lemon dressing.',
     3200, 'Organic', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
     true, ARRAY['organic','low-sugar','vegan'], '{"calories":280,"fat_g":18,"fiber_g":9}',
     admin_id),

    ('High-Protein Bean & Quinoa Bowl', 'high-protein-bean-quinoa-bowl',
     'A hearty bowl of quinoa, mixed beans, roasted vegetables, and a tahini drizzle for muscle recovery.',
     4200, 'Weight Gain', 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600',
     true, ARRAY['high-protein','organic','vegan'], '{"calories":520,"protein_g":24,"carbs_g":60}',
     admin_id),

    ('Low-Salt Grilled Fish with Sweet Potato', 'low-salt-grilled-fish-sweet-potato',
     'Fresh chambo fillet grilled with herbs, served with mashed sweet potato and greens.',
     5000, 'Low Blood Pressure', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
     false, ARRAY['low-salt','high-protein'], '{"calories":410,"sodium_mg":180}',
     admin_id),

    ('Fresh Fruit & Yoghurt Bowl', 'fresh-fruit-yoghurt-bowl',
     'Seasonal fruit, plain yoghurt, and a sprinkle of roasted groundnuts — a light, healthy start.',
     2800, 'Organic', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600',
     true, ARRAY['organic','low-sugar'], '{"calories":260,"sugar_g":9}',
     admin_id),

    ('Whole Grain Vegetable Wrap', 'whole-grain-vegetable-wrap',
     'A whole wheat wrap filled with grilled vegetables, hummus, and fresh herbs.',
     3000, 'General Wellness', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
     false, ARRAY['high-fiber','vegan'], '{"calories":350,"fiber_g":10}',
     admin_id)
    ON CONFLICT (slug) DO NOTHING;

    -- ------------------------------------------------------------
    -- RECIPES  (public teaser fields + private secret fields)
    -- ------------------------------------------------------------
    INSERT INTO recipes (title, slug, summary, cover_image_url, dietary_tags, is_public, ingredients_public, ingredients_private, steps_private, created_by)
    VALUES
    ('Kwathu Pumpkin & Groundnut Stew', 'kwathu-pumpkin-groundnut-stew',
     'Our signature diabetic-friendly stew — comforting, nourishing, and naturally low in sugar.',
     'https://images.unsplash.com/photo-1547592180-85f173990554?w=600',
     ARRAY['diabetic-friendly','organic'], true,
     'Pumpkin, groundnut flour, onion, tomato, local spices (exact ratios kept private).',
     '2kg pumpkin, 300g groundnut flour, 2 onions, 4 tomatoes, 1 tsp Kwathu spice blend #3, 1.2L water',
     '1) Sauté onions until translucent. 2) Add tomatoes, cook down to a paste. 3) Add cubed pumpkin and water, simmer 20 min. 4) Whisk in groundnut flour slowly to avoid lumps. 5) Add Kwathu spice blend #3, simmer covered 15 min until pumpkin is soft. 6) Rest 5 min before serving.',
     admin_id),

    ('Organic Garden Salad Dressing', 'organic-garden-salad-dressing',
     'The light citrus dressing behind our most popular organic salad.',
     'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
     ARRAY['organic','low-sugar','vegan'], true,
     'Lemon juice, olive oil, fresh herbs, a touch of local honey.',
     '4 tbsp olive oil, 2 tbsp fresh lemon juice, 1 tsp Dijon-style mustard, 1 tsp raw honey, pinch of salt, chopped parsley & mint',
     '1) Whisk lemon juice and mustard together. 2) Slowly stream in olive oil while whisking to emulsify. 3) Stir in honey and herbs. 4) Season to taste. 5) Chill 10 minutes before dressing the salad so flavours meld.',
     admin_id),

    ('Whole Grain Veggie Wrap', 'whole-grain-veggie-wrap',
     'A quick, high-fibre lunch wrap you can prep ahead for the week.',
     'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
     ARRAY['high-fiber','vegan'], true,
     'Whole wheat wrap, grilled vegetables, hummus, fresh herbs.',
     '1 whole wheat tortilla, 100g hummus, grilled bell pepper, grilled courgette, grilled red onion, handful spinach, 1 tsp Kwathu herb mix',
     '1) Grill vegetables until lightly charred. 2) Spread hummus evenly over the wrap. 3) Layer vegetables and spinach down the centre. 4) Sprinkle Kwathu herb mix. 5) Fold in the sides and roll tightly. 6) Rest seam-side down for 2 minutes before slicing.',
     admin_id)
    ON CONFLICT (slug) DO NOTHING;

    -- ------------------------------------------------------------
    -- BLOG POSTS
    -- ------------------------------------------------------------
    INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, category, tags, is_published, author_id, published_at)
    VALUES
    ('5 Simple Swaps for a Diabetic-Friendly Kitchen', '5-simple-swaps-diabetic-friendly-kitchen',
     'Small changes to your everyday cooking that can make a big difference to blood sugar control.',
     'Managing diabetes does not mean giving up flavour. In this post we walk through five easy ingredient swaps — like replacing white rice with brown rice or quinoa, using groundnut flour instead of refined starches to thicken stews, and choosing naturally sweet fruits over processed sugar. We also cover portion sizing and how to read nutrition labels at local markets. Small, consistent swaps compound into meaningful health improvements over time, and Kwathu Foods designs every diabetic-friendly meal on our menu around these same principles.',
     'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',
     'Nutrition', ARRAY['diabetes','healthy-eating'], true, admin_id, now() - interval '10 days'),

    ('Plant Guide: Growing Pumpkin the Organic Way', 'plant-guide-growing-pumpkin-organic',
     'A look at how we grow the pumpkin used in our signature stew, from seed to harvest.',
     'Pumpkin is one of the hardiest crops on our farm and a cornerstone ingredient in several Kwathu meals. This guide covers soil preparation, organic composting methods we use instead of synthetic fertiliser, natural pest management with companion planting, and the signs that tell us a pumpkin is ready to harvest. Growing organically takes patience, but the payoff is ingredients with better flavour and no chemical residue — which matters most when you are cooking for people managing health conditions.',
     'https://images.unsplash.com/photo-1571680322279-a226e4a4b850?w=600',
     'Plant Guide', ARRAY['organic-farming','pumpkin'], true, admin_id, now() - interval '6 days'),

    ('Why We Started Kwathu Foods', 'why-we-started-kwathu-foods',
     'The story behind the name, the mission, and what "our home" means to us.',
     'Kwathu means our home, our place, where we belong — and that is exactly the feeling we want every customer to have when they order from us. This post shares the personal story behind the brand: watching people around us struggle to find meals that respected their health conditions, and deciding to build something different. We talk about our farm-to-kitchen philosophy, why we work with nutrition students and local farmers, and where we hope to take this business in the coming years.',
     'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600',
     'Farm Update', ARRAY['our-story'], true, admin_id, now() - interval '20 days'),

    ('Low-Salt Cooking Tips for High Blood Pressure', 'low-salt-cooking-tips-high-blood-pressure',
     'How to keep meals flavourful while cutting back on sodium.',
     'High blood pressure often calls for reduced sodium intake, but that does not mean bland food. We share the herb and spice combinations we rely on in the Kwathu kitchen — garlic, ginger, fresh coriander, and citrus zest — to build flavour without salt. We also explain how to spot hidden sodium in processed condiments and offer a few homemade alternatives you can prepare in bulk and freeze.',
     'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
     'Nutrition', ARRAY['blood-pressure','low-salt'], true, admin_id, now() - interval '3 days')
    ON CONFLICT (slug) DO NOTHING;

END $$;

-- ------------------------------------------------------------
-- Summary of what was inserted
-- ------------------------------------------------------------
SELECT 'products' AS table_name, COUNT(*) AS total_rows FROM products
UNION ALL
SELECT 'recipes', COUNT(*) FROM recipes
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM blog_posts;
