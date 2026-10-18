import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import {
  Upload, Camera, ArrowLeft, AlertCircle, CheckCircle,
  Edit2, X, Loader, FileText
} from 'lucide-react';

export default function PrescriptionScanPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [step, setStep] = useState('upload'); // upload, processing, review, confirmed
  const [error, setError] = useState('');

  // Fetch prescription for review
  const { data: prescriptionData } = useQuery({
    queryKey: ['prescription', prescriptionId],
    queryFn: async () => {
      const response = await api.get(`/prescriptions/${prescriptionId}/review`);
      return response.data.prescription;
    },
    enabled: !!prescriptionId && step === 'review',
  });

  const [reviewedData, setReviewedData] = useState({ medicines: [] });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.prescription;
    },
    onSuccess: (data) => {
      setPrescriptionId(data._id);
      setStep('processing');
      extractMutation.mutate(data._id);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Upload failed');
      setStep('upload');
    },
  });

  // Extract mutation
  const extractMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/prescriptions/${id}/extract`);
      return response.data.prescription;
    },
    onSuccess: (data) => {
      if (data.status === 'extracted') {
        setReviewedData({
          medicines: data.extractedData.medicines.map(m => ({
            ...m,
            keep: true,
          }))
        });
        setStep('review');
      } else if (data.status === 'failed') {
        setError(data.errorMessage || 'Extraction failed');
        setStep('upload');
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Extraction failed. Please try again or enter manually.');
      setStep('upload');
    },
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: async () => {
      // First update reviewed data
      await api.patch(`/prescriptions/${prescriptionId}/review`, { reviewedData });
      // Then confirm
      const response = await api.post(`/prescriptions/${prescriptionId}/confirm`);
      return response.data;
    },
    onSuccess: () => {
      setStep('confirmed');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to create medicines');
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
        setError('Only JPEG, PNG, and PDF files are supported');
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('prescription', file);

    uploadMutation.mutate(formData);
  };

  const handleMedicineChange = (index, field, value) => {
    setReviewedData(prev => ({
      medicines: prev.medicines.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const toggleKeep = (index) => {
    setReviewedData(prev => ({
      medicines: prev.medicines.map((med, i) =>
        i === index ? { ...med, keep: !med.keep } : med
      )
    }));
  };

  const handleConfirm = () => {
    const keptMedicines = reviewedData.medicines.filter(m => m.keep !== false);
    if (keptMedicines.length === 0) {
      setError('Please keep at least one medicine or go back to manual entry');
      return;
    }

    confirmMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app"
          className="p-2 rounded-lg hover:bg-[rgb(var(--color-secondary))] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Scan Prescription</h1>
          <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            Upload a prescription image to extract medicine information
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: 'rgb(220 38 38)' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Step */}
      {step === 'upload' && (
        <div
          className="p-8 rounded-xl border space-y-6"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
            >
              <Camera className="w-8 h-8" style={{ color: 'rgb(var(--color-primary))' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload Prescription Image</h2>
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Take a clear photo or upload an existing image of your prescription
            </p>
          </div>

          {/* File Input */}
          <div>
            <label
              htmlFor="file-upload"
              className="block w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:bg-[rgb(var(--color-secondary))]"
              style={{ borderColor: 'rgb(var(--color-border))' }}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgb(var(--color-muted-foreground))' }} />
                <p className="font-medium mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  JPEG, PNG or PDF (max 10MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Preview</p>
              <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: 'rgb(var(--color-border))' }}>
                <img src={preview} alt="Prescription preview" className="w-full h-64 object-contain bg-gray-100" />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                color: 'rgb(var(--color-primary-foreground))',
              }}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Process Prescription'}
            </button>

            <Link
              to="/app/medicines/add"
              className="px-6 py-3 rounded-lg border font-medium hover:bg-[rgb(var(--color-secondary))] transition-colors text-center"
              style={{ borderColor: 'rgb(var(--color-border))' }}
            >
              Enter Manually
            </Link>
          </div>

          {/* Info */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
          >
            <p className="text-sm font-medium mb-2">Tips for best results:</p>
            <ul className="text-sm space-y-1" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              <li>• Ensure good lighting and avoid shadows</li>
              <li>• Keep the prescription flat and centered</li>
              <li>• Make sure all text is clearly visible</li>
              <li>• You'll review all extracted information before saving</li>
            </ul>
          </div>
        </div>
      )}

      {/* Processing Step */}
      {step === 'processing' && (
        <div
          className="p-12 rounded-xl border text-center space-y-6"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <Loader className="w-16 h-16 mx-auto animate-spin" style={{ color: 'rgb(var(--color-primary))' }} />
          <div>
            <h2 className="text-xl font-semibold mb-2">Processing Prescription</h2>
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Extracting medicine information from your prescription...
            </p>
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && prescriptionData && (
        <div className="space-y-6">
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: 'rgb(var(--color-card))',
              borderColor: 'rgb(var(--color-border))',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Edit2 className="w-5 h-5 mt-0.5" style={{ color: 'rgb(var(--color-primary))' }} />
              <div>
                <h2 className="text-lg font-semibold mb-1">Review Extracted Information</h2>
                <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  Please verify and edit the extracted details. Uncheck medicines you don't want to add.
                </p>
              </div>
            </div>

            {prescriptionData.extractedData?.rawText && (
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
              >
                <p className="text-sm font-medium mb-2">Raw Text Detected:</p>
                <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                  {prescriptionData.extractedData.rawText}
                </p>
              </div>
            )}
          </div>

          {/* Extracted Medicines */}
          <div className="space-y-4">
            {reviewedData.medicines.map((medicine, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border transition-all ${
                  medicine.keep === false ? 'opacity-50' : ''
                }`}
                style={{
                  backgroundColor: 'rgb(var(--color-card))',
                  borderColor: medicine.keep === false ? 'rgb(var(--color-border))' : 'rgb(var(--color-primary))',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">Medicine {index + 1}</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicine.keep !== false}
                      onChange={() => toggleKeep(index)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">Include</span>
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Medicine Name *</label>
                    <input
                      type="text"
                      value={medicine.name || ''}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'rgb(var(--color-background))',
                        borderColor: 'rgb(var(--color-border))',
                        color: 'rgb(var(--color-foreground))',
                      }}
                      placeholder="e.g., Aspirin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Strength</label>
                    <input
                      type="text"
                      value={medicine.strength || ''}
                      onChange={(e) => handleMedicineChange(index, 'strength', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'rgb(var(--color-background))',
                        borderColor: 'rgb(var(--color-border))',
                        color: 'rgb(var(--color-foreground))',
                      }}
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Instructions</label>
                    <textarea
                      value={medicine.instructions || ''}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'rgb(var(--color-background))',
                        borderColor: 'rgb(var(--color-border))',
                        color: 'rgb(var(--color-foreground))',
                      }}
                      placeholder="e.g., Take twice daily with food"
                    />
                  </div>
                </div>

                {medicine.confidence !== undefined && (
                  <div className="mt-3 text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    Confidence: {Math.round(medicine.confidence * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
              className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                color: 'rgb(var(--color-primary-foreground))',
              }}
            >
              {confirmMutation.isPending ? 'Creating Medicines...' : 'Confirm & Create Medicines'}
            </button>

            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setPreview(null);
                setPrescriptionId(null);
                setError('');
              }}
              className="px-6 py-3 rounded-lg border font-medium hover:bg-[rgb(var(--color-secondary))] transition-colors"
              style={{ borderColor: 'rgb(var(--color-border))' }}
            >
              Start Over
            </button>
          </div>

          {/* Warning */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'rgb(234 179 8 / 0.1)', color: 'rgb(161 98 7)' }}
          >
            <p className="text-sm font-medium mb-1">⚠️ Important</p>
            <p className="text-sm">
              Always verify extracted information with your actual prescription. AI extraction may contain errors.
              Consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      )}

      {/* Confirmed Step */}
      {step === 'confirmed' && (
        <div
          className="p-12 rounded-xl border text-center space-y-6"
          style={{
            backgroundColor: 'rgb(var(--color-card))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <CheckCircle className="w-16 h-16 mx-auto" style={{ color: 'rgb(34 197 94)' }} />
          <div>
            <h2 className="text-xl font-semibold mb-2">Medicines Created Successfully</h2>
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Your medicines have been added to your profile
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/app/medicines"
              className="px-6 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                color: 'rgb(var(--color-primary-foreground))',
              }}
            >
              View Medicines
            </Link>

            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setPreview(null);
                setPrescriptionId(null);
                setError('');
              }}
              className="px-6 py-3 rounded-lg border font-medium hover:bg-[rgb(var(--color-secondary))] transition-colors"
              style={{ borderColor: 'rgb(var(--color-border))' }}
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Configuration Notice */}
      {step === 'upload' && (
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
        >
          <p className="text-sm" style={{ color: 'rgb(var(--color-muted-foreground))' }}>
            <strong>Note:</strong> AI-powered prescription scanning requires OpenAI API or Google Cloud Vision configuration.
            If not configured, you'll receive a clear message and can enter medicines manually.
          </p>
        </div>
      )}
    </div>
  );
}
