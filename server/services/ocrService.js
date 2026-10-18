import axios from 'axios';

/**
 * OCR Service for extracting data from prescription and package images
 * Supports OpenAI Vision API and Google Cloud Vision
 */

// OpenAI Vision implementation
async function extractWithOpenAI(imagePath) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const fs = await import('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract medicine information from this prescription image. For each medicine, identify:
- Medicine name
- Strength (number and unit, e.g., "500mg")
- Instructions (dosage and frequency)
- Duration if mentioned

Return a JSON object with:
{
  "medicines": [
    {
      "name": "medicine name",
      "strength": "strength value",
      "instructions": "dosage instructions",
      "duration": "treatment duration if mentioned",
      "confidence": 0.0-1.0
    }
  ],
  "rawText": "any other relevant text from the prescription"
}

If handwriting is unclear or ambiguous, set confidence lower and note uncertainty in instructions.
Return null for fields that cannot be read clearly.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      return {
        ...extractedData,
        provider: 'openai',
      };
    }

    throw new Error('Failed to parse OpenAI response');
  } catch (error) {
    console.error('OpenAI extraction error:', error.message);
    throw error;
  }
}

// Google Cloud Vision implementation
async function extractWithGoogleVision(imagePath) {
  const { ImageAnnotatorClient } = await import('@google-cloud/vision');

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Google Cloud credentials not configured');
  }

  try {
    const client = new ImageAnnotatorClient();
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return {
        medicines: [],
        rawText: '',
        processingNotes: 'No text detected in image',
        provider: 'google-vision',
      };
    }

    const rawText = detections[0].description;

    // Simple extraction logic - can be enhanced with NLP
    const medicines = [];
    const lines = rawText.split('\n');

    // Basic pattern matching for medicine names and dosages
    const medicinePattern = /([A-Z][a-z]+)\s*(\d+\s*mg|mg\s*\d+)/gi;
    const matches = rawText.matchAll(medicinePattern);

    for (const match of matches) {
      medicines.push({
        name: match[1],
        strength: match[2],
        instructions: null,
        duration: null,
        confidence: 0.7,
      });
    }

    return {
      medicines,
      rawText,
      processingNotes: medicines.length === 0 ? 'Text detected but no medicines identified. Manual review required.' : null,
      provider: 'google-vision',
    };
  } catch (error) {
    console.error('Google Vision extraction error:', error.message);
    throw error;
  }
}

/**
 * Extract prescription data from image
 */
export async function extractPrescriptionData(imagePath) {
  // Try OpenAI first if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      return await extractWithOpenAI(imagePath);
    } catch (error) {
      console.error('OpenAI extraction failed, trying Google Vision:', error.message);
    }
  }

  // Fall back to Google Vision
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await extractWithGoogleVision(imagePath);
    } catch (error) {
      console.error('Google Vision extraction failed:', error.message);
    }
  }

  throw new Error('No OCR provider configured. Please set OPENAI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS');
}

/**
 * Extract package/label data from image
 */
export async function extractPackageData(imagePath) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const fs = await import('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract information from this medicine package/label. Identify:
- Medicine name
- Strength and unit
- Composition/active ingredients
- Manufacturer name
- Batch/Lot number
- Manufacturing date (MFG)
- Expiry date (EXP)

Return a JSON object:
{
  "name": "medicine name",
  "strength": "strength value with unit",
  "composition": "active ingredients",
  "manufacturer": "manufacturer name",
  "batchNumber": "batch/lot number",
  "manufacturingDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null",
  "confidence": 0.0-1.0,
  "rawText": "other visible text"
}

IMPORTANT: For dates, if unclear or ambiguous, return null rather than guessing.
If expiry date cannot be clearly read, set confidence lower and return null for expiryDate.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);
      return {
        ...extractedData,
        provider: 'openai',
      };
    }

    throw new Error('Failed to parse OpenAI response');
  } catch (error) {
    console.error('Package extraction error:', error.message);
    throw error;
  }
}
