import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, Play, FileText, Users } from 'lucide-react';

interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  pdfUrl: string;
}

interface Course {
  _id: string;
  title: string;
  lessons: Lesson[];
  createdBy: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');

  useEffect(() => {
    fetchCourses();
    fetchAllCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      // This would need a new endpoint in your backend to get all available courses
      // For now, we'll use the same endpoint
      const response = await axios.get('/api/courses');
      setAllCourses(response.data);
    } catch (error: any) {
      console.error('Failed to fetch all courses');
    }
  };

  const enrollInCourse = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await axios.post(`/api/courses/enroll/${courseId}`);
      toast.success('Successfully enrolled in course!');
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
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
        <h1 className="text-2xl font-bold text-secondary-900">Courses</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-secondary-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === 'enrolled'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === 'available'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Available Courses
          </button>
        </div>
      </div>

      {activeTab === 'enrolled' && (
        <div>
          {courses.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No courses enrolled</h3>
              <p className="text-secondary-600 mb-6">
                You haven't enrolled in any courses yet. Browse available courses to get started.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn-primary"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-secondary-900">{course.title}</h3>
                      <p className="text-sm text-secondary-600">
                        {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {course.lessons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-secondary-900">Lessons:</h4>
                      {course.lessons.map((lesson) => (
                        <div key={lesson._id} className="bg-secondary-50 p-3 rounded-lg">
                          <h5 className="font-medium text-secondary-800 mb-2">{lesson.title}</h5>
                          <div className="flex space-x-2">
                            {lesson.videoUrl && (
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Video
                              </a>
                            )}
                            {lesson.pdfUrl && (
                              <a
                                href={lesson.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-green-600 hover:text-green-700"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                PDF
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div>
          <div className="card text-center py-12">
            <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Course Enrollment</h3>
            <p className="text-secondary-600 mb-6">
              Contact your administrator to get enrolled in available courses.
            </p>
            <p className="text-sm text-secondary-500">
              Course enrollment is managed by administrators to ensure proper access control.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;