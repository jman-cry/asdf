import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Video, Phone, Users, Clock, Award, CheckCircle, XCircle } from 'lucide-react';

interface VideoCall {
  _id: string;
  type: 'one-to-one' | 'group';
  initiator: string;
  participants: string[];
  status: 'pending' | 'accepted' | 'rejected';
  callId: string;
  pointsCost: number;
}

const VideoCalls: React.FC = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiatingCall, setInitiatingCall] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [callType, setCallType] = useState<'one-to-one' | 'group'>('one-to-one');
  const [participantIds, setParticipantIds] = useState('');

  useEffect(() => {
    // In a real app, you'd fetch calls from an endpoint
    // For now, we'll just set loading to false
    setLoading(false);
  }, []);

  const initiateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim()) return;

    setInitiatingCall(true);
    try {
      const endpoint = callType === 'one-to-one' ? '/api/video-calls/one-to-one' : '/api/video-calls/group';
      const payload = callType === 'one-to-one' 
        ? { teacherId }
        : { teacherId, participantIds: participantIds.split(',').map(id => id.trim()).filter(id => id) };

      const response = await axios.post(endpoint, payload);
      toast.success(`${callType === 'one-to-one' ? 'One-to-one' : 'Group'} call initiated successfully!`);
      
      // Reset form
      setTeacherId('');
      setParticipantIds('');
      
      // In a real app, you might redirect to a call interface or update the calls list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate call');
    } finally {
      setInitiatingCall(false);
    }
  };

  const respondToCall = async (callId: string, status: 'accepted' | 'rejected') => {
    try {
      await axios.post(`/api/video-calls/respond/${callId}`, { status });
      toast.success(`Call ${status} successfully!`);
      // Update calls list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to respond to call');
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
        <h1 className="text-2xl font-bold text-secondary-900">Video Calls</h1>
      </div>

      {/* Points Display for Students */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-secondary-900">One-to-One Points</h3>
                <p className="text-2xl font-bold text-green-600">{user.oneToOnePoints || 0}</p>
                <p className="text-sm text-secondary-600">10 points per call</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-secondary-900">Group Points</h3>
                <p className="text-2xl font-bold text-blue-600">{user.groupPoints || 0}</p>
                <p className="text-sm text-secondary-600">20 points per call</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Call Form for Students */}
      {user?.role === 'student' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Initiate Video Call</h2>
          
          <form onSubmit={initiateCall} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Call Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="one-to-one"
                    checked={callType === 'one-to-one'}
                    onChange={(e) => setCallType(e.target.value as 'one-to-one')}
                    className="mr-2"
                  />
                  <Phone className="h-4 w-4 mr-1" />
                  One-to-One (10 points)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="group"
                    checked={callType === 'group'}
                    onChange={(e) => setCallType(e.target.value as 'group')}
                    className="mr-2"
                  />
                  <Users className="h-4 w-4 mr-1" />
                  Group Call (20 points)
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-secondary-700 mb-1">
                Teacher ID
              </label>
              <input
                type="text"
                id="teacherId"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="Enter teacher's user ID"
                className="input-field"
                required
              />
            </div>

            {callType === 'group' && (
              <div>
                <label htmlFor="participantIds" className="block text-sm font-medium text-secondary-700 mb-1">
                  Friend IDs (comma-separated)
                </label>
                <input
                  type="text"
                  id="participantIds"
                  value={participantIds}
                  onChange={(e) => setParticipantIds(e.target.value)}
                  placeholder="Enter friend IDs separated by commas"
                  className="input-field"
                />
                <p className="text-sm text-secondary-600 mt-1">
                  Maximum 4 friends can join the group call
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={initiatingCall || !teacherId.trim()}
              className="btn-primary flex items-center"
            >
              {initiatingCall ? (
                <div className="loading-spinner h-4 w-4 mr-2"></div>
              ) : (
                <Video className="h-4 w-4 mr-2" />
              )}
              Initiate {callType === 'one-to-one' ? 'One-to-One' : 'Group'} Call
            </button>
          </form>
        </div>
      )}

      {/* Call Requests for Teachers */}
      {user?.role === 'teacher' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Incoming Call Requests</h2>
          
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-600">No pending call requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div key={call._id} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${call.type === 'one-to-one' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {call.type === 'one-to-one' ? (
                          <Phone className={`h-5 w-5 ${call.type === 'one-to-one' ? 'text-green-600' : 'text-blue-600'}`} />
                        ) : (
                          <Users className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-secondary-900">
                          {call.type === 'one-to-one' ? 'One-to-One Call' : 'Group Call'}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {call.participants.length} participant{call.participants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {call.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => respondToCall(call._id, 'accepted')}
                          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => respondToCall(call._id, 'rejected')}
                          className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {call.status !== 'pending' && (
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        call.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Call History</h2>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-600">No call history available</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCalls;