import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, resolveImageUrl } from '../api.js';

export default function RecipeDetail() {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/recipes/${slug}`).then((d) => setRecipe(d.recipe)).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p style={{ textAlign: 'center', padding: 40 }}>{error}</p>;
  if (!recipe) return <p style={{ textAlign: 'center', padding: 40 }}>Loading…</p>;

  return (
    <section className="container" style={{ maxWidth: 720 }}>
      <img
        src={recipe.cover_image_url ? resolveImageUrl(recipe.cover_image_url) : 'https://placehold.co/700x300?text=Recipe'}
        alt={recipe.title}
        style={{ width: '100%', borderRadius: 12, marginBottom: 20 }}
      />
      <h1>{recipe.title}</h1>
      <div>{recipe.dietary_tags?.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
      <p style={{ marginTop: 16 }}>{recipe.summary}</p>

      {recipe.ingredients_public && (
        <>
          <h3>Ingredients</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{recipe.ingredients_public}</p>
        </>
      )}

      <p style={{ color: 'var(--muted)', fontStyle: 'italic', marginTop: 20 }}>
        Our exact preparation method and formula are part of the Kwathu Foods secret recipe —
        order this meal to enjoy the full dish!
      </p>
    </section>
  );
}
