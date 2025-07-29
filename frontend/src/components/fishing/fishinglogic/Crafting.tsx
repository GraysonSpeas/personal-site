import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../../config.tsx';

type Material = {
  type: 'gold' | 'fish' | 'resource';
  quantity: number;
  species?: string;
  name?: string;
};

type Recipe = {
  id: number;
  name: string;
  requiredMaterials: Material[];
  outputType: string;
  outputTypeId: number;
};

type FishInventory = { species: string; quantity: number }[];
type ResourceInventory = { name: string; quantity: number }[];

type Props = {
  refetchTrigger?: number;
  refetch: () => Promise<void>;
  refreshOther: () => void;
};

export function Crafting({ refetchTrigger, refetch, refreshOther }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [gold, setGold] = useState(0);
  const [fishInv, setFishInv] = useState<FishInventory>([]);
  const [resourceInv, setResourceInv] = useState<ResourceInventory>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [refetchTrigger]);

  async function fetchData() {
    setLoading(true);
    setMessage('');
    try {
      // Fetch recipes
      const recipesRes = await fetch(`${API_BASE}/crafting/recipes`, { credentials: 'include' });
      const recipesJson = await recipesRes.json();
      if (!recipesRes.ok) throw new Error(recipesJson.error || 'Failed to load recipes');
      setRecipes(
        (recipesJson.recipes || []).map((r: any) => ({
          ...r,
          requiredMaterials: JSON.parse(r.requiredMaterials),
        }))
      );

      // Fetch inventory from merchant endpoint
      const invRes = await fetch(`${API_BASE}/merchant/inventory`, { credentials: 'include' });
      const invJson = await invRes.json();
      if (!invRes.ok) throw new Error(invJson.error || 'Failed to load inventory');

      setGold(invJson.gold || 0);
      setFishInv(invJson.fish || []);

      // Assuming resources not available from merchant, set empty or add fetching logic
      setResourceInv(invJson.resources || []);
    } catch (e: any) {
      setMessage(e.message || 'Failed to load data');
    }
    setLoading(false);
  }

  function getOwnedQuantity(mat: Material): number {
    if (mat.type === 'gold') return gold;
    if (mat.type === 'fish') {
      return fishInv.find((f) => f.species === mat.species)?.quantity ?? 0;
    }
    if (mat.type === 'resource') {
      return resourceInv.find((r) => r.name === mat.name)?.quantity ?? 0;
    }
    return 0;
  }

  function canCraft(recipe: Recipe) {
    return recipe.requiredMaterials.every((mat) => getOwnedQuantity(mat) >= mat.quantity);
  }

async function handleCraft(recipeId: number) {
  if (loading) return;
  setLoading(true);
  setMessage('');
  try {
    const res = await fetch(`${API_BASE}/crafting/craft`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Crafting failed');
    setMessage('Item crafted!');
    await fetchData();
    await refetch();  // <-- Added this line to update inventory/gear
    console.log('Crafting success, called refetch');
    refreshOther();
    console.log('refreshOther called from Crafting');
  } catch (e: any) {
    setMessage(e.message || 'Error crafting item');
  }
  setLoading(false);
}

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow text-black">
      <h2 className="text-2xl font-bold mb-4">Crafting</h2>

      {recipes.length === 0 ? (
        <p className="italic">No recipes available.</p>
      ) : (
        <div className="space-y-4">
          {recipes.map((r) => {
            const canCraftFlag = canCraft(r);
            return (
              <div key={r.id} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{r.name}</h3>
                    <ul className="text-sm ml-4 mt-1 list-disc">
                      {r.requiredMaterials.map((m, i) => {
                        const owned = getOwnedQuantity(m);
                        const lacking = owned < m.quantity;
                        return (
                          <li key={i} className={lacking ? 'text-red-600' : ''}>
                            {m.type === 'gold' && `Gold: ${m.quantity} (You have: ${owned})`}
                            {m.type === 'fish' && `Fish: ${m.species} x${m.quantity} (You have: ${owned})`}
                            {m.type === 'resource' && `Resource: ${m.name} x${m.quantity} (You have: ${owned})`}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <button
                    onClick={() => handleCraft(r.id)}
                    disabled={loading || !canCraftFlag}
                    className={`px-4 py-2 rounded ${
                      canCraftFlag
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Crafting...' : 'Craft'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {message && <p className="mt-4 text-center font-medium">{message}</p>}
    </div>
  );
}