import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Star, 
  BookOpen, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  bio: string;
  isActive: boolean;
}

interface TeacherDetails {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  subjects: string[];
  bio: string;
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: number;
  specializations: string[];
  availability: {
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  contactInfo: {
    phone: string;
    officeHours: string;
    preferredContact: string;
  };
  ratings: {
    average: number;
    totalReviews: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    studentName: string;
    callType: string;
    date: string;
  }>;
  isActive: boolean;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, [selectedSubject, sortBy, searchTerm]);

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (sortBy) params.append('sortBy', sortBy);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/api/teachers?${params.toString()}`);
      setTeachers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/teachers/subjects/list');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const fetchTeacherDetails = async (teacherId: string) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`/api/teachers/${teacherId}`);
      setSelectedTeacher(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch teacher details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-secondary-300'
        }`}
      />
    ));
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Teachers Directory</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Search by name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search teachers..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field"
              >
                <option value="">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers List */}
        <div className="space-y-4">
          {teachers.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No teachers found</h3>
              <p className="text-secondary-600">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            teachers.map((teacher) => (
              <div
                key={teacher.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTeacher?.id === teacher.id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => fetchTeacherDetails(teacher.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-secondary-900">{teacher.name}</h3>
                        <div className="flex items-center">
                          {renderStars(teacher.rating)}
                          <span className="ml-2 text-sm text-secondary-600">
                            {teacher.rating.toFixed(1)} ({teacher.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-secondary-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{teacher.subjects.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-secondary-600">
                        <Award className="h-4 w-4 mr-2" />
                        <span>{teacher.experience} years experience</span>
                      </div>

                      {teacher.bio && (
                        <p className="text-sm text-secondary-600 mt-2">{teacher.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    teacher.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {teacher.isActive ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Teacher Details */}
        <div className="lg:sticky lg:top-6">
          {!selectedTeacher && !detailsLoading ? (
            <div className="card text-center py-12">
              <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Select a teacher</h3>
              <p className="text-secondary-600">
                Click on a teacher from the list to view their detailed profile.
              </p>
            </div>
          ) : detailsLoading ? (
            <div className="card">
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner"></div>
              </div>
            </div>
          ) : selectedTeacher ? (
            <div className="card">
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-secondary-200 pb-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-secondary-900">{selectedTeacher.name}</h2>
                      <div className="flex items-center">
                        {renderStars(selectedTeacher.ratings.average)}
                        <span className="ml-2 text-sm text-secondary-600">
                          {selectedTeacher.ratings.average.toFixed(1)} ({selectedTeacher.ratings.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedTeacher.bio && (
                    <p className="text-secondary-700">{selectedTeacher.bio}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-secondary-400 mr-2" />
                      <span>{selectedTeacher.email}</span>
                    </div>
                    {selectedTeacher.contactInfo.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-secondary-400 mr-2" />
                        <span>{selectedTeacher.contactInfo.phone}</span>
                      </div>
                    )}
                    {selectedTeacher.contactInfo.officeHours && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-secondary-400 mr-2" />
                        <span>Office Hours: {selectedTeacher.contactInfo.officeHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subjects & Experience */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Teaching Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-secondary-700">Subjects:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTeacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-secondary-700">Experience:</span>
                      <span className="ml-2 text-sm text-secondary-600">
                        {selectedTeacher.experience} years
                      </span>
                    </div>

                    {selectedTeacher.specializations.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-secondary-700">Specializations:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTeacher.specializations.map((spec) => (
                            <span
                              key={spec}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                {selectedTeacher.availability.schedule && selectedTeacher.availability.schedule.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">Teaching Schedule</h3>
                    <div className="space-y-2">
                      {selectedTeacher.availability.schedule.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-secondary-700">
                            {formatDay(slot.day)}
                          </span>
                          <span className="text-secondary-600">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                      ))}
                      {selectedTeacher.availability.timezone && (
                        <p className="text-xs text-secondary-500 mt-2">
                          Timezone: {selectedTeacher.availability.timezone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Qualifications */}
                {selectedTeacher.qualifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">Qualifications</h3>
                    <div className="space-y-2">
                      {selectedTeacher.qualifications.map((qual, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-secondary-700">{qual.degree}</span>
                          <span className="text-secondary-600"> - {qual.institution}</span>
                          {qual.year && (
                            <span className="text-secondary-500"> ({qual.year})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Reviews */}
                {selectedTeacher.recentReviews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">Recent Reviews</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedTeacher.recentReviews.map((review) => (
                        <div key={review.id} className="bg-secondary-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm font-medium text-secondary-700">
                                {review.studentName}
                              </span>
                            </div>
                            <span className="text-xs text-secondary-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-secondary-600">{review.comment}</p>
                          )}
                          <span className="text-xs text-secondary-500 capitalize">
                            {review.callType} call
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-secondary-200">
                  <a
                    href={`/video-calls?teacher=${selectedTeacher.id}`}
                    className="btn-primary w-full text-center flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Schedule Video Call
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Teachers;