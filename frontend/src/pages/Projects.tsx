import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FolderOpen, FileText, Users } from 'lucide-react';

interface Section {
  _id: string;
  title: string;
  pdfUrl: string;
}

interface Project {
  _id: string;
  title: string;
  sections: Section[];
  createdBy: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-secondary-900">Projects</h1>
        
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
            My Projects
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === 'available'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Available Projects
          </button>
        </div>
      </div>

      {activeTab === 'enrolled' && (
        <div>
          {projects.length === 0 ? (
            <div className="card text-center py-12">
              <FolderOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No projects assigned</h3>
              <p className="text-secondary-600 mb-6">
                You haven't been assigned to any projects yet. Check back later or contact your instructor.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn-primary"
              >
                Browse Available Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project._id} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-secondary-900">{project.title}</h3>
                      <p className="text-sm text-secondary-600">
                        {project.sections.length} section{project.sections.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {project.sections.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-secondary-900">Sections:</h4>
                      {project.sections.map((section) => (
                        <div key={section._id} className="bg-secondary-50 p-3 rounded-lg">
                          <h5 className="font-medium text-secondary-800 mb-2">{section.title}</h5>
                          {section.pdfUrl && (
                            <a
                              href={section.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-green-600 hover:text-green-700"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View PDF
                            </a>
                          )}
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
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Project Assignment</h3>
            <p className="text-secondary-600 mb-6">
              Project assignments are managed by your instructors and administrators.
            </p>
            <p className="text-sm text-secondary-500">
              You will be notified when new projects are assigned to you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;