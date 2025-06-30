import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Edit, Trash2, Upload, Play, FileText } from 'lucide-react';

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

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // This would need a new endpoint to get all courses for admin
      // For now, we'll simulate with empty array
      setCourses([]);
    } catch (error: any) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    setCreating(true);
    try {
      const response = await axios.post('/api/courses', { title: newCourseTitle });
      setCourses([...courses, response.data]);
      setNewCourseTitle('');
      setShowCreateForm(false);
      toast.success('Course created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const addLesson = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    setAddingLesson(true);
    try {
      // This would need file upload handling
      toast.info('File upload functionality needs to be implemented');
      setNewLessonTitle('');
      setShowLessonForm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add lesson');
    } finally {
      setAddingLesson(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await axios.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter(course => course._id !== courseId));
      toast.success('Course deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
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
        <h1 className="text-2xl font-bold text-secondary-900">Manage Courses</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </button>
      </div>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Create New Course</h2>
          <form onSubmit={createCourse} className="space-y-4">
            <div>
              <label htmlFor="courseTitle" className="block text-sm font-medium text-secondary-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                id="courseTitle"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Enter course title"
                className="input-field"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={creating}
                className="btn-primary flex items-center"
              >
                {creating ? (
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Course
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCourseTitle('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No courses created</h3>
          <p className="text-secondary-600 mb-6">
            Create your first course to start building your curriculum.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create First Course
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course._id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
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
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowLessonForm(course._id)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lesson
                  </button>
                  <button
                    onClick={() => deleteCourse(course._id)}
                    className="btn-danger flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Add Lesson Form */}
              {showLessonForm === course._id && (
                <div className="border-t border-secondary-200 pt-4 mt-4">
                  <h4 className="font-medium text-secondary-900 mb-3">Add New Lesson</h4>
                  <form onSubmit={(e) => addLesson(e, course._id)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="Enter lesson title"
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Video File
                        </label>
                        <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                          <p className="text-sm text-secondary-600">Upload video file</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          PDF File
                        </label>
                        <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                          <p className="text-sm text-secondary-600">Upload PDF file</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={addingLesson}
                        className="btn-primary flex items-center"
                      >
                        {addingLesson ? (
                          <div className="loading-spinner h-4 w-4 mr-2"></div>
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLessonForm(null);
                          setNewLessonTitle('');
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lessons List */}
              {course.lessons.length > 0 && (
                <div className="border-t border-secondary-200 pt-4 mt-4">
                  <h4 className="font-medium text-secondary-900 mb-3">Lessons</h4>
                  <div className="space-y-2">
                    {course.lessons.map((lesson) => (
                      <div key={lesson._id} className="bg-secondary-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-secondary-800">{lesson.title}</h5>
                          <div className="flex space-x-4 mt-1">
                            {lesson.videoUrl && (
                              <span className="flex items-center text-sm text-primary-600">
                                <Play className="h-3 w-3 mr-1" />
                                Video
                              </span>
                            )}
                            {lesson.pdfUrl && (
                              <span className="flex items-center text-sm text-green-600">
                                <FileText className="h-3 w-3 mr-1" />
                                PDF
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;