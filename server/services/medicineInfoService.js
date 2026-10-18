import axios from 'axios';

/**
 * Medicine Information Service
 * Fetches medicine information from trusted sources
 */

/**
 * Fetch from OpenFDA API
 */
async function fetchFromOpenFDA(medicineName, strength) {
  try {
    const searchQuery = strength
      ? `${medicineName} ${strength}`
      : medicineName;

    const response = await axios.get('https://api.fda.gov/drug/label.json', {
      params: {
        search: `openfda.brand_name:"${medicineName}" OR openfda.generic_name:"${medicineName}"`,
        limit: 1
      }
    });

    if (!response.data.results || response.data.results.length === 0) {
      return null;
    }

    const result = response.data.results[0];

    return {
      genericName: result.openfda?.generic_name?.[0],
      brandName: result.openfda?.brand_name?.[0],
      activeIngredients: result.active_ingredient || [],
      composition: result.openfda?.substance_name?.join(', '),
      commonSideEffects: result.adverse_reactions || [],
      source: 'OpenFDA',
      sourceUrl: `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medicineName}"`,
      retrievedAt: new Date(),
      matchConfidence: 0.8,
    };
  } catch (error) {
    console.error('OpenFDA fetch error:', error.message);
    return null;
  }
}

/**
 * Fetch medicine information from configured source
 */
export async function fetchMedicineInfo(medicineName, strength) {
  if (!medicineName) {
    throw new Error('Medicine name is required');
  }

  // Check if custom API is configured
  if (process.env.MEDICINE_INFO_API_KEY && process.env.MEDICINE_INFO_BASE_URL) {
    try {
      const response = await axios.get(`${process.env.MEDICINE_INFO_BASE_URL}/search`, {
        params: {
          name: medicineName,
          strength: strength
        },
        headers: {
          'Authorization': `Bearer ${process.env.MEDICINE_INFO_API_KEY}`
        }
      });

      if (response.data && response.data.results) {
        return {
          ...response.data.results,
          source: 'Custom API',
          retrievedAt: new Date(),
        };
      }
    } catch (error) {
      console.error('Custom API fetch error:', error.message);
    }
  }

  // Try OpenFDA (public, no key required)
  const fdaResult = await fetchFromOpenFDA(medicineName, strength);
  if (fdaResult) {
    return fdaResult;
  }

  // No information available
  return null;
}

/**
 * Check for allergy warnings based on user's recorded allergies
 */
export function checkAllergyWarnings(medicineInfo, userAllergies) {
  if (!medicineInfo || !userAllergies || userAllergies.length === 0) {
    return [];
  }

  const warnings = [];
  const ingredients = [
    ...(medicineInfo.activeIngredients || []),
    ...(medicineInfo.composition ? medicineInfo.composition.split(',').map(s => s.trim()) : [])
  ].map(ing => ing.toLowerCase());

  for (const allergy of userAllergies) {
    const allergen = allergy.allergen.toLowerCase();

    // Check if any ingredient contains the allergen
    const matchingIngredients = ingredients.filter(ing =>
      ing.includes(allergen) || allergen.includes(ing)
    );

    if (matchingIngredients.length > 0) {
      warnings.push({
        allergen: allergy.allergen,
        severity: allergy.severity,
        matchingIngredients,
        userNote: allergy.notes,
      });
    }
  }

  return warnings;
}
