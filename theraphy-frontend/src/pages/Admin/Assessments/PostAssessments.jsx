import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAssessmentQuestion } from '../../../services/api.js';
import './PostAssessments.css';

const PostAssessment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    questionText: '',
    category: 'anxiety',
    options: [{ text: '', score: 0 }],
    maxScore: 0,
    order: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: field === 'score' ? Number(value) || 0 : value };
    setFormData(prev => ({ ...prev, options: newOptions }));
    
    // Update max score
    const totalScore = newOptions.reduce((sum, opt) => sum + (Number(opt.score) || 0), 0);
    setFormData(prev => ({ ...prev, maxScore: totalScore }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', score: 0 }]
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
      
      // Update max score
      const totalScore = newOptions.reduce((sum, opt) => sum + (Number(opt.score) || 0), 0);
      setFormData(prev => ({ ...prev, maxScore: totalScore }));
    }
  };

  const validateForm = () => {
    if (!formData.questionText.trim()) {
      toast.error('Please enter a question');
      return false;
    }

    if (formData.options.some(opt => !opt.text.trim())) {
      toast.error('All options must have text');
      return false;
    }

    if (formData.options.some(opt => opt.score < 0)) {
      toast.error('Scores cannot be negative');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await createAssessmentQuestion(formData);
      toast.success('Question created successfully');
      navigate('/admin/assessments');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-assessment-page">
      <div className="page-header">
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/assessments')}
        >
          <ArrowLeft size={18} />
          Back to Assessments
        </button>
        <h1 className="page-title">Create New Assessment Question</h1>
      </div>

      <form onSubmit={handleSubmit} className="assessment-form">
        <div className="form-section">
          <h3>Question Details</h3>
          
          <div className="form-group">
            <label htmlFor="questionText">
              Question Text <span className="required">*</span>
            </label>
            <textarea
              id="questionText"
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              rows={4}
              required
              className="form-input"
              placeholder="Enter your assessment question here..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="anxiety">Anxiety</option>
                <option value="phobia">Phobia</option>
                <option value="depression">Depression</option>
                <option value="general">General</option>
                <option value="ocd">OCD</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="order">Display Order</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
              <small className="field-hint">Lower numbers appear first</small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Options & Scoring</h3>
            <button
              type="button"
              onClick={addOption}
              className="btn btn-secondary add-option-btn"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>
          
          {formData.options.map((option, index) => (
            <div key={index} className="option-card">
              <div className="option-header">
                <span className="option-number">Option {index + 1}</span>
                {formData.options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-option-btn"
                    title="Remove option"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="option-inputs">
                <div className="input-group">
                  <label>Text</label>
                  <input
                    type="text"
                    placeholder="Option text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Score</label>
                  <input
                    type="number"
                    placeholder="Score"
                    value={option.score}
                    onChange={(e) => handleOptionChange(index, 'score', e.target.value)}
                    className="form-input score-input"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="max-score-display">
            <span className="max-score-label">Maximum Possible Score:</span>
            <span className="max-score-value">{formData.maxScore}</span>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive">
              Active <span className="field-hint">(question will be available for assessments)</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/assessments')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={18} />
                Save Question
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostAssessment;