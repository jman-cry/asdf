import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FolderOpen, Plus, Trash2, Upload, FileText } from 'lucide-react';

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

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState<string | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // This would need a new endpoint to get all projects for admin
      // For now, we'll simulate with empty array
      setProjects([]);
    } catch (error: any) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    setCreating(true);
    try {
      const response = await axios.post('/api/projects', { title: newProjectTitle });
      setProjects([...projects, response.data]);
      setNewProjectTitle('');
      setShowCreateForm(false);
      toast.success('Project created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const addSection = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    setAddingSection(true);
    try {
      // This would need file upload handling
      toast.info('File upload functionality needs to be implemented');
      setNewSectionTitle('');
      setShowSectionForm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add section');
    } finally {
      setAddingSection(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(project => project._id !== projectId));
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
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
        <h1 className="text-2xl font-bold text-secondary-900">Manage Projects</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Create New Project</h2>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label htmlFor="projectTitle" className="block text-sm font-medium text-secondary-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                id="projectTitle"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Enter project title"
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
                Create Project
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProjectTitle('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <FolderOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No projects created</h3>
          <p className="text-secondary-600 mb-6">
            Create your first project to start organizing assignments and resources.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project._id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
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
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSectionForm(project._id)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                  </button>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="btn-danger flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Add Section Form */}
              {showSectionForm === project._id && (
                <div className="border-t border-secondary-200 pt-4 mt-4">
                  <h4 className="font-medium text-secondary-900 mb-3">Add New Section</h4>
                  <form onSubmit={(e) => addSection(e, project._id)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="Enter section title"
                        className="input-field"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        PDF File
                      </label>
                      <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-sm text-secondary-600">Upload PDF file for this section</p>
                        <p className="text-xs text-secondary-500 mt-1">PDF files only</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={addingSection}
                        className="btn-primary flex items-center"
                      >
                        {addingSection ? (
                          <div className="loading-spinner h-4 w-4 mr-2"></div>
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Section
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSectionForm(null);
                          setNewSectionTitle('');
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sections List */}
              {project.sections.length > 0 && (
                <div className="border-t border-secondary-200 pt-4 mt-4">
                  <h4 className="font-medium text-secondary-900 mb-3">Sections</h4>
                  <div className="space-y-2">
                    {project.sections.map((section) => (
                      <div key={section._id} className="bg-secondary-50 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-secondary-800">{section.title}</h5>
                          {section.pdfUrl && (
                            <span className="flex items-center text-sm text-green-600 mt-1">
                              <FileText className="h-3 w-3 mr-1" />
                              PDF Available
                            </span>
                          )}
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

export default AdminProjects;