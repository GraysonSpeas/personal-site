export const craftingRecipes = [
  {
    id: 1,
    name: 'Simple Rod',
    description: 'Craft a simple rod',
    outputType: 'rod',
    outputTypeId: 2,
    requiredMaterials: JSON.stringify([
      { type: 'resource', name: 'Shells', quantity: 2 },
      { type: 'gold', quantity: 500 },
    ]),
  },
  {
    id: 2,
    name: 'Blue Bull',
    description: 'Craft a consumable potion from fish',
    outputType: 'consumable',
    outputTypeId: 1,
    requiredMaterials: JSON.stringify([
      { type: 'fish', species: 'Clownfish', quantity: 2 },
      { type: 'gold', quantity: 100 },
    ]),
  },
  {
    id: 3,
    name: 'Simple Rod',
    description: 'Craft a simple rod',
    outputType: 'hook',
    outputTypeId: 2,
    requiredMaterials: JSON.stringify([
      { type: 'gold', quantity: 500 },
    ]),
  },
];