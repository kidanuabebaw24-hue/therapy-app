import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Award, Clock, Users, X } from 'lucide-react';
import { getAvailableTherapists, getSpecializations } from '../../../services/therapistService';
import TherapistCard from './TherapistCard';
import TherapistDetails from './TherapistDetails';
import './Therapists.css';

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    minExperience: '',
    maxRate: ''
  });
  const [specializations, setSpecializations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTherapists();
    fetchSpecializations();
  }, [filters]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const response = await getAvailableTherapists(filters);
      setTherapists(response.therapists || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await getSpecializations();
      setSpecializations(response.specializations || []);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      minExperience: '',
      maxRate: ''
    });
    setSearchTerm('');
  };

  const filteredTherapists = therapists.filter(therapist =>
    therapist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (therapist) => {
    setSelectedTherapist(therapist);
    setShowDetailsModal(true);
  };

  return (
    <div className="therapists-page">
      <div className="page-header">
        <h1>Find a Therapist</h1>
        <p>Connect with licensed mental health professionals</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange('specialization', e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Min Experience (years)</label>
            <select
              value={filters.minExperience}
              onChange={(e) => handleFilterChange('minExperience', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>

          {(filters.specialization || filters.minExperience || filters.maxRate) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="results-info">
        <span>{filteredTherapists.length} therapists found</span>
      </div>

      {/* Therapists Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading therapists...</p>
        </div>
      ) : (
        <div className="therapists-grid">
          {filteredTherapists.length > 0 ? (
            filteredTherapists.map((therapist) => (
              <TherapistCard
                key={therapist.id}
                therapist={therapist}
                onViewDetails={() => handleViewDetails(therapist)}
              />
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No therapists found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="reset-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Therapist Details Modal */}
      {showDetailsModal && selectedTherapist && (
        <TherapistDetails
          therapist={selectedTherapist}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default Therapists;
